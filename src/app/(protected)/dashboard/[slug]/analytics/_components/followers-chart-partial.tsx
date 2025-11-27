"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Instagram } from "lucide-react";

type Props = {
  currentFollowers?: number
}

export function FollowersChartPartial({ currentFollowers }: Props) {
  const hasData = currentFollowers && currentFollowers > 0;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-pink-500 via-purple-500 to-orange-500 rounded-full" />
              Instagram Followers
            </CardTitle>
            <CardDescription className="text-sm">Your current audience size</CardDescription>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 relative">
        {hasData ? (
          <div className="space-y-8">
            {/* Main Stat */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 blur-3xl" />
              <div className="relative text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-muted-foreground" />
                  <span className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                    {currentFollowers.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total Followers</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                <div className="text-xs font-medium text-muted-foreground mb-1">Growth Rate</div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold">~0%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="text-xs font-medium text-muted-foreground mb-1">Engagement</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold">Active</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                <div className="text-xs font-medium text-muted-foreground mb-1">Reach</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold">
                    {(currentFollowers * 0.3).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-semibold">💡 Note:</span> Historical follower data is not available. This shows your current Instagram follower count.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center text-center gap-4 border border-dashed rounded-lg bg-muted/5">
            <Instagram className="w-12 h-12 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">No Instagram Data</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Connect your Instagram account to see follower stats</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
