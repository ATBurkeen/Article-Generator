# Bayestone Creator - 产品需求文档 (PRD)

## 文档元数据

**创建时间**: 2025-11-12  
**作者**: AI Assistant  
**版本**: v1.0.0  
**项目周期**: 3小时快速开发  

---

## 一、项目概述

### 1.1 项目背景

Bayestone Creator是一个通用的SaaS内容生成平台，首个功能模块聚焦于**UGC/素人文案自动生成**。该平台核心依托高质量媒体数据（爆文、关键词、产品话术等），结合AI大模型能力，为中小型To-B客户提供智能化内容创作服务。

### 1.2 核心价值

- **配置驱动架构**：支持不同业务场景（奶粉、书包、母婴等）快速切换
- **AI赋能创作**：多步骤智能生成，从用户画像到成品文案一站式完成
- **降本增效**：替代人工撰写，提升内容产出效率300%+

### 1.3 技术定位

- **前端技术栈**：Vue 3 + Vite + Element Plus + Pinia
- **AI服务**：OpenRouter API (Claude 3.5 Sonnet)
- **部署方式**：本地开发环境运行
- **数据存储**：IndexedDB（浏览器端）

---

## 二、功能架构

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                   Bayestone Creator                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │  业务配置层      │         │   Prompt配置层    │      │
│  │  (JSON Config)  │         │  (可视化编辑)     │      │
│  └─────────────────┘         └──────────────────┘      │
│           │                            │                 │
│           ▼                            ▼                 │
│  ┌──────────────────────────────────────────────┐      │
│  │            核心处理引擎                        │      │
│  │  • 参数提取器  • 知识库检索  • AI编排       │      │
│  └──────────────────────────────────────────────┘      │
│           │                                              │
│           ▼                                              │
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │   数据层         │         │    AI服务层       │      │
│  │  • Excel解析     │         │  • OpenRouter     │      │
│  │  • Fuse.js搜索   │         │  • 流式输出模拟   │      │
│  │  • IndexedDB     │         │  • 错误重试       │      │
│  └─────────────────┘         └──────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心功能模块

#### 模块1：配置驱动系统

**功能描述**：通过JSON配置文件定义不同业务场景的参数结构、数据源、匹配规则。

**配置示例**：

```json
{
  "businessName": "书包文案生成",
  "version": "1.0.0",
  "parameters": [
    {
      "key": "grade",
      "label": "年级",
      "type": "select",
      "options": ["1-3年级", "4-6年级", "初中"],
      "required": true
    },
    {
      "key": "feature",
      "label": "核心卖点",
      "type": "textarea",
      "placeholder": "如：护脊减负、大容量、身高定制等",
      "required": true
    }
  ],
  "dataSource": {
    "file": "戈撒驰高转化文章.xlsx",
    "searchFields": ["笔记标签", "笔记正文", "笔记标题"]
  },
  "knowledgeBase": {
    "enabledLibraries": ["popular_articles", "keywords", "rtb"]
  }
}
```

#### 模块2：Excel数据引擎

**功能描述**：加载并解析100M以内的Excel文件，提供高性能模糊搜索能力。

**技术方案**：
- **解析库**：SheetJS (xlsx) - <mark style="background-color: yellow; text-decoration: underline;">解析速度 ~50MB/s</mark>
- **搜索引擎**：Fuse.js - <mark style="background-color: yellow; text-decoration: underline;">模糊匹配阈值 0.4，搜索延迟 <50ms</mark>

**数据结构映射**：

```javascript
// Excel原始结构
{
  "笔记ID": "68839c35000000000d0259ce",
  "笔记标题": "六年级娃实测：身高定制书包超实用！",
  "笔记正文": "果果今年六年级，课本习题已经堆到像小山...",
  "笔记标签": "Gotyasatch护脊书包,戈撒驰护脊书包...",
  "点赞数": 106,
  "互动率": "15.03%"
}

// 内部标准化结构
{
  "id": "68839c35000000000d0259ce",
  "title": "六年级娃实测：身高定制书包超实用！",
  "content": "果果今年六年级...",
  "tags": ["Gotyasatch护脊书包", "戈撒驰护脊书包"],
  "metrics": {
    "likes": 106,
    "engagementRate": 0.1503
  }
}
```

#### 模块3：AI生成流程

**功能描述**：多步骤编排AI调用，生成高质量文案内容。

**流程设计**：

