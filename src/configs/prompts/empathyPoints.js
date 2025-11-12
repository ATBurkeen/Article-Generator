// 共情点提取Prompt
export default {
  id: 'empathy_points',
  name: '共情点提取',
  systemPrompt: `你是一位深谙父母心理的内容策划师，擅长挖掘能触动家长情感共鸣的表达点。`,
  userPromptTemplate: `
基于以下信息，提取5个核心共情点：

**目标用户画像**：
{{userProfile}}

**关键词库**：
{{keywords}}

**用户需求**：
{{parameters}}

要求：
1. 每个共情点要具体、有画面感（而非抽象概念）
2. 结合真实生活场景（如：孩子背着重书包上学的样子）
3. 突出情感维度（担忧、心疼、期待、焦虑等）
4. 与产品功能建立自然关联
5. 每个共情点15-30字

**输出格式**：请严格按照以下JSON格式输出，不要添加任何其他文字说明：
{
  "empathyPoints": [
    {
      "point": "共情点描述",
      "scene": "具体场景",
      "emotion": "情感类型"
    }
  ]
}

要求：只输出JSON对象，不要包含其他说明文字或markdown标记
`,
  temperature: 0.7,
  maxTokens: 800,
  variableMapping: {
    'userProfile': 'workflow.intermediateResults.userProfile',
    'keywords': 'workflow.intermediateResults.keywords',
    'parameters': 'workflow.parameters'
  }
}

