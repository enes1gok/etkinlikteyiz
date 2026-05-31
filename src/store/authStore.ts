import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Community } from '../types';
import { MOCK_USERS, MOCK_COMMUNITIES } from '../utils/mockData';

interface AuthState {
  user: User | null;
  community: Community | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  studentId: string;
  password: string;
  communityId: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      community: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, _password) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((r) => setTimeout(r, 1000));

          const found = MOCK_USERS.find(
            (u) => u.email.toLowerCase() === email.trim().toLowerCase()
          );
          if (!found) {
            set({ isLoading: false, error: 'E-posta veya şifre hatalı.' });
            return false;
          }

          const community =
            MOCK_COMMUNITIES.find((c) => c.id === found.communityId) ??
            MOCK_COMMUNITIES[0];
          set({ user: found, community, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ isLoading: false, error: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((r) => setTimeout(r, 1200));

          const newUser: User = {
            id: `u_${Date.now()}`,
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            studentId: data.studentId.trim(),
            role: 'member',
            communityId: data.communityId,
            joinedAt: new Date().toISOString(),
            eventsAttended: 0,
            eventsRegistered: [],
          };

          const community =
            MOCK_COMMUNITIES.find((c) => c.id === data.communityId) ??
            MOCK_COMMUNITIES[0];
          set({ user: newUser, community, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ isLoading: false, error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
          return false;
        }
      },

      logout: () => {
        set({ user: null, community: null, isAuthenticated: false, error: null });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'unicomm-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        community: state.community,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
