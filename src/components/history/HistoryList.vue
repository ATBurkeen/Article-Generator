<template>
  <div class="history-list">
    <el-empty
      v-if="!historyStore.hasRecords"
      description="暂无历史记录"
      :image-size="100"
    />

    <div v-else class="history-items">
      <div
        v-for="record in historyStore.sortedRecords"
        :key="record.id"
        class="history-item"
        @click="$emit('load', record)"
      >
        <div class="item-header">
          <h5 class="item-title">{{ record.result.title || '未命名' }}</h5>
          <el-button
            :icon="Delete"
            size="small"
            text
            @click.stop="$emit('delete', record.id)"
          />
        </div>
        
        <div class="item-meta">
          <span class="meta-time">
            {{ formatTime(record.timestamp) }}
          </span>
          <el-tag size="small" type="info">
            {{ record.businessType }}
          </el-tag>
        </div>

        <p class="item-preview">
          {{ getPreview(record.result.content) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
import { useHistoryStore } from '../../stores/history'

defineEmits(['load', 'delete'])

const historyStore = useHistoryStore()

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

function getPreview(content) {
  if (!content) return ''
  return content.slice(0, 60) + (content.length > 60 ? '...' : '')
}
</script>

<style scoped>
.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.meta-time {
  font-size: 12px;
  color: #909399;
}

.item-preview {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

