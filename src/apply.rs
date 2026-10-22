use crate::error::{PresetError, Result};
use serde::Serialize;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Serialize)]
pub struct Conflict {
    path: PathBuf,
    reason: String,
}

#[derive(Debug, Serialize)]
pub struct ApplyPlan {
    pub add: Vec<PathBuf>,
    pub skip: Vec<PathBuf>,
    pub conflicts: Vec<Conflict>,
}

pub fn resolve_target(cwd: &Path, target: &str) -> Result<PathBuf> {
    if target.trim().is_empty()
        || Path::new(target)
            .components()
            .any(|part| matches!(part, Component::ParentDir))
    {
        return Err(PresetError::ValidationError(
            "Apply target must not be empty or contain parent traversal".to_string(),
        ));
    }
    let root: PathBuf = cwd.join(target).components().collect();
    if root.parent().is_none() || (cwd != root && cwd.starts_with(&root)) {
        return Err(PresetError::ValidationError(
            "Apply target cannot be the filesystem root or an ancestor of the working directory"
                .to_string(),
        ));
    }
    validate_directories(&root)?;
    Ok(root)
}

// 每次检查完整父路径，拒绝目标本身及中间目录中的软链。
fn validate_directories(path: &Path) -> Result<()> {
    let mut current = PathBuf::new();
    for component in path.components() {
        current.push(component);
        match fs::symlink_metadata(&current) {
            Ok(metadata) if !metadata.is_dir() || metadata.file_type().is_symlink() => {
                return Err(PresetError::ValidationError(format!(
                    "Target path is not a regular directory: {}",
                    current.display()
                )));
            }
            Ok(_) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => return Err(error.into()),
        }
    }
    Ok(())
}

fn collect_files(root: &Path, relative: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    for entry in fs::read_dir(root.join(relative))? {
        let entry = entry?;
        let path = relative.join(entry.file_name());
        let kind = entry.file_type()?;
        if entry
            .file_name()
            .to_string_lossy()
            .trim_end_matches(['.', ' '])
            .eq_ignore_ascii_case(".git")
            || kind.is_symlink()
        {
            return Err(PresetError::ValidationError(format!(
                "Cannot apply repository metadata or symbolic links: {}",
                path.display()
            )));
        }
        if kind.is_dir() {
            collect_files(root, &path, files)?;
        } else if kind.is_file() {
            files.push(path);
        } else {
            return Err(PresetError::ValidationError(format!(
                "Cannot apply special file: {}",
                path.display()
            )));
        }
    }
    Ok(())
}

fn files_equal(left: &Path, right: &Path) -> Result<bool> {
    let a = fs::metadata(left)?;
    let b = fs::metadata(right)?;
    if a.len() != b.len() {
        return Ok(false);
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if a.permissions().mode() & 0o111 != b.permissions().mode() & 0o111 {
            return Ok(false);
        }
    }
    let mut a = File::open(left)?;
    let mut b = File::open(right)?;
    let mut buffer_a = [0; 64 * 1024];
    let mut buffer_b = [0; 64 * 1024];
    loop {
        let count = a.read(&mut buffer_a)?;
        if count == 0 {
            return Ok(b.read(&mut buffer_b[..1])? == 0);
        }
        match b.read_exact(&mut buffer_b[..count]) {
            Ok(()) => {}
            Err(error) if error.kind() == std::io::ErrorKind::UnexpectedEof => return Ok(false),
            Err(error) => return Err(error.into()),
        }
        if buffer_a[..count] != buffer_b[..count] {
            return Ok(false);
        }
    }
}

