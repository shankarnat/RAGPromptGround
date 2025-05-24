import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { performanceMonitor, perfLog } from '@/services/PerformanceMonitor';
import { progressiveApiRequest } from '@/lib/queryClient';

export interface AutomotiveQuestion {
  id: string;
  question: string;
  category: 'parts' | 'specifications' | 'service' | 'diagnostics' | 'general';
  expectedAnswer?: string;
  keywords?: string[];
}

export interface AutomotiveAnswer {
  questionId: string;
  answer: string;
  confidence: number;
  sources?: string[];
  relatedQuestions?: string[];
  timestamp: Date;
}

export interface ValidationResult {
  questionId: string;
  isCorrect: boolean;
  feedback?: string;
  suggestedAnswer?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  questions: AutomotiveQuestion[];
  createdAt: Date;
  category?: string;
}

export interface TestExecution {
  suiteId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'paused';
  currentQuestionIndex: number;
  results: Array<{
    question: AutomotiveQuestion;
    answer: AutomotiveAnswer;
    validation?: ValidationResult;
  }>;
}

interface UseAutomotiveQAReturn {
  // Question submission and answer retrieval
  submitQuestion: (
    question: string, 
    category?: AutomotiveQuestion['category'],
    options?: {
      vehicleInfo?: { year?: string; make?: string; model?: string };
      priority?: 'high' | 'normal' | 'low';
      timeout?: number;
    }
  ) => Promise<AutomotiveAnswer>;
  getAnswer: (questionId: string) => AutomotiveAnswer | undefined;
  
  // Confidence score management
  getAverageConfidence: () => number;
  getConfidenceByCategory: (category: AutomotiveQuestion['category']) => number;
  
  // Answer validation and feedback
  validateAnswer: (questionId: string, isCorrect: boolean, feedback?: string) => void;
  provideFeedback: (questionId: string, feedback: string) => void;
  
  // Test suite execution and monitoring
  createTestSuite: (name: string, questions: AutomotiveQuestion[], description?: string) => TestSuite;
  executeTestSuite: (
    suiteId: string,
    options?: {
      batchSize?: number;
      onProgress?: (progress: number) => void;
      abortSignal?: AbortSignal;
    }
  ) => Promise<void>;
  pauseTestExecution: () => void;
  resumeTestExecution: () => void;
  getCurrentTestStatus: () => TestExecution | undefined;
  
  // Results and metrics
  getTestResults: (suiteId?: string) => TestExecution[];
  exportResults: (format: 'json' | 'csv' | 'pdf') => Promise<Blob>;
  
  // Performance monitoring
  getPerformanceAnalytics: () => any;
  getPerformanceAlerts: (severity?: 'warning' | 'error' | 'critical') => any[];
  
  // State
  questions: AutomotiveQuestion[];
  answers: Map<string, AutomotiveAnswer>;
  validations: Map<string, ValidationResult>;
  testSuites: TestSuite[];
  currentExecution?: TestExecution;
}

