
import { create } from 'zustand';
import { MemoryProfile } from '@/types/memoryProfiles';

interface MemoryProfileState {
  currentProfile: MemoryProfile | null;
  profiles: MemoryProfile[];
  isLoading: boolean;
  error: string | null;
  setCurrentProfile: (profile: MemoryProfile | null) => void;
  setProfiles: (profiles: MemoryProfile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProfile: (profile: MemoryProfile) => void;
  updateProfile: (profile: MemoryProfile) => void;
  removeProfile: (profileId: string) => void;
}

export const useMemoryProfileStore = create<MemoryProfileState>((set, get) => ({
  currentProfile: null,
  profiles: [],
  isLoading: false,
  error: null,
  
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  
  setProfiles: (profiles) => set({ profiles }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  addProfile: (profile) => set((state) => ({
    profiles: [...state.profiles, profile]
  })),
  
  updateProfile: (profile) => set((state) => ({
    profiles: state.profiles.map(p => 
      p.id === profile.id ? profile : p
    ),
    currentProfile: state.currentProfile?.id === profile.id ? profile : state.currentProfile
  })),
  
  removeProfile: (profileId) => set((state) => ({
    profiles: state.profiles.filter(p => p.id !== profileId),
    currentProfile: state.currentProfile?.id === profileId ? null : state.currentProfile
  }))
}));
