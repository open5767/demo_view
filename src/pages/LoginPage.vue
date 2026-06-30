<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, Eye, EyeOff, LogIn, User, Shield, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const formType = ref<'login' | 'register'>('login');

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
});

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const validationErrors = ref<Record<string, string>>({});

const hasSuccessMessage = computed(() => successMessage.value !== '');
const hasErrorMessage = computed(() => errorMessage.value !== '');

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; error: string } => {
  if (password.length < 8) return { valid: false, error: '密码长度至少为 8 位' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: '密码必须包含至少一个大写字母' };
  if (!/[a-z]/.test(password)) return { valid: false, error: '密码必须包含至少一个小写字母' };
  if (!/[0-9]/.test(password)) return { valid: false, error: '密码必须包含至少一个数字' };
  return { valid: true, error: '' };
};

const validateForm = (): boolean => {
  validationErrors.value = {};

  if (formType.value === 'login') {
    if (!loginForm.value.email) {
      validationErrors.value.email = '请输入邮箱地址';
    } else if (!validateEmail(loginForm.value.email)) {
      validationErrors.value.email = '请输入有效的邮箱地址';
    }
    if (!loginForm.value.password) {
      validationErrors.value.password = '请输入密码';
    }
  } else {
    if (!registerForm.value.username) {
      validationErrors.value.username = '请输入用户名';
    } else if (registerForm.value.username.length < 3) {
      validationErrors.value.username = '用户名长度至少为 3 位';
    }
    if (!registerForm.value.email) {
      validationErrors.value.email = '请输入邮箱地址';
    } else if (!validateEmail(registerForm.value.email)) {
      validationErrors.value.email = '请输入有效的邮箱地址';
    }
    if (!registerForm.value.password) {
      validationErrors.value.password = '请输入密码';
    } else {
      const result = validatePassword(registerForm.value.password);
      if (!result.valid) validationErrors.value.password = result.error;
    }
    if (!registerForm.value.confirmPassword) {
      validationErrors.value.confirmPassword = '请确认密码';
    } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
      validationErrors.value.confirmPassword = '两次输入的密码不一致';
    }
    if (!registerForm.value.agreeTerms) {
      validationErrors.value.agreeTerms = '您必须同意服务条款';
    }
  }

  return Object.keys(validationErrors.value).length === 0;
};

const toggleFormType = () => {
  formType.value = formType.value === 'login' ? 'register' : 'login';
  errorMessage.value = '';
  successMessage.value = '';
  validationErrors.value = {};
};

const handleLogin = async () => {
  if (!validateForm()) return;
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const success = await authStore.login(loginForm.value.email, loginForm.value.password);
    if (success) {
      successMessage.value = '登录成功！正在跳转...';
      setTimeout(() => router.push('/game'), 1500);
    } else {
      errorMessage.value = authStore.errorMessage || '登录失败，请检查您的账号和密码';
    }
  } catch {
    errorMessage.value = '网络错误，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  if (!validateForm()) return;
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const success = await authStore.register(
      registerForm.value.username,
      registerForm.value.email,
      registerForm.value.password
    );
    if (success) {
      successMessage.value = '注册成功！即将跳转到登录页面...';
      setTimeout(() => toggleFormType(), 2000);
    } else {
      errorMessage.value = authStore.errorMessage || '注册失败，请稍后重试';
    }
  } catch {
    errorMessage.value = '网络错误，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = () => {
  if (formType.value === 'login') handleLogin();
  else handleRegister();
};

