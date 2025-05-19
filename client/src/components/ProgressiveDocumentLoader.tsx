import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Search,
  Database,
  Network,
  FileInput,
  Table,
  Info,
  Sparkles
} from 'lucide-react';
import { UploadedDocument } from '@shared/schema';
import { DocumentCharacteristics } from '@/services/DocumentAnalyzer';
import documentAnalyzer from '@/services/DocumentAnalyzer';

interface DocumentPreview {
  title: string;
  pageCount: number;
  fileSize: string;
  mimeType: string;
  thumbnailUrl?: string;
  firstPageContent?: string;
}

interface BasicAnalysis {
  documentType: string;
  hasTables: boolean;
  hasForms: boolean;
  hasImages: boolean;
  structureComplexity: 'simple' | 'moderate' | 'complex';
  potentialProcessingTypes: Array<{
    type: 'idp' | 'rag' | 'kg';
    confidence: number;
    reason: string;
  }>;
}

interface LoadingStage {
  stage: 'idle' | 'preview' | 'analysis' | 'ready';
  isLoading: boolean;
  error?: string;
}

interface ProgressiveDocumentLoaderProps {
  document: UploadedDocument;
  onProcessingRequest?: (type: 'idp' | 'rag' | 'kg', config?: any) => void;
  onDocumentReady?: (preview: DocumentPreview, analysis: BasicAnalysis) => void;
  autoAnalyze?: boolean;
}

