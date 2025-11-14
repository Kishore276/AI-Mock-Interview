import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Trophy, Clock, MessageSquare } from 'lucide-react';
import heroImage from '@/assets/hero-bg.jpg';
import Layout from '@/components/Layout';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  image_url: string;
}

const Dashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, hours: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    loadStats();
  }, []);

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .limit(4);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading courses",
        description: error.message,
      });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user) return;

    const { data: enrollments } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', user.id);

    const { data: tests } = await supabase
      .from('mock_tests')
      .select('*')
      .eq('user_id', user.id);

    setStats({
      enrolled: enrollments?.length || 0,
      completed: tests?.length || 0,
      hours: enrollments?.reduce((sum, e) => sum + (e.progress || 0), 0) || 0,
    });
  };

  const enrollCourse = async (courseId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_courses')
      .insert({ user_id: user.id, course_id: courseId });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already Enrolled",
          description: "You're already enrolled in this course",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    } else {
      toast({
        title: "Success!",
        description: "You've been enrolled in the course",
      });
      loadStats();
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden h-80 shadow-strong">
          <img 
            src={heroImage} 
            alt="AI Learning Platform" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="px-8 md:px-16 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Master Your Future with AI
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Prepare for placements with AI-powered learning, mock tests, and personalized predictions
              </p>
              <Button size="lg" className="bg-gradient-accent" onClick={() => navigate('/ai-chat')}>
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolled}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hours}h</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className="shadow-medium hover:shadow-strong transition-shadow cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <img 
                  src={course.image_url} 
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{course.duration}</span>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        enrollCourse(course.id);
                      }}
                    >
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;