```
步骤1: 参数收集与验证 (前端表单验证)
  ↓
步骤2: 知识库检索 (Demo阶段AI生成模拟数据)
  • 爆文库：匹配相似爆文 (AI生成3-5条参考文案)
  • 关键词库：提取共情点 (AI生成10-15个关键词)
  • RTB库：产品话术 (AI生成2-3条产品卖点)
  ↓
步骤3: 生成目标用户画像 (Claude Prompt)
  • 输入：用户参数 + 知识库数据
  • 输出：150字人物素描
  ↓
步骤4: 提取共情点 (Claude Prompt)
  • 输入：用户画像 + 关键词库
  • 输出：5个核心共情点
  ↓
步骤5: 撰写文章主体 (Claude Prompt)
  • 输入：爆文风格 + 用户画像 + 共情点 + RTB
  • 输出：400字文章正文
  ↓
步骤6: 生成标题候选 (Claude Prompt)
  • 输入：文章内容 + 爆文标题参考
  • 输出：10个标题选项
  ↓
步骤7: 违禁词审核与优化 (Claude Prompt)
  • 输入：文章 + 违禁词规则库
  • 输出：合规化文章
  ↓
步骤8: 格式调整与emoji插入 (Claude Prompt)
  • 输入：审核后文章
  • 输出：最终成品（标题+正文+emoji）
```

**Prompt可配置化**：所有步骤的Prompt模板存储在独立配置文件中，支持热更新。

#### 模块4：工作台界面

**布局方案**：左右分栏工作台模式

```
┌─────────────────────────────────────────────────────┐
│  Header: Bayestone Creator - UGC文案生成             │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  左侧配置区   │         右侧预览区                     │
│  (30%)      │         (70%)                         │
│              │                                       │
│ [折叠面板]   │  ┌─────────────────────────────────┐ │
│  ▼ 步骤1    │  │  实时进度展示                    │ │
│    参数填写  │  │  • 当前步骤：正在生成用户画像... │ │
│  ▼ 步骤2    │  │  • 进度条：████████░░ 80%       │ │
│    知识库检索│  └─────────────────────────────────┘ │
│  ▶ 步骤3    │                                       │
│    AI生成   │  ┌─────────────────────────────────┐ │
│  ▶ 步骤4    │  │  生成结果预览                    │ │
│    结果编辑  │  │                                  │ │
│             │  │  [用户画像]                      │ │
│ [历史记录]  │  │  [共情点]                        │ │
│  • 2025-... │  │  [文章正文]                      │ │
│  • 2025-... │  │  [标题候选]                      │ │
│             │  └─────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────┘
```

**交互细节**：
- 折叠面板：当前步骤展开，已完成步骤折叠并显示✅标记
- 实时更新：AI生成过程中，右侧实时显示中间结果（模拟打字机效果）
- 响应式布局：最小宽度1280px

#### 模块5：历史记录系统

**存储方案**：IndexedDB

**数据结构**：

```javascript
{
  id: "uuid-v4",
  timestamp: 1699776000000,
  businessType: "书包文案生成",
  parameters: {
    grade: "4-6年级",
    feature: "护脊减负"
  },
  result: {
    title: "护脊书包测评：拯救娃的驼背危机！",
    content: "四升五课本和作业量巨增...",
    userProfile: "小学四年级家长...",
    keywords: ["护脊", "减负", "驼背"]
  },
  metadata: {
    duration: 45000, // 生成耗时ms
    modelUsed: "claude-sonnet-4.5"
  }
}
```

**功能要求**：
- 最多保存10条记录（FIFO）
- 支持点击历史记录快速恢复
- 支持删除单条记录

#### 模块6：导出功能

**导出格式**：HTML文件

**模板结构**：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>{标题}</title>
  <style>
    /* 小红书风格样式 */
    body { font-family: -apple-system, sans-serif; }
    .title { font-size: 24px; font-weight: bold; }
    .content { line-height: 1.8; white-space: pre-wrap; }
    .emoji { font-size: 18px; }
  </style>
</head>
<body>
  <div class="article">
    <h1 class="title">{标题}</h1>
    <div class="content">{正文内容}</div>
    <div class="meta">
      <p>生成时间: {时间戳}</p>
      <p>关键词: {标签}</p>
    </div>
  </div>
</body>
</html>
```

---

## 三、技术实现方案

### 3.1 状态管理架构 (Pinia)

**Store划分**：

```javascript
// stores/app.js - 应用全局状态
{
  currentBusiness: 'bookbag', // 当前业务类型
  isLoading: false,
  excelData: [], // 解析后的Excel数据
  excelLoadingProgress: 0
}

// stores/workflow.js - 工作流状态
{
  currentStep: 1,
  steps: [
    { id: 1, name: '参数收集', status: 'completed' },
    { id: 2, name: '知识库检索', status: 'in_progress' },
    { id: 3, name: 'AI生成', status: 'pending' }
  ],
  parameters: {}, // 用户输入的参数
  intermediateResults: {
    popularArticles: [],
    keywords: [],
    rtb: [],
    userProfile: '',
    empathyPoints: []
  },
  finalResult: {
    title: '',
    content: '',
    titleOptions: []
  }
}

// stores/history.js - 历史记录
{
  records: [], // 最多10条
  currentRecordId: null
}
```

### 3.2 Composables封装

```javascript
// composables/useExcel.js
export function useExcel() {
  const loadExcel = async (file) => { /* SheetJS解析 */ }
  const searchData = (query) => { /* Fuse.js搜索 */ }
  return { loadExcel, searchData }
}

// composables/useAI.js
export function useAI() {
  const callClaude = async (prompt, config) => { /* OpenRouter调用 */ }
  const simulateStreaming = (text, callback) => { /* 打字机效果 */ }
  return { callClaude, simulateStreaming }
}

// composables/useHistory.js
export function useHistory() {
  const saveRecord = async (data) => { /* IndexedDB存储 */ }
  const loadRecords = async () => { /* 加载历史 */ }
  const deleteRecord = async (id) => { /* 删除记录 */ }
  return { saveRecord, loadRecords, deleteRecord }
}

// composables/useExport.js
export function useExport() {
  const exportToHTML = (data) => { /* 生成HTML文件 */ }
  return { exportToHTML }
}
```

### 3.3 AI调用封装

**OpenRouter集成**：

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
});

async function callAI(prompt, systemPrompt, config = {}) {
  const maxRetries = 2;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const completion = await client.chat.completions.create({
        model: "anthropic/claude-sonnet-4.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(`AI调用失败: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

**打字机效果模拟**：

```javascript
function simulateTyping(text, onUpdate, speed = 30) {
  let currentIndex = 0;
  const interval = setInterval(() => {
    if (currentIndex < text.length) {
      onUpdate(text.slice(0, currentIndex + 1));
      currentIndex++;
    } else {
      clearInterval(interval);
    }
  }, speed);
  
  return () => clearInterval(interval); // 返回取消函数
}
```

### 3.4 配置文件结构

```
src/
├── configs/
│   ├── business/
│   │   ├── bookbag.json        # 书包业务配置
│   │   └── milkpowder.json     # 奶粉业务配置（示例）
│   └── prompts/
│       ├── userProfile.js      # 用户画像Prompt
│       ├── empathyPoints.js    # 共情点提取Prompt
│       ├── articleGeneration.js# 文章生成Prompt
│       ├── titleOptimization.js# 标题优化Prompt
│       ├── compliance.js       # 违禁词审核Prompt
│       └── formatting.js       # 格式调整Prompt
```

**Prompt配置示例**：

```javascript
// src/configs/prompts/userProfile.js
export default {
  id: 'user_profile',
  name: '用户画像生成',
  systemPrompt: `你是一位资深的用户研究专家，擅长从用户需求中提炼人物画像。`,
  userPromptTemplate: `
基于以下信息，生成一份150字以内的目标用户画像：

**用户输入参数**：
{{parameters}}

**相关爆文数据**：
{{popularArticles}}

要求：
1. 分析用户的核心需求和痛点
2. 描述用户的行为特征和决策动机
3. 突出与产品相关的场景需求
4. 语言简洁、人物形象鲜明

请直接输出人物画像，不要包含额外的说明文字。
  `,
  temperature: 0.7,
  maxTokens: 500,
  // 可配置的变量替换规则
  variableMapping: {
    'parameters': 'workflow.parameters',
    'popularArticles': 'workflow.intermediateResults.popularArticles'
  }
}
```

---

## 四、数据流设计

### 4.1 完整数据流图

```
用户输入参数
    ↓
[参数验证] → 保存到 workflow.parameters
    ↓
[加载Excel数据] → 缓存到 app.excelData
    ↓
[知识库检索]
    ├─ 爆文库：AI生成模拟数据 → workflow.intermediateResults.popularArticles
    ├─ 关键词库：AI生成模拟数据 → workflow.intermediateResults.keywords
    └─ RTB库：AI生成模拟数据 → workflow.intermediateResults.rtb
    ↓
[AI生成流程]
    ├─ 步骤1: 用户画像 → workflow.intermediateResults.userProfile
    ├─ 步骤2: 共情点提取 → workflow.intermediateResults.empathyPoints
    ├─ 步骤3: 文章生成 → workflow.intermediateResults.article
    ├─ 步骤4: 标题优化 → workflow.finalResult.titleOptions
    ├─ 步骤5: 违禁词审核 → workflow.finalResult.content
    └─ 步骤6: 格式调整 → workflow.finalResult (最终版)
    ↓
[用户确认编辑] → 可手动修改 finalResult
    ↓
[保存到历史] → IndexedDB
    ↓
[导出HTML] → 下载到本地
```

### 4.2 错误处理策略

| 错误类型 | 处理方式 | 用户提示 |
|---------|---------|---------|
| Excel加载失败 | 显示错误提示，允许重新上传 | "文件加载失败，请检查文件格式" |
| AI调用超时 | 自动重试2次，失败后提示 | "AI服务响应超时，正在重试(1/2)..." |
| AI返回内容不符合预期 | 使用默认值填充，标记警告 | "⚠️ 此部分内容生成异常，建议手动编辑" |
| IndexedDB写入失败 | 降级到LocalStorage | "历史记录保存异常，已切换备用存储" |
| 网络断开 | 暂停流程，显示重试按钮 | "网络连接中断，请检查后点击重试" |

---

## 五、性能指标

### 5.1 关键性能指标 (KPI)

| 指标项 | 目标值 | 说明 |
|-------|--------|------|
| **Excel加载时间** | <mark style="background-color: yellow; text-decoration: underline;"><3秒 (50MB文件)</mark> | 使用Web Worker异步加载 |
| **首屏渲染时间** | <mark style="background-color: yellow; text-decoration: underline;"><1秒</mark> | 骨架屏 + 懒加载 |
| **AI单步响应时间** | <mark style="background-color: yellow; text-decoration: underline;"><15秒</mark> | Claude 3.5 Sonnet平均响应 |
| **完整流程耗时** | <mark style="background-color: yellow; text-decoration: underline;"><2分钟</mark> | 8个AI步骤串行执行 |
| **模糊搜索延迟** | <mark style="background-color: yellow; text-decoration: underline;"><50ms</mark> | Fuse.js索引优化 |
| **历史记录加载** | <mark style="background-color: yellow; text-decoration: underline;"><200ms</mark> | IndexedDB批量查询 |

### 5.2 优化策略

**Excel加载优化**：
```javascript
// 使用Web Worker避免阻塞主线程
const worker = new Worker('/workers/excel-parser.js');
worker.postMessage({ file: excelFile });
worker.onmessage = (e) => {
  app.excelData = e.data;
};
```

**AI调用并发优化**（后期扩展）：
```javascript
// 部分步骤可并行执行
Promise.all([
  generateUserProfile(),
  generateKeywords(),
  generateRTB()
]).then(([profile, keywords, rtb]) => {
  // 合并结果后继续后续步骤
});
```

---

## 六、UI/UX设计规范

### 6.1 视觉风格

- **配色方案**：
  - 主色：#409EFF (Element Plus Primary)
  - 成功色：#67C23A
  - 警告色：#E6A23C
  - 危险色：#F56C6C
  - 中性色：#909399

- **字体**：
  - 标题：PingFang SC / Microsoft YaHei (16px-24px)
  - 正文：PingFang SC / Microsoft YaHei (14px)
  - 代码：Consolas / Monaco (12px)

### 6.2 交互规范

**进度反馈**：
- 每个AI步骤开始时，显示loading动画
- 步骤完成时，显示✅标记和绿色高亮
- 失败时显示❌标记和错误信息

**表单验证**：
- 必填项实时验证
- 错误提示显示在字段下方
- 所有参数验证通过后，"开始生成"按钮才可点击

**响应式反馈**：
- 按钮点击：300ms防抖
- 输入框：实时验证 + 500ms防抖搜索
- 文件上传：显示进度条

### 6.3 无障碍设计

- 所有交互元素支持键盘导航
- 表单字段提供aria-label
- 错误提示使用role="alert"

---

## 七、开发计划

### 7.1 时间分配 (3小时)

