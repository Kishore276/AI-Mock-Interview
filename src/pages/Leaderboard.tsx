import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_score: number;
  tests_completed: number;
  avg_score: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    if (!user) return;

    // Get all test scores grouped by user
    const { data: testData, error } = await supabase
      .from('mock_tests')
      .select('user_id, score, total_questions');

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return;
    }

    // Get user profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name');

    if (!testData || !profiles) return;

    // Calculate stats for each user
    const userStats = new Map<string, { total: number; count: number; name: string }>();

    testData.forEach(test => {
      const percentage = (test.score / test.total_questions) * 100;
      const existing = userStats.get(test.user_id) || { total: 0, count: 0, name: '' };
      userStats.set(test.user_id, {
        total: existing.total + percentage,
        count: existing.count + 1,
        name: existing.name,
      });
    });

    // Add names
    profiles.forEach(profile => {
      const existing = userStats.get(profile.id);
      if (existing) {
        existing.name = profile.full_name || 'Anonymous';
      }
    });

    // Create leaderboard entries
    const entries: LeaderboardEntry[] = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        user_id: userId,
        full_name: stats.name,
        total_score: Math.round(stats.total),
        tests_completed: stats.count,
        avg_score: Math.round(stats.total / stats.count),
        rank: 0,
      }))
      .sort((a, b) => b.avg_score - a.avg_score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setLeaderboard(entries);

    // Find current user's rank
    const currentUserRank = entries.find(e => e.user_id === user.id)?.rank;
    setUserRank(currentUserRank || null);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: '🏆 Champion', variant: 'default' as const };
    if (rank <= 3) return { label: '🥈 Top 3', variant: 'secondary' as const };
    if (rank <= 10) return { label: '⭐ Top 10', variant: 'outline' as const };
    return null;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other students</p>
        </div>

        {/* User's Rank Card */}
        {userRank && (
          <Card className="shadow-medium bg-gradient-primary text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Your Current Rank</p>
                  <p className="text-4xl font-bold mt-1">#{userRank}</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Based on average test scores</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No data available yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete tests to appear on the leaderboard
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const badge = getRankBadge(entry.rank);
                  const isCurrentUser = entry.user_id === user?.id;

                  return (
                    <div
                      key={entry.user_id}
                      className={`border rounded-lg p-4 transition-all ${
                        isCurrentUser
                          ? 'bg-primary/10 border-primary shadow-soft'
                          : 'hover:shadow-soft'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12">
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-secondary text-white">
                              {entry.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {entry.full_name}
                                {isCurrentUser && (
                                  <span className="text-primary ml-2">(You)</span>
                                )}
                              </p>
                              {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {entry.tests_completed} test{entry.tests_completed !== 1 ? 's' : ''} completed
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {entry.avg_score}%
                          </p>
                          <p className="text-xs text-muted-foreground">Average Score</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Leaderboard;
