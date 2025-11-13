// 共情点提取Prompt
export default {
  id: 'empathy_points',
  name: '共情点提取',
  systemPrompt: `你是一位深谙人性洞察的内容策划专家，擅长从用户需求中提炼能触动情感共鸣的表达点。你能够准确捕捉目标受众的痛点、期待和焦虑，并将其转化为具有画面感的共情点，让读者感同身受。`,
  userPromptTemplate: `
你需要基于以下信息，提取5个核心共情点：

**创作者人设**（请严格按照此人设的语气和价值观来提取共情点）：
{{persona}}

**目标用户画像**：
{{userProfile}}

**关键词库**：
{{keywords}}

**用户需求**：
{{parameters}}

要求：
1. 每个共情点要具体、有画面感，而非抽象概念
2. 结合真实生活场景进行描述
3. 突出情感维度，让读者产生强烈共鸣
4. 与产品特点或服务建立自然关联
5. 每个共情点15-30字
6. 撰写尽可能细颗粒度的共情点，试着让读者感同身受
7. 风格和表达方式必须符合上述创作者人设的特点

**输出格式要求（必读）**：
1. 只输出纯JSON对象
2. 不要添加markdown标记（如\`\`\`json）
3. 不要添加任何前缀或后缀说明文字
4. 不要添加emoji或特殊符号
5. 直接输出以下格式的JSON：

{
  "empathyPoints": [
    {
      "point": "共情点描述",
      "scene": "具体场景",
      "emotion": "情感类型"
    }
  ]
}
`,
  temperature: 0.7,
  maxTokens: 800,
  variableMapping: {
    'persona': 'workflow.intermediateResults.persona',
    'userProfile': 'workflow.intermediateResults.userProfile',
    'keywords': 'workflow.intermediateResults.keywords',
    'parameters': 'workflow.parameters'
  }
}

