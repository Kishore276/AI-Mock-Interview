import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  FileText,
  ArrowLeft,
  Award
} from 'lucide-react';
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

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock modules for demonstration
  const modules: Module[] = [
    { id: '1', title: 'Introduction to the Course', duration: '30 min', completed: true },
    { id: '2', title: 'Core Concepts Overview', duration: '45 min', completed: true },
    { id: '3', title: 'Practical Applications', duration: '1 hour', completed: false },
    { id: '4', title: 'Advanced Topics', duration: '1.5 hours', completed: false },
    { id: '5', title: 'Practice Problems', duration: '2 hours', completed: false },
    { id: '6', title: 'Final Assessment', duration: '1 hour', completed: false },
  ];

  useEffect(() => {
    if (id) {
      loadCourse();
      checkEnrollment();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      setCourse(data);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('user_courses')
      .select('progress')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .single();

    if (data) {
      setEnrolled(true);
      setProgress(data.progress || 0);
    }
  };

  const enrollCourse = async () => {
    if (!user || !id) return;

    const { error } = await supabase
      .from('user_courses')
      .insert({ user_id: user.id, course_id: id, progress: 0 });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success!",
        description: "You've been enrolled in the course",
      });
      setEnrolled(true);
    }
  };

  const updateProgress = async (newProgress: number) => {
    if (!user || !id) return;

    const { error } = await supabase
      .from('user_courses')
      .update({ progress: newProgress })
      .eq('user_id', user.id)
      .eq('course_id', id);

    if (!error) {
      setProgress(newProgress);
      toast({
        title: "Progress Updated",
        description: `Course ${newProgress}% complete`,
      });
    }
  };

  const completeModule = (moduleIndex: number) => {
    const completedCount = moduleIndex + 1;
    const newProgress = Math.round((completedCount / modules.length) * 100);
    updateProgress(newProgress);
  };

  if (!course) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Course Header */}
        <Card className="shadow-medium">
          <div className="relative h-64 overflow-hidden rounded-t-lg">
            <img 
              src={course.image_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-lg opacity-90">{course.description}</p>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                <span>{modules.length} Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span>Certificate on Completion</span>
              </div>
            </div>

            {enrolled ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <Button 
                onClick={enrollCourse} 
                className="w-full bg-gradient-primary"
                size="lg"
              >
                Enroll in Course
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Course Content */}
        {enrolled && (
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="notes">My Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>Complete each module to progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="border rounded-lg p-4 hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {module.completed ? (
                            <CheckCircle className="w-6 h-6 text-success" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-muted-foreground" />
                          )}
                          <div>
                            <h3 className="font-semibold">{module.title}</h3>
                            <p className="text-sm text-muted-foreground">{module.duration}</p>
                          </div>
                        </div>
                        <Button
                          variant={module.completed ? "outline" : "default"}
                          size="sm"
                          onClick={() => completeModule(index)}
                          disabled={module.completed}
                        >
                          {module.completed ? 'Completed' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Course Resources</CardTitle>
                  <CardDescription>Additional materials and references</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Course Handbook</h3>
                        <p className="text-sm text-muted-foreground">PDF - 2.5 MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Practice Problems</h3>
                        <p className="text-sm text-muted-foreground">PDF - 1.8 MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Reference Materials</h3>
                        <p className="text-sm text-muted-foreground">PDF - 3.2 MB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Course Notes</CardTitle>
                  <CardDescription>Your personal notes for this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Go to the Notes section to create course-specific notes
                  </p>
                  <Button 
                    onClick={() => navigate('/notes')} 
                    className="w-full"
                  >
                    Go to Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default CourseDetails;
