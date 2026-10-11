import { FileCode2, Folder, GitBranch } from 'lucide-react'
import styles from './preset-home.module.css'

export function SourceDiagram({ locale }: { locale: 'en' | 'zh' }) {
  const zh = locale === 'zh'
  return (
    <figure className={styles.diagram} aria-label={zh ? '同一份 starter，通过 basic.json 和 team.json 生成两个版本' : 'One starter generates two editions through basic.json and team.json'}>
      <div className={styles.source}>
        <div className={styles.diagramHeader}><Folder size={15} aria-hidden="true" /><span>starter/</span><span className={styles.sourceTag}>{zh ? '维护这一份' : 'Maintain once'}</span></div>
        <div className={styles.sourceFiles}>
          <p><FileCode2 size={13} aria-hidden="true" />src/main.ts</p>
          <p><FileCode2 size={13} aria-hidden="true" />src/analytics.ts</p>
          <p><FileCode2 size={13} aria-hidden="true" />package.json</p>
        </div>
      </div>
      <div className={styles.branch} aria-hidden="true"><span /><GitBranch size={16} /></div>
      <div className={styles.outputs}>
        <div className={styles.edition}>
          <p className={styles.presetLabel}>basic.json</p>
          <div className={styles.editionBody}>
            <p className={styles.editionTitle}><span className={styles.statusDot} />{zh ? '基础版' : 'Basic edition'}</p>
            <p>src/main.ts</p>
            <p className={styles.excluded}>src/analytics.ts <span aria-label={zh ? '排除' : 'Excluded'}>−</span></p>
          </div>
        </div>
        <div className={styles.edition}>
          <p className={styles.presetLabel}>team.json</p>
          <div className={styles.editionBody}>
            <p className={styles.editionTitle}><span className={styles.statusDot} />{zh ? '团队版' : 'Team edition'}</p>
            <p>src/main.ts</p>
            <p>src/analytics.ts</p>
          </div>
        </div>
      </div>
      <figcaption>{zh ? '公共代码改一处，版本差异留在配置里。' : 'Edit shared code once. Keep edition differences in config.'}</figcaption>
    </figure>
  )
}
