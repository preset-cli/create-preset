import { expect, test } from 'vitest'
import { createAgentPrompt, getAgentPagePath } from '../prompt'

test('localized prompts share the same English documentation URLs', () => {
  const pagePath = getAgentPagePath({ slugSegments: ['guide', 'preset-configs'] })
  const english = createAgentPrompt('en', pagePath)
  const chinese = createAgentPrompt('zh', pagePath)

  expect(english).toContain('My task:')
  expect(chinese).toContain('我的需求：')
  for (const prompt of [english, chinese]) {
    expect(prompt.match(/https:\/\/\S+/g)).toEqual([
      'https://preset.js.org/llms.txt',
      'https://preset.js.org/agent/guide/preset-configs.md',
    ])
  }
})
