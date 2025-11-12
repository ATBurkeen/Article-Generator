<template>
  <div id="app" class="app-container">
    <Workspace />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Workspace from './views/Workspace.vue'
import { useAppStore } from './stores/app'
import { useHistoryStore } from './stores/history'
import { useHistory } from './composables/useHistory'
import businessConfig from './configs/business/bookbag.json'

const appStore = useAppStore()
const historyStore = useHistoryStore()
const { initDB, loadRecords } = useHistory()

onMounted(async () => {
  // 加载业务配置
  appStore.setBusinessConfig(businessConfig)
  
  // 初始化IndexedDB并加载历史记录
  try {
    await initDB()
    const records = await loadRecords()
    historyStore.setRecords(records)
  } catch (err) {
    console.error('初始化历史记录失败:', err)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.app-container {
  height: 100%;
  width: 100%;
  background: #f5f7fa;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

