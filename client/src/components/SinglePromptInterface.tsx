import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  FileSearch,
  Zap
} from 'lucide-react';

interface SinglePromptInterfaceProps {
  onProcessStart?: (prompt: string, config: any) => void;
  onQuestionSubmit?: (question: string) => void;
  disabled?: boolean;
}

type ProcessingPhase = 'input' | 'understanding' | 'processing' | 'complete';

const SinglePromptInterface: React.FC<SinglePromptInterfaceProps> = ({
  onProcessStart,
  onQuestionSubmit,
  disabled = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [currentPhase, setCurrentPhase] = useState<ProcessingPhase>('input');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [question, setQuestion] = useState('');
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

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1">
                <FileSearch className="h-4 w-4 mr-2" />
                View All Results
              </Button>
              <Button variant="outline" onClick={() => setCurrentPhase('input')} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default SinglePromptInterface;