import { useConversation as useLegacyConversation } from '@/hooks/useConversation';
import { useSimplifiedConversation } from '@/hooks/useSimplifiedConversation';
import { useConversationFlow } from '@/context/ConversationFlowContext';
import { DocumentCharacteristics } from '@/services/DocumentAnalyzer';
import { useToast } from '@/hooks/use-toast';

export function useUnifiedConversation(onProcessingConfigured?: (config: any) => void) {
  const { flowType } = useConversationFlow();
  const { toast } = useToast();
  
  // Process config to ensure RAG is properly configured
  const processConfig = (config: any) => {
    // Ensure config has expected structure to prevent TypeError
    if (!config) {
      config = {};
    }
    
    // Check if this is a configuration that should trigger immediate processing
    const shouldTriggerProcessing = config.triggerProcessing || 
                                   config.processImmediately || 
                                   (config.configuration?.rag?.enabled && 
                                    config.configuration?.rag?.vectorization);
    
    // If should trigger immediate processing, enhance it
    if (shouldTriggerProcessing) {
      // Ensure configuration and rag objects exist
      if (!config.configuration) {
        config.configuration = {};
      }
      
      // Create a safe base for the rag configuration
      const baseRagConfig = config.configuration.rag || {};
      const baseMultimodalConfig = baseRagConfig.multimodal || {};
      
      // Check if this is from the AI assistant
      const isFromAIAssistant = config.source === 'ai_assistant';
      
      const enhancedConfig = {
        ...config,
        // Ensure we have RAG with all advanced features
        configuration: {
          ...config.configuration,
          rag: {
            ...baseRagConfig,
            enabled: true,
            method: 'semantic',
            chunking: true,
            vectorization: true,
            embeddings: true,
            multimodal: {
              ...baseMultimodalConfig,
              // If from AI assistant or explicitly enabled, ensure all multimodal features are on
              imageCaption: isFromAIAssistant ? true : (baseMultimodalConfig.imageCaption || false),
              visualAnalysis: isFromAIAssistant ? true : (baseMultimodalConfig.visualAnalysis || false),
              ocr: isFromAIAssistant ? true : (baseMultimodalConfig.ocr || false),
              // Always enable transcription
              transcription: true
            }
          }
        },
        // Ensure rag is in processing types
        processingTypes: ['rag', ...(config.processingTypes || [])].filter(
          (value, index, self) => self.indexOf(value) === index
        ),
        triggerProcessing: true,
        processImmediately: true,
        // Flag that this was processed by AI assistant
        enhancedByAI: true
      };      
      if (onProcessingConfigured) {
        onProcessingConfigured(enhancedConfig);
        
        // Only show toast if not a multimodal update
        if (!config.multimodalUpdate) {
          toast({
            title: "RAG Processing Configured",
            description: "Your document will be processed with semantic chunking and vectorization.",
          });
        }
      }
      
      return;
    }
    
    // Pass through normally
    if (onProcessingConfigured) {
      onProcessingConfigured(config);
    }
  };
  
  // Use appropriate conversation hook based on flow type
  const legacyConversation = useLegacyConversation(processConfig);
  const simplifiedConversation = useSimplifiedConversation(processConfig);
  
  // Determine which conversation flow to use
  if (flowType === 'legacy') {
    return legacyConversation;
  } else if (flowType === 'simplified') {
    return simplifiedConversation;
  }
  
  // Default to simplified flow for any other case
  return simplifiedConversation;
}