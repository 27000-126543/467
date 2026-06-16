import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockUsers } from '@/mock/data';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasRegionAccess: (region: { province?: string; city?: string }) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const user = mockUsers.find((u) => u.username === username);
        
        if (!user || password !== '123456') {
          return { success: false, message: '用户名或密码错误' };
        }

        const token = `mock_token_${Date.now()}`;
        
        set({
          user,
          token,
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission) || user.role === 'national';
      },

      hasRegionAccess: (region) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'national') return true;
        
        if (user.region.province && region.province) {
          if (user.region.province !== region.province) return false;
        }
        
        if (user.region.city && region.city) {
          if (user.region.city !== region.city) return false;
        }
        
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
