'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

type StreakData = {
    currentStreak: number;
    longestStreak: number;
    isAtRisk: boolean;
    milestone?: number;
};

type Props = {
    initialStreak: StreakData;
};

export function StreakCounter({ initialStreak }: Props) {
    const [streak, setStreak] = useState(initialStreak);
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        if (initialStreak.milestone) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [initialStreak.milestone]);

    const getStreakColor = () => {
        if (streak.currentStreak === 0) return 'text-muted-foreground';
        if (streak.currentStreak < 7) return 'text-orange-500';
        if (streak.currentStreak < 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getStreakEmoji = () => {
        if (streak.currentStreak === 0) return '💤';
        if (streak.currentStreak < 7) return '🔥';
        if (streak.currentStreak < 30) return '⚡';
        if (streak.currentStreak < 100) return '💎';
        return '👑';
    };

    return (
        <>
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            <Card className={cn(
                'px-4 py-3 flex items-center gap-3 transition-all hover:shadow-md',
                streak.isAtRisk && 'border-orange-500/50 bg-orange-500/5'
            )}>
                {/* Streak Icon */}
                <div className={cn(
                    'p-2 rounded-lg transition-all',
                    streak.currentStreak === 0 && 'bg-muted',
                    streak.currentStreak > 0 && streak.currentStreak < 7 && 'bg-orange-500/10',
                    streak.currentStreak >= 7 && streak.currentStreak < 30 && 'bg-yellow-500/10',
                    streak.currentStreak >= 30 && 'bg-gradient-to-br from-red-500/10 to-orange-500/10'
                )}>
                    <Flame className={cn('w-5 h-5', getStreakColor())} />
                </div>

                {/* Streak Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                            {streak.currentStreak === 0 ? 'Start your streak!' : `${streak.currentStreak} day streak`}
                        </span>
                        <span className="text-lg">{getStreakEmoji()}</span>
                    </div>
                    {streak.isAtRisk && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>Login soon to keep your streak!</span>
                        </div>
                    )}
                </div>

                {/* Longest Streak Badge */}
                {streak.longestStreak > 0 && (
                    <Badge variant="outline" className="gap-1.5 bg-background/50">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs">Best: {streak.longestStreak}</span>
                    </Badge>
                )}

                {/* Milestone Badge */}
                {initialStreak.milestone && (
                    <Badge className="gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-semibold">{initialStreak.milestone} days! 🎉</span>
                    </Badge>
                )}
            </Card>
        </>
    );
}
