// 知识库生成Prompt配置
export default {
  popularArticles: {
    id: 'knowledge_popular_articles',
    name: '爆文库生成',
    systemPrompt: `你是一位小红书内容分析专家，擅长总结爆款文案的写作特点。`,
    userPromptTemplate: `
基于以下用户需求，生成5篇模拟的爆文参考案例：

**用户需求**：
{{parameters}}

要求：
1. 每篇爆文包含：标题、核心卖点、情感表达技巧
2. 风格符合小红书平台特点（口语化、共情强、有emoji）
3. 突出用户痛点和产品优势的结合
4. 每篇100-150字

**输出格式要求（必读）**：
1. 只输出纯JSON对象
2. 不要添加markdown标记（如\`\`\`json）
3. 不要添加任何前缀或后缀说明文字
4. 不要添加额外的emoji或特殊符号（emoji只能在标题内容中）
5. 直接输出以下格式的JSON：

{
  "articles": [
    {
      "title": "标题内容",
      "highlights": "核心卖点",
      "technique": "写作技巧说明"
    }
  ]
}
`,
    temperature: 0.8,
    maxTokens: 1500
  },

  keywords: {
    id: 'knowledge_keywords',
    name: '关键词库生成',
    systemPrompt: `你是一位用户洞察专家，擅长从需求中提炼关键痛点和共情点。`,
    userPromptTemplate: `
基于以下用户需求，生成15个关键词（包含痛点、需求、情感描述）：

**用户需求**：
{{parameters}}

要求：
1. 关键词要具体、有场景感
2. 包含情感维度
3. 涵盖产品功能相关的高频词汇
4. 每个关键词2-5个字

**输出格式要求（必读）**：
1. 只输出纯JSON对象
2. 不要添加markdown标记（如\`\`\`json）
3. 不要添加任何前缀或后缀说明文字
4. 不要添加emoji或特殊符号
5. 直接输出以下格式的JSON：

{
  "keywords": [
    { "word": "关键词", "category": "痛点/需求/情感", "description": "简短说明" }
  ]
}
`,
    temperature: 0.7,
    maxTokens: 1000
  },

  rtb: {
    id: 'knowledge_rtb',
    name: 'RTB话术生成',
    systemPrompt: `你是一位产品营销专家，擅长提炼产品的核心卖点和信任理由(RTB - Reason to Believe)。`,
    userPromptTemplate: `
基于以下用户需求和产品特点，生成3条RTB话术：

**用户需求**：
{{parameters}}

要求：
1. 每条RTB包含：功能描述 + 实际效果 + 权威背书
2. 语言真实可信，避免夸大
3. 突出差异化优势
4. 每条50-80字

**输出格式要求（必读）**：
1. 只输出纯JSON对象
2. 不要添加markdown标记（如\`\`\`json）
3. 不要添加任何前缀或后缀说明文字
4. 不要添加emoji或特殊符号
5. 直接输出以下格式的JSON：

{
  "rtbList": [
    {
      "feature": "功能点",
      "benefit": "用户获益",
      "proof": "信任背书"
    }
  ]
}
`,
    temperature: 0.7,
    maxTokens: 1000
  }
}

