import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '@/pages/GamePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import HomePage from '@/pages/HomePage.vue'
import { useAuthStore } from '@/store/authStore'

// 定义路由配置
const routes = [
  {
   path: '/',
   name: 'home',
    component: HomePage,
  },
  {
   path: '/login',
   name: 'login',
    component: LoginPage,
   meta: { requiresGuest: true }, // 只允许未登录用户访问
  },
  {
   path: '/register',
   name: 'register',
    component: LoginPage,
   meta: { requiresGuest: true },
  },
  {
   path: '/game',
   name: 'game',
    component: GamePage,
   meta: { requiresAuth: true }, // 需要登录才能访问
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // 检查是否需要登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 如果用户未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } });
   return;
  }

  // 检查是否只允许游客访问（如登录页）
  if (to.meta.requiresGuest && isAuthenticated) {
    // 如果用户已登录，重定向到游戏页面
    next({ name: 'game' });
   return;
  }

  // 默认放行
  next();
});

export default router
