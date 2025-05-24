import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Download, 
  Clock, 
  FileText,
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  History,
  BarChart3,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

// TypeScript Interfaces
interface Question {
  id: string;
  text: string;
  timestamp: Date;
  category?: string;
  isFavorite?: boolean;
}

interface SourceAttribution {
  documentName: string;
  pageNumber?: number;
  jsonPath?: string;
  confidence: number;
  excerpt?: string;
}

interface Answer {
  id: string;
  questionId: string;
  text: string;
  confidence: number;
  sources: SourceAttribution[];
  relatedSuggestions?: string[];
  responseTime: number;
  timestamp: Date;
  validation?: {
    rating?: 'positive' | 'negative';
    correctAnswer?: string;
    flagged?: boolean;
  };
}

interface TestMetrics {
  totalQuestions: number;
  averageConfidence: number;
  averageResponseTime: number;
  categoryPerformance: {
    [category: string]: {
      count: number;
      avgConfidence: number;
      avgResponseTime: number;
    };
  };
  accuracyRate: number;
}

const predefinedQuestions = {
  specs: [
    "What is the engine displacement of the 2024 Honda Accord?",
    "What are the fuel economy ratings for the Acura MDX?",
    "What is the towing capacity of the Honda Pilot?",
    "What are the available trim levels for the Honda CR-V?"
  ],
  parts: [
    "What is the part number for the Honda Civic air filter?",
    "Where can I find the brake pad specifications?",
    "What type of oil filter does the Accord use?",
    "What are the spark plug replacement intervals?"
  ],
  procedures: [
    "How do I reset the maintenance minder?",
    "What is the procedure for changing the cabin air filter?",
    "How do I pair my phone with Honda Connect?",
    "What are the steps for jumpstarting the battery?"
  ]
};

