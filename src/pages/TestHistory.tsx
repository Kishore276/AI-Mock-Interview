import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

interface Test {
  id: string;
  test_name: string;
  score: number;
  total_questions: number;
  duration_minutes: number;
  completed_at: string;
}

const TestHistory = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgScore: 0,
    bestScore: 0,
    totalTime: 0,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mock_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      setTests(data || []);
      calculateStats(data || []);
    }
  };

  const calculateStats = (tests: Test[]) => {
    if (tests.length === 0) return;

    const totalTests = tests.length;
    const scores = tests.map(t => (t.score / t.total_questions) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / totalTests;
    const bestScore = Math.max(...scores);
    const totalTime = tests.reduce((sum, t) => sum + t.duration_minutes, 0);

    setStats({
      totalTests,
      avgScore: Math.round(avgScore),
      bestScore: Math.round(bestScore),
      totalTime,
    });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-secondary';
    if (percentage >= 40) return 'text-accent';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (percentage >= 60) return { label: 'Good', variant: 'secondary' as const };
    if (percentage >= 40) return { label: 'Average', variant: 'outline' as const };
    return { label: 'Needs Improvement', variant: 'destructive' as const };
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Test History & Analytics</h1>
          <p className="text-muted-foreground">Track your performance over time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              <Progress value={stats.avgScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestScore}%</div>
              <p className="text-xs text-muted-foreground">Personal best</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTime}m</div>
              <p className="text-xs text-muted-foreground">In tests</p>
            </CardContent>
          </Card>
        </div>

        {/* Test History */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
            <CardDescription>Your test performance history</CardDescription>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No tests completed yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start taking mock tests to see your history here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => {
                  const percentage = (test.score / test.total_questions) * 100;
                  const badge = getScoreBadge(test.score, test.total_questions);
                  
                  return (
                    <div 
                      key={test.id}
                      className="border rounded-lg p-4 hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{test.test_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(test.completed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(test.score, test.total_questions)}`}>
                            {test.score}/{test.total_questions}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                          <p className="text-2xl font-bold">{Math.round(percentage)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Duration</p>
                          <p className="text-2xl font-bold">{test.duration_minutes}m</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Progress value={percentage} className="h-2" />
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

export default TestHistory;
