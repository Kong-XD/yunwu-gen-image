# 快速启动指南

## 📦 安装依赖

在项目根目录运行：

\`\`\`bash
npm install
\`\`\`

如果安装速度较慢，可以使用国内镜像：

\`\`\`bash
npm install --registry=https://registry.npmmirror.com
\`\`\`

## 🚀 启动项目

安装完成后，运行开发服务器：

\`\`\`bash
npm run dev
\`\`\`

或者：

\`\`\`bash
npm start
\`\`\`

服务器启动后，在浏览器中访问：

\`\`\`
http://localhost:8000
\`\`\`

## 📂 项目说明

### 已实现功能

✅ **基础布局**
- 响应式侧边栏菜单
- 顶部导航栏
- 用户信息下拉菜单
- 侧边栏折叠/展开

✅ **Dashboard（控制台）**
- 数据统计卡片（用户数、订单数、收入、增长率）
- 最近订单列表展示
- 美观的图标和配色

✅ **用户管理**
- 用户列表展示（表格形式）
- 新增用户（模态框）
- 编辑用户
- 删除用户（带确认）
- 角色和状态标签

✅ **系统设置**
- 基本设置（站点名称、描述、语言）
- 功能设置（注册开关、邮件通知）
- 安全设置（登录限制、会话管理）

### 技术栈

- **Umi**: 4.0.74 (企业级React应用框架)
- **React**: 18.2.0
- **Ant Design**: 4.24.15 (UI组件库)
- **TypeScript**: 5.0.0
- **Less**: CSS预处理器

### 目录结构

\`\`\`
src/
├── layouts/           # 布局组件
│   ├── BasicLayout.tsx
│   └── BasicLayout.less
├── pages/            # 页面组件
│   ├── Dashboard/    # 控制台
│   ├── Users/        # 用户管理  
│   └── Settings/     # 系统设置
└── global.less       # 全局样式
\`\`\`

## 🔧 配置说明

### 路由配置

路由配置在 `.umirc.ts` 文件中，采用约定式路由：

\`\`\`typescript
routes: [
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    routes: [
      { path: '/dashboard', component: '@/pages/Dashboard' },
      { path: '/users', component: '@/pages/Users' },
      { path: '/settings', component: '@/pages/Settings' },
    ],
  },
]
\`\`\`

### 代理配置

如果需要对接后端API，已配置代理：

\`\`\`typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
\`\`\`

## 📝 开发建议

1. **添加新页面**：在 `src/pages/` 下创建新文件夹，并在 `.umirc.ts` 中添加路由

2. **修改菜单**：编辑 `src/layouts/BasicLayout.tsx` 中的 `menuItems`

3. **样式定制**：使用 Less 编写组件样式，遵循 BEM 命名规范

4. **状态管理**：如需要全局状态，可以使用 Umi 内置的数据流方案

## 🎨 预览

项目启动后包含以下页面：

- `/dashboard` - 数据看板
- `/users` - 用户管理
- `/settings` - 系统设置

## 🐛 常见问题

### Q: 安装依赖失败？
A: 尝试清除缓存：`npm cache clean --force`，然后重新安装

### Q: 端口被占用？
A: 修改 `.env` 文件中的 PORT 配置，或者使用 `PORT=3000 npm run dev` 指定端口

### Q: 样式不生效？
A: 确保 Less 模块正确导入，检查文件路径是否正确

## 📚 相关文档

- [Umi 官方文档](https://umijs.org/)
- [Ant Design 官方文档](https://4x.ant.design/)
- [React 官方文档](https://react.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Happy Coding! 🎉