pub fn plan_apply(staged: &Path, root: &Path) -> Result<ApplyPlan> {
    validate_directories(root)?;
    let mut files = Vec::new();
    collect_files(staged, Path::new(""), &mut files)?;
    files.sort();
    if files.is_empty() {
        return Err(PresetError::ValidationError(
            "Preset selection contains no files to apply".to_string(),
        ));
    }
    let mut plan = ApplyPlan {
        add: Vec::new(),
        skip: Vec::new(),
        conflicts: Vec::new(),
    };
    for relative in files {
        let target = root.join(&relative);
        if let Err(error) = validate_directories(target.parent().unwrap()) {
            plan.conflicts.push(Conflict {
                path: relative,
                reason: error.to_string(),
            });
            continue;
        }
        match fs::symlink_metadata(&target) {
            Ok(metadata)
                if metadata.is_file()
                    && !metadata.file_type().is_symlink()
                    && files_equal(&staged.join(&relative), &target)? =>
            {
                plan.skip.push(relative)
            }
            Ok(_) => plan.conflicts.push(Conflict {
                path: relative,
                reason: "Existing content or file type differs".to_string(),
            }),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => plan.add.push(relative),
            Err(error) => return Err(error.into()),
        }
    }
    Ok(plan)
}

struct AdditionTransaction {
    files: Vec<(PathBuf, PathBuf)>,
    directories: Vec<PathBuf>,
    active: bool,
}

impl AdditionTransaction {
    fn new() -> Self {
        Self {
            files: Vec::new(),
            directories: Vec::new(),
            active: true,
        }
    }

    fn ensure_directory(&mut self, path: &Path) -> Result<()> {
        validate_directories(path)?;
        if path.is_dir() {
            return Ok(());
        }
        if let Some(parent) = path.parent() {
            self.ensure_directory(parent)?;
        }
        match fs::create_dir(path) {
            Ok(()) => self.directories.push(path.to_path_buf()),
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                validate_directories(path)?
            }
            Err(error) => return Err(error.into()),
        }
        Ok(())
    }

    fn add_file(&mut self, source: &Path, target: &Path) -> Result<()> {
        let parent = target
            .parent()
            .ok_or_else(|| PresetError::ValidationError("Missing target parent".to_string()))?;
        self.ensure_directory(parent)?;
        let mut input = File::open(source)?;
        // 先完整写入同目录临时文件，再无覆盖发布；晚到的同名文件也不能被覆盖。
        let mut temporary = tempfile::NamedTempFile::new_in(parent)?;
        std::io::copy(&mut input, &mut temporary)?;
        temporary.flush()?;
        temporary
            .as_file()
            .set_permissions(input.metadata()?.permissions())?;
        validate_directories(parent)?;
        temporary.persist_noclobber(target).map_err(|error| {
            PresetError::IoError(format!("Cannot add {}: {}", target.display(), error.error))
        })?;
        self.files
            .push((target.to_path_buf(), source.to_path_buf()));
        Ok(())
    }

    fn rollback(&mut self) -> Result<()> {
        self.active = false;
        let mut failures = Vec::new();
        for (target, source) in self.files.iter().rev() {
            let remove = (|| -> Result<()> {
                validate_directories(target.parent().unwrap())?;
                match fs::symlink_metadata(target) {
                    Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(()),
                    Err(error) => return Err(error.into()),
                    Ok(metadata) if !metadata.is_file() || metadata.file_type().is_symlink() => {
                        return Err(PresetError::IoError(
                            "Added path changed during apply".to_string(),
                        ));
                    }
                    Ok(_) => {}
                }
                if !files_equal(source, target)? {
                    return Err(PresetError::IoError(
                        "Added file was modified during apply".to_string(),
                    ));
                }
                fs::remove_file(target)?;
                Ok(())
            })();
            if let Err(error) = remove {
                failures.push(format!("{}: {}", target.display(), error));
            }
        }
        for directory in self.directories.iter().rev() {
            let remove = validate_directories(directory)
                .and_then(|_| fs::remove_dir(directory).map_err(Into::into));
            if let Err(error) = remove {
                failures.push(format!("{}: {}", directory.display(), error));
            }
        }
        if failures.is_empty() {
            Ok(())
        } else {
            Err(PresetError::IoError(format!(
                "Could not roll back added paths: {}",
                failures.join("; ")
            )))
        }
    }
}

impl Drop for AdditionTransaction {
    fn drop(&mut self) {
        if self.active {
            if let Err(error) = self.rollback() {
                eprintln!("{}", error);
            }
        }
    }
}

