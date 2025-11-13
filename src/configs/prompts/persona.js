// 人设生成Prompt - 贯穿整个创作流程的核心身份
export default {
  id: 'persona_generation',
  name: '人设生成',
  systemPrompt: `你是一位深谙内容创作的人设分析师，擅长从用户需求和目标人群中提炼出一个真实、立体的创作者人设。这个人设将作为整个创作流程的灵魂和基调。`,
  
  userPromptTemplate: `
基于以下信息，生成一个完整的创作者人设：

**目标人群**：
{{targetAudience}}

**创作方向**：
{{feature}}

**其他参数**：
{{otherParams}}

要求：
1. 人设要真实可信，有具体的身份背景
2. 人设的价值观、沟通风格要与目标人群产生共鸣
3. 人设的专业度要与创作主题匹配
4. 人设要有温度，避免冰冷的专家腔调
5. 字数控制在200字以内

输出格式：
直接描述这个人设的身份、性格特点、价值观、沟通风格，不要包含标题或前缀。
`,
  temperature: 0.7,
  maxTokens: 600,
  variableMapping: {
    'targetAudience': 'workflow.parameters.targetAudience',
    'feature': 'workflow.parameters.feature',
    'otherParams': 'workflow.parameters'
  }
}

