use super::init::{resolve_creation_source, CreationSource};
use crate::apply::{plan_apply, publish_additions, resolve_target};
use crate::error::{PresetError, Result};
use crate::preset::{materialize_preset_plan, override_include};
use serde_json::json;

pub fn apply_command(
    target: String,
    source: String,
    include: Vec<String>,
    dry_run: bool,
) -> Result<()> {
    let mut preset = match resolve_creation_source(Some(&source))? {
        CreationSource::Config(plan) => plan,
        _ => {
            return Err(PresetError::ValidationError(
                "apply requires a preset JSON config, not a generator or bare repository"
                    .to_string(),
            ))
        }
    };
    override_include(&mut preset, include)?;
    let cwd = std::fs::canonicalize(std::env::current_dir()?)?;
    let root = resolve_target(&cwd, &target)?;
    // dry-run 也要生成实际文件以检查冲突，临时结果始终放在目标目录之外。
    let temporary = tempfile::tempdir()?;
    let staged = temporary.path().join("output");
    materialize_preset_plan(&preset, &staged)?;
    let plan = plan_apply(&staged, &root)?;
    if !dry_run && plan.conflicts.is_empty() {
        publish_additions(&staged, &root, &plan)?;
    }
    println!(
        "{}",
        serde_json::to_string_pretty(&json!({
            "target": root, "dryRun": dry_run, "source": preset,
            "add": plan.add, "skip": plan.skip, "conflicts": plan.conflicts,
        }))?
    );
    if !plan.conflicts.is_empty() {
        return Err(PresetError::ValidationError(
            "Apply has conflicts; no target files were changed".to_string(),
        ));
    }
    Ok(())
}