pub fn publish_additions(staged: &Path, root: &Path, plan: &ApplyPlan) -> Result<()> {
    if !plan.conflicts.is_empty() {
        return Err(PresetError::ValidationError(
            "Apply has conflicts; no target files were changed".to_string(),
        ));
    }
    let mut transaction = AdditionTransaction::new();
    for relative in &plan.add {
        if let Err(error) = transaction.add_file(&staged.join(relative), &root.join(relative)) {
            return match transaction.rollback() {
                Ok(()) => Err(error),
                Err(rollback) => Err(PresetError::IoError(format!("{}; {}", error, rollback))),
            };
        }
    }
    transaction.active = false;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn late_conflict_rolls_back_only_our_additions() {
        let temp = tempfile::tempdir().unwrap();
        let staged = temp.path().join("staged");
        let root = fs::canonicalize(temp.path()).unwrap().join("target");
        fs::create_dir(&staged).unwrap();
        fs::create_dir(&root).unwrap();
        fs::write(staged.join("a"), "added").unwrap();
        fs::write(staged.join("z"), "added").unwrap();
        fs::write(root.join("keep"), "original").unwrap();
        let plan = plan_apply(&staged, &root).unwrap();
        fs::write(root.join("z"), "late arrival").unwrap();
        assert!(publish_additions(&staged, &root, &plan).is_err());
        assert!(!root.join("a").exists());
        assert_eq!(fs::read_to_string(root.join("z")).unwrap(), "late arrival");
        assert_eq!(fs::read_to_string(root.join("keep")).unwrap(), "original");
    }

    #[test]
    fn failed_publication_removes_created_parents() {
        let temp = tempfile::tempdir().unwrap();
        let staged = temp.path().join("staged");
        let root = fs::canonicalize(temp.path()).unwrap().join("new/nested");
        fs::create_dir(&staged).unwrap();
        fs::write(staged.join("a"), "added").unwrap();
        fs::write(staged.join("z"), "added").unwrap();
        let plan = plan_apply(&staged, &root).unwrap();
        fs::remove_file(staged.join("z")).unwrap();
        assert!(publish_additions(&staged, &root, &plan).is_err());
        assert!(!root.parent().unwrap().exists());
    }

    #[test]
    fn conflict_preflight_prevents_all_writes() {
        let temp = tempfile::tempdir().unwrap();
        let staged = temp.path().join("staged");
        let root = fs::canonicalize(temp.path()).unwrap().join("target");
        fs::create_dir(&staged).unwrap();
        fs::create_dir(&root).unwrap();
        fs::write(staged.join("new"), "add").unwrap();
        fs::write(staged.join("conflict"), "incoming").unwrap();
        fs::write(root.join("conflict"), "local").unwrap();
        let plan = plan_apply(&staged, &root).unwrap();
        assert_eq!(plan.conflicts.len(), 1);
        assert!(publish_additions(&staged, &root, &plan).is_err());
        assert_eq!(fs::read_dir(&root).unwrap().count(), 1);
    }

    #[cfg(unix)]
    #[test]
    fn rejects_target_links_and_detects_executable_permission_changes() {
        use std::os::unix::fs::{symlink, PermissionsExt};
        let temp = tempfile::tempdir().unwrap();
        let base = fs::canonicalize(temp.path()).unwrap();
        let staged = base.join("staged");
        let root = base.join("target");
        fs::create_dir(&staged).unwrap();
        fs::create_dir(&root).unwrap();
        fs::write(staged.join("tool"), "script").unwrap();
        fs::write(root.join("tool"), "script").unwrap();
        fs::set_permissions(staged.join("tool"), fs::Permissions::from_mode(0o755)).unwrap();
        fs::set_permissions(root.join("tool"), fs::Permissions::from_mode(0o644)).unwrap();
        assert_eq!(plan_apply(&staged, &root).unwrap().conflicts.len(), 1);
        symlink(&root, base.join("linked")).unwrap();
        assert!(resolve_target(&base, "linked/subdir").is_err());
        fs::remove_file(root.join("tool")).unwrap();
        symlink(staged.join("tool"), root.join("tool")).unwrap();
        assert_eq!(plan_apply(&staged, &root).unwrap().conflicts.len(), 1);
    }
}
