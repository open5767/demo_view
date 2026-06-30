import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const errorMessage = ref('');

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // 初始化：从 localStorage 恢复登录状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

   if (savedToken) {
      token.value = savedToken;
    }

   if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('auth_user');
      }
    }
  };

  // 登录
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      // TODO: 调用实际的后端 API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 演示用：简单的验证逻辑
      // 在实际应用中，这里应该调用后端 API
     if (email && password) {
        // 模拟成功响应
        const mockUser: User = {
          id: '1',
          username: email.split('@')[0],
          email: email,
          avatar: 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(email),
        };
        const mockToken = 'mock_jwt_token_' + Date.now();

        user.value = mockUser;
        token.value = mockToken;

        // 保存到 localStorage
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

       return true;
      } else {
        errorMessage.value = '邮箱或密码错误';
       return false;
      }
    } catch (error) {
      errorMessage.value = '网络错误，请稍后重试';
      console.error('Login error:', error);
     return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 注册
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      // TODO: 调用实际的后端 API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, email, password }),
      // });

      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 演示用：简单的验证逻辑
     if (username && email && password) {
        // 模拟成功响应
        const mockUser: User = {
          id: '1',
          username: username,
          email: email,
          avatar: 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(username),
        };

        console.log('Registration successful:', mockUser);
       return true;
      } else {
        errorMessage.value = '注册失败，请检查输入信息';
       return false;
      }
    } catch (error) {
      errorMessage.value = '网络错误，请稍后重试';
      console.error('Registration error:', error);
     return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 游客登录
  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      username: '游客',
      email: 'guest@example.com',
      avatar: 'https://ui-avatars.com/api/?background=random&name=游客',
      role: 'guest',
    };

    user.value = guestUser;
    token.value = 'guest_token_' + Date.now();

    localStorage.setItem('auth_token', token.value);
    localStorage.setItem('auth_user', JSON.stringify(guestUser));
  };

  // 登出
  const logout = () => {
    user.value = null;
    token.value = null;
    errorMessage.value = '';

    // 清除 localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // 可以跳转到登录页或其他页面
    // router.push('/login');
  };

  // 更新用户信息
  const updateUser = (updates: Partial<User>) => {
   if (user.value) {
      user.value = { ...user.value, ...updates };
      localStorage.setItem('auth_user', JSON.stringify(user.value));
    }
  };

  // 刷新 Token（可选）
  const refreshToken = async (): Promise<boolean> => {
   if (!token.value) return false;

    try {
      // TODO: 调用实际的刷新 Token API
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token.value}` },
      // });

      // 模拟刷新
      await new Promise(resolve => setTimeout(resolve, 500));
     return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
     return false;
    }
  };

  // 初始化时恢复登录状态
  initAuth();

  return {
    // 状态
    user,
    token,
    isLoading,
    errorMessage,
    
    // 计算属性
    isAuthenticated,
    
    // 方法
    login,
   register,
    loginAsGuest,
    logout,
    updateUser,
   refreshToken,
    initAuth,
  };
});
