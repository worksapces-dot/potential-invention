'use server';

import { client } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function trackUserLogin() {
    try {
        const user = await currentUser();
        if (!user) return { success: false };

        const dbUser = await client.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                currentStreak: true,
                longestStreak: true,
                lastLoginAt: true,
            },
        });

        if (!dbUser) return { success: false };

        const now = new Date();
        const lastLogin = dbUser.lastLoginAt;

        let newStreak = dbUser.currentStreak;
        let isNewDay = false;
        let milestone = null;

        if (!lastLogin) {
            // First login ever
            newStreak = 1;
            isNewDay = true;
        } else {
            const lastLoginDate = new Date(lastLogin);

            // Compare calendar dates (ignoring time)
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());

            const diffTime = Math.abs(today.getTime() - lastLoginDay.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, no change
                return {
                    success: true,
                    streak: dbUser.currentStreak,
                    longestStreak: dbUser.longestStreak,
                    isNewDay: false,
                    isAtRisk: false,
                };
            } else if (diffDays === 1) {
                // Consecutive day
                newStreak = dbUser.currentStreak + 1;
                isNewDay = true;
            } else {
                // Streak broken
                newStreak = 1;
                isNewDay = true;
            }
        }

        // Check for milestones
        if (isNewDay && [7, 30, 100, 365].includes(newStreak)) {
            milestone = newStreak;
        }

        // Update user
        const updatedUser = await client.user.update({
            where: { clerkId: user.id },
            data: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, dbUser.longestStreak),
                lastLoginAt: now,
            },
        });

        return {
            success: true,
            streak: newStreak,
            longestStreak: updatedUser.longestStreak,
            isNewDay,
            milestone,
            isAtRisk: false,
        };
    } catch (error) {
        console.error('Track login error:', error);
        return { success: false };
    }
}

export async function getUserStreak() {
    try {
        const user = await currentUser();
        if (!user) return null;

        const dbUser = await client.user.findUnique({
            where: { clerkId: user.id },
            select: {
                currentStreak: true,
                longestStreak: true,
                lastLoginAt: true,
            },
        });

        if (!dbUser) return null;

        // Check if streak is still valid
        const now = new Date();
        const lastLogin = dbUser.lastLoginAt;

        if (!lastLogin) {
            return {
                currentStreak: 0,
                longestStreak: dbUser.longestStreak,
                isAtRisk: false,
            };
        }

        const hoursSinceLastLogin = Math.floor(
            (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
        );

        // At risk if more than 20 hours since last login
        const isAtRisk = hoursSinceLastLogin >= 20 && hoursSinceLastLogin < 48;

        // Streak broken if more than 48 hours
        const isBroken = hoursSinceLastLogin >= 48;

        return {
            currentStreak: isBroken ? 0 : dbUser.currentStreak,
            longestStreak: dbUser.longestStreak,
            isAtRisk,
            hoursSinceLastLogin,
        };
    } catch (error) {
        console.error('Get streak error:', error);
        return null;
    }
}
