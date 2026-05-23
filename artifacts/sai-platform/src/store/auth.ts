import { create } from 'zustand';
import type { User } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'sai_token';

// Read initial token from local storage
const initialToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  login: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

// Connect custom-fetch to zustand store
setAuthTokenGetter(() => {
  return useAuthStore.getState().token;
});
