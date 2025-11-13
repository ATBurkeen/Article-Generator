# 更新日志 - Bayestone Creator

## 版本 1.1.1 (2025-11-12 23:45) - JSON解析全面优化

### 🔧 修复

#### 1. Prompt配置统一强化
- **所有JSON输出Prompt增加5条明确要求**：
  1. 只输出纯JSON对象
  2. 不要添加markdown标记（如\`\`\`json）
  3. 不要添加任何前缀或后缀说明文字
  4. 不要添加emoji或特殊符号
  5. 直接输出指定格式的JSON

**受影响文件**：
- `src/configs/prompts/compliance.js` - 违禁词审核
- `src/configs/prompts/formatting.js` - 格式调整
- `src/configs/prompts/titleOptimization.js` - 标题优化
- `src/configs/prompts/empathyPoints.js` - 共情点提取
- `src/configs/prompts/knowledgeBase.js` - 知识库生成（爆文库、关键词库、RTB话术）

#### 2. JSON解析容错能力大幅提升
- **新增多层解析逻辑**：
  - 第1层：移除各种变体的markdown标记
  - 第2层：智能移除前缀说明文字
  - 第3层：正则提取JSON块
  - 第4层：直接解析尝试
  - 第5层：暴力扫描所有{}块（兜底机制）
- **增强错误日志**：显示原始响应、清理后内容、解析方式标识
- **支持多种格式**：可解析带前缀、带emoji、带markdown标记的JSON

**文件变更**：
- 修改：`src/composables/useAI.js` - 增强callClaudeJSON函数

### 📝 技术细节
- 解析成功时会在控制台显示具体的解析方式（正则提取/直接解析/暴力提取）
- 所有Prompt配置采用统一的"输出格式要求（必读）"格式
- 提高了AI返回内容的解析成功率，减少因格式问题导致的生成失败

---

## 版本 1.1.0 (2025-11-12)

### ✨ 新增功能

#### 1. 贯穿全局的创作者人设系统
- 新增 `persona.js` Prompt配置文件
- 在工作流开始时生成统一的创作者人设
- 人设会贯穿整个创作流程，确保内容风格一致性
- 人设生成失败时自动使用默认人设作为降级方案

**文件变更**：
- 新建：`src/configs/prompts/persona.js`
- 修改：`src/utils/workflowOrchestrator.js` - 添加人设生成步骤
- 修改：`src/stores/workflow.js` - 添加persona字段

#### 2. 文章字数可配置
- 用户可在参数配置中自定义文章字数（200-1000字）
- 默认值为400字
- 使用数字输入框，支持步进调整

**文件变更**：
- 修改：`src/configs/business/bookbag.json` - 添加articleLength参数
- 修改：`src/components/workspace/ConfigPanel.vue` - 支持number类型
- 修改：`src/configs/prompts/articleGeneration.js` - 支持动态字数
- 修改：`src/utils/workflowOrchestrator.js` - 传递articleLength参数

#### 3. 知识库三项可配置（爆文库、关键词库、RTB库）
- 新增三个开关控制知识库的启用/禁用
- 默认全部启用
- 禁用后该知识库数据不会生成，节省时间和成本

**文件变更**：
- 修改：`src/configs/business/bookbag.json` - 添加三个switch参数
- 修改：`src/components/workspace/ConfigPanel.vue` - 支持switch类型
- 修改：`src/utils/workflowOrchestrator.js` - 根据开关条件生成知识库

### 🔧 优化改进

#### 4. 严格根据yml文件修改共情点Prompt
- 修改empathyPoints的system prompt
- 采用yml文件中的"父亲型陪伴者"人设描述
- 增强共情点的情感共鸣能力

**文件变更**：
- 修改：`src/configs/prompts/empathyPoints.js`

#### 5. 删除所有Prompt中的实际例子
- 移除所有placeholder中的具体示例
- 移除Prompt模板中的范例说明
- 让AI根据实际需求自主创作，避免模板化

**文件变更**：
- 修改：`src/configs/business/bookbag.json`
- 修改：`src/configs/prompts/userProfile.js`
- 修改：`src/configs/prompts/knowledgeBase.js`
- 修改：`src/configs/prompts/titleOptimization.js`

### 🎨 UI组件增强

#### ConfigPanel组件
- 新增对`number`类型的支持（数字输入框）
- 新增对`switch`类型的支持（开关）
- 优化初始值设置逻辑
- 添加switch描述文字样式

**文件变更**：
- 修改：`src/components/workspace/ConfigPanel.vue`

### 🔄 工作流程调整

**新的完整工作流**：
```
1. 参数收集 (用户填写)
2. 人设生成 (新增) ⭐
3. 知识库检索 (可配置) ⭐
   - 爆文库 (可选)
   - 关键词库 (可选)
   - RTB话术库 (可选)
4. 用户画像生成
5. 共情点提取
6. 文章生成 (支持动态字数) ⭐
7. 标题优化
8. 违禁词审核
9. 格式调整
```

### 📊 数据流变化

**人设数据流向**：
```
用户参数 → 人设生成 → 用户画像 → 共情点提取 → 文章生成
```

所有涉及内容创作的步骤都会接收人设数据，确保风格一致。

### 🐛 Bug修复

- 修复知识库数据为null时的异常处理
- 添加默认值防止undefined错误
- 改善错误日志输出

### 📝 配置变更总结

**新增参数字段**：
| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `articleLength` | number | 400 | 文章字数(200-1000) |
| `enablePopularArticles` | switch | true | 启用爆文库 |
| `enableKeywords` | switch | true | 启用关键词库 |
| `enableRTB` | switch | true | 启用产品话术库 |

### ⚙️ 技术细节

**新增variableMapping**：
- persona → workflow.intermediateResults.persona
- articleLength → workflow.parameters.articleLength

**支持的表单类型**：
- ✅ input (文本输入)
- ✅ textarea (多行文本)
- ✅ select (下拉选择)
- ✅ number (数字输入) ⭐新增
- ✅ switch (开关) ⭐新增

### 🎯 使用建议

1. **首次使用**：建议保持所有知识库开关为开启状态
2. **快速测试**：可关闭爆文库和RTB库，仅保留关键词库
3. **精细控制**：根据实际需求调整文章字数
4. **人设一致性**：同一批次生成的文章会保持相同的人设风格

### 📌 注意事项

- 人设生成会在每次工作流开始时执行
- 知识库开关默认全部启用，确保向后兼容
- 关闭知识库不会报错，系统会优雅降级
- 文章字数为建议值，AI可能会有±10%的浮动

---

**总计修改文件**：12个  
**新增文件**：2个 (persona.js, CHANGELOG.md)  
**代码变更行数**：约500行

**主要贡献者**：AI Assistant  
**审核状态**：待测试

