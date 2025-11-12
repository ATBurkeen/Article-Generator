// 格式调整Prompt
export default {
  id: 'formatting',
  name: '格式调整与Emoji插入',
  systemPrompt: `你是一位小红书内容编辑，擅长优化文章排版和emoji使用，让内容更具视觉吸引力和可读性。`,

  userPromptTemplate: `
请对以下文章进行格式优化和emoji插入：

**标题**：
{{title}}

**正文**：
{{article}}

**优化要求**：
1. Emoji插入策略：
   - 全文插入10-15个emoji
   - 关键情感词汇后加emoji（如：开心😊、担心😰、惊喜🎉）
   - 产品功能点加相关emoji（如：书包🎒、减负💪、成长📈）
   - 分段开头可用emoji作为视觉引导（如：✨、📌、💡）
   - 避免使用争议性emoji（如🍼、👶等婴幼儿相关）

2. 排版优化：
   - 每段2-4句话，段落间空行
   - 核心卖点或重要信息可用「」标记
   - 数字和数据保持醒目
   - 确保段落逻辑清晰、阅读流畅

3. 细节调整：
   - 检查标点符号的正确使用
   - 统一语气和人称
   - 删除冗余表达

**输出格式**：请严格按照以下JSON格式输出，不要添加任何其他文字说明：
{
  "result": {
    "title": "优化后的标题（含emoji）",
    "content": "优化后的正文（含emoji和排版）",
    "emojiCount": 实际插入的emoji数量,
    "modifications": ["主要修改说明1", "主要修改说明2"]
  }
}

要求：只输出JSON对象，不要包含其他说明文字或markdown标记
`,
  temperature: 0.6,
  maxTokens: 2500,
  variableMapping: {
    'title': 'workflow.intermediateResults.complianceResult.fixedTitle',
    'article': 'workflow.intermediateResults.complianceResult.fixedArticle'
  }
}

