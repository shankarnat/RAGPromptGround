import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  MessageSquare, 
  BarChart3, 
  Download, 
  Share2,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAutomotiveQA } from '@/hooks/useAutomotiveQA';
import { TestingInterface } from '@/components/TestingInterface';
import { performanceMonitor } from '@/services/PerformanceMonitor';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AutomotiveQASessionProps {
  sessionId?: string;
  testSuiteId?: string;
  vehicleInfo?: {
    vin?: string;
    model?: string;
    year?: string;
    make?: string;
  };
}

export default function AutomotiveQASession({ 
  sessionId, 
  testSuiteId, 
  vehicleInfo 
}: AutomotiveQASessionProps) {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    submitQuestion,
    getAnswer,
    validateAnswer,
    executeTestSuite,
    getCurrentTestStatus,
    getTestResults,
    exportResults,
    getPerformanceAnalytics,
    getPerformanceAlerts,
    questions,
    answers,
    testSuites,
    currentExecution
  } = useAutomotiveQA();
  
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'qa' | 'metrics' | 'alerts'>('qa');
  
  // Load session from URL parameters
  const activeSessionId = params.sessionId || sessionId;
  
  // Initialize session
  useEffect(() => {
    if (activeSessionId) {
      // Load existing session
      performanceMonitor.trackUserInteraction('load_qa_session', 'qa', {
        sessionId: activeSessionId,
        hasVehicleInfo: !!vehicleInfo
      });
    } else if (testSuiteId) {
      // Start test suite execution
      executeTestSuite(testSuiteId, {
        onProgress: (progress) => {
          console.log(`Test progress: ${(progress * 100).toFixed(0)}%`);
        }
      }).catch(error => {
        toast({
          title: "Test Suite Error",
          description: error.message,
          variant: "destructive"
        });
      });
    }
  }, [activeSessionId, testSuiteId]);
  
  // Generate shareable URL
  const generateShareUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    
    if (activeSessionId) {
      params.set('session', activeSessionId);
    }
    
    if (vehicleInfo?.vin) {
      params.set('vin', vehicleInfo.vin);
    } else if (vehicleInfo) {
      if (vehicleInfo.year) params.set('year', vehicleInfo.year);
      if (vehicleInfo.make) params.set('make', vehicleInfo.make);
      if (vehicleInfo.model) params.set('model', vehicleInfo.model);
    }
    
    const url = `${baseUrl}/qa/${activeSessionId || 'new'}?${params.toString()}`;
    setShareUrl(url);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "Q&A session link copied to clipboard"
      });
    });
    
    performanceMonitor.trackUserInteraction('share_qa_session', 'qa', {
      sessionId: activeSessionId,
      hasVehicleInfo: !!vehicleInfo
    });
  }, [activeSessionId, vehicleInfo, toast]);
  
  // Export session data
  const handleExport = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    setIsLoading(true);
    try {
      const blob = await exportResults(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qa-session-${activeSessionId || 'export'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      performanceMonitor.trackUserInteraction('export_qa_session', 'qa', {
        format,
        sessionId: activeSessionId,
        questionCount: questions.length
      });
      
      toast({
        title: "Export Successful",
        description: `Session exported as ${format.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, questions.length, exportResults, toast]);
  
  // Get current performance data
  const analytics = getPerformanceAnalytics();
  const alerts = getPerformanceAlerts();
  const testStatus = getCurrentTestStatus();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/unified')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-semibold">Automotive Q&A Session</h1>
                {activeSessionId && (
                  <Badge variant="outline">
                    Session: {activeSessionId.substring(0, 8)}...
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateShareUrl}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                  disabled={isLoading}
                >
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={isLoading}
                >
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={isLoading}
                >
                  PDF
                </Button>
              </div>
            </div>
          </div>
          
          {/* Vehicle Info Bar */}
          {vehicleInfo && (
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              {vehicleInfo.vin && (
                <span>VIN: <span className="font-mono">{vehicleInfo.vin}</span></span>
              )}
              {vehicleInfo.year && vehicleInfo.make && vehicleInfo.model && (
                <span>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Test Execution Status */}
        {currentExecution && testStatus && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className={cn(
                      "h-5 w-5",
                      currentExecution.status === 'running' && "animate-spin"
                    )} />
                    <span className="font-medium">
                      Test Suite: {testSuites.find(s => s.id === currentExecution.suiteId)?.name}
                    </span>
                    <Badge variant={
                      currentExecution.status === 'running' ? 'default' :
                      currentExecution.status === 'completed' ? 'secondary' :
                      'outline'
                    }>
                      {currentExecution.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(testStatus.timeElapsed / 60)}m {testStatus.timeElapsed % 60}s
                    </span>
                    <span>
                      {testStatus.remainingQuestions} questions remaining
                    </span>
                  </div>
                </div>
                
                <Progress value={testStatus.progress * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="qa">
              <MessageSquare className="h-4 w-4 mr-2" />
              Q&A Interface
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertCircle className="h-4 w-4 mr-2" />
              Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="qa">
            <TestingInterface
              onQuestionSubmit={(question) => submitQuestion(question, 'general', { vehicleInfo })}
              onValidation={(answerId, validation, correctAnswer) => {
                validateAnswer(answerId, validation === 'correct', correctAnswer);
              }}
              onExportResults={() => handleExport('json')}
              vehicleInfo={vehicleInfo}
            />
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Q&A Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Q&A Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Total Questions</span>
                        <span className="font-medium">{analytics.qa.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span>Success Rate</span>
                        <span className="font-medium">
                          {(analytics.qa.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span>Avg Response Time</span>
                        <span className="font-medium">
                          {analytics.qa.averageResponseTime.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2">Response Time Distribution</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>P50</span>
                          <span>{analytics.qa.responseTimePercentiles.p50}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>P90</span>
                          <span>{analytics.qa.responseTimePercentiles.p90}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>P99</span>
                          <span>{analytics.qa.responseTimePercentiles.p99}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* System Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span className="font-medium">
                          {analytics.system.memoryUsage.current.toFixed(0)}MB
                        </span>
                      </div>
                      <Progress 
                        value={analytics.system.memoryUsage.current / 500 * 100} 
                        className="mt-1 h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Cache Hit Rate</span>
                        <span className="font-medium">
                          {(analytics.system.cacheHitRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={analytics.system.cacheHitRate * 100} 
                        className="mt-1 h-2"
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span className={cn(
                        "font-medium",
                        analytics.system.errorRate > 0.05 ? "text-red-600" : "text-green-600"
                      )}>
                        {(analytics.system.errorRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* User Behavior */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Sessions</span>
                      <span className="font-medium">{analytics.userBehavior.totalSessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Session Duration</span>
                      <span className="font-medium">
                        {Math.floor(analytics.userBehavior.averageSessionDuration / 60000)}m
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Actions per Session</span>
                      <span className="font-medium">
                        {analytics.userBehavior.actionsPerSession.toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2">Top Actions</p>
                      {analytics.userBehavior.mostCommonActions.slice(0, 3).map((action, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="truncate">{action.action}</span>
                          <span>{action.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts">
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No performance alerts at this time. System is running smoothly.
                  </AlertDescription>
                </Alert>
              ) : (
                alerts.map((alert) => (
                  <Alert 
                    key={alert.id}
                    variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          {alert.metadata && (
                            <p className="text-sm text-gray-600 mt-1">
                              {JSON.stringify(alert.metadata, null, 2)}
                            </p>
                          )}
                        </div>
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'error' ? 'default' :
                          'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}