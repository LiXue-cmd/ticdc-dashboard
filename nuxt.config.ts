// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@unocss/nuxt',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-codemirror',
    'nuxt-authorization', // 引入认证模块
    '@sidebase/nuxt-auth',
  ],
  auth: {
    // 认证配置
    baseURL: process.env.AUTH_BASE_URL || 'http://localhost:3000', // 根据实际情况修改
    origin: process.env.ORIGIN || 'http://localhost:3000',
    enableGlobalAppMiddleware: true,
    endpoints: {
      // 👇 端点路径以 `/auth` 开头，与 baseURL 组合成完整路径
      login: { url: '/api/auth/login', method: 'post' }, // 完整路径：/api/auth/login
      session: { url: '/api/auth/session', method: 'get' }, // 完整路径：/api/auth/session
      // 其他端点同理
    },
    routes: {
      // 自动保护所有路由（除了登录页）
      protected: true,
      except: ['/login', '/auth/**'], // 允许匿名访问的路由
    },
    // 认证策略配置（基于 Passport Local 策略）
    strategies: {
      local: {
        scheme: 'local',
        routes: {
          login: '/auth/login', // 登录路由
          logout: '/auth/logout', // 登出路由
          callback: '/auth/callback', // 回调路由（可选）
          home: '/', // 认证后重定向首页
          loginFailed: '/login?error=1', // 登录失败重定向
        },
        endpoints: {
          login: { url: '/api/auth/login', method: 'post' },
          session: { url: '/api/auth/session', method: 'get' }, // 策略内路径同步修正
        },
        // 自定义用户验证逻辑（与原服务端逻辑对接）
        validate: async (credentials) => {
          const { username, password } = credentials;
          // 这里可对接原服务端用户验证逻辑（如调用 API 或本地验证）
          // 示例：使用原仓库的用户数据模拟验证
          const users = {
            admin: { id: 1, role: 'superAdmin', password: 'admin' },
            normaluser: { id: 2, role: 'normalUser', password: 'normal' },
          };
          const user = users[username];
          if (user && user.password === password) {
            // 返回用户信息（包含角色和权限）
            return {
              id: user.id,
              username: user.username,
              role: user.role,
              permissions: user.role === 'superAdmin' ? ['*'] : ['read'], // 示例权限
            };
          }
          return null; // 验证失败
        },
      },
    },
    // 令牌存储方式（使用 Cookie，更安全）
    storage: {
      token: {
        property: 'auth',
        type: 'cookie',
        options: {
          name: 'auth.token',
          maxAge: 60 * 60 * 24, // 1 天
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
        },
      },
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
  ],

  colorMode: {
    classSuffix: '',
  },

  features: {
    // For UnoCSS
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  compatibilityDate: '2025-05-16',
})