export function TestingInterface() {
  // State management
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<TestMetrics>({
    totalQuestions: 0,
    averageConfidence: 0,
    averageResponseTime: 0,
    categoryPerformance: {},
    accuracyRate: 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle question submission
  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim()) return;

    const questionId = Date.now().toString();
    const newQuestion: Question = {
      id: questionId,
      text: currentQuestion,
      timestamp: new Date(),
      category: detectCategory(currentQuestion)
    };

    setQuestionHistory([newQuestion, ...questionHistory]);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockAnswer: Answer = {
        id: Date.now().toString(),
        questionId,
        text: `This is a mock answer for: "${currentQuestion}". In a real implementation, this would be the actual response from your RAG system.`,
        confidence: Math.random() * 0.3 + 0.7,
        sources: [
          {
            documentName: "2024 Honda Accord Owner's Manual",
            pageNumber: 123,
            confidence: 0.92,
            excerpt: "The relevant information can be found in this section..."
          },
          {
            documentName: "Honda Service Manual",
            jsonPath: "$.specifications.engine",
            confidence: 0.85
          }
        ],
        relatedSuggestions: [
          "Related: How to check engine oil level",
          "Related: Maintenance schedule overview",
          "Related: Engine specifications comparison"
        ],
        responseTime: Math.random() * 2000 + 500,
        timestamp: new Date()
      };

      setAnswers([mockAnswer, ...answers]);
      setSelectedAnswer(mockAnswer);
      updateMetrics(mockAnswer);
      setIsLoading(false);
      setCurrentQuestion('');
    }, 1500);
  };

  // Detect question category
  const detectCategory = (question: string): string => {
    const lower = question.toLowerCase();
    if (lower.includes('part number') || lower.includes('filter') || lower.includes('brake')) {
      return 'parts';
    } else if (lower.includes('how to') || lower.includes('procedure') || lower.includes('reset')) {
      return 'procedures';
    } else {
      return 'specs';
    }
  };

  // Update metrics
  const updateMetrics = (answer: Answer) => {
    setMetrics(prev => {
      const category = detectCategory(answer.text);
      const categoryPerf = { ...prev.categoryPerformance };
      
      if (!categoryPerf[category]) {
        categoryPerf[category] = { count: 0, avgConfidence: 0, avgResponseTime: 0 };
      }
      
      const catData = categoryPerf[category];
      catData.count += 1;
      catData.avgConfidence = (catData.avgConfidence * (catData.count - 1) + answer.confidence) / catData.count;
      catData.avgResponseTime = (catData.avgResponseTime * (catData.count - 1) + answer.responseTime) / catData.count;

      const totalQuestions = prev.totalQuestions + 1;
      const avgConfidence = (prev.averageConfidence * prev.totalQuestions + answer.confidence) / totalQuestions;
      const avgResponseTime = (prev.averageResponseTime * prev.totalQuestions + answer.responseTime) / totalQuestions;

      return {
        totalQuestions,
        averageConfidence: avgConfidence,
        averageResponseTime: avgResponseTime,
        categoryPerformance: categoryPerf,
        accuracyRate: prev.accuracyRate
      };
    });
  };

  // Handle answer validation
  const handleValidation = (answerId: string, rating: 'positive' | 'negative') => {
    setAnswers(prev => prev.map(ans => 
      ans.id === answerId 
        ? { ...ans, validation: { ...ans.validation, rating } }
        : ans
    ));

    // Update accuracy rate
    const validatedAnswers = answers.filter(a => a.validation?.rating);
    const positiveAnswers = validatedAnswers.filter(a => a.validation?.rating === 'positive');
    const accuracyRate = validatedAnswers.length > 0 
      ? (positiveAnswers.length / validatedAnswers.length) * 100 
      : 0;
    
    setMetrics(prev => ({ ...prev, accuracyRate }));
  };

  // Toggle favorite
  const toggleFavorite = (questionId: string) => {
    setFavorites(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
    
    setQuestionHistory(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, isFavorite: !q.isFavorite }
        : q
    ));
  };

  // Export results
  const exportResults = () => {
    const data = {
      metrics,
      questions: questionHistory,
      answers: answers.map(a => ({
        ...a,
        sources: a.sources.map(s => ({ ...s, excerpt: undefined }))
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-results-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Question Input</CardTitle>
              <CardDescription>
                Enter automotive-related questions to test the RAG system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Enter your question about Honda/Acura vehicles..."
                  className="min-h-[100px] pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSubmitQuestion();
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-2 right-2"
                  onClick={() => setIsRecording(!isRecording)}
                  disabled
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitQuestion} 
                  disabled={!currentQuestion.trim() || isLoading}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Submit Question'}
                </Button>
              </div>

              {/* Predefined Questions */}
              <Tabs defaultValue="specs" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="parts">Parts</TabsTrigger>
                  <TabsTrigger value="procedures">Procedures</TabsTrigger>
                </TabsList>
                {Object.entries(predefinedQuestions).map(([category, questions]) => (
                  <TabsContent key={category} value={category} className="space-y-2">
                    {questions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => setCurrentQuestion(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Answer Display Panel */}
          {selectedAnswer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Answer
                  <Badge variant={selectedAnswer.confidence > 0.8 ? "default" : "secondary"}>
                    {(selectedAnswer.confidence * 100).toFixed(0)}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <p>{selectedAnswer.text}</p>
                </div>

                {/* Source Attribution */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Sources:</h4>
                  {selectedAnswer.sources.map((source, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium text-sm">{source.documentName}</span>
                          </div>
                          {source.pageNumber && (
                            <p className="text-xs text-muted-foreground">Page {source.pageNumber}</p>
                          )}
                          {source.jsonPath && (
                            <p className="text-xs text-muted-foreground font-mono">{source.jsonPath}</p>
                          )}
                          {source.excerpt && (
                            <p className="text-xs text-muted-foreground mt-2">"{source.excerpt}"</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {(source.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Related Suggestions */}
                {selectedAnswer.relatedSuggestions && selectedAnswer.relatedSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Related Information:</h4>
                    <div className="space-y-1">
                      {selectedAnswer.relatedSuggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setCurrentQuestion(suggestion.replace('Related: ', ''))}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Tools */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <span className="text-sm font-medium">Was this answer helpful?</span>
                  <Button
                    size="sm"
                    variant={selectedAnswer.validation?.rating === 'positive' ? 'default' : 'outline'}
                    onClick={() => handleValidation(selectedAnswer.id, 'positive')}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAnswer.validation?.rating === 'negative' ? 'default' : 'outline'}
                    onClick={() => handleValidation(selectedAnswer.id, 'negative')}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAnswer.validation?.flagged ? 'destructive' : 'outline'}
                    onClick={() => setAnswers(prev => prev.map(a => 
                      a.id === selectedAnswer.id 
                        ? { ...a, validation: { ...a.validation, flagged: !a.validation?.flagged } }
                        : a
                    ))}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - History & Metrics */}
        <div className="space-y-4">
          {/* Question History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Question History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {questionHistory.map((question) => (
                    <div
                      key={question.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setCurrentQuestion(question.text)}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm flex-1">{question.text}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(question.id);
                          }}
                        >
                          {question.isFavorite ? (
                            <Star className="h-3 w-3 fill-current" />
                          ) : (
                            <StarOff className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(question.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Testing Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Testing Metrics
                </span>
                <Button size="sm" variant="outline" onClick={exportResults}>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold">{metrics.totalQuestions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  <p className="text-2xl font-bold">{metrics.accuracyRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Average Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Confidence</span>
                  <span>{(metrics.averageConfidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.averageConfidence * 100} />
              </div>

              {/* Response Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <span className="text-sm font-medium">
                  {(metrics.averageResponseTime / 1000).toFixed(2)}s
                </span>
              </div>

              {/* Category Performance */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Category Performance</h4>
                {Object.entries(metrics.categoryPerformance).map(([category, data]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span>{data.count} questions</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Conf: {(data.avgConfidence * 100).toFixed(0)}%</span>
                      <span>•</span>
                      <span>Time: {(data.avgResponseTime / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}