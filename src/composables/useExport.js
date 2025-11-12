import { ref } from 'vue'

export function useExport() {
  const isExporting = ref(false)
  const error = ref(null)
  
  /**
   * 导出为HTML文件
   * @param {Object} data - 文章数据
   * @param {string} data.title - 标题
   * @param {string} data.content - 内容
   * @param {Object} data.metadata - 元数据
   * @returns {Promise<void>}
   */
  async function exportToHTML(data) {
    isExporting.value = true
    error.value = null
    
    try {
      const { title, content, metadata } = data
      
      // 生成HTML模板
      const html = generateHTMLTemplate({
        title,
        content,
        generatedAt: metadata.generatedAt || new Date().toISOString(),
        duration: metadata.duration || 0,
        modelUsed: metadata.modelUsed || 'claude-sonnet-4.5'
      })
      
      // 创建Blob
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      
      // 生成文件名
      const filename = generateFilename(title)
      
      // 触发下载
      downloadBlob(blob, filename)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('导出HTML失败:', err)
      return false
    } finally {
      isExporting.value = false
    }
  }
  
  /**
   * 生成HTML模板
   */
  function generateHTMLTemplate({ title, content, generatedAt, duration, modelUsed }) {
    // 处理换行符
    const formattedContent = content.replace(/\n/g, '<br>')
    
    // 格式化生成时间
    const formattedDate = new Date(generatedAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // 格式化耗时
    const formattedDuration = duration > 0 
      ? `${Math.round(duration / 1000)}秒` 
      : '未知'
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Bayestone Creator">
  <title>${escapeHTML(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 
                   'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.8;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    
    .title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px 30px;
      font-size: 16px;
      line-height: 2;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .emoji {
      font-size: 18px;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      border-top: 1px solid #e9ecef;
    }
    
    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 14px;
      color: #666;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .meta-label {
      font-weight: 500;
      color: #333;
    }
    
    .watermark {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e9ecef;
    }
    
    .watermark a {
      color: #667eea;
      text-decoration: none;
    }
    
    .watermark a:hover {
      text-decoration: underline;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        border-radius: 0;
      }
    }
    
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .title {
        font-size: 22px;
      }
      
      .content {
        padding: 30px 20px;
        font-size: 15px;
      }
      
      .footer {
        padding: 15px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${escapeHTML(title)}</h1>
      <p class="subtitle">由 Bayestone Creator 智能生成</p>
    </div>
    
    <div class="content">
      ${formattedContent}
    </div>
    
    <div class="footer">
      <div class="meta-info">
        <div class="meta-item">
          <span class="meta-label">生成时间:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">生成耗时:</span>
          <span>${formattedDuration}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">AI模型:</span>
          <span>${escapeHTML(modelUsed)}</span>
        </div>
      </div>
    </div>
    
    <div class="watermark">
      Powered by <a href="#">Bayestone Creator</a> | 智能UGC内容生成平台
    </div>
  </div>
</body>
</html>`
  }
  
  /**
   * HTML转义
   */
  function escapeHTML(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }
  
  /**
   * 生成文件名
   */
  function generateFilename(title) {
    // 移除特殊字符
    const cleanTitle = title
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)
    
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${cleanTitle}-${timestamp}.html`
  }
  
  /**
   * 触发下载
   */
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }
  
  /**
   * 复制到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否成功
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      
      return success
    }
  }
  
  return {
    isExporting,
    error,
    exportToHTML,
    copyToClipboard
  }
}

