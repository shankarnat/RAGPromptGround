import React, { useState, useEffect } from 'react';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Network, 
  Database, 
  Upload,
  Settings,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  Eye,
  Info,
  Zap,
  Layers,
  GitBranch,
  FileSearch,
  BrainCircuit,
  ScanLine
} from 'lucide-react';

interface ProcessingPipelineVisualizationProps {
  onStepClick?: (stepType: string) => void;
  autoProcess?: boolean;
  showDependencies?: boolean;
  compact?: boolean;
  pipelineSteps?: any[];
  pipelineStatus?: any;
}

type ProcessingStepType = 'upload' | 'rag' | 'kg' | 'idp';
type StepStatus = 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped';

interface ProcessingStep {
  id: ProcessingStepType;
  name: string;
  description: string;
  icon: React.ElementType;
  dependencies: ProcessingStepType[];
  status: StepStatus;
  progress: number;
  estimatedTime: string;
  details: {
    [key: string]: any;
  };
}

const ProcessingPipelineVisualization: React.FC<ProcessingPipelineVisualizationProps> = ({
  onStepClick,
  autoProcess = false,
  showDependencies = true,
  compact = false
}) => {
  const { state, runUnifiedProcessing, updateProcessingStatus } = useDocumentProcessing();
  const [selectedStep, setSelectedStep] = useState<ProcessingStep | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Define processing steps with dependencies
  const processingSteps: ProcessingStep[] = [
    {
      id: 'upload',
      name: 'Document Upload',
      description: 'Upload and validate document',
      icon: Upload,
      dependencies: [],
      status: state.selectedDocument ? 'completed' : 'pending',
      progress: state.selectedDocument ? 100 : 0,
      estimatedTime: '5s',
      details: {
        fileName: state.selectedDocument?.name || 'No file selected',
        fileSize: state.selectedDocument ? `${(state.selectedDocument.size / 1024 / 1024).toFixed(2)} MB` : '0 MB',
        fileType: state.selectedDocument?.type || 'Unknown'
      }
    },
    {
      id: 'rag',
      name: 'RAG Processing',
      description: 'Chunk document and create embeddings',
      icon: FileSearch,
      dependencies: ['upload'],
      status: mapProcessingStatus(state.unifiedProcessing.processingStatus.rag),
      progress: calculateProgress(state.unifiedProcessing.processingStatus.rag),
      estimatedTime: '30s',
      details: {
        chunksCreated: state.unifiedProcessing.unifiedResults.standard?.chunks?.length || 0,
        vectorsGenerated: state.unifiedProcessing.unifiedResults.standard?.vectors?.length || 0,
        indexStatus: state.unifiedProcessing.unifiedResults.standard?.indexStatus || 'Not indexed',
        chunkingMethod: state.chunkingMethod,
        chunkSize: state.chunkSize,
        overlap: state.chunkOverlap
      }
    },
    {
      id: 'kg',
      name: 'Knowledge Graph',
      description: 'Extract entities and relationships',
      icon: Network,
      dependencies: ['upload'],
      status: mapProcessingStatus(state.unifiedProcessing.processingStatus.kg),
      progress: calculateProgress(state.unifiedProcessing.processingStatus.kg),
      estimatedTime: '45s',
      details: {
        entitiesFound: state.unifiedProcessing.unifiedResults.kg?.entities?.length || 0,
        relationsFound: state.unifiedProcessing.unifiedResults.kg?.relations?.length || 0,
        graphDensity: state.unifiedProcessing.unifiedResults.kg?.graph?.density || 0,
        entityTypes: getUniqueEntityTypes(state.unifiedProcessing.unifiedResults.kg?.entities || [])
      }
    },
    {
      id: 'idp',
      name: 'Document Intelligence',
      description: 'Extract metadata and classify content',
      icon: BrainCircuit,
      dependencies: ['upload', 'rag'],
      status: mapProcessingStatus(state.unifiedProcessing.processingStatus.idp),
      progress: calculateProgress(state.unifiedProcessing.processingStatus.idp),
      estimatedTime: '20s',
      details: {
        metadataExtracted: Object.keys(state.unifiedProcessing.unifiedResults.idp?.metadata || {}).length,
        classifications: state.unifiedProcessing.unifiedResults.idp?.classification || [],
        tablesFound: state.unifiedProcessing.unifiedResults.idp?.extractedData?.tables || 0,
        imagesFound: state.unifiedProcessing.unifiedResults.idp?.extractedData?.images || 0,
        formFields: state.unifiedProcessing.unifiedResults.idp?.extractedData?.formFields || 0
      }
    }
  ];

  // Map processing status to step status
  function mapProcessingStatus(status: string): StepStatus {
    switch (status) {
      case 'idle': return 'pending';
      case 'processing': return 'in-progress';
      case 'completed': return 'completed';
      case 'error': return 'error';
      default: return 'pending';
    }
  }

  // Calculate progress based on status
  function calculateProgress(status: string): number {
    switch (status) {
      case 'idle': return 0;
      case 'processing': return 50;
      case 'completed': return 100;
      case 'error': return 0;
      default: return 0;
    }
  }

  // Get unique entity types
  function getUniqueEntityTypes(entities: any[]): string[] {
    const uniqueTypes = new Set(entities.map(e => e.type));
    return Array.from(uniqueTypes);
  }

  // Timer effect
  useEffect(() => {
    if (processingStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - processingStartTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [processingStartTime]);

  // Start processing
  const handleStartProcessing = async () => {
    if (!state.selectedDocument) return;
    
    setProcessingStartTime(Date.now());
    await runUnifiedProcessing();
    setProcessingStartTime(null);
  };

  // Get step color based on status
  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-300';
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'error': return 'text-red-600 bg-red-100 border-red-300';
      case 'skipped': return 'text-gray-400 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'skipped': return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  // Check if step can be processed based on dependencies
  const canProcessStep = (step: ProcessingStep): boolean => {
    if (step.dependencies.length === 0) return true;
    return step.dependencies.every(depId => {
      const dep = processingSteps.find(s => s.id === depId);
      return dep?.status === 'completed';
    });
  };

  // Handle step click
  const handleStepClick = (step: ProcessingStep) => {
    setSelectedStep(step);
    setShowDetails(true);
    onStepClick?.(step.id);
  };

  // Render compact view
  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            {processingSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(step)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    getStepColor(step.status)
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{step.name}</span>
                  {getStatusIcon(step.status)}
                </button>
                {index < processingSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render full pipeline visualization
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Processing Pipeline</CardTitle>
              <CardDescription>
                Document processing workflow with dependencies
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {processingStartTime && (
                <Badge variant="secondary">
                  {Math.floor(elapsedTime / 1000)}s elapsed
                </Badge>
              )}
              <Button
                onClick={handleStartProcessing}
                disabled={!state.selectedDocument || processingStartTime !== null}
              >
                {processingStartTime ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Processing
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative">
            {/* Pipeline steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Dependency lines */}
                  {showDependencies && step.dependencies.length > 0 && (
                    <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
                      <GitBranch className="h-4 w-4 text-gray-400 rotate-90" />
                    </div>
                  )}
                  
                  {/* Step card */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleStepClick(step)}
                          disabled={!canProcessStep(step)}
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            getStepColor(step.status)
                          } ${!canProcessStep(step) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className="relative">
                              <step.icon className="h-8 w-8" />
                              <div className="absolute -bottom-1 -right-1">
                                {getStatusIcon(step.status)}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <h3 className="font-medium">{step.name}</h3>
                              <p className="text-xs mt-1 opacity-75">
                                {step.description}
                              </p>
                            </div>
                            
                            {step.status === 'in-progress' && (
                              <Progress value={step.progress} className="h-1" />
                            )}
                            
                            <Badge variant="outline" className="text-xs">
                              Est. {step.estimatedTime}
                            </Badge>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to view details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Arrow to next step */}
                  {index < processingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Processing summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {processingSteps.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {processingSteps.filter(s => s.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-gray-600">Processing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {processingSteps.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {processingSteps.filter(s => s.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Step details sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent>
          {selectedStep && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedStep.name}</SheetTitle>
                <SheetDescription>{selectedStep.description}</SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedStep.status)}
                    <span className="font-medium capitalize">{selectedStep.status}</span>
                    {selectedStep.status === 'in-progress' && (
                      <Progress value={selectedStep.progress} className="flex-1 h-2" />
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Dependencies</h3>
                  {selectedStep.dependencies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStep.dependencies.map(depId => {
                        const dep = processingSteps.find(s => s.id === depId);
                        return dep ? (
                          <div key={depId} className="flex items-center space-x-2">
                            {getStatusIcon(dep.status)}
                            <span className="text-sm">{dep.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No dependencies</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedStep.details).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="text-sm font-medium">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedStep.status === 'error' && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-red-600">Error Details</h3>
                      <p className="text-sm text-gray-600">
                        Processing failed. Please check your configuration and try again.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProcessingPipelineVisualization;