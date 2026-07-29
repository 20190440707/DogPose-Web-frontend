# DogPose-Web-frontend

DogPose Web 前端应用 - v2.0.0

## 项目简介

DogPose-Web-frontend 是 DogPose 项目的前端应用，基于 Vue 3 + Vite 构建，提供用户友好的 Web 界面。

## 技术栈

- **框架**: Vue 3.5+
- **构建工具**: Vite 7.3+
- **路由**: Vue Router 5.0+
- **状态管理**: Pinia 3.0+
- **UI 组件库**: Ant Design Vue 4.2+
- **HTTP 客户端**: Axios
- **样式**: Sass

## 项目结构

```
src/
├── apis/          # API 接口封装
├── components/    # 公共组件
├── layouts/       # 布局组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── style/         # 全局样式
├── utils/         # 工具函数
├── views/         # 页面视图
├── App.vue        # 根组件
└── main.js        # 入口文件
```

## 快速开始

### 环境要求

- Node.js ^20.19.0 或 >=22.12.0
- pnpm (推荐)

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

### 生产环境构建

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

### 代码格式化

```bash
pnpm format
```

## 开发工具推荐

### IDE

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件

### 浏览器调试工具

- **Chromium 浏览器** (Chrome, Edge, Brave 等):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 版本历史

### v2.0.0
- 集成犬只行为分析 2.0 子系统
- 支持攻击性与衔取行为评估指标
- 更新衔取与耐力行为分析服务端口
- 优化页面整体视觉风格与 header、头像等组件样式

### v0.1.0
- 初始版本发布
- 基础架构搭建
- 用户登录/注册功能
- 基础页面布局
