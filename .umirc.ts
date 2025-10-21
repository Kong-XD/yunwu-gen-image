import { defineConfig } from 'umi';

export default defineConfig({
  title: '云雾后台管理系统',
  npmClient: 'npm',
  
  // 配置antd
  antd: {},
  
  // 开启react查询devtools
  reactQuery: {},
  
  // 路由配置
  routes: [
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        {
          path: '/',
          redirect: '/dashboard',
        },
        {
          path: '/dashboard',
          name: '控制台',
          icon: 'DashboardOutlined',
          component: '@/pages/Dashboard',
        },
        {
          path: '/users',
          name: '用户管理',
          icon: 'UserOutlined',
          component: '@/pages/Users',
        },
        {
          path: '/settings',
          name: '系统设置',
          icon: 'SettingOutlined',
          component: '@/pages/Settings',
        },
      ],
    },
  ],

  // 配置代理
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});


