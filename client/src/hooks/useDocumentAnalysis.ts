import { useState, useCallback } from 'react';
import documentAnalyzer, { 
  DocumentCharacteristics, 
  ProcessingRecommendation 
} from '@/services/DocumentAnalyzer';
import { useToast } from '@/hooks/use-toast';

export interface DocumentAnalysisState {
  isAnalyzing: boolean;
  analysis: DocumentCharacteristics | null;
  quickRecommendations: ProcessingRecommendation[] | null;
  error: string | null;
}

export interface UseDocumentAnalysisReturn {
  state: DocumentAnalysisState;
  analyzeDocument: (file: File) => Promise<DocumentCharacteristics | null>;
  getQuickRecommendations: (file: File) => Promise<ProcessingRecommendation[] | null>;
  clearAnalysis: () => void;
  applyRecommendation: (recommendation: ProcessingRecommendation) => void;
}

export function useDocumentAnalysis(): UseDocumentAnalysisReturn {
  const { toast } = useToast();
  const [state, setState] = useState<DocumentAnalysisState>({
    isAnalyzing: false,
    analysis: null,
    quickRecommendations: null,
    error: null
  });

  const analyzeDocument = useCallback(async (file: File): Promise<DocumentCharacteristics | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const analysis = await documentAnalyzer.analyzeDocument(file);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysis,
        error: null
      }));

      toast({
        title: "Document Analyzed",
        description: `Identified as ${analysis.documentType} with ${analysis.processingRecommendations.length} recommendations`,
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  }, [toast]);

  const getQuickRecommendations = useCallback(async (file: File): Promise<ProcessingRecommendation[] | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const { recommendedProcessing } = await documentAnalyzer.quickAnalysis(file);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        quickRecommendations: recommendedProcessing,
        error: null
      }));

      return recommendedProcessing;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Quick analysis failed';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));

      return null;
    }
  }, [toast]);

  const clearAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      analysis: null,
      quickRecommendations: null,
      error: null
    });
  }, [toast]);

  const applyRecommendation = useCallback((recommendation: ProcessingRecommendation) => {
    // This function would typically dispatch actions to update the processing configuration
    // For now, it just shows a toast as a placeholder
    toast({
      title: "Applying Recommendation",
      description: `Configuring ${recommendation.processingType.toUpperCase()} processing: ${recommendation.reason}`,
    });

    // In a real implementation, you would:
    // 1. Update the processing configuration based on suggestedConfig
    // 2. Enable the recommended processing type
    // 3. Update UI to reflect the changes
    console.log('Applying recommendation:', recommendation);
  }, [toast]);

  return {
    state,
    analyzeDocument,
    getQuickRecommendations,
    clearAnalysis,
    applyRecommendation
  };
}