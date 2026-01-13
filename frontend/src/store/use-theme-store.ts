import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'cyan';
export type Wallpaper = 'default' | 'grid' | 'dots' | 'gradient' | string;

interface ThemeState {
    accentColor: AccentColor;
    wallpaper: Wallpaper;
    soundEnabled: boolean;

    setAccentColor: (color: AccentColor) => void;
    setWallpaper: (wallpaper: Wallpaper) => void;
    toggleSound: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            accentColor: 'violet',
            wallpaper: 'default',
            soundEnabled: true,

            setAccentColor: (color) => set({ accentColor: color }),
            setWallpaper: (wallpaper) => set({ wallpaper }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
        }),
        {
            name: 'vibely-theme-storage',
        }
    )
);
