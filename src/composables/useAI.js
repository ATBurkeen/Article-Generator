import { ref } from 'vue'
import OpenAI from 'openai'

export function useAI() {
  const isGenerating = ref(false)
  const error = ref(null)
  const retryCount = ref(0)
  const MAX_RETRIES = 2
  
  // 初始化OpenAI客户端
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    dangerouslyAllowBrowser: true // 允许浏览器端调用
  })
  
  /**
   * 调用Claude AI生成内容
   * @param {string} userPrompt - 用户提示词
   * @param {string} systemPrompt - 系统提示词
   * @param {Object} config - 配置参数
   * @returns {Promise<string>} AI生成的内容
   */
  async function callClaude(userPrompt, systemPrompt = '', config = {}) {
    isGenerating.value = true
    error.value = null
    retryCount.value = 0
    
    const {
      temperature = 0.7,
      maxTokens = 2000,
      model = 'anthropic/claude-sonnet-4.5'
    } = config
    
    while (retryCount.value <= MAX_RETRIES) {
      try {
        const messages = []
        
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt })
        }
        
        messages.push({ role: 'user', content: userPrompt })
        
        const completion = await client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        })
        
        const content = completion.choices[0].message.content
        isGenerating.value = false
        return content
        
      } catch (err) {
        retryCount.value++
        error.value = err.message
        
        if (retryCount.value > MAX_RETRIES) {
          isGenerating.value = false
          throw new Error(`AI调用失败 (已重试${MAX_RETRIES}次): ${err.message}`)
        }
        
        // 等待1秒后重试
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
  
  /**
   * 调用AI并解析JSON响应
   * @param {string} userPrompt - 用户提示词
   * @param {string} systemPrompt - 系统提示词
   * @param {Object} config - 配置参数
   * @returns {Promise<Object>} 解析后的JSON对象
   */
  async function callClaudeJSON(userPrompt, systemPrompt = '', config = {}) {
    // 在prompt中强调只返回JSON
    const enhancedPrompt = userPrompt + '\n\n**重要**：请直接返回JSON对象，不要添加任何```json```标记或其他说明文字，只返回纯JSON内容。'
    
    const response = await callClaude(enhancedPrompt, systemPrompt, config)
    
    try {
      // 移除可能的markdown代码块标记
      let cleanResponse = response.trim()
      
      // 移除 ```json 和 ``` 标记
      cleanResponse = cleanResponse.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '')
      
      // 尝试提取JSON内容（最外层的花括号或方括号）
      const jsonMatch = cleanResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('✅ JSON解析成功:', parsed)
        return parsed
      }
      
      // 如果没有匹配到，尝试直接解析
      const parsed = JSON.parse(cleanResponse)
      console.log('✅ JSON解析成功:', parsed)
      return parsed
    } catch (err) {
      console.error('❌ JSON解析失败，原始响应:', response)
      console.error('解析错误:', err.message)
      throw new Error(`AI返回的内容不是有效的JSON格式。响应内容：${response.substring(0, 200)}...`)
    }
  }
  
  /**
   * 模拟流式输出（打字机效果）
   * @param {string} text - 要展示的文本
   * @param {Function} onUpdate - 每次更新时的回调函数
   * @param {number} speed - 打字速度（毫秒/字符）
   * @returns {Function} 取消函数
   */
  function simulateStreaming(text, onUpdate, speed = 30) {
    let currentIndex = 0
    let isCancelled = false
    
    const typeNextChar = () => {
      if (isCancelled || currentIndex >= text.length) {
        return
      }
      
      currentIndex++
      onUpdate(text.slice(0, currentIndex))
      
      setTimeout(typeNextChar, speed)
    }
    
    // 开始打字
    setTimeout(typeNextChar, speed)
    
    // 返回取消函数
    return () => {
      isCancelled = true
    }
  }
  
  /**
   * 替换Prompt模板中的变量
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 替换后的字符串
   */
  function replaceTemplateVariables(template, variables) {
    let result = template
    
    // 匹配 {{variableName}} 格式
    const regex = /\{\{([^}]+)\}\}/g
    result = result.replace(regex, (match, key) => {
      const trimmedKey = key.trim()
      
      // 如果是对象，转换为JSON字符串
      const value = variables[trimmedKey]
      if (value === undefined || value === null) {
        return `[缺失: ${trimmedKey}]`
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      
      return String(value)
    })
    
    return result
  }
  
  /**
   * 从变量映射中获取实际数据
   * @param {Object} variableMapping - 变量映射配置
   * @param {Object} stores - 所有store对象
   * @returns {Object} 实际变量数据
   */
  function resolveVariables(variableMapping, stores) {
    const variables = {}
    
    for (const [key, path] of Object.entries(variableMapping)) {
      variables[key] = getValueByPath(stores, path)
    }
    
    return variables
  }
  
  /**
   * 根据路径获取对象中的值
   * 支持点号分隔的路径，如 'workflow.parameters.grade'
   */
  function getValueByPath(obj, path) {
    const parts = path.split('.')
    let current = obj
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[part]
    }
    
    return current
  }
  
  /**
   * 批量生成（并发）
   * @param {Array} prompts - Prompt配置数组
   * @returns {Promise<Array>} 生成结果数组
   */
  async function batchGenerate(prompts) {
    const results = await Promise.allSettled(
      prompts.map(({ userPrompt, systemPrompt, config }) => 
        callClaude(userPrompt, systemPrompt, config)
      )
    )
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value, index }
      } else {
        return { success: false, error: result.reason.message, index }
      }
    })
  }
  
  return {
    isGenerating,
    error,
    retryCount,
    callClaude,
    callClaudeJSON,
    simulateStreaming,
    replaceTemplateVariables,
    resolveVariables,
    batchGenerate
  }
}

