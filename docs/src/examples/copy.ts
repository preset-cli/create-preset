export const exampleCopy = {
  zh: {
    title: '这些步骤，每个项目都要再做一遍？',
    description: '从一个常见问题开始，看看源文件、Preset 配置和生成结果。',
    before: '手动维护',
    after: '使用 Create Preset',
    view: '查看示例',
    all: '使用示例',
    scenarios: [
      {
        id: 'variants',
        title: '模板差别不大，却要维护好几份？',
        before: '基础版、团队版各复制一份源码。修一个问题，每份模板都要检查和修改。',
        after: '共用一份源码，把文件和配置差异写进 Preset，创建时生成需要的版本。',
      },
      {
        id: 'skills',
        title: '每个项目都要复制同一批 Skills？',
        before: '找到常用 Skills，逐个复制到项目目录，再删掉这次用不上的。',
        after: '常用 Skills 集中放在一个仓库，按配置选取，一次引入到项目的 Skills 目录。',
      },
      {
        id: 'monorepo',
        title: '只想用 monorepo 里的一个子项目？',
        before: '克隆整个仓库，取出子目录，删除无关文件，再处理 workspace: 依赖。',
        after: '指定子目录、排除文件和依赖处理规则，直接生成独立项目。',
      },
      {
        id: 'file-changes',
        title: '模板拉下来，每次都要改同样的配置？',
        before: '删除示例文件、修改 README、替换配置值，每次创建项目都再做一遍。',
        after: '将固定步骤写进 Preset，创建项目时一起完成。',
      },
    ],
  },
  en: {
    title: 'Repeating the same steps for every project?',
    description: 'Start with a familiar problem. Compare the source files, preset config, and generated output.',
    before: 'Manual upkeep',
    after: 'With Create Preset',
    view: 'View example',
    all: 'Examples',
    scenarios: [
      {
        id: 'variants',
        title: 'Almost identical templates, maintained separately?',
        before: 'Keep separate copies for basic and team editions. Check and fix the same code in every copy.',
        after: 'Keep one source. Describe the file and config differences in presets and generate the edition needed.',
      },
      {
        id: 'skills',
        title: 'Copying the same skills into every project?',
        before: 'Find the usual skills, copy them one by one, then remove the ones this project does not need.',
        after: 'Keep common skills in one repository. Select them with a preset and bring them into a project together.',
      },
      {
        id: 'monorepo',
        title: 'Only need one project from a monorepo?',
        before: 'Clone the repository, extract a directory, remove unrelated files, then fix workspace: dependencies.',
        after: 'Choose the directory, exclusions, and dependency rules to generate a standalone project.',
      },
      {
        id: 'file-changes',
        title: 'Making the same edits after every clone?',
        before: 'Remove sample files, rewrite the README, and change config values every time a project is created.',
        after: 'Describe those steps in a preset and apply them during project creation.',
      },
    ],
  },
} as const
