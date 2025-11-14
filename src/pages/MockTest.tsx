import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, Video, VideoOff, Play, CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';

const MockTest = () => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const mockQuestions = [
    { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1 },
    { question: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Tree"], correct: 1 },
    { question: "What does SQL stand for?", options: ["Simple Query Language", "Structured Query Language", "System Query Language", "Standard Query Language"], correct: 1 },
  ];

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video metadata to load before playing
        videoRef.current.onloadedmetadata = async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              setIsCameraOn(true);
              toast({
                title: "Camera Started",
                description: "Your test session is being monitored",
              });
            }
          } catch (playError) {
            console.error('Error playing video:', playError);
            toast({
              variant: "destructive",
              title: "Playback Error",
              description: "Unable to display camera feed.",
            });
          }
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please grant permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const startTest = async () => {
    await startCamera();
    setIsTestActive(true);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitTest = async () => {
    const score = answers.reduce((total, answer, idx) => {
      return total + (answer === mockQuestions[idx].correct ? 1 : 0);
    }, 0);

    if (user) {
      const { error } = await supabase
        .from('mock_tests')
        .insert({
          user_id: user.id,
          test_name: 'Technical Mock Test',
          score,
          total_questions: mockQuestions.length,
          duration_minutes: 15,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Test Submitted!",
          description: `You scored ${score}/${mockQuestions.length}`,
        });
      }
    }

    stopCamera();
    setIsTestActive(false);
  };

  if (!isTestActive) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-2xl">Mock Interview Test</CardTitle>
              <CardDescription>
                Practice with our AI-powered mock tests with camera monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="font-medium">Camera monitoring enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium">3 technical questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium">15 minutes duration</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-primary"
                onClick={startTest}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Mock Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const question = mockQuestions[currentQuestion];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Camera Feed */}
        <Card className="shadow-medium">
          <CardContent className="p-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls={false}
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute top-4 right-4">
                <Badge variant={isCameraOn ? "default" : "destructive"}>
                  {isCameraOn ? <Video className="w-4 h-4 mr-1" /> : <VideoOff className="w-4 h-4 mr-1" />}
                  {isCameraOn ? "Recording" : "Camera Off"}
                </Badge>
              </div>
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg">Waiting for camera...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestion + 1}/{mockQuestions.length}</CardTitle>
              <Badge variant="outline">Technical</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={answers[currentQuestion] === idx ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => selectAnswer(idx)}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion === mockQuestions.length - 1 ? (
                <Button 
                  onClick={submitTest}
                  className="bg-gradient-accent"
                  disabled={answers.length !== mockQuestions.length}
                >
                  Submit Test
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MockTest;