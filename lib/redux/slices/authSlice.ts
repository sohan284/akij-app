import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  role: 'employer' | 'candidate';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

function loadFromStorage(): AuthState {
  if (typeof window === 'undefined') return { user: null, isAuthenticated: false };
  try {
    const raw = localStorage.getItem('akij_auth');
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {}
  return { user: null, isAuthenticated: false };
}

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('akij_auth', JSON.stringify({ user: action.payload, isAuthenticated: true }));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('akij_auth');
      }
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
