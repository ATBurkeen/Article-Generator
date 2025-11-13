// 用户画像生成Prompt
export default {
  id: 'user_profile',
  name: '用户画像生成',
  systemPrompt: `你是一位资深的用户研究专家，擅长从用户需求中提炼人物画像。你的画像要生动、有场景感，能让读者感同身受。`,
  userPromptTemplate: `
基于以下信息，生成一份150字以内的目标用户画像：

**创作者人设**：
{{persona}}

**用户输入参数**：
{{parameters}}

**相关爆文参考**：
{{popularArticles}}

**用户关键词**：
{{keywords}}

要求：
1. 描述具体的家长形象
2. 分析核心需求和痛点
3. 突出决策动机和购买考量因素
4. 语言亲切自然，像在描述一个真实的人

请直接输出人物画像，不要包含标题前缀。
`,
  temperature: 0.7,
  maxTokens: 500,
  variableMapping: {
    'persona': 'workflow.intermediateResults.persona',
    'parameters': 'workflow.parameters',
    'popularArticles': 'workflow.intermediateResults.popularArticles',
    'keywords': 'workflow.intermediateResults.keywords'
  }
}