const ProgressiveDocumentLoader: React.FC<ProgressiveDocumentLoaderProps> = ({
  document,
  onProcessingRequest,
  onDocumentReady,
  autoAnalyze = true
}) => {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>({
    stage: 'idle',
    isLoading: false
  });
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [basicAnalysis, setBasicAnalysis] = useState<BasicAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTab, setSelectedTab] = useState('preview');

  // Load document preview (fast)
  const loadPreview = useCallback(async () => {
    setLoadingStage({ stage: 'preview', isLoading: true });
    
    try {
      // Simulate loading preview data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const previewData: DocumentPreview = {
        title: document.name,
        pageCount: Math.ceil(document.size / (1024 * 500)), // Rough estimate
        fileSize: `${(document.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: document.type,
        firstPageContent: `This is a preview of ${document.name}. The document contains various sections and information...`
      };
      
      setPreview(previewData);
      setLoadingStage({ stage: 'preview', isLoading: false });
      
      // Automatically proceed to analysis if enabled
      if (autoAnalyze) {
        performBasicAnalysis();
      }
    } catch (error) {
      setLoadingStage({
        stage: 'preview',
        isLoading: false,
        error: 'Failed to load document preview'
      });
    }
  }, [document, autoAnalyze]);

  // Perform basic document analysis (background)
  const performBasicAnalysis = useCallback(async () => {
    setLoadingStage({ stage: 'analysis', isLoading: true });
    
    try {
      // Use the DocumentAnalyzer service for real analysis
      const analysis = await documentAnalyzer.analyzeDocument(
        new File([new Blob()], document.name, { type: document.type })
      );
      
      // Convert to BasicAnalysis format
      const basicAnalysisData: BasicAnalysis = {
        documentType: analysis.documentType,
        hasTables: analysis.structure.hasTables,
        hasForms: analysis.structure.formFields > 0,
        hasImages: analysis.structure.hasImages,
        structureComplexity: analysis.structure.structureComplexity,
        potentialProcessingTypes: []
      };
      
      // Determine potential processing types based on analysis
      if (analysis.structure.hasTables || analysis.contentFeatures.financialData) {
        basicAnalysisData.potentialProcessingTypes.push({
          type: 'rag',
          confidence: 0.9,
          reason: 'Document contains tables suitable for Q&A'
        });
      }
      
      if (analysis.structure.formFields > 0) {
        basicAnalysisData.potentialProcessingTypes.push({
          type: 'idp',
          confidence: 0.95,
          reason: 'Document contains form fields for extraction'
        });
      }
      
      if (analysis.relationships.entityCount > 5) {
        basicAnalysisData.potentialProcessingTypes.push({
          type: 'kg',
          confidence: 0.85,
          reason: 'Document contains entities suitable for relationship mapping'
        });
      }
      
      setBasicAnalysis(basicAnalysisData);
      setLoadingStage({ stage: 'ready', isLoading: false });
      setShowSuggestions(basicAnalysisData.potentialProcessingTypes.length > 0);
      
      // Notify parent component
      if (onDocumentReady && preview) {
        onDocumentReady(preview, basicAnalysisData);
      }
    } catch (error) {
      setLoadingStage({
        stage: 'analysis',
        isLoading: false,
        error: 'Failed to analyze document'
      });
    }
  }, [document, preview, onDocumentReady]);

  // Initialize loading when document changes
  useEffect(() => {
    if (document) {
      loadPreview();
    }
  }, [document, loadPreview]);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'preview':
        return <Eye className="w-4 h-4" />;
      case 'analysis':
        return <Search className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getProcessingIcon = (type: string) => {
    switch (type) {
      case 'idp':
        return <FileInput className="w-4 h-4" />;
      case 'rag':
        return <Table className="w-4 h-4" />;
      case 'kg':
        return <Network className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getProcessingLabel = (type: string) => {
    switch (type) {
      case 'idp':
        return 'Extract Form Fields';
      case 'rag':
        return 'Enable Table Q&A';
      case 'kg':
        return 'Map Relationships';
      default:
        return 'Process Document';
    }
  };

  const renderLoadingState = () => {
    if (loadingStage.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{loadingStage.error}</AlertDescription>
        </Alert>
      );
    }

    if (loadingStage.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">
            {loadingStage.stage === 'preview' ? 'Loading preview...' : 'Analyzing document...'}
          </p>
          <Progress value={loadingStage.stage === 'preview' ? 33 : 66} className="w-32" />
        </div>
      );
    }

    return null;
  };

  const renderDocumentPreview = () => {
    if (!preview) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p className="font-medium">{preview.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium">{preview.fileSize}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pages</p>
            <p className="font-medium">{preview.pageCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{preview.mimeType}</p>
          </div>
        </div>
        
        {preview.firstPageContent && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Preview</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 line-clamp-3">
                {preview.firstPageContent}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!basicAnalysis) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Document Type</p>
            <Badge variant="outline">{basicAnalysis.documentType}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Complexity</p>
            <Badge variant={basicAnalysis.structureComplexity === 'complex' ? 'destructive' : 'secondary'}>
              {basicAnalysis.structureComplexity}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Document Features</p>
          <div className="flex flex-wrap gap-2">
            {basicAnalysis.hasTables && (
              <Badge variant="secondary">
                <Table className="w-3 h-3 mr-1" />
                Contains Tables
              </Badge>
            )}
            {basicAnalysis.hasForms && (
              <Badge variant="secondary">
                <FileInput className="w-3 h-3 mr-1" />
                Contains Forms
              </Badge>
            )}
            {basicAnalysis.hasImages && (
              <Badge variant="secondary">
                <Eye className="w-3 h-3 mr-1" />
                Contains Images
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessingSuggestions = () => {
    if (!basicAnalysis || basicAnalysis.potentialProcessingTypes.length === 0) {
      return null;
    }

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Processing Suggestions
          </CardTitle>
          <CardDescription>Based on document analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {basicAnalysis.potentialProcessingTypes.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getProcessingIcon(suggestion.type)}
                  <div>
                    <p className="font-medium text-sm">{getProcessingLabel(suggestion.type)}</p>
                    <p className="text-xs text-gray-500">{suggestion.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => onProcessingRequest?.(suggestion.type)}
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Loading State or Document Information - maintain consistent height */}
      <Card className="min-h-[400px] flex flex-col">
        {loadingStage.isLoading || loadingStage.error ? (
          <CardContent className="flex-1 flex items-center justify-center">
            {renderLoadingState()}
          </CardContent>
        ) : (
          <>
            <CardHeader className="flex-none">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{document.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStageIcon(loadingStage.stage)}
                  <span className="text-sm text-gray-500">{loadingStage.stage}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
                <TabsList className="flex-none">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  {basicAnalysis && <TabsTrigger value="analysis">Analysis</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="preview" className="flex-1 overflow-y-auto">
                  {renderDocumentPreview()}
                </TabsContent>
                
                <TabsContent value="analysis" className="flex-1 overflow-y-auto">
                  {renderAnalysisResults()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        )}
      </Card>

      {/* Processing Suggestions */}
      {showSuggestions && renderProcessingSuggestions()}

      {/* Manual Processing Options */}
      {loadingStage.stage === 'ready' && !showSuggestions && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Document ready for processing. Use the options below or describe what you want to do in the chat.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProgressiveDocumentLoader;