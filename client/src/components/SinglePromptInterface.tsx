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
}

type ProcessingPhase = 'input' | 'understanding' | 'processing' | 'complete';

// Index Configuration Test Panel Component
const IndexConfigurationTestPanel: React.FC = () => {
  const [agenticQuery, setAgenticQuery] = useState('What are the key specifications of the Acura RDX?');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(true);

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

  const handleRunQuery = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate query execution
    setTimeout(() => {
      setShowResults(true);
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setAgenticQuery(suggestion);
    handleRunQuery();
  }, [handleRunQuery]);

  return (
    <div className="pt-0 px-6 pb-6 bg-white/50 max-h-[400px] overflow-y-auto">
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
                          onClick={handleRunQuery}
                          disabled={isLoading}
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
                        onChange={(e) => setAgenticQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isLoading) {
                            handleRunQuery();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Autosuggest */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Suggested Queries</div>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {agenticSuggestions.slice(0, 6).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        className="text-xs h-8 justify-start text-left whitespace-normal"
                        title={suggestion}
                      >
                        <span className="truncate">
                          {suggestion.length > 45 ? suggestion.substring(0, 45) + '...' : suggestion}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluate Button Card */}
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleRunQuery}
                disabled={isLoading}
              >
                <TableOfContents className="h-4 w-4" />
                Evaluate Processing Components
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {showResults && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <CardTitle>Evaluation Results</CardTitle>
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 transition-colors hover:bg-green-50 hover:text-green-600"
                        title="This evaluation was helpful"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="This evaluation needs improvement"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Powered by LLM
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 mb-4">
                  Based on the analyzed document, here's what I found regarding "{agenticQuery}":
                </p>

                {/* RAG Insights */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center cursor-pointer hover:text-blue-700 transition-colors rounded px-2 py-1 hover:bg-blue-50 inline-flex" title="Click to view RAG search details">
                    <Database className="h-4 w-4 mr-2 text-blue-500" />
                    Document Search Insights
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    The document contains detailed information about technical specifications and implementation guidelines.
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Executive Summary</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        The 2025 Acura RDX represents the pinnacle of luxury compact SUV engineering featuring the exclusive Super Handling All-Wheel Drive™ SH-AWD® system powerful 2.0L VTEC® Turbo engine comprehensive AcuraWatch® safety technologies This fact sheet provides complete technical specifications features capabilities
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Drivetrain Specifications (Malformed Table)</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        Drivetrain Type SH-AWD® Super Handling All-Wheel Drive™ Transmission 10-Speed Automatic 10AT with paddle shifters Gear Ratios (1-5) 1st: 4.710, 2nd: 3.094, 3rd: 2.050 4th: 1.559, 5th: 1.197 Gear Ratios (6-10) 6th: 0.936, 7th: 0.748, 8th: 0.634 9th: 0.529, 10th: 0.455 Reverse Gear 3.966 Final Drive: 4.375 Towing Capacity 1,500 lbs When properly equipped
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Engine Specifications (Poor Extraction)</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        Engine Specifications Specification Value Details Engine Type 2.0L VTEC® Turbo 4-cylinder, 16-valve, DOHC Displacement 1996 cc 121.8 cu in Bore x Stroke 86.0 x 85.9 mm 3.39 x 3.38 in Compression Ratio 10.3:1 Premium fuel recommended Max Horsepower 272 hp @ 6500 rpm SAE net Max Torque 280 lb-ft @ 1600-4500 rpm SAE net
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Intelligence Insights */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-purple-500" />
                    Document Intelligence Insights
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    The document contains structured data that provides key metrics and comparisons.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-purple-50 rounded-lg cursor-pointer hover:shadow-md transition-all" title="Click to view Document Intelligence details">
                      <div className="text-2xl font-bold text-purple-700">4</div>
                      <div className="text-xs text-gray-600">Tables Analyzed</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Several forms were identified with important compliance information.
                  </p>
                </div>

                {/* AI Recommendations */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <TableOfContents className="h-4 w-4 mr-2 text-orange-500" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Sparkles className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-700">Review the technical specifications in sections 2.3 and 4.1</span>
                    </li>
                    <li className="flex items-start">
                      <Sparkles className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-700">Pay attention to the compliance requirements mentioned in the forms</span>
                    </li>
                    <li className="flex items-start">
                      <Sparkles className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-700">Consider the relationships between the identified entities</span>
                    </li>
                  </ul>
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
  disabled = false
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
        <IndexConfigurationTestPanel />
      </div>
    );
  }

  return null;
};

export default SinglePromptInterface;