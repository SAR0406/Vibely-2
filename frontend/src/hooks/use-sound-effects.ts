import useSound from 'use-sound';
import { useThemeStore } from '@/store/use-theme-store';
import { useCallback } from 'react';

// Using online hosted sounds for reliability in MVP, can serve local files later
const SOUNDS = {
    send: 'https://cdn.freesound.org/previews/566/566435_12683884-lq.mp3', // Pop sound
    receive: 'https://cdn.freesound.org/previews/234/234524_4019029-lq.mp3', // Gentle notification
    click: 'https://cdn.freesound.org/previews/256/256116_3263906-lq.mp3', // Soft click
    join: 'https://cdn.freesound.org/previews/270/270387_5123851-lq.mp3', // Join channel
    play: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3' // Success/Play
};

export function useSoundEffects() {
    const { soundEnabled } = useThemeStore();

    const [playSend] = useSound(SOUNDS.send, { volume: 0.5 });
    const [playReceive] = useSound(SOUNDS.receive, { volume: 0.4 });
    const [playClick] = useSound(SOUNDS.click, { volume: 0.3 });
    const [playJoin] = useSound(SOUNDS.join, { volume: 0.4 });

    const play = useCallback((type: 'send' | 'receive' | 'click' | 'join') => {
        if (!soundEnabled) return;

        switch (type) {
            case 'send': playSend(); break;
            case 'receive': playReceive(); break;
            case 'click': playClick(); break;
            case 'join': playJoin(); break;
        }
    }, [soundEnabled, playSend, playReceive, playClick, playJoin]);

    return { play };
}
