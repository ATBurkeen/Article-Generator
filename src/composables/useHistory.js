import { ref } from 'vue'
import { openDB } from 'idb'

const DB_NAME = 'bayestone-creator'
const DB_VERSION = 1
const STORE_NAME = 'history'

export function useHistory() {
  const db = ref(null)
  const isInitialized = ref(false)
  const error = ref(null)
  
  /**
   * 初始化IndexedDB
   */
  async function initDB() {
    try {
      db.value = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // 创建对象存储
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { 
              keyPath: 'id' 
            })
            // 创建索引
            store.createIndex('timestamp', 'timestamp', { unique: false })
            store.createIndex('businessType', 'businessType', { unique: false })
          }
        }
      })
      
      isInitialized.value = true
      return db.value
    } catch (err) {
      error.value = err.message
      console.error('IndexedDB初始化失败:', err)
      
      // 降级到LocalStorage
      console.warn('降级使用LocalStorage')
      return null
    }
  }
  
  /**
   * 保存记录到IndexedDB
   * @param {Object} record - 记录对象
   * @returns {Promise<string>} 记录ID
   */
  async function saveRecord(record) {
    if (!db.value) {
      await initDB()
    }
    
    try {
      if (db.value) {
        // 使用IndexedDB
        const tx = db.value.transaction(STORE_NAME, 'readwrite')
        await tx.store.add(record)
        await tx.done
        return record.id
      } else {
        // 降级到LocalStorage
        return saveToLocalStorage(record)
      }
    } catch (err) {
      error.value = err.message
      console.error('保存记录失败:', err)
      // 尝试LocalStorage作为备份
      return saveToLocalStorage(record)
    }
  }
  
  /**
   * 加载所有记录
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 记录列表
   */
  async function loadRecords(limit = 10) {
    if (!db.value) {
      await initDB()
    }
    
    try {
      if (db.value) {
        // 从IndexedDB加载
        const tx = db.value.transaction(STORE_NAME, 'readonly')
        const index = tx.store.index('timestamp')
        let records = await index.getAll()
        
        // 按时间倒序排序
        records.sort((a, b) => b.timestamp - a.timestamp)
        
        // 限制数量
        records = records.slice(0, limit)
        
        return records
      } else {
        // 从LocalStorage加载
        return loadFromLocalStorage(limit)
      }
    } catch (err) {
      error.value = err.message
      console.error('加载记录失败:', err)
      return loadFromLocalStorage(limit)
    }
  }
  
  /**
   * 删除记录
   * @param {string} id - 记录ID
   * @returns {Promise<boolean>} 是否成功
   */
  async function deleteRecord(id) {
    if (!db.value) {
      await initDB()
    }
    
    try {
      if (db.value) {
        const tx = db.value.transaction(STORE_NAME, 'readwrite')
        await tx.store.delete(id)
        await tx.done
        return true
      } else {
        return deleteFromLocalStorage(id)
      }
    } catch (err) {
      error.value = err.message
      console.error('删除记录失败:', err)
      return false
    }
  }
  
  /**
   * 获取单条记录
   * @param {string} id - 记录ID
   * @returns {Promise<Object>} 记录对象
   */
  async function getRecord(id) {
    if (!db.value) {
      await initDB()
    }
    
    try {
      if (db.value) {
        return await db.value.get(STORE_NAME, id)
      } else {
        return getFromLocalStorage(id)
      }
    } catch (err) {
      error.value = err.message
      console.error('获取记录失败:', err)
      return null
    }
  }
  
  /**
   * 清空所有记录
   * @returns {Promise<boolean>} 是否成功
   */
  async function clearAllRecords() {
    if (!db.value) {
      await initDB()
    }
    
    try {
      if (db.value) {
        const tx = db.value.transaction(STORE_NAME, 'readwrite')
        await tx.store.clear()
        await tx.done
        return true
      } else {
        localStorage.removeItem('bayestone-history')
        return true
      }
    } catch (err) {
      error.value = err.message
      console.error('清空记录失败:', err)
      return false
    }
  }
  
  // ============= LocalStorage降级方案 =============
  
  function saveToLocalStorage(record) {
    try {
      const records = loadFromLocalStorage()
      records.unshift(record)
      
      // 限制数量
      const limited = records.slice(0, 10)
      localStorage.setItem('bayestone-history', JSON.stringify(limited))
      
      return record.id
    } catch (err) {
      console.error('LocalStorage保存失败:', err)
      throw err
    }
  }
  
  function loadFromLocalStorage(limit = 10) {
    try {
      const data = localStorage.getItem('bayestone-history')
      if (!data) return []
      
      const records = JSON.parse(data)
      return records.slice(0, limit)
    } catch (err) {
      console.error('LocalStorage加载失败:', err)
      return []
    }
  }
  
  function deleteFromLocalStorage(id) {
    try {
      const records = loadFromLocalStorage()
      const filtered = records.filter(r => r.id !== id)
      localStorage.setItem('bayestone-history', JSON.stringify(filtered))
      return true
    } catch (err) {
      console.error('LocalStorage删除失败:', err)
      return false
    }
  }
  
  function getFromLocalStorage(id) {
    try {
      const records = loadFromLocalStorage()
      return records.find(r => r.id === id) || null
    } catch (err) {
      console.error('LocalStorage获取失败:', err)
      return null
    }
  }
  
  return {
    db,
    isInitialized,
    error,
    initDB,
    saveRecord,
    loadRecords,
    deleteRecord,
    getRecord,
    clearAllRecords
  }
}