| 阶段 | 时长 | 任务 |
|-----|------|------|
| **阶段1** | 30分钟 | 项目初始化、配置文件、Pinia Store |
| **阶段2** | 45分钟 | Excel加载、Fuse.js集成、AI调用封装 |
| **阶段3** | 60分钟 | 工作台界面、流程编排、进度展示 |
| **阶段4** | 30分钟 | 历史记录、导出功能 |
| **阶段5** | 15分钟 | 测试、调试、优化 |

### 7.2 技术风险

| 风险项 | 影响 | 缓解措施 |
|-------|------|---------|
| OpenRouter API不稳定 | 高 | 添加重试机制 + 降级方案 |
| Excel文件过大导致浏览器卡顿 | 中 | 使用Web Worker + 进度提示 |
| IndexedDB兼容性问题 | 低 | 降级到LocalStorage |
| AI生成内容质量不稳定 | 中 | 提供手动编辑功能 |

---

## 八、测试用例

### 8.1 功能测试

**用例1：参数收集**
- 输入：选择"4-6年级" + 输入"护脊减负"
- 期望：参数保存成功，进入下一步

**用例2：知识库检索**
- 输入：用户参数
- 期望：AI生成3条爆文、10个关键词、2条RTB

**用例3：完整流程**
- 输入：完整参数
- 期望：2分钟内生成完整文章 + 10个标题候选

**用例4：历史记录**
- 操作：生成3篇文章
- 期望：历史列表显示3条记录，点击可恢复

**用例5：导出HTML**
- 操作：点击导出按钮
- 期望：下载包含完整内容的HTML文件

### 8.2 异常测试

**用例6：网络中断**
- 场景：AI调用时断网
- 期望：显示错误提示 + 重试按钮

**用例7：Excel文件错误**
- 场景：上传非Excel文件
- 期望：提示"文件格式不支持"

**用例8：AI返回空内容**
- 场景：API返回空字符串
- 期望：显示警告 + 允许重新生成

---

## 九、后续扩展规划

### 9.1 短期优化（1-2周）

- **性能优化**：引入虚拟滚动优化历史记录列表
- **功能增强**：支持批量生成（输入多组参数）
- **用户体验**：添加快捷键支持（Ctrl+S保存、Ctrl+E导出）

### 9.2 中期迭代（1-3个月）

- **业务扩展**：接入真实知识库API（替代AI生成模拟数据）
- **多业务支持**：完善奶粉、母婴等其他业务配置
- **协作功能**：支持分享生成结果（生成短链接）

### 9.3 长期规划（3-6个月）

- **用户系统**：登录、权限管理、团队协作
- **数据分析**：生成文案的效果追踪（点击率、转化率）
- **AI优化**：Fine-tune专属模型，提升生成质量

---

## 十、附录

### 10.1 依赖包清单

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.5.0",
    "@element-plus/icons-vue": "^2.3.0",
    "openai": "^4.20.0",
    "xlsx": "^0.18.5",
    "fuse.js": "^7.0.0",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

### 10.2 环境变量

```env
# .env
VITE_OPENROUTER_API_KEY=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
VITE_APP_TITLE=Bayestone Creator
VITE_APP_VERSION=1.0.0
VITE_MAX_HISTORY_RECORDS=10
```

### 10.3 目录结构

```
bayestone-creator/
├── public/
│   └── workers/
│       └── excel-parser.js
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── workspace/
│   │   │   ├── ConfigPanel.vue
│   │   │   ├── PreviewPanel.vue
│   │   │   └── ProgressIndicator.vue
│   │   ├── history/
│   │   │   └── HistoryList.vue
│   │   └── common/
│   │       └── FileUploader.vue
│   ├── composables/
│   │   ├── useExcel.js
│   │   ├── useAI.js
│   │   ├── useHistory.js
│   │   └── useExport.js
│   ├── configs/
│   │   ├── business/
│   │   │   └── bookbag.json
│   │   └── prompts/
│   │       ├── userProfile.js
│   │       ├── empathyPoints.js
│   │       ├── articleGeneration.js
│   │       ├── titleOptimization.js
│   │       ├── compliance.js
│   │       └── formatting.js
│   ├── stores/
│   │   ├── app.js
│   │   ├── workflow.js
│   │   └── history.js
│   ├── utils/
│   │   ├── validator.js
│   │   └── formatter.js
│   ├── views/
│   │   └── Workspace.vue
│   ├── App.vue
│   └── main.js
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

**文档结束**

本需求文档涵盖了Bayestone Creator项目的所有核心功能、技术方案和实现细节。开发过程中如遇到问题或需要调整需求，请及时更新本文档。

