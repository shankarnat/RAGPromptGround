import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileSearch, 
  Network, 
  FileText, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { useDocumentAnalysisContext } from '@/context/DocumentAnalysisContext';
import { ProcessingRecommendation } from '@/services/DocumentAnalyzer';

interface DocumentAnalysisCardProps {
  file: File | null;
  onApplyRecommendation?: (recommendation: ProcessingRecommendation) => void;
  className?: string;
  compact?: boolean;
}

const DocumentAnalysisCard: React.FC<DocumentAnalysisCardProps> = ({
  file,
  onApplyRecommendation,
  className = '',
  compact = false
}) => {
  const { state, analyzeDocument, applyRecommendation } = useDocumentAnalysisContext();
  const { isAnalyzing, analysis, error } = state;

  useEffect(() => {
    if (file) {
      analyzeDocument(file);
    }
  }, [file, analyzeDocument]);

  const getProcessingIcon = (type: string) => {
    switch (type) {
      case 'rag': return <FileSearch className="h-4 w-4" />;
      case 'kg': return <Network className="h-4 w-4" />;
      case 'idp': return <FileText className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'form': 'bg-blue-100 text-blue-800',
      'report': 'bg-green-100 text-green-800',
      'contract': 'bg-purple-100 text-purple-800',
      'invoice': 'bg-yellow-100 text-yellow-800',
      'email': 'bg-gray-100 text-gray-800',
      'article': 'bg-indigo-100 text-indigo-800',
      'presentation': 'bg-pink-100 text-pink-800',
      'spreadsheet': 'bg-orange-100 text-orange-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.unknown;
  };

  const handleApplyRecommendation = (recommendation: ProcessingRecommendation) => {
    applyRecommendation(recommendation);
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation);
    }
  };

  if (!file) {
    return null;
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Quick Analysis</CardTitle>
            {isAnalyzing && <Progress value={50} className="w-16 h-1" />}
          </div>
        </CardHeader>
        <CardContent>
          {analysis && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <Badge variant="secondary" className={getDocumentTypeColor(analysis.documentType)}>
                  {analysis.documentType}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confidence:</span>
                <span className="text-sm font-medium">{(analysis.confidence * 100).toFixed(0)}%</span>
              </div>
              <Separator />
              <div className="space-y-1">
                {analysis.processingRecommendations
                  .filter(r => r.priority === 'high')
                  .map((rec, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getProcessingIcon(rec.processingType)}
                        <span className="text-xs">{rec.processingType.toUpperCase()}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleApplyRecommendation(rec)}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} min-h-[400px] flex flex-col`}>
      <CardHeader className="flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>Document Analysis</CardTitle>
          </div>
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Analyzing...</span>
              <Progress value={50} className="w-24 h-2" />
            </div>
          )}
        </div>
        <CardDescription>
          Intelligent analysis of document characteristics and processing recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Show skeleton while analyzing */}
        {isAnalyzing && !analysis && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Document Type and Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Document Type</p>
                <Badge className={getDocumentTypeColor(analysis.documentType)}>
                  {analysis.documentType.charAt(0).toUpperCase() + analysis.documentType.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Analysis Confidence</p>
                <div className="flex items-center space-x-2">
                  <Progress value={analysis.confidence * 100} className="flex-1" />
                  <span className="text-sm font-medium">{(analysis.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Document Structure */}
            <div>
              <h4 className="font-medium mb-3">Document Structure</h4>
              <div className="grid grid-cols-3 gap-3">
                {analysis.structure.hasTables && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tables</span>
                  </div>
                )}
                {analysis.structure.hasLists && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Lists</span>
                  </div>
                )}
                {analysis.structure.hasImages && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Images</span>
                  </div>
                )}
                {analysis.structure.hasCharts && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Charts</span>
                  </div>
                )}
                {analysis.structure.formFields > 0 && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{analysis.structure.formFields} Fields</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Complexity: <span className="font-medium">{analysis.structure.structureComplexity}</span>
              </p>
            </div>

            <Separator />

            {/* Content Features */}
            <div>
              <h4 className="font-medium mb-3">Content Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Word Count</span>
                  <span className="text-sm font-medium">{analysis.contentFeatures.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Language</span>
                  <span className="text-sm font-medium">{analysis.contentFeatures.language.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {analysis.contentFeatures.technicalContent && (
                    <Badge variant="outline">Technical</Badge>
                  )}
                  {analysis.contentFeatures.financialData && (
                    <Badge variant="outline">Financial</Badge>
                  )}
                  {analysis.contentFeatures.legalContent && (
                    <Badge variant="outline">Legal</Badge>
                  )}
                </div>
                {analysis.contentFeatures.topKeywords.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Key Terms</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.contentFeatures.topKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Processing Recommendations */}
            <div>
              <h4 className="font-medium mb-3">Processing Recommendations</h4>
              <div className="space-y-3">
                {analysis.processingRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getProcessingIcon(rec.processingType)}
                          <span className="font-medium">{rec.processingType.toUpperCase()}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(rec.priority)}`}
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyRecommendation(rec)}
                        className="ml-3"
                      >
                        Apply
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentAnalysisCard;