import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Database, 
  Eye, 
  Image, 
  ScanLine, 
  MessageSquare,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Zap,
  TestTube,
  Search,
  Loader2,
  BrainCircuit,
  Sparkles,
  Bot,
  ThumbsUp,
  ThumbsDown,
  TableOfContents
} from 'lucide-react';

interface SinglePromptInterfaceProps {
  onProcessStart?: (prompt: string, config: any) => void;
  disabled?: boolean;
  // Props for prompt parsing state
  isPromptApplied?: boolean;
  promptParsing?: any;
  processingConfig?: any;
  ragResults?: any;
}

type ProcessingPhase = 'input' | 'understanding' | 'processing' | 'complete';

// Index Configuration Test Panel Component
const IndexConfigurationTestPanel: React.FC<{
  isPromptApplied?: boolean;
  promptParsing?: any;
  processingConfig?: any;
  ragResults?: any;
}> = ({
  isPromptApplied = false,
  promptParsing,
  processingConfig,
  ragResults
}) => {
  const [agenticQuery, setAgenticQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const agenticSuggestions = [
    "What is the towing capacity of the 2025 Acura RDX?",
    "What type of drivetrain does the 2025 Acura RDX have?",
    "What is the engine displacement of the 2025 Acura RDX?",
    "What is the ground clearance of the 2025 Acura RDX?",
    "How many speakers are in the ELS Studio 3D Audio system?",
    "What is the maximum horsepower of the 2025 Acura RDX?",
    "What transmission does the 2025 Acura RDX use?",
    "What safety features are included in AcuraWatch®?"
  ];

  const handleInputChange = useCallback((value: string) => {
    setAgenticQuery(value);
    
    if (value.trim().length === 0) {
      // Show all suggestions when input is empty
      setFilteredSuggestions(agenticSuggestions);
      setShowSuggestions(true);
    } else {
      // Filter suggestions based on input
      const filtered = agenticSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [agenticSuggestions]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setAgenticQuery(suggestion);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    handleRunQuery(suggestion);
  }, []);

  // Helper function to get answer from chunks (restored original logic)
  const getAnswerFromChunks = useCallback((query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // If prompt is applied, return correct answer
    if (isPromptApplied && lowerQuery.includes('towing capacity')) {
      return '1,500 lbs';
    }
    
    if (isPromptApplied && lowerQuery.includes('engine displacement')) {
      return '1996 cc (121.8 cu in)';
    }
    
    if (isPromptApplied && lowerQuery.includes('horsepower')) {
      return '272 hp @ 6500 rpm';
    }
    
    if (isPromptApplied && lowerQuery.includes('drivetrain')) {
      return 'SH-AWD® (Super Handling All-Wheel Drive™)';
    }
    
    // Otherwise return not found
    return 'Answer not able to find';
  }, [isPromptApplied]);
  
  // Helper function to get relevant chunks (restored original logic)
  const getRelevantChunks = useCallback((query: string): any[] => {
    if (!ragResults?.chunks) return [];
    
    // If prompt is applied, return properly formatted Markdown chunks
    if (isPromptApplied && query.toLowerCase().includes('towing capacity')) {
      return [{
        content: `## Drivetrain Specifications

| Component | Specification | Details |
|-----------|--------------|---------|
| Drivetrain Type | SH-AWD® | Super Handling All-Wheel Drive™ |
| Transmission | 10-Speed Automatic | 10AT with paddle shifters |
| Towing Capacity | 1,500 lbs | When properly equipped |`,
        confidence: 0.95,
        title: "Drivetrain Specifications (Well-Formatted Table)"
      }];
    }
    
    if (isPromptApplied && query.toLowerCase().includes('engine')) {
      return [{
        content: `## Engine Specifications

| Specification | Value | Details |
|--------------|--------|---------|
| Engine Type | 2.0L VTEC® Turbo | 4-cylinder, 16-valve, DOHC |
| Displacement | 1996 cc | 121.8 cu in |
| Max Horsepower | 272 hp @ 6500 rpm | SAE net |
| Max Torque | 280 lb-ft @ 1600-4500 rpm | SAE net |`,
        confidence: 0.95,
        title: "Engine Specifications (Well-Formatted Table)"
      }];
    }
    
    // Find chunks that might contain the answer
    const relevantChunks = ragResults.chunks.filter((chunk: any) => 
      chunk.content.toLowerCase().includes(query.toLowerCase().split(' ').slice(-2).join(' '))
    ).slice(0, 3);
    
    return relevantChunks.map((chunk: any) => ({
      content: chunk.content.substring(0, 150) + '...',
      confidence: Math.random() * 0.2 + 0.8, // 80-100% confidence
      title: "Basic Content Extract"
    }));
  }, [ragResults, isPromptApplied]);

  const handleRunQuery = useCallback(async (query?: string) => {
    const queryToRun = query || agenticQuery;
    if (!queryToRun.trim()) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    
    // Simulate query execution with restored original logic
    setTimeout(() => {
      const answer = getAnswerFromChunks(queryToRun);
      const sources = getRelevantChunks(queryToRun);
      const confidence = isPromptApplied ? 0.95 : Math.random() * 0.3 + 0.7; // Higher confidence when prompt applied
      
      const mockResult = {
        query: queryToRun,
        answer: answer,
        confidence: confidence,
        sources: sources,
        isPromptApplied: isPromptApplied
      };
      
      setQueryResult(mockResult);
      setShowResults(true);
      setIsLoading(false);
    }, 1500);
  }, [agenticQuery, getAnswerFromChunks, getRelevantChunks, isPromptApplied]);

  return (
    <div className="pt-0 px-6 pb-6 bg-white/50 min-h-[600px] max-h-[95vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Query Input Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-purple-500" />
                <CardTitle>Evaluate and Test</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Refresh test results"
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRunQuery()}
                        disabled={isLoading || !agenticQuery.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        )}
                      </Button>
                    </div>
                    <Input
                      className="pl-10 pr-12 flex-1 w-full"
                      placeholder="Enter your agentic prompt about the document..."
                      value={agenticQuery}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isLoading && agenticQuery.trim()) {
                          handleRunQuery();
                        }
                      }}
                      onFocus={() => {
                        if (agenticQuery.trim().length === 0) {
                          // Show all suggestions when input is empty
                          setFilteredSuggestions(agenticSuggestions);
                          setShowSuggestions(true);
                        } else {
                          // Show filtered suggestions when input has text
                          const filtered = agenticSuggestions.filter(suggestion =>
                            suggestion.toLowerCase().includes(agenticQuery.toLowerCase())
                          );
                          if (filtered.length > 0) {
                            setFilteredSuggestions(filtered);
                            setShowSuggestions(true);
                          }
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicking
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                    />
                    
                    {/* Type-ahead Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto mt-1">
                        {filteredSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Results Card */}
        {showResults && queryResult && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <CardTitle>Query Results</CardTitle>
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 transition-colors hover:bg-green-50 hover:text-green-600"
                        title="This result was helpful"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="This result needs improvement"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {queryResult.isPromptApplied && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Prompt Applied
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {(queryResult.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Answer */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-900">Answer</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {queryResult.answer}
                  </p>
                </div>

                {/* Sources */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-900">Sources</h4>
                  <div className="space-y-2">
                    {queryResult.sources.map((source: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        queryResult.isPromptApplied ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">{source.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {(source.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {source.content.includes('|') && source.content.includes('##') ? (
                            // Render Markdown-like content with basic formatting
                            <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border">
                              {source.content}
                            </pre>
                          ) : (
                            <p>{source.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const SinglePromptInterface: React.FC<SinglePromptInterfaceProps> = ({
  onProcessStart,
  disabled = false,
  isPromptApplied = false,
  promptParsing,
  processingConfig,
  ragResults
}) => {
  const [prompt, setPrompt] = useState('');
  const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>('input');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = () => {
    if (!prompt.trim()) return;
    setCurrentPhase('understanding');
  };

  const handleProceed = () => {
    setCurrentPhase('processing');
    setProcessingProgress(0);
    
    // Simulate processing with realistic steps
    const processingSteps = [
      { task: 'Document uploaded and validated', progress: 10, delay: 500 },
      { task: 'Document AI: Extracting tables and forms...', progress: 25, delay: 2000 },
      { task: 'RAG: OCR extraction completed', progress: 45, delay: 1500 },
      { task: 'RAG: Processing images and generating captions...', progress: 65, delay: 2000 },
      { task: 'RAG: Creating semantic chunks...', progress: 80, delay: 1500 },
      { task: 'RAG: Building vector index...', progress: 95, delay: 1000 },
      { task: 'Processing complete', progress: 100, delay: 500 }
    ];

    let stepIndex = 0;
    const runNextStep = () => {
      if (stepIndex < processingSteps.length) {
        const step = processingSteps[stepIndex];
        setCurrentTask(step.task);
        setProcessingProgress(step.progress);
        
        if (step.progress === 100) {
          setTimeout(() => {
            setResults({
              tables: 4,
              formFields: 15,
              images: 12,
              chunks: 89,
              quickFacts: [
                'Vehicle: 2025 Acura RDX',
                'Engine: 2.0L VTEC® Turbo, 272 HP',
                'Key Features: AcuraWatch®, SH-AWD®'
              ]
            });
            setCurrentPhase('complete');
          }, step.delay);
        } else {
          setTimeout(() => {
            stepIndex++;
            runNextStep();
          }, step.delay);
        }
      }
    };
    
    runNextStep();
    
    // Auto-configure and start processing
    const autoConfig = {
      rag: { enabled: true, ocrExtraction: true, imageCaptioning: true, visualAnalysis: true },
      idp: { enabled: true, textExtraction: true, classification: true, metadata: true },
      kg: { enabled: false }
    };
    
    onProcessStart?.(prompt, autoConfig);
  };


  if (currentPhase === 'input') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Describe Your Document Analysis Needs
            </CardTitle>
            <CardDescription>
              Tell us what you want to analyze and extract from your document in detail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="I need to analyze a document that contains tables, images, and technical specifications. I want to extract..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={disabled}
            />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Characters: {prompt.length}/2000</span>
              <span>Be specific about tables, images, and data you need extracted</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze}
                disabled={!prompt.trim() || disabled}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Analyze Document
              </Button>
              <Button 
                variant="outline"
                onClick={() => setPrompt('')}
                disabled={disabled}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentPhase === 'understanding') {
    return (
      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              System Understanding
            </CardTitle>
            <CardDescription>
              Based on your description, I will configure the following processing pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Document AI (IDP)</div>
                  <div className="text-sm text-gray-600">Extract tables, form fields, and structured data</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">RAG Processing (Auto-configured)</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      OCR Extraction: ON (for technical diagrams)
                    </div>
                    <div className="flex items-center gap-2">
                      <Image className="h-3 w-3" />
                      Image Processing: ON (vehicle photos/diagrams)
                    </div>
                    <div className="flex items-center gap-2">
                      <ScanLine className="h-3 w-3" />
                      Visual Analysis: ON (component identification)
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Image Captioning: ON (AI descriptions)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border">
              <div className="font-medium text-sm mb-2">Expected Processing Time: ~3-5 minutes</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Tables: Engine specs, dimensions, features</div>
                <div>• Images: 12+ processed with captions + OCR text</div>
                <div>• Searchable chunks: ~50-100 semantic segments</div>
                <div>• Q&A Ready: Technical specification queries</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleProceed} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Proceed with Processing
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentPhase('input')} className="flex-1 text-sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Modify
                </Button>
                <Button variant="outline" onClick={() => setCurrentPhase('input')} className="flex-1 text-sm">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentPhase === 'processing') {
    return (
      <div className="space-y-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600 animate-spin" />
              Processing: Document Analysis
            </CardTitle>
            <CardDescription>
              Processing your document with comprehensive multimodal analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentTask}</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>

            <div className="text-sm text-gray-600">
              ⏱️ Estimated time remaining: {processingProgress < 50 ? '4' : processingProgress < 80 ? '2' : '1'} minutes
            </div>

            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              View Detailed Progress
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentPhase === 'complete') {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analysis Complete - Ready for Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Document AI:</div>
                <div className="text-gray-600">{results?.tables} tables, {results?.formFields} form fields</div>
              </div>
              <div>
                <div className="font-medium">Images:</div>
                <div className="text-gray-600">{results?.images} processed (captions + OCR)</div>
              </div>
              <div>
                <div className="font-medium">Content:</div>
                <div className="text-gray-600">{results?.chunks} semantic chunks indexed</div>
              </div>
              <div>
                <div className="font-medium">Features:</div>
                <div className="text-gray-600">OCR, Visual Analysis, Captions</div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setCurrentPhase('input')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Another
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Index Configuration & Test Panel */}
        <IndexConfigurationTestPanel 
          isPromptApplied={isPromptApplied}
          promptParsing={promptParsing}
          processingConfig={processingConfig}
          ragResults={ragResults}
        />
      </div>
    );
  }

  return null;
};

export default SinglePromptInterface;