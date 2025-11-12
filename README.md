# Bayestone Creator

## 项目简介

Bayestone Creator 是一个通用的 SaaS 内容生成平台，首个功能模块聚焦于 UGC/素人文案自动生成。

## 技术栈

- **前端框架**: Vue 3 + Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **AI 服务**: OpenRouter (Claude 3.5 Sonnet)
- **数据处理**: SheetJS (Excel) + Fuse.js (搜索)
- **数据存储**: IndexedDB

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，确保 API Key 正确配置。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器将自动打开 `http://localhost:5173`

## 项目结构

```
bayestone-creator/
├── src/
│   ├── components/      # 组件
│   ├── composables/     # 组合式函数
│   ├── configs/         # 配置文件
│   ├── stores/          # Pinia 状态管理
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   └── main.js          # 入口文件
├── public/              # 静态资源
└── package.json         # 项目配置
```

## 功能特性

- ✅ 配置驱动的参数系统
- ✅ Excel 数据加载与模糊搜索
- ✅ AI 多步骤生成流程
- ✅ 实时进度展示
- ✅ 历史记录管理（IndexedDB）
- ✅ HTML 导出功能

## 开发指南

详细的技术文档请参考 [PRD-Bayestone-Creator.md](./PRD-Bayestone-Creator.md)

## License

MIT

