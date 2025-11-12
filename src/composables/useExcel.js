import { ref } from 'vue'
import * as XLSX from 'xlsx'
import Fuse from 'fuse.js'

export function useExcel() {
  const isLoading = ref(false)
  const progress = ref(0)
  const error = ref(null)
  const searchIndex = ref(null)
  
  /**
   * 加载并解析Excel文件
   * @param {File} file - Excel文件对象
   * @returns {Promise<Array>} 解析后的数据数组
   */
  async function loadExcel(file) {
    isLoading.value = true
    progress.value = 0
    error.value = null
    
    try {
      const data = await readFileAsArrayBuffer(file)
      progress.value = 30
      
      const workbook = XLSX.read(data, { type: 'array' })
      progress.value = 60
      
      // 读取第一个sheet
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      progress.value = 90
      
      // 标准化数据结构
      const normalizedData = normalizeData(jsonData)
      progress.value = 100
      
      return normalizedData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 读取文件为ArrayBuffer
   */
  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsArrayBuffer(file)
    })
  }
  
  /**
   * 标准化数据结构
   * 将Excel字段映射为统一的内部结构
   */
  function normalizeData(rawData) {
    return rawData.map(item => ({
      id: item['笔记ID'] || item.id || '',
      title: item['笔记标题'] || item.title || '',
      content: item['笔记正文'] || item.content || '',
      tags: parseTag(item['笔记标签'] || item.tags || ''),
      author: item['作者昵称'] || item.author || '',
      publishTime: item['发布时间'] || item.publishTime || '',
      metrics: {
        likes: parseInt(item['点赞数'] || item.likes || 0),
        collects: parseInt(item['收藏数'] || item.collects || 0),
        comments: parseInt(item['评论数'] || item.comments || 0),
        shares: parseInt(item['分享数'] || item.shares || 0),
        engagementRate: parseFloat(item['互动率'] || item.engagementRate || 0)
      },
      link: item['笔记链接'] || item.link || '',
      rawData: item // 保留原始数据
    }))
  }
  
  /**
   * 解析标签字符串为数组
   */
  function parseTag(tagString) {
    if (!tagString) return []
    if (Array.isArray(tagString)) return tagString
    return tagString.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
  }
  
  /**
   * 初始化搜索索引
   * @param {Array} data - 数据数组
   * @param {Array} searchFields - 搜索字段列表
   */
  function initializeSearchIndex(data, searchFields = ['title', 'content', 'tags']) {
    const options = {
      keys: searchFields,
      threshold: 0.4, // 模糊匹配阈值（0=完全匹配，1=匹配任何内容）
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      useExtendedSearch: true
    }
    
    searchIndex.value = new Fuse(data, options)
  }
  
  /**
   * 模糊搜索
   * @param {string} query - 搜索关键词
   * @param {number} limit - 返回结果数量限制
   * @returns {Array} 搜索结果
   */
  function searchData(query, limit = 10) {
    if (!searchIndex.value) {
      console.warn('搜索索引未初始化')
      return []
    }
    
    if (!query || query.trim() === '') {
      return []
    }
    
    const results = searchIndex.value.search(query, { limit })
    return results.map(r => ({
      ...r.item,
      score: r.score // 匹配分数，越小越匹配
    }))
  }
  
  /**
   * 高级搜索（支持多条件）
   * @param {Object} filters - 过滤条件
   * @returns {Array} 过滤后的结果
   */
  function advancedSearch(filters, data) {
    let results = data
    
    // 按互动率过滤
    if (filters.minEngagementRate) {
      results = results.filter(item => 
        item.metrics.engagementRate >= filters.minEngagementRate
      )
    }
    
    // 按点赞数过滤
    if (filters.minLikes) {
      results = results.filter(item => 
        item.metrics.likes >= filters.minLikes
      )
    }
    
    // 按标签过滤
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(item => 
        filters.tags.some(tag => item.tags.includes(tag))
      )
    }
    
    // 按时间范围过滤
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      results = results.filter(item => {
        const publishTime = new Date(item.publishTime).getTime()
        return publishTime >= start && publishTime <= end
      })
    }
    
    // 排序
    if (filters.sortBy) {
      results = sortResults(results, filters.sortBy, filters.sortOrder)
    }
    
    return results
  }
  
  /**
   * 排序结果
   */
  function sortResults(data, sortBy, order = 'desc') {
    const sorted = [...data].sort((a, b) => {
      let aValue, bValue
      
      if (sortBy === 'engagementRate') {
        aValue = a.metrics.engagementRate
        bValue = b.metrics.engagementRate
      } else if (sortBy === 'likes') {
        aValue = a.metrics.likes
        bValue = b.metrics.likes
      } else if (sortBy === 'publishTime') {
        aValue = new Date(a.publishTime).getTime()
        bValue = new Date(b.publishTime).getTime()
      } else {
        return 0
      }
      
      return order === 'desc' ? bValue - aValue : aValue - bValue
    })
    
    return sorted
  }
  
  /**
   * 随机选择N条数据
   */
  function randomSelect(data, count) {
    if (data.length <= count) return data
    
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
  
  return {
    isLoading,
    progress,
    error,
    searchIndex,
    loadExcel,
    initializeSearchIndex,
    searchData,
    advancedSearch,
    randomSelect,
    normalizeData
  }
}

