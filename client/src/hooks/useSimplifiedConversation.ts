import { useState, useCallback, useEffect } from 'react';
import simplifiedConversationManager, { ConversationState, ConversationMessage } from '@/services/SimplifiedContractConversationManager';
import { DocumentCharacteristics } from '@/services/DocumentAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { useConfigSync } from '@/hooks/use-config-sync';

// Simple UUID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export interface UseConversationReturn {
  state: ConversationState;
  sendMessage: (message: string) => void;
  handleAction: (action: string, data?: any) => void;
  startConversation: (documentAnalysis: DocumentCharacteristics) => void;
  resetConversation: () => void;
  getProcessingConfig: () => any;
}

export function useSimplifiedConversation(onProcessingConfigured?: (config: any) => void): UseConversationReturn {
  const { toast } = useToast();
  const [state, setState] = useState<ConversationState>({
    messages: [],
    selectedProcessingTypes: [],
    isComplete: false,
    useCase: undefined,
    configuration: {}
  });

  // Handle RAG processing trigger
  useEffect(() => {
    // Check if we need to trigger processing (after Turn 3)
    // Safely check configuration structure to prevent TypeError
    const shouldTriggerProcessing = state.triggerProcessing && 
                                  (state.configuration?.rag?.enabled || 
                                   (state.selectedProcessingTypes.includes('rag')));
                                   
    if (shouldTriggerProcessing) {
      console.log('Triggering RAG processing after Turn 3');
      
      // Ensure configuration has a valid structure
      const baseConfig = state.configuration || {};
      const baseRagConfig = baseConfig.rag || { enabled: true };
      
      // Get multimodal preferences
      const multimodalPrefs = state.multimodalPreferences || {};
      const imageProcessingEnabled = multimodalPrefs.imageProcessing || false;
      
      // Create a configuration to send to parent
      const enhancedConfig = {
        configuration: {
          ...baseConfig,
          rag: {
            ...baseRagConfig,
            enabled: true,
            method: 'semantic',
            chunking: true,
            vectorization: true,
            embeddings: true,
            multimodal: {
              // Enable all multimodal features when triggered through AI assistant
              imageCaption: imageProcessingEnabled,
              visualAnalysis: imageProcessingEnabled,
              ocr: imageProcessingEnabled,
              transcription: true // Always enable transcription
            }
          }
        },
        processingTypes: ['rag', ...state.selectedProcessingTypes].filter(
          (value, index, self) => self.indexOf(value) === index
        ),
        triggerProcessing: true,
        processImmediately: true,
        source: 'ai_assistant', // Mark as coming from AI assistant
        enhancedByAI: true
      };
      
      if (onProcessingConfigured) {
        onProcessingConfigured(enhancedConfig);
        
        // Show toast notification
        toast({
          title: "RAG Processing Started",
          description: "Your document is being processed with semantic chunking and vectorization.",
        });
      }
      
      // Clear the trigger flag
      setState(prev => ({
        ...prev,
        triggerProcessing: false
      }));
    }
  }, [state.triggerProcessing, state.configuration, state.selectedProcessingTypes, onProcessingConfigured, toast]);

  const startConversation = useCallback((documentAnalysis: DocumentCharacteristics | null) => {
    if (documentAnalysis) {
      // Use SimplifiedConversationManager to start the conversation
      const conversationState = simplifiedConversationManager.startConversation(documentAnalysis);
      
      // Update our state with the messages from SimplifiedConversationManager
      setState(conversationState);
      
      return;
    }
    
    // Fallback for when no document analysis is available
    const initialMessages: ConversationMessage[] = [
      {
        id: generateId(),
        type: 'assistant',
        content: `I've identified this as a contract document. Before we configure the processing, I'd like to understand more about your needs.`,
        timestamp: new Date()
      }
    ];
    
    setState(prev => ({
      ...prev,
      documentAnalysis,
      messages: initialMessages,
      isComplete: false
    }));
  }, [setState]);  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;

    // Convert state to ConversationState for the manager
    const baseState: ConversationState = { ...state };
    
    const newState = simplifiedConversationManager.processUserMessage(message, baseState);
    
    // If processing is complete, notify parent
    if (newState.isComplete && !state.isComplete && onProcessingConfigured) {
      const config = simplifiedConversationManager.buildFinalConfiguration(newState);
      onProcessingConfigured(config);
    }
    
    // Update state with the new state from the conversation manager
    setState(newState);
  }, [state, onProcessingConfigured]);

  const handleAction = useCallback((action: string, data?: any) => {
    // Handle step-based actions from SimplifiedConversationManager
    if (action === 'enable_image_processing' || action === 'disable_image_processing') {
      // Update multimodal preferences in real-time
      if (onProcessingConfigured) {
        const config = {
          configuration: {
            rag: {
              enabled: true,
              method: 'semantic',
              chunking: true,
              vectorization: true, // Ensure vectorization is enabled
              embeddings: true,    // Ensure embeddings are enabled
              multimodal: {
                imageCaption: data.imageProcessing,
                visualAnalysis: data.imageProcessing,
                ocr: data.imageProcessing,
                transcription: true // Always enable transcription
              }
            }
          },
          source: 'ai_assistant',
          multimodalUpdate: true,
          // Flag for complete AI-assisted processing
          completeProcessing: true,
          // Ensure rag is in processing types
          processingTypes: ['rag']
        };
        
        onProcessingConfigured(config);
      }
    }
    
    if (action === 'process_document' && onProcessingConfigured) {
      // Ensure that data has the source flag for AI assistant
      const enhancedData = {
        ...data,
        source: 'ai_assistant',
        enhancedByAI: true
      };
      onProcessingConfigured(enhancedData);
    }
    
    // Use the conversation manager to handle the action
    const newState = simplifiedConversationManager.handleAction(action, data, state);
    
    // Update our state with the new state
    setState(newState);
  }, [state, onProcessingConfigured]);

  const resetConversation = useCallback(() => {
    startConversation(null);
  }, [startConversation]);

  const getProcessingConfig = useCallback(() => {
    return simplifiedConversationManager.buildFinalConfiguration(state);
  }, [state]);

  // Build configuration from state for sync
  const buildConfigFromState = useCallback(() => {
    return simplifiedConversationManager.buildFinalConfiguration(state);
  }, [state]);

  // Use debounced sync to avoid rapid state updates
  useConfigSync(
    (config) => {
      if (onProcessingConfigured) {
        onProcessingConfigured(config);
      }
    },
    buildConfigFromState(),
    [state.multimodalPreferences, state.configuration, state.selectedProcessingTypes]
  );

  return {
    state,
    sendMessage,
    handleAction,
    startConversation,
    resetConversation,
    getProcessingConfig
  };
}