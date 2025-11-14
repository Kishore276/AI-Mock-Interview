import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Target, Award, Briefcase } from 'lucide-react';
import Layout from '@/components/Layout';

const Placement = () => {
  const [stats, setStats] = useState({
    testsCompleted: 0,
    avgScore: 0,
    coursesCompleted: 0,
    notesCount: 0,
  });
  const [prediction, setPrediction] = useState<string>('');
  const [companies, setCompanies] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;

    const { data: tests } = await supabase
      .from('mock_tests')
      .select('score, total_questions')
      .eq('user_id', user.id);

    const { data: courses } = await supabase
      .from('user_courses')
      .select('progress')
      .eq('user_id', user.id);

    const { data: notes } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', user.id);

    const testsCompleted = tests?.length || 0;
    const avgScore = tests?.length
      ? tests.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) / tests.length
      : 0;
    const coursesCompleted = courses?.filter(c => c.progress >= 80).length || 0;
    const notesCount = notes?.length || 0;

    setStats({
      testsCompleted,
      avgScore: Math.round(avgScore),
      coursesCompleted,
      notesCount,
    });

    generatePrediction(testsCompleted, avgScore, coursesCompleted);
  };

  const generatePrediction = (tests: number, score: number, courses: number) => {
    const performanceScore = (tests * 10 + score + courses * 20) / 3;

    if (performanceScore >= 80) {
      setPrediction('Excellent');
      setCompanies(['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple']);
    } else if (performanceScore >= 60) {
      setPrediction('Very Good');
      setCompanies(['Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel']);
    } else if (performanceScore >= 40) {
      setPrediction('Good');
      setCompanies(['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture']);
    } else {
      setPrediction('Needs Improvement');
      setCompanies(['Focus on improving your skills']);
    }
  };

  const getPredictionColor = () => {
    switch (prediction) {
      case 'Excellent': return 'text-success';
      case 'Very Good': return 'text-secondary';
      case 'Good': return 'text-accent';
      default: return 'text-destructive';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Placement Prediction</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your performance
          </p>
        </div>

        {/* Prediction Card */}
        <Card className="shadow-strong bg-gradient-primary text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Your Placement Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-4">{prediction}</div>
            <p className="text-lg opacity-90">
              Based on your performance across all activities
            </p>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.testsCompleted}</div>
              <Progress value={stats.testsCompleted * 10} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              <Progress value={stats.avgScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
              <Award className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
              <Progress value={stats.coursesCompleted * 25} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
              <Award className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notesCount}</div>
              <Progress value={Math.min(stats.notesCount * 5, 100)} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Recommended Companies */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Recommended Companies
            </CardTitle>
            <CardDescription>
              Based on your current performance level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {companies.map((company, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-sm py-2 px-4"
                >
                  {company}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-sm">Complete more mock tests to improve your technical skills</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary mt-2" />
              <p className="text-sm">Enroll in additional courses to broaden your knowledge</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <p className="text-sm">Practice regularly and maintain detailed notes for revision</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Placement;