const quickLogin = (type: 'guest' | 'google' | 'github') => {
  if (type === 'guest') {
    authStore.loginAsGuest();
    router.push('/game');
  }
};
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-slate-950">
    <!-- 微妙的网格背景 -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

    <div class="relative z-10 w-full max-w-md mx-4">
      <!-- 返回首页 -->
      <div class="mb-6">
        <router-link to="/" class="inline-flex items-center gap-1.5 text-slate-500 hover:text-teal-400 text-xs transition-colors">
          <ArrowLeft class="w-3.5 h-3.5" />
          返回首页
        </router-link>
      </div>

      <!-- 系统标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-xl mb-5 ring-1 ring-teal-500/20">
          <Shield class="w-8 h-8 text-teal-400" />
        </div>
        <h1 class="text-2xl font-bold text-white tracking-wide">
          AI数字化卡牌应急推演系统
        </h1>
        <p class="text-slate-500 text-sm mt-2">
          AI Digital Card Emergency Deduction System
        </p>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
        <div class="px-8 pt-8 pb-8">
          <!-- 表单切换标签 -->
          <div class="flex mb-7 bg-slate-800 rounded-lg p-1">
            <button
              @click="toggleFormType"
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
              :class="formType === 'login' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'"
            >
              登录
            </button>
            <button
              @click="toggleFormType"
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
              :class="formType === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'"
            >
              注册
            </button>
          </div>

          <!-- 成功消息 -->
          <div
            v-if="hasSuccessMessage"
            class="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3"
          >
            <div class="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-emerald-400 text-sm">{{ successMessage }}</p>
          </div>

          <!-- 错误消息 -->
          <div
            v-if="hasErrorMessage"
            class="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
          >
            <div class="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p class="text-red-400 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 注册 - 用户名 -->
            <div v-if="formType === 'register'">
              <label class="block text-slate-400 text-xs font-medium mb-1.5">用户名</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User class="w-4 h-4 text-slate-500" />
                </div>
                <input
                  v-model="registerForm.username"
                  type="text"
                  placeholder="请输入用户名"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  :class="{ 'border-red-500/50': validationErrors.username }"
                />
              </div>
              <p v-if="validationErrors.username" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.username }}</p>
            </div>

            <!-- 登录 - 邮箱 -->
            <div v-if="formType === 'login'">
              <label class="block text-slate-400 text-xs font-medium mb-1.5">邮箱地址</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail class="w-4 h-4 text-slate-500" />
                </div>
                <input
                  v-model="loginForm.email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  :class="{ 'border-red-500/50': validationErrors.email }"
                />
              </div>
              <p v-if="validationErrors.email" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.email }}</p>
            </div>

            <!-- 注册 - 邮箱 -->
            <div v-if="formType === 'register'">
              <label class="block text-slate-400 text-xs font-medium mb-1.5">邮箱地址</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail class="w-4 h-4 text-slate-500" />
                </div>
                <input
                  v-model="registerForm.email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  :class="{ 'border-red-500/50': validationErrors.email }"
                />
              </div>
              <p v-if="validationErrors.email" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.email }}</p>
            </div>

            <!-- 登录 - 密码 -->
            <div v-if="formType === 'login'">
              <label class="block text-slate-400 text-xs font-medium mb-1.5">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock class="w-4 h-4 text-slate-500" />
                </div>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  :class="{ 'border-red-500/50': validationErrors.password }"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Eye v-if="showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="validationErrors.password" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.password }}</p>
            </div>

            <!-- 注册 - 密码 -->
            <div v-if="formType === 'register'">
              <label class="block text-slate-400 text-xs font-medium mb-1.5">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock class="w-4 h-4 text-slate-500" />
                </div>
                <input
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  :class="{ 'border-red-500/50': validationErrors.password }"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Eye v-if="showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="validationErrors.password" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.password }}</p>
            </div>

            <!-- 注册 - 确认密码 -->
            <div v-if="formType === 'register'">
              <label class="block text-slate-400 text-xs font-medium mb-1.5">确认密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock class="w-4 h-4 text-slate-500" />
                </div>
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="请再次输入密码"
                  class="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  :class="{ 'border-red-500/50': validationErrors.confirmPassword }"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Eye v-if="showConfirmPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="validationErrors.confirmPassword" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.confirmPassword }}</p>
            </div>

            <!-- 记住密码 / 忘记密码 (仅登录) -->
            <div v-if="formType === 'login'" class="flex items-center justify-between">
              <label class="flex items-center cursor-pointer group">
                <input
                  v-model="loginForm.rememberMe"
                  type="checkbox"
                  class="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/30 cursor-pointer"
                />
                <span class="ml-2 text-slate-500 text-xs group-hover:text-slate-400 transition-colors">记住我</span>
              </label>
              <a href="#" class="text-teal-500 hover:text-teal-400 text-xs transition-colors">忘记密码？</a>
            </div>

            <!-- 服务条款 (仅注册) -->
            <div v-if="formType === 'register'">
              <label class="flex items-start cursor-pointer group">
                <input
                  v-model="registerForm.agreeTerms"
                  type="checkbox"
                  class="w-3.5 h-3.5 mt-0.5 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/30 cursor-pointer"
                />
                <span class="ml-2 text-slate-500 text-xs group-hover:text-slate-400 transition-colors">
                  我已阅读并同意
                  <a href="#" class="text-teal-500 hover:text-teal-400 underline">服务条款</a>
                  和
                  <a href="#" class="text-teal-500 hover:text-teal-400 underline">隐私政策</a>
                </span>
              </label>
              <p v-if="validationErrors.agreeTerms" class="mt-1.5 text-red-400 text-xs">{{ validationErrors.agreeTerms }}</p>
            </div>

            <!-- 提交按钮 -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-2.5 px-6 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <LogIn v-else class="w-4 h-4" />
              <span>{{ isLoading ? '处理中...' : (formType === 'login' ? '登录' : '注册') }}</span>
            </button>
          </form>

          <!-- 分割线 -->
          <div class="relative my-5">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-800" />
            </div>
            <div class="relative flex justify-center">
              <span class="bg-slate-900 px-3 text-slate-600 text-xs">或</span>
            </div>
          </div>

          <!-- 快捷入口 -->
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="quickLogin('guest')"
              class="py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-xs hover:text-slate-200 hover:border-slate-600 transition-all"
            >
              游客体验
            </button>
            <button
              @click="quickLogin('google')"
              class="py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-xs hover:text-slate-200 hover:border-slate-600 transition-all"
            >
              Google
            </button>
            <button
              @click="quickLogin('github')"
              class="py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-xs hover:text-slate-200 hover:border-slate-600 transition-all"
            >
              GitHub
            </button>
          </div>
        </div>

        <!-- 底部切换提示 -->
        <div class="py-4 border-t border-slate-800 text-center">
          <p class="text-slate-500 text-xs">
            {{ formType === 'login' ? '还没有账号？' : '已有账号？' }}
            <button
              @click="toggleFormType"
              class="text-teal-500 hover:text-teal-400 font-medium transition-colors"
            >
              {{ formType === 'login' ? '立即注册' : '立即登录' }}
            </button>
          </p>
        </div>
      </div>

      <!-- 底部版权 -->
      <p class="text-center text-slate-700 text-xs mt-6">
        &copy; 2026 AI数字化卡牌应急推演系统
      </p>
    </div>
  </div>
</template>
