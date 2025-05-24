import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Zap, 
  Brain, 
  Car,
  Wrench,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BarChart3,
  Clock,
  Target
} from "lucide-react";
import { useConversation } from "@/hooks/useConversation";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import TestQueryInterface from "@/components/TestQueryInterface";
import { automotiveTestQuestions } from "@/data/automotiveTestQuestions";

interface TestResult {
  id: string;
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  confidence: number;
  latency: number;
  sources: Array<{
    text: string;
    document: string;
    confidence: number;
  }>;
  evaluation?: {
    isCorrect: boolean;
    feedback?: 'positive' | 'negative';
    notes?: string;
  };
  category: 'technical' | 'parts' | 'maintenance' | 'safety' | 'diagnostic' | 'specifications' | 'service' | 'general';
}

interface IntegratedTestResultsProps {
  onClose?: () => void;
  onComplete?: (results: any) => void;
}

const IntegratedTestResults: React.FC<IntegratedTestResultsProps> = ({ onClose, onComplete }) => {
  const { state: conversationState } = useConversation();
  const { state: processingState } = useDocumentProcessing();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'evaluate'>('overview');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Calculate metrics from test results
  const calculateMetrics = () => {
    if (testResults.length === 0) return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      avgConfidence: 0,
      avgLatency: 0,
      accuracyRate: 0,
      categoriesBreakdown: {}
    };

    const passed = testResults.filter(r => r.evaluation?.isCorrect).length;
    const failed = testResults.filter(r => r.evaluation && !r.evaluation.isCorrect).length;
    const avgConfidence = testResults.reduce((sum, r) => sum + r.confidence, 0) / testResults.length;
    const avgLatency = testResults.reduce((sum, r) => sum + r.latency, 0) / testResults.length;
    
    const categoriesBreakdown = testResults.reduce((acc, r) => {
      const category = r.category;
      if (!acc[category]) {
        acc[category] = { total: 0, passed: 0, avgConfidence: 0 };
      }
      acc[category].total++;
      if (r.evaluation?.isCorrect) acc[category].passed++;
      return acc;
    }, {} as Record<string, { total: number; passed: number; avgConfidence: number }>);

    // Calculate average confidence per category
    Object.keys(categoriesBreakdown).forEach(cat => {
      const catResults = testResults.filter(r => r.category === cat);
      categoriesBreakdown[cat].avgConfidence = 
        catResults.reduce((sum, r) => sum + r.confidence, 0) / catResults.length;
    });

    return {
      totalTests: testResults.length,
      passedTests: passed,
      failedTests: failed,
      avgConfidence: avgConfidence * 100,
      avgLatency,
      accuracyRate: (passed / (passed + failed)) * 100 || 0,
      categoriesBreakdown
    };
  };

  // Run automated tests based on conversation state
  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    const testType = conversationState.qaTestResults?.testType || 'general';
    
    // Filter questions based on test type - map test types to categories
    const categoryMap: Record<string, string[]> = {
      'parts': ['parts', 'technical'],
      'specifications': ['technical', 'diagnostic'], 
      'service': ['maintenance', 'safety'],
      'general': ['technical', 'parts', 'maintenance', 'safety', 'diagnostic']
    };
    
    const relevantCategories = categoryMap[testType] || categoryMap['general'];
    const relevantQuestions = automotiveTestQuestions.filter(q => 
      relevantCategories.includes(q.category)
    ).slice(0, 10); // Limit to 10 questions for demo

    for (let i = 0; i < relevantQuestions.length; i++) {
      setCurrentTestIndex(i);
      const question = relevantQuestions[i];
      
      // Simulate API call to get answer
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      const latency = Date.now() - startTime;
      
      const result: TestResult = {
        id: `test-${Date.now()}-${i}`,
        question: question.question,
        expectedAnswer: question.expectedAnswer,
        actualAnswer: question.expectedAnswer, // In real implementation, this would come from the Q&A system
        confidence: 0.75 + Math.random() * 0.25,
        latency,
        sources: [{
          text: question.documentReference || 'Automotive Service Manual',
          document: processingState.document.title,
          confidence: 0.8 + Math.random() * 0.2
        }],
        category: question.category,
        evaluation: {
          isCorrect: Math.random() > 0.2, // 80% success rate for demo
        }
      };
      
      setTestResults(prev => [...prev, result]);
    }
    
    setIsRunningTests(false);
  };

  // Handle user feedback on a result
  const handleFeedback = (resultId: string, feedback: 'positive' | 'negative') => {
    setTestResults(prev => prev.map(r => 
      r.id === resultId 
        ? { ...r, evaluation: { ...r.evaluation!, feedback } }
        : r
    ));
  };

  // Re-run a specific test
  const rerunTest = async (result: TestResult) => {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    const latency = Date.now() - startTime;
    
    const updatedResult: TestResult = {
      ...result,
      confidence: 0.75 + Math.random() * 0.25,
      latency,
      evaluation: {
        isCorrect: Math.random() > 0.15, // 85% success rate on rerun
      }
    };
    
    setTestResults(prev => prev.map(r => 
      r.id === result.id ? updatedResult : r
    ));
  };

  const metrics = calculateMetrics();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Integrated Test Results</h2>
          <p className="text-gray-600">Comprehensive Q&A testing and evaluation</p>
        </div>
        <div className="flex gap-2">
          {!isRunningTests && testResults.length === 0 && (
            <Button onClick={runAutomatedTests} className="gap-2">
              <Car className="h-4 w-4" />
              Run Automotive Tests
            </Button>
          )}
          {testResults.length > 0 && (
            <Button 
              onClick={() => onComplete?.(testResults)} 
              variant="default"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Testing
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed" className="gap-2">
            <FileText className="h-4 w-4" />
            Detailed Results
          </TabsTrigger>
          <TabsTrigger value="evaluate" className="gap-2">
            <Brain className="h-4 w-4" />
            Evaluate & Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.accuracyRate.toFixed(1)}%</div>
                <Progress value={metrics.accuracyRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.passedTests} passed / {metrics.failedTests} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgConfidence.toFixed(1)}%</div>
                <Progress value={metrics.avgConfidence} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  System confidence score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgLatency.toFixed(0)}ms</div>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Response latency
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>Test results grouped by automotive category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.categoriesBreakdown).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {category === 'parts' && <Wrench className="h-4 w-4 text-blue-600" />}
                        {category === 'specifications' && <FileText className="h-4 w-4 text-green-600" />}
                        {category === 'service' && <Car className="h-4 w-4 text-purple-600" />}
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {data.passed}/{data.total} passed
                        </span>
                        <Badge variant={data.passed === data.total ? 'default' : 'secondary'}>
                          {((data.passed / data.total) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(data.passed / data.total) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Running Tests Progress */}
          {isRunningTests && (
            <Card>
              <CardHeader>
                <CardTitle>Running Tests...</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={(currentTestIndex / 10) * 100} 
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Testing question {currentTestIndex + 1} of 10
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Detail</CardTitle>
              <CardDescription>Individual test results with evaluation status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedResult?.id === result.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">{result.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {result.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {(result.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {result.latency}ms
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.evaluation?.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                        
                        {selectedResult?.id === result.id && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Answer:</p>
                              <p className="text-sm">{result.actualAnswer}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Sources:</p>
                              <div className="space-y-1">
                                {result.sources.map((source, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground">
                                    • {source.text.substring(0, 100)}...
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(result.id, 'positive');
                                }}
                                className={result.evaluation?.feedback === 'positive' ? 'bg-green-50' : ''}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(result.id, 'negative');
                                }}
                                className={result.evaluation?.feedback === 'negative' ? 'bg-red-50' : ''}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rerunTest(result);
                                }}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Testing Interface */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Live Q&A Testing</CardTitle>
                  <CardDescription>Test custom queries against your automotive documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <TestQueryInterface fields={processingState.fields} />
                </CardContent>
              </Card>
            </div>

            {/* Test Suite Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Automotive Test Suites</CardTitle>
                  <CardDescription>Pre-configured test scenarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={() => runAutomatedTests()}
                    >
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium">Parts & Components Test</p>
                        <p className="text-xs text-muted-foreground">VIN, part numbers, specifications</p>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={() => runAutomatedTests()}
                    >
                      <Car className="h-4 w-4 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium">Service Procedures Test</p>
                        <p className="text-xs text-muted-foreground">Maintenance, repairs, diagnostics</p>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={() => runAutomatedTests()}
                    >
                      <FileText className="h-4 w-4 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium">Technical Specs Test</p>
                        <p className="text-xs text-muted-foreground">Dimensions, capacities, ratings</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                  <CardDescription>Connected systems and data flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Conversation Manager</span>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Document Processing</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Performance Monitor</span>
                      </div>
                      <Badge variant="default">Tracking</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Evaluation Feedback</span>
                      </div>
                      <Badge variant="secondary">
                        {testResults.filter(r => r.evaluation?.feedback).length} rated
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedTestResults;