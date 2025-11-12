import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  // 历史记录列表（最多10条）
  const records = ref([])
  
  // 当前查看的记录ID
  const currentRecordId = ref(null)
  
  // 最大记录数
  const MAX_RECORDS = parseInt(import.meta.env.VITE_MAX_HISTORY_RECORDS || '10')
  
  // 添加记录
  function addRecord(record) {
    const newRecord = {
      id: generateId(),
      timestamp: Date.now(),
      ...record
    }
    
    // 添加到列表开头
    records.value.unshift(newRecord)
    
    // 保持最多MAX_RECORDS条记录（FIFO）
    if (records.value.length > MAX_RECORDS) {
      records.value = records.value.slice(0, MAX_RECORDS)
    }
    
    return newRecord.id
  }
  
  // 删除记录
  function deleteRecord(id) {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value.splice(index, 1)
      if (currentRecordId.value === id) {
        currentRecordId.value = null
      }
    }
  }
  
  // 获取记录
  function getRecord(id) {
    return records.value.find(r => r.id === id)
  }
  
  // 设置当前记录
  function setCurrentRecord(id) {
    currentRecordId.value = id
  }
  
  // 清空所有记录
  function clearRecords() {
    records.value = []
    currentRecordId.value = null
  }
  
  // 加载记录列表（从IndexedDB）
  function setRecords(recordList) {
    records.value = recordList.slice(0, MAX_RECORDS)
  }
  
  // 生成唯一ID
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Computed
  const currentRecord = computed(() => 
    currentRecordId.value ? getRecord(currentRecordId.value) : null
  )
  
  const hasRecords = computed(() => records.value.length > 0)
  
  const recordsCount = computed(() => records.value.length)
  
  // 按时间排序的记录
  const sortedRecords = computed(() => 
    [...records.value].sort((a, b) => b.timestamp - a.timestamp)
  )
  
  return {
    // State
    records,
    currentRecordId,
    MAX_RECORDS,
    
    // Getters
    currentRecord,
    hasRecords,
    recordsCount,
    sortedRecords,
    
    // Actions
    addRecord,
    deleteRecord,
    getRecord,
    setCurrentRecord,
    clearRecords,
    setRecords
  }
})

