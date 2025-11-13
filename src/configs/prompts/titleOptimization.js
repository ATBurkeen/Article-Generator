// 标题优化Prompt
export default {
  id: 'title_optimization',
  name: '标题优化',
  systemPrompt: `你是一位小红书爆款标题专家，深谙平台算法和用户心理。你擅长用精炼的语言、恰当的emoji和强烈的情感冲击力，创造出高点击率的标题。`,

  userPromptTemplate: `
基于以下文章内容，生成10个吸引人的小红书标题：

**文章正文**：
{{article}}

**用户需求**：
{{parameters}}

**爆文标题参考**：
{{popularTitles}}

**标题创作技巧**：
1. 长度控制在20字以内
2. 使用2-4个emoji增强视觉冲击力
3. 常用套路：痛点提问式、惊叹反差式、数字具体式、对比选择式、情感共鸣式
4. 融入核心关键词和产品特点
5. 制造悬念或冲突，激发点击欲望
6. 避免标题党和虚假信息

**输出格式要求（必读）**：
1. 只输出纯JSON对象
2. 不要添加markdown标记（如\`\`\`json）
3. 不要添加任何前缀或后缀说明文字
4. 不要添加emoji或特殊符号（emoji只能在标题内容中）
5. 直接输出以下格式的JSON：

{
  "titles": [
    {
      "title": "标题内容",
      "technique": "使用的技巧类型",
      "score": "预估吸引力(1-10分)"
    }
  ]
}

要求：
- 必须生成正好10个标题
- 确保10个标题风格多样化，覆盖不同的表达套路
`,
  temperature: 0.9,
  maxTokens: 1500,
  variableMapping: {
    'article': 'workflow.intermediateResults.article',
    'parameters': 'workflow.parameters',
    'popularTitles': 'workflow.intermediateResults.popularArticles'
  }
}

