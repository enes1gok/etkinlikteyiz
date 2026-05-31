import { create } from 'zustand';
import { User, Community } from '../types';
import { MOCK_USERS, MOCK_COMMUNITIES } from '../utils/mockData';

interface AuthState {
  user: User | null;
  community: Community | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  studentId: string;
  password: string;
  communityId: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  community: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, _password) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1000));

    const found = MOCK_USERS.find((u) => u.email === email) ?? MOCK_USERS[0];
    const community = MOCK_COMMUNITIES.find((c) => c.id === found.communityId) ?? MOCK_COMMUNITIES[0];

    set({ user: found, community, isAuthenticated: true, isLoading: false });
    return true;
  },

  register: async (data) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1200));

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: data.name,
      email: data.email,
      studentId: data.studentId,
      role: 'member',
      communityId: data.communityId,
      joinedAt: new Date().toISOString(),
      eventsAttended: 0,
      eventsRegistered: [],
    };

    const community = MOCK_COMMUNITIES.find((c) => c.id === data.communityId) ?? MOCK_COMMUNITIES[0];
    set({ user: newUser, community, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: () => {
    set({ user: null, community: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
