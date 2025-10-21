# 云雾后台管理系统

基于 Umi 4.0 + React 18 + Ant Design 4.0 的后台管理系统。

## 技术栈

- **框架**: Umi 4.0
- **UI库**: Ant Design 4.0
- **前端**: React 18
- **语言**: TypeScript
- **样式**: Less

## 功能特性

- ✅ 响应式布局（侧边栏、顶部导航）
- ✅ 路由配置和菜单管理
- ✅ Dashboard 数据看板
- ✅ 用户管理（增删改查）
- ✅ 系统设置
- ✅ 优雅的UI设计
- ✅ TypeScript 类型支持

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
# 或
npm start
\`\`\`

访问 http://localhost:8000

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 项目结构

\`\`\`
yunwu-gen-image/
├── src/
│   ├── layouts/              # 布局组件
│   │   ├── BasicLayout.tsx   # 基础布局
│   │   └── BasicLayout.less  # 布局样式
│   ├── pages/                # 页面组件
│   │   ├── Dashboard/        # 控制台
│   │   ├── Users/            # 用户管理
│   │   └── Settings/         # 系统设置
│   └── global.less           # 全局样式
├── .umirc.ts                 # Umi 配置文件
├── package.json              # 项目依赖
└── tsconfig.json             # TypeScript 配置
\`\`\`

## 页面说明

### Dashboard（控制台）
- 展示系统核心数据统计
- 最近订单列表
- 数据可视化展示

### Users（用户管理）
- 用户列表展示
- 新增/编辑/删除用户
- 用户角色和状态管理

### Settings（系统设置）
- 基本设置（站点信息）
- 功能设置（注册、邮件等）
- 安全设置（登录限制、会话管理）

## 自定义配置

修改 `.umirc.ts` 文件可以自定义：
- 路由配置
- 代理设置
- 构建配置
- 插件配置

## 开发建议

1. 遵循 Ant Design 设计规范
2. 使用 TypeScript 提供类型安全
3. 组件化开发，提高代码复用性
4. 使用 Less 进行样式管理

## License

MIT


