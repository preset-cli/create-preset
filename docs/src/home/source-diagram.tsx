import { getMessages, type Locale } from '@/locales'
import { FileCode2, Folder, GitBranch } from 'lucide-react'
import styles from './preset-home.module.css'

export const SourceDiagram = ({ locale }: { locale: Locale }) => {
  const copy = getMessages(locale).home.diagram
  return (
    <figure className={styles.diagram} aria-label={copy.label}>
      <div className={styles.source}>
        <div className={styles.diagramHeader}><Folder size={15} aria-hidden="true" /><span>starter/</span><span className={styles.sourceTag}>{copy.maintain}</span></div>
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
            <p className={styles.editionTitle}><span className={styles.statusDot} />{copy.basic}</p>
            <p>src/main.ts</p>
            <p className={styles.excluded}>src/analytics.ts <span aria-label={copy.excluded}>−</span></p>
          </div>
        </div>
        <div className={styles.edition}>
          <p className={styles.presetLabel}>team.json</p>
          <div className={styles.editionBody}>
            <p className={styles.editionTitle}><span className={styles.statusDot} />{copy.team}</p>
            <p>src/main.ts</p>
            <p>src/analytics.ts</p>
          </div>
        </div>
      </div>
      <figcaption>{copy.caption}</figcaption>
    </figure>
  )
}
