<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { LogIn, Gamepad2, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

// 跳转到游戏页
const goToGame = () => {
  router.push('/game');
};
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
   <!-- 背景装饰 -->
   <div class="absolute inset-0 overflow-hidden">
     <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
     <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
   </div>

   <!-- 主容器 -->
   <div class="relative z-10 text-center max-w-4xl mx-auto">
     <!-- Logo 和标题 -->
     <div class="mb-12">
       <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
         <Gamepad2 class="w-12 h-12 text-white" />
       </div>
       <h1 class="text-5xl md:text-6xl font-bold text-white mb-4">
         Demo Game
       </h1>
       <p class="text-xl text-gray-300 mb-8">
         探索未知的游戏世界，开启你的冒险之旅
       </p>
     </div>

     <!-- 功能卡片 -->
     <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
       <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
         <div class="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
           <svg class="w-6 h-6 text-indigo-400"fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
           </svg>
         </div>
         <h3 class="text-lg font-semibold text-white mb-2">快速匹配</h3>
         <p class="text-gray-400 text-sm">智能匹配系统，快速找到对手</p>
       </div>

       <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
         <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
           <svg class="w-6 h-6 text-purple-400"fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
           </svg>
         </div>
         <h3 class="text-lg font-semibold text-white mb-2">安全可靠</h3>
         <p class="text-gray-400 text-sm">公平公正的游戏环境</p>
       </div>

       <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
         <div class="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
           <svg class="w-6 h-6 text-pink-400"fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
           </svg>
         </div>
         <h3 class="text-lg font-semibold text-white mb-2">多人在线</h3>
         <p class="text-gray-400 text-sm">与好友一起享受游戏乐趣</p>
       </div>
     </div>

     <!-- 操作按钮 -->
     <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
       <template v-if="authStore.isAuthenticated">
         <button
           @click="goToGame"
           class="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 transition-all duration-300 flex items-center gap-3"
         >
           <span>开始游戏</span>
           <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
         </button>
       </template>
       <template v-else>
         <button
           @click="goToLogin"
           class="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 transition-all duration-300 flex items-center gap-3"
         >
           <LogIn class="w-5 h-5" />
           <span>立即登录</span>
         </button>

         <button
           @click="goToLogin"
           class="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transform hover:scale-105 active:scale-100 transition-all duration-300"
         >
           免费注册
         </button>
       </template>
     </div>

     <!-- 底部统计信息 -->
     <div class="mt-16 grid grid-cols-3 gap-8 text-white">
       <div>
         <div class="text-3xl font-bold text-purple-400 mb-2">10K+</div>
         <div class="text-gray-400 text-sm">活跃玩家</div>
       </div>
       <div>
         <div class="text-3xl font-bold text-pink-400 mb-2">50K+</div>
         <div class="text-gray-400 text-sm">对局数量</div>
       </div>
       <div>
         <div class="text-3xl font-bold text-indigo-400 mb-2">99%</div>
         <div class="text-gray-400 text-sm">好评率</div>
       </div>
     </div>
   </div>
  </div>
</template>
