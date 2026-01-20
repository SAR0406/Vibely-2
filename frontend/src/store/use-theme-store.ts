import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'cyan' | 'gold';
export type Wallpaper = 'default' | 'grid' | 'dots' | 'gradient' | 'cyberpunk' | 'glass' | 'nebula' | string;

interface ThemeState {
    accentColor: AccentColor;
    wallpaper: Wallpaper;
    soundEnabled: boolean;
    userTier: 'FREE' | 'PRO' | 'BUSINESS';

    setAccentColor: (color: AccentColor) => void;
    setWallpaper: (wallpaper: Wallpaper) => void;
    toggleSound: () => void;
    setUserTier: (tier: 'FREE' | 'PRO' | 'BUSINESS') => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            accentColor: 'violet',
            wallpaper: 'default',
            soundEnabled: true,
            userTier: 'FREE',

            setAccentColor: (color) => set({ accentColor: color }),
            setWallpaper: (wallpaper) => set({ wallpaper }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            setUserTier: (tier) => set({ userTier: tier }),
        }),
        {
            name: 'vibely-theme-storage',
        }
    )
);