export function useAutomotiveQA(): UseAutomotiveQAReturn {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<AutomotiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<string, AutomotiveAnswer>>(new Map());
  const [validations, setValidations] = useState<Map<string, ValidationResult>>(new Map());
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [currentExecution, setCurrentExecution] = useState<TestExecution | undefined>();
  const [executions, setExecutions] = useState<TestExecution[]>([]);

  // Question submission and answer retrieval with error handling
  const submitQuestion = useCallback(async (
    question: string, 
    category: AutomotiveQuestion['category'] = 'general',
    options?: {
      vehicleInfo?: { year?: string; make?: string; model?: string };
      priority?: 'high' | 'normal' | 'low';
      timeout?: number;
    }
  ): Promise<AutomotiveAnswer> => {
    const questionObj: AutomotiveQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      category,
      keywords: extractKeywords(question)
    };
    
    // Start performance tracking
    const perfTracker = performanceMonitor.trackQAQuery(
      questionObj.id,
      question,
      Date.now(),
      {
        vehicleInfo: options?.vehicleInfo,
        documentType: category
      }
    );
    
    try {
      setQuestions(prev => [...prev, questionObj]);
      
      // Validate question format
      if (!question.trim()) {
        throw new Error('Question cannot be empty');
      }
      
      if (question.length > 500) {
        throw new Error('Question too long. Please limit to 500 characters.');
      }
      
      // Check for invalid automotive data formats
      if (category === 'parts' && !question.match(/\b\d{5}-[A-Z0-9]{3}-[A-Z0-9]{3}\b/i) && question.includes('part number')) {
        perfLog.qa('Warning: Part number format may be invalid', { question });
      }
      
      // In real implementation, use actual API
      let answer: AutomotiveAnswer;
      
      if (process.env.NODE_ENV === 'production') {
        // Real API call with timeout and error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 30000);
        
        try {
          const response = await progressiveApiRequest(
            'POST',
            '/api/qa/submit',
            {
              question: questionObj,
              options: {
                priority: options?.priority || 'normal',
                vehicleInfo: options?.vehicleInfo
              }
            },
            {
              documentType: 'manual',
              onProgress: (progress) => {
                perfLog.qa(`Q&A processing progress: ${(progress * 100).toFixed(0)}%`);
              }
            }
          );
          
          clearTimeout(timeoutId);
          answer = await response.json();
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            throw new Error('Question processing timeout. Please try a simpler question.');
          }
          
          throw error;
        }
      } else {
        // Development mode simulation
        answer = {
          questionId: questionObj.id,
          answer: await simulateAnswerGeneration(question, category),
          confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 confidence
          sources: ['Service Manual Page 45', 'Technical Bulletin TB-2025-03'],
          relatedQuestions: generateRelatedQuestions(question, category),
          timestamp: new Date()
        };
      }
      
      setAnswers(prev => new Map(prev.set(questionObj.id, answer)));
      
      // Track successful completion
      perfTracker.complete(true, answer.confidence);
      
      // User interaction tracking
      performanceMonitor.trackUserInteraction('submit_question', 'qa', {
        category,
        confidence: answer.confidence,
        sourceCount: answer.sources?.length || 0
      });
      
      toast({
        title: "Question Processed",
        description: `Confidence: ${(answer.confidence * 100).toFixed(0)}%`,
      });
      
      return answer;
      
    } catch (error: any) {
      // Track failed completion
      perfTracker.complete(false, 0, error);
      
      // Log specific automotive errors
      perfLog.error('Q&A submission failed', {
        question: questionObj.id,
        error: error.message,
        category
      });
      
      // User-friendly error messages
      let userMessage = 'Failed to process question. Please try again.';
      
      if (error.message.includes('timeout')) {
        userMessage = 'The question took too long to process. Try breaking it into smaller parts.';
      } else if (error.message.includes('empty')) {
        userMessage = 'Please enter a question.';
      } else if (error.message.includes('too long')) {
        userMessage = error.message;
      } else if (error.status === 422) {
        userMessage = 'Invalid question format. Please check and try again.';
      } else if (error.status === 503) {
        userMessage = 'Service temporarily unavailable. Please try again later.';
      }
      
      toast({
        title: "Error Processing Question",
        description: userMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [toast]);

  const getAnswer = useCallback((questionId: string): AutomotiveAnswer | undefined => {
    return answers.get(questionId);
  }, [answers]);

  // Confidence score management
  const getAverageConfidence = useCallback((): number => {
    if (answers.size === 0) return 0;
    const total = Array.from(answers.values()).reduce((sum, answer) => sum + answer.confidence, 0);
    return total / answers.size;
  }, [answers]);

  const getConfidenceByCategory = useCallback((category: AutomotiveQuestion['category']): number => {
    const categoryAnswers = Array.from(answers.entries())
      .filter(([questionId]) => {
        const question = questions.find(q => q.id === questionId);
        return question?.category === category;
      })
      .map(([, answer]) => answer);
    
    if (categoryAnswers.length === 0) return 0;
    const total = categoryAnswers.reduce((sum, answer) => sum + answer.confidence, 0);
    return total / categoryAnswers.length;
  }, [answers, questions]);

  // Answer validation and feedback
  const validateAnswer = useCallback((
    questionId: string, 
    isCorrect: boolean, 
    feedback?: string
  ): void => {
    const validation: ValidationResult = {
      questionId,
      isCorrect,
      feedback,
      suggestedAnswer: isCorrect ? undefined : generateSuggestedAnswer(questionId)
    };
    
    setValidations(prev => new Map(prev.set(questionId, validation)));
    
    toast({
      title: isCorrect ? "Answer Validated" : "Answer Needs Improvement",
      description: feedback || (isCorrect ? "The answer is correct!" : "Please review the suggested answer."),
      variant: isCorrect ? "default" : "destructive"
    });
  }, [toast]);

  const provideFeedback = useCallback((questionId: string, feedback: string): void => {
    setValidations(prev => {
      const existing = prev.get(questionId);
      return new Map(prev.set(questionId, {
        ...existing,
        questionId,
        isCorrect: existing?.isCorrect ?? false,
        feedback
      }));
    });
  }, []);

  // Test suite execution and monitoring
  const createTestSuite = useCallback((
    name: string, 
    questions: AutomotiveQuestion[], 
    description?: string
  ): TestSuite => {
    const suite: TestSuite = {
      id: `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || '',
      questions,
      createdAt: new Date(),
      category: questions[0]?.category
    };
    
    setTestSuites(prev => [...prev, suite]);
    
    toast({
      title: "Test Suite Created",
      description: `"${name}" with ${questions.length} questions`,
    });
    
    return suite;
  }, [toast]);

  const executeTestSuite = useCallback(async (
    suiteId: string,
    options?: {
      batchSize?: number;
      onProgress?: (progress: number) => void;
      abortSignal?: AbortSignal;
    }
  ): Promise<void> => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) {
      toast({
        title: "Error",
        description: "Test suite not found",
        variant: "destructive"
      });
      return;
    }
    
    const execution: TestExecution = {
      suiteId,
      startTime: new Date(),
      status: 'running',
      currentQuestionIndex: 0,
      results: []
    };
    
    setCurrentExecution(execution);
    setExecutions(prev => [...prev, execution]);
    
    // Track test suite execution
    performanceMonitor.trackUserInteraction('start_test_suite', 'qa', {
      suiteId,
      questionCount: suite.questions.length,
      category: suite.category
    });
    
    try {
      const batchSize = options?.batchSize || 5;
      const totalQuestions = suite.questions.length;
      
      // Process questions in batches for better performance
      for (let i = 0; i < totalQuestions; i += batchSize) {
        // Check for abort signal
        if (options?.abortSignal?.aborted) {
          throw new Error('Test execution aborted');
        }
        
        const batch = suite.questions.slice(i, Math.min(i + batchSize, totalQuestions));
        
        // Process batch in parallel with error handling
        const batchPromises = batch.map(async (question, index) => {
          try {
            const answer = await submitQuestion(
              question.question,
              question.category,
              {
                priority: 'normal',
                timeout: 60000 // 1 minute timeout for test questions
              }
            );
            
            return {
              question,
              answer,
              success: true
            };
          } catch (error) {
            perfLog.error(`Failed to process test question ${i + index + 1}`, error);
            
            // Create a failed answer entry
            return {
              question,
              answer: {
                questionId: question.id,
                answer: 'Failed to process question',
                confidence: 0,
                timestamp: new Date()
              } as AutomotiveAnswer,
              success: false,
              error
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Update execution results
        setCurrentExecution(prev => {
          if (!prev) return prev;
          
          const newResults = [...prev.results];
          batchResults.forEach(result => {
            newResults.push({
              question: result.question,
              answer: result.answer
            });
          });
          
          return {
            ...prev,
            currentQuestionIndex: Math.min(i + batchSize, totalQuestions),
            results: newResults
          };
        });
        
        // Report progress
        const progress = Math.min((i + batchSize) / totalQuestions, 1);
        options?.onProgress?.(progress);
        
        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < totalQuestions) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Mark execution as completed
      setCurrentExecution(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'completed',
          endTime: new Date()
        };
      });
      
      // Track completion
      performanceMonitor.trackUserInteraction('complete_test_suite', 'qa', {
        suiteId,
        duration: Date.now() - execution.startTime.getTime(),
        questionsProcessed: totalQuestions
      });
      
      toast({
        title: "Test Suite Completed",
        description: `Processed ${totalQuestions} questions`,
      });
      
    } catch (error: any) {
      // Handle test execution errors
      setCurrentExecution(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'paused',
          endTime: new Date()
        };
      });
      
      perfLog.error('Test suite execution failed', {
        suiteId,
        error: error.message
      });
      
      toast({
        title: "Test Execution Error",
        description: error.message || "Failed to complete test suite",
        variant: "destructive"
      });
      
      throw error;
    }
  }, [testSuites, submitQuestion, toast]);

  const pauseTestExecution = useCallback((): void => {
    if (currentExecution && currentExecution.status === 'running') {
      setCurrentExecution({
        ...currentExecution,
        status: 'paused'
      });
      
      toast({
        title: "Test Paused",
        description: "You can resume the test at any time",
      });
    }
  }, [currentExecution, toast]);

  const resumeTestExecution = useCallback((): void => {
    if (currentExecution && currentExecution.status === 'paused') {
      setCurrentExecution({
        ...currentExecution,
        status: 'running'
      });
      
      toast({
        title: "Test Resumed",
        description: "Continuing from where you left off",
      });
    }
  }, [currentExecution, toast]);

  const getCurrentTestStatus = useCallback((): TestExecution | undefined => {
    return currentExecution;
  }, [currentExecution]);

  // Results and metrics
  const getTestResults = useCallback((suiteId?: string): TestExecution[] => {
    if (suiteId) {
      return executions.filter(e => e.suiteId === suiteId);
    }
    return executions;
  }, [executions]);

  const exportResults = useCallback(async (format: 'json' | 'csv' | 'pdf'): Promise<Blob> => {
    const data = {
      questions: questions.map(q => ({
        ...q,
        answer: answers.get(q.id),
        validation: validations.get(q.id)
      })),
      testSuites,
      executions,
      metrics: {
        totalQuestions: questions.length,
        averageConfidence: getAverageConfidence(),
        validatedAnswers: validations.size,
        correctAnswers: Array.from(validations.values()).filter(v => v.isCorrect).length
      }
    };
    
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      case 'csv':
        const csv = convertToCSV(data);
        return new Blob([csv], { type: 'text/csv' });
      
      case 'pdf':
        // In real implementation, use a PDF library
        const pdfContent = generatePDFContent(data);
        return new Blob([pdfContent], { type: 'application/pdf' });
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [questions, answers, validations, testSuites, executions, getAverageConfidence]);

  // Auto-progress test execution
  useEffect(() => {
    if (currentExecution && currentExecution.status === 'running') {
      const suite = testSuites.find(s => s.id === currentExecution.suiteId);
      if (!suite) return;
      
      const currentQuestion = suite.questions[currentExecution.currentQuestionIndex];
      if (!currentQuestion) return;
      
      const answer = answers.get(currentQuestion.id);
      if (answer && !currentExecution.results.find(r => r.question.id === currentQuestion.id)) {
        // Add result and move to next question
        const newResults = [...currentExecution.results, {
          question: currentQuestion,
          answer,
          validation: validations.get(currentQuestion.id)
        }];
        
        const nextIndex = currentExecution.currentQuestionIndex + 1;
        
        if (nextIndex < suite.questions.length) {
          // Continue to next question
          setCurrentExecution({
            ...currentExecution,
            currentQuestionIndex: nextIndex,
            results: newResults
          });
          
          submitQuestion(suite.questions[nextIndex].question, suite.questions[nextIndex].category);
        } else {
          // Test complete
          const completedExecution = {
            ...currentExecution,
            endTime: new Date(),
            status: 'completed' as const,
            results: newResults
          };
          
          setCurrentExecution(undefined);
          setExecutions(prev => prev.map(e => 
            e.suiteId === currentExecution.suiteId && e.startTime === currentExecution.startTime
              ? completedExecution
              : e
          ));
          
          toast({
            title: "Test Complete",
            description: `Finished ${suite.name} with ${newResults.length} questions answered`,
          });
        }
      }
    }
  }, [currentExecution, testSuites, answers, validations, submitQuestion, toast]);

  // Performance analytics
  const getPerformanceAnalytics = useCallback(() => {
    return performanceMonitor.getAnalytics();
  }, []);
  
  const getPerformanceAlerts = useCallback((severity?: 'warning' | 'error' | 'critical') => {
    return performanceMonitor.getAlerts(severity);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Track session end
      performanceMonitor.trackUserInteraction('end_qa_session', 'qa', {
        totalQuestions: questions.length,
        totalAnswers: answers.size,
        averageConfidence: getAverageConfidence()
      });
    };
  }, [questions.length, answers.size, getAverageConfidence]);

  return {
    submitQuestion,
    getAnswer,
    getAverageConfidence,
    getConfidenceByCategory,
    validateAnswer,
    provideFeedback,
    createTestSuite,
    executeTestSuite,
    pauseTestExecution,
    resumeTestExecution,
    getCurrentTestStatus,
    getTestResults,
    exportResults,
    getPerformanceAnalytics,
    getPerformanceAlerts,
    questions,
    answers,
    validations,
    testSuites,
    currentExecution
  };
}

// Helper functions
function extractKeywords(question: string): string[] {
  const keywords = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'how', 'the', 'for', 'and'].includes(word));
  return Array.from(new Set(keywords));
}

async function simulateAnswerGeneration(question: string, category: AutomotiveQuestion['category']): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate category-specific answers
  const answerTemplates = {
    parts: [
      "The part number is ${partNumber} and it's compatible with ${models}.",
      "This component requires ${specs} and should be replaced every ${interval}.",
      "The OEM part is ${part} with alternatives ${alternatives}."
    ],
    specifications: [
      "The specification for this is ${spec} according to the service manual.",
      "The recommended value is ${value} with a tolerance of ${tolerance}.",
      "Under normal conditions, this should be ${normal}, but can vary to ${range}."
    ],
    service: [
      "The service interval is ${interval} or ${condition}, whichever comes first.",
      "This procedure requires ${tools} and takes approximately ${time}.",
      "The service bulletin ${bulletin} recommends ${procedure}."
    ],
    diagnostics: [
      "This diagnostic code indicates ${issue}. Check ${components} first.",
      "The symptoms suggest ${problem}. Perform ${tests} to confirm.",
      "Common causes include ${causes}. Start troubleshooting with ${steps}."
    ],
    general: [
      "Based on the documentation, ${answer}.",
      "The manual states that ${information}.",
      "According to technical specifications, ${details}."
    ]
  };
  
  const templates = answerTemplates[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Simple template filling (in real implementation, use actual data)
  return template.replace(/\${[^}]+}/g, (match) => {
    const key = match.slice(2, -1);
    const placeholders: Record<string, string> = {
      partNumber: "17220-5BA-A00",
      models: "2025 Honda Accord, CR-V",
      specs: "OEM specifications",
      interval: "30,000 miles",
      part: "Honda Genuine Air Filter",
      alternatives: "Denso 143-3024, WIX 42875",
      spec: "32 PSI ± 2 PSI",
      value: "0.8-1.2mm",
      tolerance: "±0.1mm",
      normal: "180-220°F",
      range: "160-240°F",
      condition: "12 months",
      tools: "10mm socket, torque wrench",
      time: "45 minutes",
      bulletin: "TSB-2025-001",
      procedure: "replacement with updated part",
      issue: "low oil pressure",
      components: "oil pump, filter, and pressure sensor",
      problem: "transmission slipping",
      tests: "fluid level check and pressure test",
      causes: "worn brake pads, stuck caliper, or ABS sensor failure",
      steps: "visual inspection of brake components",
      answer: "this is covered in Section 4.3 of the service manual",
      information: "this requires dealer-level diagnostic equipment",
      details: "this falls within normal operating parameters"
    };
    return placeholders[key] || match;
  });
}

function generateRelatedQuestions(question: string, category: AutomotiveQuestion['category']): string[] {
  const relatedByCategory = {
    parts: [
      "What are the compatible aftermarket alternatives?",
      "What is the installation procedure for this part?",
      "Are there any service bulletins for this component?"
    ],
    specifications: [
      "What are the tolerance limits for this specification?",
      "How does this spec change with temperature?",
      "What tools are needed to measure this?"
    ],
    service: [
      "What are the required tools for this service?",
      "Are there any special precautions?",
      "What is the labor time estimate?"
    ],
    diagnostics: [
      "What are the related fault codes?",
      "What is the diagnostic procedure?",
      "What are common misdiagnoses?"
    ],
    general: [
      "Where can I find more information?",
      "Are there any related technical bulletins?",
      "What is the warranty coverage?"
    ]
  };
  
  return relatedByCategory[category].slice(0, 2);
}

function generateSuggestedAnswer(questionId: string): string {
  return "Based on the technical documentation, a more accurate answer would include specific part numbers, torque specifications, or service intervals as applicable.";
}

function convertToCSV(data: any): string {
  const rows = [
    ['Question ID', 'Question', 'Category', 'Answer', 'Confidence', 'Validated', 'Correct'],
    ...data.questions.map((q: any) => [
      q.id,
      q.question,
      q.category,
      q.answer?.answer || '',
      q.answer?.confidence || '',
      q.validation ? 'Yes' : 'No',
      q.validation?.isCorrect ? 'Yes' : 'No'
    ])
  ];
  
  return rows.map(row => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');
}

function generatePDFContent(data: any): string {
  // Placeholder for PDF generation
  // In real implementation, use jsPDF or similar library
  return `Automotive Q&A Test Results\n\nTotal Questions: ${data.questions.length}\nAverage Confidence: ${data.metrics.averageConfidence}\n`;
}