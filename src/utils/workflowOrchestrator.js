// 工作流编排器 - 核心业务逻辑
import { useAI } from '../composables/useAI'
import { useWorkflowStore } from '../stores/workflow'
import { useAppStore } from '../stores/app'

// 导入所有Prompt配置
import personaPrompt from '../configs/prompts/persona'
import knowledgeBasePrompts from '../configs/prompts/knowledgeBase'
import userProfilePrompt from '../configs/prompts/userProfile'
import empathyPointsPrompt from '../configs/prompts/empathyPoints'
import articleGenerationPrompt from '../configs/prompts/articleGeneration'
import titleOptimizationPrompt from '../configs/prompts/titleOptimization'
import compliancePrompt from '../configs/prompts/compliance'
import formattingPrompt from '../configs/prompts/formatting'

export class WorkflowOrchestrator {
  constructor() {
    this.ai = useAI()
    this.workflowStore = useWorkflowStore()
    this.appStore = useAppStore()
    this.onProgress = null
    this.onStepComplete = null
  }
  
  /**
   * 设置进度回调
   */
  setProgressCallback(callback) {
    this.onProgress = callback
  }
  
  /**
   * 设置步骤完成回调
   */
  setStepCompleteCallback(callback) {
    this.onStepComplete = callback
  }
  
  /**
   * 报告进度
   */
  reportProgress(stepId, message, data = null) {
    if (this.onProgress) {
      this.onProgress({ stepId, message, data })
    }
  }
  
  /**
   * 执行完整工作流
   */
  async executeWorkflow() {
    try {
      this.workflowStore.startGeneration()
      
      // 步骤1: 参数收集（由用户完成，跳过）
      this.workflowStore.updateStepStatus('params', 'completed')
      this.workflowStore.nextStep()
      
      // 新步骤: 人设生成
      await this.stepPersonaGeneration()
      
      // 步骤2: 知识库检索（可选）
      await this.stepKnowledgeRetrieval()
      
      // 步骤3: 用户画像生成
      await this.stepUserProfile()
      
      // 步骤4: 共情点提取
      await this.stepEmpathyPoints()
      
      // 步骤5: 文章生成
      await this.stepArticleGeneration()
      
      // 步骤6: 标题优化
      await this.stepTitleOptimization()
      
      // 步骤7: 违禁词审核
      await this.stepCompliance()
      
      // 步骤8: 格式调整
      await this.stepFormatting()
      
      // 设置最终结果
      this.setFinalResult()
      
      return true
    } catch (error) {
      console.error('工作流执行失败:', error)
      throw error
    }
  }
  
  /**
   * 新步骤: 人设生成
   */
  async stepPersonaGeneration() {
    this.reportProgress('persona', '正在生成创作者人设...')
    
    try {
      const variables = {
        targetAudience: this.workflowStore.parameters.targetAudience || '',
        feature: this.workflowStore.parameters.feature || '',
        otherParams: JSON.stringify(this.workflowStore.parameters, null, 2)
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        personaPrompt.userPromptTemplate,
        variables
      )
      
      const persona = await this.ai.callClaude(
        prompt,
        personaPrompt.systemPrompt,
        personaPrompt
      )
      
      this.workflowStore.saveIntermediateResult('persona', persona)
      this.reportProgress('persona', '✅ 创作者人设生成完成')
      
      console.log('生成的人设:', persona)
      
      if (this.onStepComplete) {
        this.onStepComplete('persona', persona)
      }
    } catch (error) {
      console.error('人设生成失败:', error)
      // 人设生成失败时使用默认人设
      const defaultPersona = '一位经验丰富、真诚可信的内容创作者，关注用户真实需求，以专业又亲切的方式分享经验。'
      this.workflowStore.saveIntermediateResult('persona', defaultPersona)
      this.reportProgress('persona', '⚠️ 使用默认人设')
    }
  }
  
  /**
   * 步骤2: 知识库检索 (AI生成模拟数据) - 可配置
   */
  async stepKnowledgeRetrieval() {
    this.workflowStore.updateStepStatus('knowledge', 'in_progress')
    this.reportProgress('knowledge', '正在检索知识库...')
    
    const params = this.workflowStore.parameters
    const paramStr = JSON.stringify(params, null, 2)
    
    // 读取用户配置的开关（默认为true）
    const enablePopularArticles = params.enablePopularArticles !== false
    const enableKeywords = params.enableKeywords !== false
    const enableRTB = params.enableRTB !== false
    
    try {
      let popularArticles = null
      let keywords = null
      let rtb = null
      
      // 根据配置生成对应的知识库数据
      if (enablePopularArticles) {
        this.reportProgress('knowledge', '正在生成爆文参考...')
        const popularPrompt = this.ai.replaceTemplateVariables(
          knowledgeBasePrompts.popularArticles.userPromptTemplate,
          { parameters: paramStr }
        )
        popularArticles = await this.ai.callClaudeJSON(
          popularPrompt,
          knowledgeBasePrompts.popularArticles.systemPrompt,
          knowledgeBasePrompts.popularArticles
        )
      } else {
        console.log('⚠️ 爆文库已禁用')
      }
      
      if (enableKeywords) {
        this.reportProgress('knowledge', '正在提取关键词...')
        const keywordsPrompt = this.ai.replaceTemplateVariables(
          knowledgeBasePrompts.keywords.userPromptTemplate,
          { parameters: paramStr }
        )
        keywords = await this.ai.callClaudeJSON(
          keywordsPrompt,
          knowledgeBasePrompts.keywords.systemPrompt,
          knowledgeBasePrompts.keywords
        )
      } else {
        console.log('⚠️ 关键词库已禁用')
      }
      
      if (enableRTB) {
        this.reportProgress('knowledge', '正在生成RTB话术...')
        const rtbPrompt = this.ai.replaceTemplateVariables(
          knowledgeBasePrompts.rtb.userPromptTemplate,
          { parameters: paramStr }
        )
        rtb = await this.ai.callClaudeJSON(
          rtbPrompt,
          knowledgeBasePrompts.rtb.systemPrompt,
          knowledgeBasePrompts.rtb
        )
      } else {
        console.log('⚠️ RTB话术库已禁用')
      }
      
      // 保存结果（即使为null也保存，让后续步骤知道这些数据不可用）
      this.workflowStore.saveIntermediateResult('popularArticles', popularArticles)
      this.workflowStore.saveIntermediateResult('keywords', keywords)
      this.workflowStore.saveIntermediateResult('rtb', rtb)
      
      this.workflowStore.updateStepStatus('knowledge', 'completed')
      this.workflowStore.nextStep()
      
      const enabledCount = [enablePopularArticles, enableKeywords, enableRTB].filter(Boolean).length
      this.reportProgress('knowledge', `✅ 知识库检索完成 (已启用${enabledCount}/3项)`)
      
      if (this.onStepComplete) {
        this.onStepComplete('knowledge', { popularArticles, keywords, rtb })
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('knowledge', 'failed')
      throw error
    }
  }
  
  /**
   * 步骤3: 用户画像生成
   */
  async stepUserProfile() {
    this.workflowStore.updateStepStatus('profile', 'in_progress')
    this.reportProgress('profile', '正在生成目标用户画像...')
    
    try {
      const variables = {
        persona: this.workflowStore.intermediateResults.persona || '专业内容创作者',
        parameters: JSON.stringify(this.workflowStore.parameters, null, 2),
        popularArticles: JSON.stringify(this.workflowStore.intermediateResults.popularArticles || {}, null, 2),
        keywords: JSON.stringify(this.workflowStore.intermediateResults.keywords || {}, null, 2)
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        userProfilePrompt.userPromptTemplate,
        variables
      )
      
      const userProfile = await this.ai.callClaude(
        prompt,
        userProfilePrompt.systemPrompt,
        userProfilePrompt
      )
      
      this.workflowStore.saveIntermediateResult('userProfile', userProfile)
      this.workflowStore.updateStepStatus('profile', 'completed')
      this.workflowStore.nextStep()
      this.reportProgress('profile', '✅ 用户画像生成完成')
      
      if (this.onStepComplete) {
        this.onStepComplete('profile', userProfile)
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('profile', 'failed')
      throw error
    }
  }
  
  /**
   * 步骤4: 共情点提取
   */
  async stepEmpathyPoints() {
    this.workflowStore.updateStepStatus('empathy', 'in_progress')
    this.reportProgress('empathy', '正在提取共情点...')
    
    try {
      const variables = {
        persona: this.workflowStore.intermediateResults.persona || '专业内容创作者',
        userProfile: this.workflowStore.intermediateResults.userProfile,
        keywords: JSON.stringify(this.workflowStore.intermediateResults.keywords || {}, null, 2),
        parameters: JSON.stringify(this.workflowStore.parameters, null, 2)
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        empathyPointsPrompt.userPromptTemplate,
        variables
      )
      
      const empathyPoints = await this.ai.callClaudeJSON(
        prompt,
        empathyPointsPrompt.systemPrompt,
        empathyPointsPrompt
      )
      
      this.workflowStore.saveIntermediateResult('empathyPoints', empathyPoints)
      this.workflowStore.updateStepStatus('empathy', 'completed')
      this.workflowStore.nextStep()
      this.reportProgress('empathy', '✅ 共情点提取完成')
      
      if (this.onStepComplete) {
        this.onStepComplete('empathy', empathyPoints)
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('empathy', 'failed')
      throw error
    }
  }
  
  /**
   * 步骤5: 文章生成
   */
  async stepArticleGeneration() {
    this.workflowStore.updateStepStatus('article', 'in_progress')
    this.reportProgress('article', '正在撰写文章...')
    
    try {
      // 获取文章字数，默认400字
      const articleLength = this.workflowStore.parameters.articleLength || 400
      
      const variables = {
        articleLength: articleLength,
        persona: this.workflowStore.intermediateResults.persona || '专业内容创作者',
        userProfile: this.workflowStore.intermediateResults.userProfile,
        empathyPoints: JSON.stringify(this.workflowStore.intermediateResults.empathyPoints, null, 2),
        rtb: JSON.stringify(this.workflowStore.intermediateResults.rtb || {}, null, 2),
        popularArticles: JSON.stringify(this.workflowStore.intermediateResults.popularArticles || {}, null, 2),
        parameters: JSON.stringify(this.workflowStore.parameters, null, 2)
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        articleGenerationPrompt.userPromptTemplate,
        variables
      )
      
      const article = await this.ai.callClaude(
        prompt,
        articleGenerationPrompt.systemPrompt,
        articleGenerationPrompt
      )
      
      this.workflowStore.saveIntermediateResult('article', article)
      this.workflowStore.updateStepStatus('article', 'completed')
      this.workflowStore.nextStep()
      this.reportProgress('article', '✅ 文章生成完成')
      
      if (this.onStepComplete) {
        this.onStepComplete('article', article)
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('article', 'failed')
      throw error
    }
  }
  
  /**
   * 步骤6: 标题优化
   */
  async stepTitleOptimization() {
    this.workflowStore.updateStepStatus('titles', 'in_progress')
    this.reportProgress('titles', '正在生成标题候选...')
    
    try {
      const variables = {
        article: this.workflowStore.intermediateResults.article,
        parameters: JSON.stringify(this.workflowStore.parameters, null, 2),
        popularTitles: JSON.stringify(this.workflowStore.intermediateResults.popularArticles, null, 2)
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        titleOptimizationPrompt.userPromptTemplate,
        variables
      )
      
      const titleOptions = await this.ai.callClaudeJSON(
        prompt,
        titleOptimizationPrompt.systemPrompt,
        titleOptimizationPrompt
      )
      
      this.workflowStore.saveIntermediateResult('titleOptions', titleOptions)
      // 默认选择第一个标题
      if (titleOptions.titles && titleOptions.titles.length > 0) {
        this.workflowStore.saveIntermediateResult('selectedTitle', titleOptions.titles[0].title)
      }
      
      this.workflowStore.updateStepStatus('titles', 'completed')
      this.workflowStore.nextStep()
      this.reportProgress('titles', '✅ 标题生成完成')
      
      if (this.onStepComplete) {
        this.onStepComplete('titles', titleOptions)
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('titles', 'failed')
      throw error
    }
  }
  
  /**
   * 步骤7: 违禁词审核
   */
  async stepCompliance() {
    this.workflowStore.updateStepStatus('compliance', 'in_progress')
    this.reportProgress('compliance', '正在进行合规性审核...')
    
    try {
      // 确保有选中的标题，如果没有则使用第一个标题
      let selectedTitle = this.workflowStore.intermediateResults.selectedTitle
      if (!selectedTitle) {
        const titleOptions = this.workflowStore.intermediateResults.titleOptions
        if (titleOptions && titleOptions.titles && titleOptions.titles.length > 0) {
          selectedTitle = titleOptions.titles[0].title || titleOptions.titles[0]
          this.workflowStore.saveIntermediateResult('selectedTitle', selectedTitle)
          console.log('⚠️ 未选择标题，自动使用第一个:', selectedTitle)
        } else {
          // 如果标题列表也为空，生成一个默认标题
          selectedTitle = '优质内容分享'
          this.workflowStore.saveIntermediateResult('selectedTitle', selectedTitle)
          console.warn('⚠️ 无标题可用，使用默认标题')
        }
      }
      
      const variables = {
        title: selectedTitle,
        article: this.workflowStore.intermediateResults.article
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        compliancePrompt.userPromptTemplate,
        variables
      )
      
      const complianceResult = await this.ai.callClaudeJSON(
        prompt,
        compliancePrompt.systemPrompt,
        compliancePrompt
      )
      
      this.workflowStore.saveIntermediateResult('complianceResult', complianceResult.compliance)
      
      this.workflowStore.updateStepStatus('compliance', 'completed')
      this.workflowStore.nextStep()
      
      if (complianceResult.compliance.hasIssues) {
        this.reportProgress('compliance', `✅ 合规性审核完成，已修正${complianceResult.compliance.issues.length}处问题`)
      } else {
        this.reportProgress('compliance', '✅ 合规性审核完成，无违规内容')
      }
      
      if (this.onStepComplete) {
        this.onStepComplete('compliance', complianceResult.compliance)
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('compliance', 'failed')
      throw error
    }
  }
  
  /**
   * 步骤8: 格式调整
   */
  async stepFormatting() {
    this.workflowStore.updateStepStatus('formatting', 'in_progress')
    this.reportProgress('formatting', '正在优化格式和插入emoji...')
    
    try {
      const compliance = this.workflowStore.intermediateResults.complianceResult
      const variables = {
        title: compliance.fixedTitle,
        article: compliance.fixedArticle
      }
      
      const prompt = this.ai.replaceTemplateVariables(
        formattingPrompt.userPromptTemplate,
        variables
      )
      
      const formattedResult = await this.ai.callClaudeJSON(
        prompt,
        formattingPrompt.systemPrompt,
        formattingPrompt
      )
      
      this.workflowStore.saveIntermediateResult('formattedResult', formattedResult.result)
      
      this.workflowStore.updateStepStatus('formatting', 'completed')
      this.workflowStore.nextStep()
      this.reportProgress('formatting', `✅ 格式调整完成，已插入${formattedResult.result.emojiCount}个emoji`)
      
      if (this.onStepComplete) {
        this.onStepComplete('formatting', formattedResult.result)
      }
    } catch (error) {
      this.workflowStore.updateStepStatus('formatting', 'failed')
      throw error
    }
  }
  
  /**
   * 设置最终结果
   */
  setFinalResult() {
    const formatted = this.workflowStore.intermediateResults.formattedResult
    
    this.workflowStore.setFinalResult({
      title: formatted.title,
      content: formatted.content
    })
    
    this.reportProgress('complete', '🎉 文章生成完成！')
  }
}

