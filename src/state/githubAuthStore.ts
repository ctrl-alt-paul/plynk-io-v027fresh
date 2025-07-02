import { create } from 'zustand';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
}

interface GitHubAuthState {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  canAccessCommunity: boolean;
  setUser: (user: GitHubUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useGitHubAuth = create<GitHubAuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  canAccessCommunity: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    canAccessCommunity: !!user,
    error: null 
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearAuth: () => set({ 
    user: null, 
    isAuthenticated: false, 
    canAccessCommunity: false,
    error: null 
  }),
}));

// Initialize function (usually called once on app start)
export const initializeGitHubAuth = () => {
  // Check for stored token in localStorage
  const storedToken = localStorage.getItem('github_auth_token');
  
  if (storedToken) {
    // Token exists, set the user as authenticated
    // In a real app, you might want to validate the token with the server
    // before setting the user as authenticated
    try {
      const storedUser = localStorage.getItem('github_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        useGitHubAuth.getState().setUser(user);
      }
    } catch (error) {
      console.error('Error parsing stored GitHub user:', error);
      useGitHubAuth.getState().clearAuth();
    }
  }
};
