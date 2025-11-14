import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Send, User } from 'lucide-react';
import Layout from '@/components/Layout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI placement assistant. I can help you with:\n\n• Study tips and guidance\n• Interview preparation\n• Technical questions\n• Career advice\n• Mock test strategies\n\nHow can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Interview questions
    if (lowerMessage.includes('interview') || lowerMessage.includes('hr')) {
      return 'For interview preparation, I recommend:\n\n1. Practice STAR method for behavioral questions\n2. Research the company thoroughly\n3. Prepare questions to ask the interviewer\n4. Review your resume and be ready to explain each experience\n5. Practice common interview questions\n\nWould you like specific tips for technical or HR interviews?';
    }

    // DSA questions
    if (lowerMessage.includes('dsa') || lowerMessage.includes('data structure') || lowerMessage.includes('algorithm')) {
      return 'Data Structures & Algorithms tips:\n\n1. Start with basics: Arrays, LinkedLists, Stacks, Queues\n2. Practice problems on LeetCode, HackerRank\n3. Focus on time and space complexity analysis\n4. Master common patterns: Two Pointers, Sliding Window, Binary Search\n5. Practice at least 2-3 problems daily\n\nWould you like resources for any specific topic?';
    }

    // Resume
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return 'Resume building tips:\n\n1. Keep it to 1-2 pages maximum\n2. Use action verbs (Led, Developed, Managed)\n3. Quantify achievements with numbers\n4. Tailor it for each job application\n5. Include: Education, Experience, Projects, Skills\n6. Proofread for errors\n\nWould you like help with any specific section?';
    }

    // Placement tips
    if (lowerMessage.includes('placement') || lowerMessage.includes('job')) {
      return 'Placement preparation strategy:\n\n1. Build a strong foundation in core subjects\n2. Complete at least 3-4 significant projects\n3. Practice coding problems regularly\n4. Improve communication skills\n5. Stay updated with industry trends\n6. Network with alumni and professionals\n\nWhat specific area would you like to focus on?';
    }

    // Default response
    return 'I\'m here to help with your placement preparation! You can ask me about:\n\n• Interview tips and common questions\n• DSA and coding practice\n• Resume building\n• Placement strategies\n• Company-specific preparation\n• Aptitude and reasoning\n\nWhat would you like to know?';
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)]">
        <Card className="shadow-medium h-full flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              AI Placement Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-primary">
                          <Bot className="w-5 h-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-secondary">
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-primary">
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AIChat;
