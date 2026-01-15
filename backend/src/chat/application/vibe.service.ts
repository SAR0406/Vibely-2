import { Injectable } from '@nestjs/common';

@Injectable()
export class VibeService {
    analyze(content: string): { score: number; label: string } {
        const text = content.toLowerCase();

        // Simple keyword lists
        const positiveWords = ['amazing', 'awesome', 'great', 'love', 'cool', 'good', 'happy', 'fire', 'lit', 'sweet', 'nice', 'thanks', 'thx', 'lol', 'haha'];
        const intenseWords = ['hate', 'angry', 'mad', 'furious', 'stupid', 'dumb', 'wtf', 'omg', 'urgent', 'asap', '!!!'];
        const chillWords = ['ok', 'okay', 'sure', 'fine', 'maybe', 'later', 'chill', 'relax', 'yeah', 'yep'];

        let score = 50; // Neutral start
        let label = 'Chill';

        // Calculate score based on words
        positiveWords.forEach(word => {
            if (text.includes(word)) score += 5;
        });

        intenseWords.forEach(word => {
            if (text.includes(word)) score += 10; // Intensity increases score (energy), not necessarily positive/negative for "Vibe" which is often "Energy"
        });

        // Determine label
        if (score > 80) {
            label = 'Fire 🔥';
        } else if (score > 60) {
            label = 'Vibing ✨';
        } else if (score > 40) {
            label = 'Chill 🧊';
        } else if (score < 30) {
            label = 'Low Key 🌙';
        } else {
            label = 'Neutral 😐';
        }

        // Cap score
        score = Math.min(100, Math.max(0, score));

        return { score, label };
    }
}
