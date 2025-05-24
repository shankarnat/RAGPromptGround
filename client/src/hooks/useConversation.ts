import { useState, useCallback, useEffect } from 'react';
import conversationManager, { ConversationState, ConversationMessage } from '@/services/ConversationManager';
import { DocumentCharacteristics } from '@/services/DocumentAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { useConfigSync } from '@/hooks/use-config-sync';

// Simple UUID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to generate configuration summary
const generateConfigSummary = (config: any): string => {
  let summary = "**Configuration Summary:**\n\n";
  
  if (config.configuration) {
    // RAG Configuration
    if (config.configuration.rag && config.configuration.rag.enabled) {
      summary += "**Document Search (RAG):**\n";
      summary += `- Chunking strategy: ${config.configuration.rag.method || 'semantic'}\n`;
      summary += `- Search optimization: ${config.configuration.rag.chunking ? 'Enabled' : 'Disabled'}\n`;
      
      if (config.configuration.rag.multimodal) {
        const multimodalOptions = [];
        if (config.configuration.rag.multimodal.transcription) multimodalOptions.push('Audio transcription');
        if (config.configuration.rag.multimodal.ocr) multimodalOptions.push('OCR for images');
        if (config.configuration.rag.multimodal.imageCaption) multimodalOptions.push('Image captioning');
        if (config.configuration.rag.multimodal.visualAnalysis) multimodalOptions.push('Visual analysis');
        
        if (multimodalOptions.length > 0) {
          summary += `- Multimodal processing: ${multimodalOptions.join(', ')}\n`;
        }
      }
      summary += "\n";
    }
    
    // Knowledge Graph Configuration
    if (config.configuration.kg && config.configuration.kg.enabled) {
      summary += "**Knowledge Graph:**\n";
      summary += `- Entity extraction: ${config.configuration.kg.entityExtraction ? 'Enabled' : 'Disabled'}\n`;
      summary += `- Relationship mapping: ${config.configuration.kg.relationMapping ? 'Enabled' : 'Disabled'}\n`;
      if (config.configuration.kg.graphBuilding) {
        summary += `- Graph visualization: Enabled\n`;
      }
      summary += "\n";
    }
    
    // IDP Configuration
    if (config.configuration.idp && config.configuration.idp.enabled) {
      summary += "**Document Processing (IDP):**\n";
      summary += `- Text extraction: ${config.configuration.idp.textExtraction ? 'Enabled' : 'Disabled'}\n`;
      summary += `- Document classification: ${config.configuration.idp.classification ? 'Enabled' : 'Disabled'}\n`;
      if (config.configuration.idp.tables) {
        summary += `- Table extraction: Enabled\n`;
      }
      if (config.configuration.idp.metadata) {
        summary += `- Metadata extraction: Enabled\n`;
      }
      summary += "\n";
    }
  }
  
  // User preferences
  if (config.userProfile) {
    summary += "**User Preferences:**\n";
    if (config.userProfile.role) summary += `- Role: ${config.userProfile.role}\n`;
    if (config.userProfile.department) summary += `- Department: ${config.userProfile.department}\n`;
    if (config.processingPreferences) {
      if (config.processingPreferences.primaryGoal) summary += `- Primary goal: ${config.processingPreferences.primaryGoal}\n`;
      if (config.processingPreferences.urgency) summary += `- Urgency: ${config.processingPreferences.urgency}\n`;
    }
  }
  
  return summary;
};

export interface UserProfile {
  role: string;
  department?: string;
  experience?: string;
  intent: string;
  timeConstraint: string;
  detailLevel: string;
  priorKnowledge: string;
  explanationLevel?: string;
  preferences: string[];
  format?: string;
  vehicleRole?: string;
  testingEnabled?: boolean;
  testingMode?: 'live' | 'batch' | 'validation';
  accuracyTracking?: boolean;
}

export interface ProcessingConfiguration {
  rag: {
    enabled: boolean;
    method: string;
    chunkSize: number;
    overlap: number;
    configured?: boolean;
  };
  kg: {
    enabled: boolean;
    entityTypes: string[] | string;
    relationMapping: boolean;
    graphBuilding?: boolean;
    configured?: boolean;
  };
  idp: {
    enabled: boolean;
    extractFields: boolean;
    classification: boolean;
    metadata?: boolean;
    tables?: boolean;
    formFields?: boolean;
    configured?: boolean;
  };
}

export interface QATestResult {
  questionId: string;
  question: string;
  userAnswer?: string;
  systemAnswer: string;
  isCorrect?: boolean;
  confidence: number;
  timestamp: Date;
}

export interface TestingState {
  enabled: boolean;
  mode: 'live' | 'batch' | 'validation';
  currentTest?: {
    type: 'parts' | 'specifications' | 'service';
    questions: Array<{
      id: string;
      question: string;
      expectedAnswer?: string;
    }>;
    currentQuestionIndex: number;
  };
  results: QATestResult[];
  metrics: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    averageConfidence: number;
    startTime?: Date;
    endTime?: Date;
  };
}

export interface EnhancedConversationState extends Omit<ConversationState, 'documentAnalysis' | 'userProfile'> {
  userProfile: UserProfile;
  selectedFeatures: string[];
  processingConfig: ProcessingConfiguration;
  processingPriority?: string;
  isVehicleDocument?: boolean;
  documentAnalysis?: DocumentCharacteristics | null;
  testing?: TestingState;
}

export interface UseConversationReturn {
  state: EnhancedConversationState;
  sendMessage: (message: string) => void;
  handleAction: (action: string, data?: any) => void;
  startConversation: (documentAnalysis: DocumentCharacteristics) => void;
  resetConversation: () => void;
  getProcessingConfig: () => any;
  // Testing methods
  enableTesting: (mode: 'live' | 'batch' | 'validation') => void;
  submitTestAnswer: (questionId: string, answer: string) => void;
  validateAnswer: (questionId: string, isCorrect: boolean) => void;
  getTestResults: () => QATestResult[];
  getTestMetrics: () => TestingState['metrics'];
}

export function useConversation(onProcessingConfigured?: (config: any) => void): UseConversationReturn {
  const { toast } = useToast();
  const [state, setState] = useState<EnhancedConversationState>({
    messages: [],
    selectedProcessingTypes: [],
    isComplete: false,
    useCase: undefined,
    configuration: {},
    userProfile: {
      role: '',
      intent: '',
      timeConstraint: '',
      detailLevel: '',
      priorKnowledge: '',
      preferences: []
    },
    selectedFeatures: [],
    processingConfig: {
      rag: { enabled: false, method: 'semantic', chunkSize: 150, overlap: 20 },
      kg: { enabled: false, entityTypes: ['all'], relationMapping: true },
      idp: { enabled: false, extractFields: true, classification: true }
    },
    testing: {
      enabled: false,
      mode: 'live',
      results: [],
      metrics: {
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        averageConfidence: 0
      }
    }
  });

  // Helper function to configure processing based on user profile
  const configureProcessingFromUserProfile = useCallback(() => {
    const { role, intent, timeConstraint, detailLevel, priorKnowledge, preferences } = state.userProfile;
    const processingPriority = state.processingPriority || 'balanced';
    
    // Configure RAG if selected
    if (state.selectedFeatures.includes('rag')) {
      let ragMethod = 'semantic';
      let chunkSize = 150;
      let overlap = 20;
      
      // Adjust based on user preferences
      if (timeConstraint === 'quick') {
        chunkSize = 300;
        overlap = 0;
        if (priorKnowledge === 'expert') {
          ragMethod = 'fixed';
        }
      } else if (timeConstraint === 'extended') {
        chunkSize = 100;
        overlap = 50;
      }
      
      if (intent === 'find_specific' && preferences.includes('structured_data')) {
        ragMethod = 'header';
      }
      
      setState(prev => ({
        ...prev,
        processingConfig: {
          ...prev.processingConfig,
          rag: {
            ...prev.processingConfig.rag,
            enabled: true,
            method: ragMethod,
            chunkSize,
            overlap,
            configured: true
          }
        }
      }));
    }
    
    // Configure KG if selected
    if (state.selectedFeatures.includes('kg')) {
      let entityTypes: string[] | string = ['all'];
      let relationMapping = true;
      let graphBuilding = detailLevel === 'high';
      
      if (role === 'decision_maker') {
        entityTypes = ['person', 'organization', 'location'];
      } else if (role === 'technical') {
        entityTypes = ['concept', 'technical_term', 'component'];
      }
      
      setState(prev => ({
        ...prev,
        processingConfig: {
          ...prev.processingConfig,
          kg: {
            ...prev.processingConfig.kg,
            enabled: true,
            entityTypes,
            relationMapping,
            graphBuilding,
            configured: true
          }
        }
      }));
    }
    
    // Configure IDP if selected
    if (state.selectedFeatures.includes('idp')) {
      let extractFields = true;
      let classification = true;
      let metadata = true;
      let tables = intent === 'extract_data' || preferences.includes('structured_data');
      let formFields = intent === 'extract_data';
      
      setState(prev => ({
        ...prev,
        processingConfig: {
          ...prev.processingConfig,
          idp: {
            ...prev.processingConfig.idp,
            enabled: true,
            extractFields,
            classification,
            metadata,
            tables,
            formFields,
            configured: true
          }
        }
      }));
    }
  }, [state.userProfile, state.selectedFeatures, state.processingPriority]);

  const startConversation = useCallback((documentAnalysis: DocumentCharacteristics | null) => {
    if (documentAnalysis) {
      // Use ConversationManager to get CRM-specific questions
      const conversationState = conversationManager.startConversation(documentAnalysis);
      
      // Update our state with the messages from ConversationManager
      setState({
        messages: conversationState.messages,
        selectedProcessingTypes: conversationState.selectedProcessingTypes,
        isComplete: conversationState.isComplete,
        currentQuestion: conversationState.currentQuestion,
        documentAnalysis: documentAnalysis,
        userGoal: conversationState.userGoal,
        useCase: conversationState.useCase,
        configuration: conversationState.configuration,
        conversationStep: conversationState.conversationStep,
        userProfile: {
          role: conversationState.userProfile?.role || '',
          department: conversationState.userProfile?.department || '',
          experience: conversationState.userProfile?.experience || '',
          intent: '',
          timeConstraint: '',
          detailLevel: '',
          priorKnowledge: '',
          preferences: []
        },
        selectedFeatures: [],
        processingConfig: {
          rag: { enabled: false, method: 'semantic', chunkSize: 500, overlap: 50 },
          kg: { enabled: false, entityTypes: [], relationMapping: false },
          idp: { enabled: false, extractFields: false, classification: false }
        },
        processingPreferences: conversationState.processingPreferences,
        multimodalPreferences: conversationState.multimodalPreferences
      });
      
      return;
    }
    
    // Fallback for when no document analysis is available
    const docType = 'document';
    const initialMessages: ConversationMessage[] = [
      {
        id: generateId(),
        type: 'assistant',
        content: `I've analyzed your document. Which CRM workflow would you like to enhance?`,
        timestamp: new Date(),
        actions: [
          {
            id: 'workflow-1',
            label: 'Decision maker (executive, manager)',
            action: 'set_user_role',
            data: { role: 'decision_maker', features: ['kg', 'idp'] }
          },
          {
            id: 'role-2',
            label: 'Information seeker (researcher, analyst)',
            action: 'set_user_role',
            data: { role: 'researcher', features: ['rag', 'kg'] }
          },
          {
            id: 'role-3',
            label: 'Technical specialist (engineer, developer)',
            action: 'set_user_role',
            data: { role: 'technical', features: ['rag', 'idp'] }
          },
          {
            id: 'role-4',
            label: 'Content creator (writer, marketer)',
            action: 'set_user_role',
            data: { role: 'creator', features: ['rag'] }
          },
          {
            id: 'role-5',
            label: 'Other/Not listed',
            action: 'set_user_role',
            data: { role: 'other', features: [] }
          }
        ]
      }
    ];
    
    setState(prev => ({
      ...prev,
      documentAnalysis,
      messages: initialMessages,
      isAnalyzing: false,
      isComplete: false,
      userProfile: {
        role: '',
        intent: '',
        timeConstraint: '',
        detailLevel: '',
        priorKnowledge: '',
        preferences: []
      },
      selectedFeatures: [],
      processingConfig: {
        rag: { enabled: false, method: 'semantic', chunkSize: 150, overlap: 20 },
        kg: { enabled: false, entityTypes: ['all'], relationMapping: true },
        idp: { enabled: false, extractFields: true, classification: true }
      }
    }));
  }, [setState]);

  const submitTestAnswer = useCallback((questionId: string, answer: string) => {
    setState(prev => {
      const currentTest = prev.testing?.currentTest;
      if (!currentTest) return prev;
      
      const question = currentTest.questions[currentTest.currentQuestionIndex];
      if (!question || question.id !== questionId) return prev;
      
      const testResult: QATestResult = {
        questionId,
        question: question.question,
        userAnswer: answer,
        systemAnswer: "", // This would be filled by the system
        confidence: 0.85, // Placeholder confidence
        timestamp: new Date()
      };
      
      return {
        ...prev,
        testing: {
          ...prev.testing!,
          results: [...prev.testing!.results, testResult],
          metrics: {
            ...prev.testing!.metrics,
            answeredQuestions: prev.testing!.metrics.answeredQuestions + 1
          }
        }
      };
    });
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;

    // Check if we're in testing mode and this is a test answer
    if (state.testing?.enabled && state.testing.currentTest && !message.startsWith('action:')) {
      const currentTest = state.testing.currentTest;
      const currentQuestion = currentTest.questions[currentTest.currentQuestionIndex];
      
      if (currentQuestion) {
        // Submit the test answer
        submitTestAnswer(currentQuestion.id, message);
        
        // Move to next question or finish test
        const nextIndex = currentTest.currentQuestionIndex + 1;
        if (nextIndex < currentTest.questions.length) {
          // Show next question
          const nextQuestion = currentTest.questions[nextIndex];
          const testMessage: ConversationMessage = {
            id: generateId(),
            type: 'assistant' as const,
            content: `Test Question ${nextIndex + 1}/${currentTest.questions.length}: ${nextQuestion.question}`,
            timestamp: new Date()
          };
          
          setState(prev => ({
            ...prev,
            testing: {
              ...prev.testing!,
              currentTest: {
                ...currentTest,
                currentQuestionIndex: nextIndex
              }
            },
            messages: [...prev.messages, 
              { id: generateId(), type: 'user' as const, content: message, timestamp: new Date() },
              testMessage
            ]
          }));
        } else {
          // Test complete
          setState(prev => ({
            ...prev,
            testing: {
              ...prev.testing!,
              currentTest: undefined,
              metrics: {
                ...prev.testing!.metrics,
                endTime: new Date()
              }
            }
          }));
          
          // Send completion message directly to conversation manager
          // Create completion message to move to results validation
          const completionMessage: ConversationMessage = {
            id: generateId(),
            type: 'assistant' as const,
            content: "Test completed! Let's review your results.",
            timestamp: new Date()
          };
          
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, completionMessage],
            conversationStep: 'results_validation'
          }));
        }
        return;
      }
    }

    // Add debugging for action messages
    if (message.startsWith('action:')) {
      console.log('useConversation: Received action message:', message);
      try {
        const actionData = JSON.parse(message.substring(7));
        console.log('useConversation: Parsed action data:', actionData);
        if (actionData.action === 'next_step' && actionData.data.nextStep === 'recommendations') {
          console.log('useConversation: IMPORTANT - Processing next_step to recommendations!');
        }
      } catch (e) {
        console.error('useConversation: Error parsing action message:', e);
      }
    }

    // Convert EnhancedConversationState to ConversationState for the manager
    const baseState: ConversationState = {
      messages: state.messages,
      selectedProcessingTypes: state.selectedProcessingTypes,
      isComplete: state.isComplete,
      currentQuestion: state.currentQuestion,
      documentAnalysis: state.documentAnalysis || undefined,
      userGoal: state.userGoal,
      useCase: state.useCase,
      configuration: state.configuration,
      conversationStep: state.conversationStep // Make sure to include the current step!
    };
    
    console.log('useConversation: Current conversationStep before sending message:', state.conversationStep);
    const newState = conversationManager.processUserMessage(message, baseState);
    
    // Log state changes
    console.log('useConversation: State returned from conversationManager:', {
      currentStep: state.conversationStep,
      newStep: newState.conversationStep,
      messageCount: newState.messages.length
    });

    // Special handling for confirmation -> recommendations transition
    if (state.conversationStep === 'confirmation' && 
        message.includes('next_step') && 
        message.includes('recommendations')) {
      console.log('useConversation: FORCE SETTING recommendations step!');
      newState.conversationStep = 'recommendations';
    }

    // Merge the returned state with our enhanced state, preserving required fields
    setState(prev => {
      // Log the state change
      console.log('useConversation: Updating state from', prev.conversationStep, 'to', newState.conversationStep);
      
      return {
        ...prev,
        messages: newState.messages,
        selectedProcessingTypes: newState.selectedProcessingTypes,
        isComplete: newState.isComplete,
        currentQuestion: newState.currentQuestion,
        documentAnalysis: newState.documentAnalysis || prev.documentAnalysis,
        userGoal: newState.userGoal,
        useCase: newState.useCase,
        configuration: newState.configuration || prev.configuration,
        conversationStep: newState.conversationStep,
        userProfile: {
          ...prev.userProfile,
          ...(newState.userProfile || {})
        },
        processingPreferences: newState.processingPreferences || prev.processingPreferences,
        multimodalPreferences: newState.multimodalPreferences || prev.multimodalPreferences
      };
    });
  }, [state, submitTestAnswer, generateId]);

  const enableTesting = useCallback((mode: 'live' | 'batch' | 'validation') => {
    setState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        testingEnabled: true,
        testingMode: mode,
        accuracyTracking: true
      },
      testing: {
        ...prev.testing!,
        enabled: true,
        mode,
        metrics: {
          ...prev.testing!.metrics,
          startTime: new Date()
        }
      }
    }));
    
    toast({
      title: "Testing Mode Enabled",
      description: `Q&A testing mode set to: ${mode}`,
    });
  }, [toast]);

  const handleAction = useCallback((action: string, data?: any) => {
    console.log('useConversation: handleAction called with', action, data);
    
    // Handle step-based actions from ConversationManager
    if (['next_step', 'set_role', 'set_department', 'set_vehicle', 'request_vin_input', 
        'request_vehicle_input', 'set_experience', 'set_goal', 
        'set_urgency', 'set_detail', 'select_processing', 'set_has_images', 
        'set_has_audio', 'set_needs_ocr', 'set_visual_analysis', 'set_image_processing',
        'set_kg_preferences', 'set_kg_entities', 'set_idp_preferences', 'apply_recommendation',
        'start_qa_test'].includes(action)) {
      
      // Handle immediate updates for specific actions
      if (action === 'select_processing') {
        console.log('useConversation: select_processing action with:', data);
        
        // Immediately update the parent configuration when basic RAG search is selected
        if (data.configuration?.rag?.enabled && onProcessingConfigured) {
          console.log('useConversation: Enabling RAG from select_processing');
          
          // Add a delay to ensure proper state propagation
          setTimeout(() => {
            const configToSend = {
              ...data,
              source: 'ai_basic_rag'  // Mark as basic RAG from AI
            };
            onProcessingConfigured(configToSend);
          }, 100);
        }
        
        // Immediately update the parent configuration when IDP is selected
        if (data.configuration?.idp?.enabled && onProcessingConfigured) {
          console.log('useConversation: Enabling IDP from select_processing');
          
          // Add a delay to ensure proper state propagation
          setTimeout(() => {
            const configToSend = {
              ...data,
              source: 'ai_basic_idp'  // Mark as basic IDP from AI
            };
            onProcessingConfigured(configToSend);
          }, 100);
        }
      }
      
      // Handle image selection to update multimodal configuration
      if (action === 'set_has_images' && onProcessingConfigured) {
        console.log('useConversation: User has images:', data.hasImages);
        
        if (data.hasImages) {
          // Delay the configuration update to avoid race conditions
          setTimeout(() => {
            // Build immediate configuration update with image captioning
            // This should only update the imageCaption setting, preserving other multimodal settings
            const imageConfig = {
              configuration: {
                rag: {
                  enabled: true,
                  multimodal: {
                    imageCaption: true  // Only update image captioning
                  }
                },
                multimodalUpdate: true  // Flag to indicate this is a multimodal update
              },
              source: 'ai_assistant',
              partialUpdate: true  // Indicate this is a partial update
            };
            
            console.log('useConversation: Sending imageCaption update:', imageConfig);
            // Update parent
            onProcessingConfigured(imageConfig);
          }, 300); // Increased delay to ensure state updates properly
        }
      }
      
      // Handle audio selection to update multimodal configuration
      if (action === 'set_has_audio' && onProcessingConfigured) {
        console.log('useConversation: User has audio:', data.hasAudio);
        
        if (data.hasAudio) {
          // Delay the update to avoid conflicts with state updates
          setTimeout(() => {
            // Build immediate configuration update with audio transcription
            // This should only update the transcription setting, preserving other multimodal settings
            const audioConfig = {
              configuration: {
                rag: {
                  enabled: true,
                  multimodal: {
                    transcription: true  // Only update audio transcription
                  }
                },
                multimodalUpdate: true  // Flag to indicate this is a multimodal update
              },
              source: 'ai_assistant',
              partialUpdate: true  // Indicate this is a partial update
            };
            
            console.log('useConversation: Sending audio transcription update:', audioConfig);
            // Update parent
            onProcessingConfigured(audioConfig);
          }, 300); // Match delay with image captioning for consistency
        }
      }
      
      // Handle OCR selection to update multimodal configuration
      if (action === 'set_needs_ocr' && onProcessingConfigured) {
        console.log('useConversation: User needs OCR:', data.needsOCR);
        
        if (data.needsOCR) {
          // Delay the update to avoid conflicts with state updates
          setTimeout(() => {
            // Build immediate configuration update with OCR
            // This should only update the OCR setting, preserving other multimodal settings
            const ocrConfig = {
              configuration: {
                rag: {
                  enabled: true,
                  multimodal: {
                    ocr: true  // Only update OCR
                  }
                },
                multimodalUpdate: true  // Flag to indicate this is a multimodal update
              },
              source: 'ai_assistant',
              partialUpdate: true  // Indicate this is a partial update
            };
            
            console.log('useConversation: Sending OCR update:', ocrConfig);
            // Update parent
            onProcessingConfigured(ocrConfig);
          }, 300); // Match delay with other multimodal options for consistency
        }
      }
      
      // Handle visual analysis selection to update multimodal configuration
      if (action === 'set_visual_analysis' && onProcessingConfigured) {
        console.log('useConversation: User wants visual analysis:', data.visualAnalysis);
        
        if (data.visualAnalysis) {
          // Delay the update to avoid conflicts with state updates
          setTimeout(() => {
            // Build immediate configuration update with visual analysis
            // This should only update the visualAnalysis setting, preserving other multimodal settings
            const visualAnalysisConfig = {
              configuration: {
                rag: {
                  enabled: true,
                  multimodal: {
                    visualAnalysis: true  // Only update visual analysis
                  }
                },
                multimodalUpdate: true  // Flag to indicate this is a multimodal update
              },
              source: 'ai_assistant',
              partialUpdate: true  // Indicate this is a partial update
            };
            
            console.log('useConversation: Sending visual analysis update:', visualAnalysisConfig);
            // Update parent
            onProcessingConfigured(visualAnalysisConfig);
          }, 300); // Match delay with other multimodal options for consistency
        }
      }
      
      // Handle knowledge graph selection to update KG configuration
      if (action === 'set_kg_preferences') {
        console.log('useConversation: User wants Knowledge Graph:', data.kgEnabled);
        console.log('useConversation: onProcessingConfigured available:', !!onProcessingConfigured);
        console.log('useConversation: Current onProcessingConfigured function:', onProcessingConfigured);
        
        if (data.kgEnabled && onProcessingConfigured) {
          console.log('useConversation: Setting up KG configuration update');
          // Create the config before the timeout
          const kgConfig = {
            configuration: {
              kg: {
                enabled: true,
                entityExtraction: true,
                relationMapping: true,
                entityTypes: data.entityTypes,
                graphBuilding: true
              }
            },
            source: 'ai_assistant',
            kgUpdate: true  // Flag to indicate this is a KG update
          };
          
          console.log('useConversation: KG config created:', kgConfig);
          
          // Delay the update to avoid conflicts with state updates
          const timeoutId = setTimeout(() => {
            console.log('useConversation: Inside setTimeout callback');
            console.log('useConversation: Sending KG update:', kgConfig);
            console.log('useConversation: Actually calling onProcessingConfigured');
            // Update parent
            onProcessingConfigured(kgConfig);
            console.log('useConversation: onProcessingConfigured called successfully');
          }, 300); // Match delay with other options for consistency
          
          console.log('useConversation: Scheduled KG update with timeout ID:', timeoutId);
        } else {
          console.log('useConversation: KG not enabled or onProcessingConfigured not available');
          console.log('useConversation: data.kgEnabled =', data.kgEnabled);
          console.log('useConversation: onProcessingConfigured =', onProcessingConfigured);
        }
      }
      
      // Handle IDP selection to update Document Intelligence Processing configuration
      if (action === 'set_idp_preferences') {
        console.log('useConversation: User wants IDP:', data.idpEnabled);
        console.log('useConversation: IDP extract type:', data.extractType);
        console.log('useConversation: onProcessingConfigured available:', !!onProcessingConfigured);
        
        if (data.idpEnabled && onProcessingConfigured) {
          console.log('useConversation: Setting up IDP configuration update');
          // Create the config based on extract type
          const idpConfig = {
            configuration: {
              idp: {
                enabled: true,
                textExtraction: true,
                classification: data.extractType === 'metadata' || data.extractType === 'full',
                metadata: data.extractType === 'metadata' || data.extractType === 'full',
                tables: data.extractType === 'structured' || data.extractType === 'full',
                formFields: data.extractType === 'structured' || data.extractType === 'full'
              }
            },
            source: 'ai_assistant',
            idpUpdate: true  // Flag to indicate this is an IDP update
          };
          
          console.log('useConversation: IDP config created:', idpConfig);
          
          // Delay the update to avoid conflicts with state updates
          const timeoutId = setTimeout(() => {
            console.log('useConversation: Inside IDP setTimeout callback');
            console.log('useConversation: Sending IDP update:', idpConfig);
            console.log('useConversation: Actually calling onProcessingConfigured for IDP');
            // Update parent
            onProcessingConfigured(idpConfig);
            console.log('useConversation: onProcessingConfigured called successfully for IDP');
          }, 300); // Match delay with other options for consistency
          
          console.log('useConversation: Scheduled IDP update with timeout ID:', timeoutId);
        } else {
          console.log('useConversation: IDP not enabled or onProcessingConfigured not available');
          console.log('useConversation: data.idpEnabled =', data.idpEnabled);
          console.log('useConversation: onProcessingConfigured =', onProcessingConfigured);
        }
      }
      
      // Handle Q&A test start action
      if (action === 'start_qa_test') {
        console.log('useConversation: Starting Q&A test with type:', data.testType);
        
        // Enable testing with the appropriate mode
        enableTesting('live');
        
        // Create test questions based on test type
        const testQuestions = getTestQuestions(data.testType, state.documentAnalysis);
        
        setState(prev => ({
          ...prev,
          testing: {
            ...prev.testing!,
            currentTest: {
              type: data.testType,
              questions: testQuestions,
              currentQuestionIndex: 0
            },
            metrics: {
              ...prev.testing!.metrics,
              totalQuestions: testQuestions.length
            }
          }
        }));
        
        // Show first test question
        const firstQuestion = testQuestions[0];
        if (firstQuestion) {
          const testMessage: ConversationMessage = {
            id: generateId(),
            type: 'assistant' as const,
            content: `Test Question 1/${testQuestions.length}: ${firstQuestion.question}`,
            timestamp: new Date()
          };
          
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, testMessage]
          }));
        }
      }
      
      // Send action message to ConversationManager
      console.log('useConversation: Sending action to ConversationManager');
      sendMessage(`action:${JSON.stringify({ action, data })}`);
      return;
    }
    
    if (action === 'quick_intent') {
      // Handle the CRM-specific suggested actions
      sendMessage(data);
      return;
    }
    
    if (action === 'confirm_processing' || action === 'modify_processing' || action === 'process_document' || action === 'review_config') {
      // Handle confirmation actions from ConversationManager
      if (action === 'confirm_processing') {
        const baseState: ConversationState = {
          messages: state.messages,
          selectedProcessingTypes: state.selectedProcessingTypes,
          isComplete: state.isComplete,
          currentQuestion: state.currentQuestion,
          documentAnalysis: state.documentAnalysis || undefined,
          userGoal: state.userGoal,
          useCase: state.useCase,
          configuration: data
        };
        
        const newState = conversationManager.confirmProcessing(baseState, data);
        console.log('useConversation: confirm_processing - received config:', data);
        console.log('useConversation: confirm_processing - newState configuration:', newState.configuration);
        
        setState(prev => ({
          ...prev,
          messages: newState.messages,
          selectedProcessingTypes: newState.selectedProcessingTypes,
          isComplete: true,
          currentQuestion: newState.currentQuestion,
          documentAnalysis: newState.documentAnalysis || prev.documentAnalysis,
          userGoal: newState.userGoal,
          useCase: newState.useCase,
          configuration: newState.configuration?.configuration || data,
          conversationStep: newState.conversationStep,
          userProfile: {
            ...prev.userProfile,
            ...(newState.userProfile || {})
          },
          processingPreferences: newState.processingPreferences || prev.processingPreferences,
          multimodalPreferences: newState.multimodalPreferences || prev.multimodalPreferences
        }));
        
        // Update configuration in real-time with proper source identification
        if (onProcessingConfigured) {
          console.log('useConversation: calling onProcessingConfigured with:', data);
          // Add a flag to indicate this is from basic RAG search
          if (data.configuration?.rag?.enabled && data.processingTypes?.includes('rag')) {
            const configToSend = {
              ...data,
              source: 'ai_basic_rag'  // Mark as basic RAG from AI
            };
            onProcessingConfigured(configToSend);
          } else {
            onProcessingConfigured(data);
          }
        }
      } else if (action === 'process_document') {
        // Notify parent that processing should start
        console.log('useConversation: process_document action with data:', data);
        console.log('useConversation: process_document - configuration:', data.configuration);
        if (onProcessingConfigured) {
          onProcessingConfigured(data);
        }
        
        // Update conversation state to show processing has started
        const processingStartedMessage: ConversationMessage = {
          id: generateId(),
          type: 'assistant',
          content: 'Perfect! I\'ve started processing your document. You\'ll see the results shortly.',
          timestamp: new Date()
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, processingStartedMessage],
          isComplete: true
        }));
      } else if (action === 'review_config') {
        // Show configuration summary
        const configSummary = generateConfigSummary(data);
        const reviewMessage: ConversationMessage = {
          id: generateId(),
          type: 'assistant',
          content: configSummary,
          timestamp: new Date(),
          actions: [
            {
              id: generateId(),
              label: 'Process Document',
              action: 'process_document',
              data: data
            },
            {
              id: generateId(),
              label: 'Modify Configuration',
              action: 'start_over',
              data: {}
            }
          ]
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, reviewMessage]
        }));
      }
      return;
    }
    
    if (action === 'set_user_role') {
      const { role, features } = data;
      
      // Update user profile with role, maintaining all required fields
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          role
        },
        selectedFeatures: features
      }));
      
      // Ask about intent/use case
      const intentQuestion = {
        id: generateId(),
        type: 'assistant' as const,
        content: 'What are you specifically trying to do with this document?',
        timestamp: new Date(),
        actions: [
          { 
            id: 'intent-1', 
            label: 'Find specific answers or information', 
            action: 'set_user_intent', 
            data: { 
              intent: 'find_specific',
              features: ['rag']
            } 
          },
          { 
            id: 'intent-2', 
            label: 'Extract structured data (tables, fields, numbers)', 
            action: 'set_user_intent', 
            data: { 
              intent: 'extract_data',
              features: ['idp']
            } 
          },
          { 
            id: 'intent-3', 
            label: 'Understand relationships and connections', 
            action: 'set_user_intent', 
            data: { 
              intent: 'understand_relationships',
              features: ['kg']
            } 
          },
          { 
            id: 'intent-4', 
            label: 'Comprehensive analysis (all of the above)', 
            action: 'set_user_intent', 
            data: { 
              intent: 'comprehensive',
              features: ['rag', 'kg', 'idp']
            } 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, intentQuestion]
      }));
    }
    else if (action === 'set_user_intent') {
      const { intent, features } = data;
      
      // Update user profile with intent
      // Merge with previously selected features if any
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          intent
        },
        selectedFeatures: Array.from(new Set([...prev.selectedFeatures, ...features]))
      }));
      
      // Ask about time constraints/detail level
      const timeQuestion = {
        id: generateId(),
        type: 'assistant' as const,
        content: 'How much time do you have, and what level of detail do you need?',
        timestamp: new Date(),
        actions: [
          { 
            id: 'time-1', 
            label: 'Quick overview (I need it fast)', 
            action: 'set_time_detail', 
            data: { 
              timeConstraint: 'quick',
              detailLevel: 'low',
              processingPriority: 'speed'
            } 
          },
          { 
            id: 'time-2', 
            label: 'Standard analysis (balanced approach)', 
            action: 'set_time_detail', 
            data: { 
              timeConstraint: 'standard',
              detailLevel: 'medium',
              processingPriority: 'balanced'
            } 
          },
          { 
            id: 'time-3', 
            label: 'Deep dive (I need thorough analysis)', 
            action: 'set_time_detail', 
            data: { 
              timeConstraint: 'extended',
              detailLevel: 'high',
              processingPriority: 'depth'
            } 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, timeQuestion]
      }));
    }
    else if (action === 'set_time_detail') {
      const { timeConstraint, detailLevel, processingPriority } = data;
      
      // Update user profile with time and detail preferences
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          timeConstraint,
          detailLevel
        },
        processingPriority
      }));
      
      // Ask about prior knowledge
      const knowledgeQuestion = {
        id: generateId(),
        type: 'assistant' as const,
        content: 'How familiar are you with the content of this document?',
        timestamp: new Date(),
        actions: [
          { 
            id: 'knowledge-1', 
            label: 'Not familiar (need explanations)', 
            action: 'set_prior_knowledge', 
            data: { 
              priorKnowledge: 'novice',
              explanationLevel: 'detailed'
            } 
          },
          { 
            id: 'knowledge-2', 
            label: 'Somewhat familiar', 
            action: 'set_prior_knowledge', 
            data: { 
              priorKnowledge: 'intermediate',
              explanationLevel: 'moderate'
            } 
          },
          { 
            id: 'knowledge-3', 
            label: 'Very familiar (expert level)', 
            action: 'set_prior_knowledge', 
            data: { 
              priorKnowledge: 'expert',
              explanationLevel: 'minimal'
            } 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, knowledgeQuestion]
      }));
    }
    else if (action === 'set_prior_knowledge') {
      const { priorKnowledge, explanationLevel } = data;
      
      // Update user profile with knowledge level
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          priorKnowledge,
          explanationLevel
        }
      }));
      
      // Ask about content preferences
      const preferencesQuestion = {
        id: generateId(),
        type: 'assistant' as const,
        content: 'How would you prefer the information to be presented?',
        timestamp: new Date(),
        actions: [
          { 
            id: 'pref-1', 
            label: 'Text summaries and explanations', 
            action: 'set_preferences', 
            data: { 
              preferences: ['text_summaries'],
              format: 'text'
            } 
          },
          { 
            id: 'pref-2', 
            label: 'Structured data (tables, lists)', 
            action: 'set_preferences', 
            data: { 
              preferences: ['structured_data'],
              format: 'structured'
            } 
          },
          { 
            id: 'pref-3', 
            label: 'Visual representations when possible', 
            action: 'set_preferences', 
            data: { 
              preferences: ['visual'],
              format: 'visual'
            } 
          },
          { 
            id: 'pref-4', 
            label: 'Mixed format (all of the above)', 
            action: 'set_preferences', 
            data: { 
              preferences: ['mixed'],
              format: 'mixed'
            } 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, preferencesQuestion]
      }));
    }
    else if (action === 'set_preferences') {
      const { preferences, format } = data;
      
      // Update user profile with preferences
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          preferences,
          format
        }
      }));
      
      // Configure processing based on all collected information
      configureProcessingFromUserProfile();
      
      // Show confirmation and options
      const configuredMessage = {
        id: generateId(),
        type: 'assistant' as const,
        content: `Thank you for sharing your needs. Based on your responses, I've configured the ideal processing approach for this ${state.documentAnalysis?.documentType || 'document'}.`,
        timestamp: new Date()
      };
      
      const actionMessage = {
        id: generateId(),
        type: 'assistant' as const,
        content: 'What would you like to do next?',
        timestamp: new Date(),
        actions: [
          { 
            id: 'next-1', 
            label: 'Start Processing Now', 
            action: 'start_processing', 
            data: {} 
          },
          { 
            id: 'next-2', 
            label: 'Review My Settings', 
            action: 'review_profile', 
            data: {} 
          },
          { 
            id: 'next-3', 
            label: 'Fine-tune Processing Options', 
            action: 'show_advanced', 
            data: {} 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, configuredMessage, actionMessage],
        isComplete: true
      }));
    }
    else if (action === 'review_profile') {
      // Create a user-friendly summary of their profile and selected options
      const profile = state.userProfile;
      
      let roleSummary;
      switch(profile.role) {
        case 'decision_maker': roleSummary = 'Decision maker (executive/manager)'; break;
        case 'researcher': roleSummary = 'Information seeker (researcher/analyst)'; break;
        case 'technical': roleSummary = 'Technical specialist'; break;
        case 'creator': roleSummary = 'Content creator'; break;
        default: roleSummary = profile.role;
      }
      
      let intentSummary;
      switch(profile.intent) {
        case 'find_specific': intentSummary = 'Finding specific information'; break;
        case 'extract_data': intentSummary = 'Extracting structured data'; break;
        case 'understand_relationships': intentSummary = 'Understanding relationships and connections'; break;
        case 'comprehensive': intentSummary = 'Comprehensive document analysis'; break;
        default: intentSummary = profile.intent;
      }
      
      let timeSummary;
      switch(profile.timeConstraint) {
        case 'quick': timeSummary = 'Quick analysis (prioritizing speed)'; break;
        case 'standard': timeSummary = 'Standard processing time (balanced approach)'; break;
        case 'extended': timeSummary = 'Thorough analysis (prioritizing depth)'; break;
        default: timeSummary = profile.timeConstraint;
      }
      
      let knowledgeSummary;
      switch(profile.priorKnowledge) {
        case 'novice': knowledgeSummary = 'New to this subject (detailed explanations)'; break;
        case 'intermediate': knowledgeSummary = 'Somewhat familiar with the subject'; break;
        case 'expert': knowledgeSummary = 'Expert-level knowledge'; break;
        default: knowledgeSummary = profile.priorKnowledge;
      }
      
      let preferencesSummary;
      if (profile.preferences.includes('mixed')) {
        preferencesSummary = 'Mixed presentation formats';
      } else if (profile.preferences.includes('visual')) {
        preferencesSummary = 'Visual representations preferred';
      } else if (profile.preferences.includes('structured_data')) {
        preferencesSummary = 'Structured data (tables, lists)';
      } else {
        preferencesSummary = 'Text summaries and explanations';
      }
      
      // Create processing feature summary
      let featuresSummary = '';
      if (state.selectedFeatures.includes('rag')) {
        featuresSummary += '• Document Search: ';
        const method = state.processingConfig.rag.method;
        if (method === 'semantic') {
          featuresSummary += 'Topic-based chunking for natural questions\n';
        } else if (method === 'fixed') {
          featuresSummary += 'Fixed-size sections for consistent retrieval\n';
        } else {
          featuresSummary += 'Section-based chunking following document structure\n';
        }
      }
      
      if (state.selectedFeatures.includes('kg')) {
        featuresSummary += '• Relationship Analysis: ';
        const entityTypes = state.processingConfig.kg.entityTypes;
        if (Array.isArray(entityTypes) && entityTypes.length > 0) {
          featuresSummary += `Focusing on ${entityTypes.join(', ')} entities\n`;
        } else if (entityTypes === 'all') {
          featuresSummary += 'Analyzing all entity types and relationships\n';
        } else {
          featuresSummary += 'Extracting key relationships\n';
        }
      }
      
      if (state.selectedFeatures.includes('idp')) {
        featuresSummary += '• Data Extraction: ';
        const features = [];
        if (state.processingConfig.idp.metadata) features.push('metadata');
        if (state.processingConfig.idp.tables) features.push('tables');
        if (state.processingConfig.idp.formFields) features.push('form fields');
        
        if (features.length > 0) {
          featuresSummary += `Extracting ${features.join(', ')}\n`;
        } else {
          featuresSummary += 'Basic extraction and classification\n';
        }
      }
      
      // Compile the full profile summary
      const profileSummary = `
**Your Profile Summary:**

**Role:** ${roleSummary}
**Goal:** ${intentSummary}
**Time/Detail:** ${timeSummary}
**Knowledge Level:** ${knowledgeSummary}
**Preferred Format:** ${preferencesSummary}

**Selected Processing Features:**
${featuresSummary}

These settings will provide you with optimized results based on your specific needs. Would you like to proceed with processing?
      `;
      
      const profileMessage = {
        id: generateId(),
        type: 'assistant' as const,
        content: profileSummary,
        timestamp: new Date(),
        actions: [
          { 
            id: 'proceed-1', 
            label: 'Proceed with Processing', 
            action: 'start_processing', 
            data: {} 
          },
          { 
            id: 'proceed-2', 
            label: 'Adjust My Preferences', 
            action: 'reset_profile', 
            data: {} 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, profileMessage]
      }));
    }
    else if (action === 'show_advanced') {
      // Show advanced configuration options based on selected features
      if (state.selectedFeatures.includes('rag')) {
        const advancedRagMessage = {
          id: generateId(),
          type: 'assistant' as const,
          content: 'How would you like to divide the document for searching?',
          timestamp: new Date(),
          actions: [
            { 
              id: 'rag-adv-1', 
              label: 'By topic and meaning', 
              action: 'configure_feature', 
              data: { 
                feature: 'rag', 
                config: { method: 'semantic', chunkSize: 150, overlap: 20 },
                description: 'Divides content by natural meaning and context'
              } 
            },
            { 
              id: 'rag-adv-2', 
              label: 'By equal-sized sections', 
              action: 'configure_feature', 
              data: { 
                feature: 'rag', 
                config: { method: 'fixed', chunkSize: 300, overlap: 0 },
                description: 'Creates uniform chunks of consistent size'
              } 
            },
            { 
              id: 'rag-adv-3', 
              label: 'By document headings', 
              action: 'configure_feature', 
              data: { 
                feature: 'rag', 
                config: { method: 'header', chunkSize: 0, overlap: 0 },
                description: 'Follows the document\'s own section structure'
              } 
            }
          ]
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, advancedRagMessage]
        }));
        
        return; // Return to wait for user selection
      }
    }
    else if (action === 'configure_feature') {
      const { feature, config, description } = data;
      
      // Update specific feature configuration
      setState(prev => ({
        ...prev,
        processingConfig: {
          ...prev.processingConfig,
          [feature]: {
            ...prev.processingConfig[feature as keyof ProcessingConfiguration],
            ...config,
            enabled: true,
            configured: true
          }
        }
      }));
      
      // Check if more features need configuration
      const unconfiguredFeatures = state.selectedFeatures.filter(f => 
        !state.processingConfig[f as keyof ProcessingConfiguration].configured &&
        f !== feature
      );
      
      if (unconfiguredFeatures.length > 0) {
        // Continue with next feature configuration
        // Show next advanced configuration...
      } else {
        // All features configured, show final confirmation
        const completionMessage = {
          id: generateId(),
          type: 'assistant' as const,
          content: 'All processing features have been configured. Ready to start processing?',
          timestamp: new Date(),
          actions: [
            { 
              id: 'final-1', 
              label: 'Start Processing', 
              action: 'start_processing', 
              data: {} 
            },
            { 
              id: 'final-2', 
              label: 'Review Configuration', 
              action: 'review_profile', 
              data: {} 
            }
          ]
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, completionMessage]
        }));
      }
    }
    else if (action === 'reset_profile') {
      // Reset user profile and start over
      startConversation(state.documentAnalysis || null);
    }
    else if (action === 'start_processing') {
      // Start processing with configured options
      const processingMessage = {
        id: generateId(),
        type: 'assistant' as const,
        content: `Processing started! I'll analyze this ${state.documentAnalysis?.documentType || 'document'} according to your preferences.`,
        timestamp: new Date()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, processingMessage],
        isComplete: true
      }));
    }
    else if (action === 'set_vehicle_role') {
      const { vehicleRole } = data;
      
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          vehicleRole
        }
      }));
      
      // Ask about what they're trying to do
      const vehicleIntentQuestion = {
        id: generateId(),
        type: 'assistant' as const,
        content: 'What are you trying to do with this vehicle information?',
        timestamp: new Date(),
        actions: [
          { 
            id: 'vehicle-intent-1', 
            label: 'Learn about features and specifications', 
            action: 'set_vehicle_intent', 
            data: { vehicleIntent: 'features' } 
          },
          { 
            id: 'vehicle-intent-2', 
            label: 'Compare with other vehicles', 
            action: 'set_vehicle_intent', 
            data: { vehicleIntent: 'compare' } 
          },
          { 
            id: 'vehicle-intent-3', 
            label: 'Troubleshoot an issue', 
            action: 'set_vehicle_intent', 
            data: { vehicleIntent: 'troubleshoot' } 
          },
          { 
            id: 'vehicle-intent-4', 
            label: 'Prepare for a test drive/demonstration', 
            action: 'set_vehicle_intent', 
            data: { vehicleIntent: 'test_drive' } 
          }
        ]
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, vehicleIntentQuestion]
      }));
    }
    else {
      // Handle legacy actions (backward compatibility)
      switch (action) {
        case 'quick_intent':
          sendMessage(data);
          break;
          
        case 'confirm_processing':
          // Convert EnhancedConversationState to ConversationState for the manager
          const baseStateForConfirm: ConversationState = {
            messages: state.messages,
            selectedProcessingTypes: state.selectedProcessingTypes,
            isComplete: state.isComplete,
            currentQuestion: state.currentQuestion,
            documentAnalysis: state.documentAnalysis || undefined,
            userGoal: state.userGoal,
            useCase: state.useCase,
            configuration: state.configuration
          };
          
          const confirmedState = conversationManager.confirmProcessing(baseStateForConfirm, data);
          
          // Merge the returned state with our enhanced state
          setState(prev => ({
            ...prev,
            messages: confirmedState.messages,
            selectedProcessingTypes: confirmedState.selectedProcessingTypes,
            isComplete: confirmedState.isComplete,
            currentQuestion: confirmedState.currentQuestion,
            documentAnalysis: confirmedState.documentAnalysis || prev.documentAnalysis,
            userGoal: confirmedState.userGoal,
            useCase: confirmedState.useCase,
            configuration: confirmedState.configuration || prev.configuration,
            conversationStep: confirmedState.conversationStep,
            userProfile: {
              ...prev.userProfile,
              ...(confirmedState.userProfile || {})
            },
            processingPreferences: confirmedState.processingPreferences || prev.processingPreferences,
            multimodalPreferences: confirmedState.multimodalPreferences || prev.multimodalPreferences
          }));
          
          toast({
            title: "Processing Configured",
            description: "Your document processing configuration has been set up successfully.",
          });
          break;
          
        case 'modify_processing':
          toast({
            title: "Modify Configuration",
            description: "You can adjust the processing settings as needed.",
          });
          break;
          
        default:
          console.log('Unknown action:', action);
      }
    }
  }, [state, sendMessage, toast, configureProcessingFromUserProfile, startConversation, enableTesting, generateId]);

  // Handle document-specific customizations
  useEffect(() => {
    // If the document is about a specific product/topic, customize the questions
    // DocumentCharacteristics doesn't have a title property, so we extract from content or type
    const docContent = state.documentAnalysis?.contentFeatures?.topKeywords || [];
    
    // Check if document is about a vehicle (like 2025 Acura RDX)
    const isVehicleDocument = 
      docContent.some(keyword => 
        ['acura', 'rdx', 'vehicle', 'car', 'suv', 'automobile'].includes(keyword.toLowerCase())
      );
    
    if (isVehicleDocument && state.messages.length === 0) {
      // Use specialized vehicle document questions
      const vehicleMessages: ConversationMessage[] = [
        {
          id: '0',
          type: 'assistant',
          content: `I've identified this as a vehicle document. To help you best, I'd like to understand more about your needs.`,
          timestamp: new Date(),
        },
        {
          id: '1',
          type: 'assistant',
          content: 'Who are you helping with this vehicle information?',
          timestamp: new Date(),
          actions: [
            {
              id: 'vehicle-role-1',
              label: 'A customer/potential buyer',
              action: 'set_vehicle_role',
              data: { vehicleRole: 'customer' }
            },
            {
              id: 'vehicle-role-2',
              label: 'Sales team member',
              action: 'set_vehicle_role',
              data: { vehicleRole: 'sales' }
            },
            {
              id: 'vehicle-role-3',
              label: 'Service technician',
              action: 'set_vehicle_role',
              data: { vehicleRole: 'service' }
            },
            {
              id: 'vehicle-role-4',
              label: 'Myself for research',
              action: 'set_vehicle_role',
              data: { vehicleRole: 'self' }
            }
          ]
        }
      ];
      
      setState(prev => ({
        ...prev,
        messages: vehicleMessages,
        isVehicleDocument: true
      }));
    }
  }, [state.documentAnalysis, state.messages.length, setState]);

  const resetConversation = useCallback(() => {
    startConversation(null);
  }, [startConversation]);

  const getProcessingConfig = useCallback(() => {
    return {
      configuration: state.processingConfig,
      userProfile: state.userProfile,
      selectedFeatures: state.selectedFeatures,
      testing: state.testing ? {
        enabled: state.testing.enabled,
        mode: state.testing.mode,
        metrics: state.testing.metrics,
        results: state.testing.results
      } : undefined
    };
  }, [state]);

  // Build configuration from state
  const buildConfigFromState = useCallback(() => {
    const { multimodalPreferences, configuration } = state;
    
    return {
      configuration: {
        rag: {
          enabled: state.selectedProcessingTypes.includes('rag') || state.selectedProcessingTypes.includes('similarity') || configuration?.rag?.enabled || false,
          method: configuration?.rag?.method || 'semantic',
          chunking: configuration?.rag?.chunking || true,
          embeddings: configuration?.rag?.embeddings || true,
          multimodal: multimodalPreferences || {
            transcription: false,
            ocr: false,
            imageCaption: false,
            visualAnalysis: false
          }
        },
        kg: {
          enabled: state.selectedProcessingTypes.includes('knowledge') || configuration?.kg?.enabled || false,
          entityExtraction: configuration?.kg?.entityExtraction || false,
          relationMapping: configuration?.kg?.relationMapping || false,
          graphBuilding: configuration?.kg?.graphBuilding || false,
          entityTypes: configuration?.kg?.entityTypes || []
        },
        idp: {
          enabled: state.selectedProcessingTypes.includes('structured') || configuration?.idp?.enabled || false,
          textExtraction: configuration?.idp?.textExtraction || false,
          classification: configuration?.idp?.classification || false,
          metadata: configuration?.idp?.metadata || false,
          tables: configuration?.idp?.tables || false
        }
      },
      userProfile: state.userProfile,
      processingPreferences: state.processingPreferences
    };
  }, [state]);

  // Helper function to generate test questions based on type and document
  const getTestQuestions = (testType: 'parts' | 'specifications' | 'service', documentAnalysis: DocumentCharacteristics | null | undefined) => {
    const questions = [];
    const generateId = () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (testType) {
      case 'parts':
        questions.push(
          { id: generateId(), question: "What is the part number for the engine air filter?", expectedAnswer: "17220-5BA-A00" },
          { id: generateId(), question: "What is the recommended replacement interval for brake pads?", expectedAnswer: "Every 25,000-50,000 miles" },
          { id: generateId(), question: "What is the part number for the cabin air filter?", expectedAnswer: "80292-TBA-A11" }
        );
        break;
      case 'specifications':
        questions.push(
          { id: generateId(), question: "What is the engine oil capacity?", expectedAnswer: "4.2 quarts with filter" },
          { id: generateId(), question: "What is the recommended tire pressure?", expectedAnswer: "32 PSI front and rear" },
          { id: generateId(), question: "What is the transmission fluid type?", expectedAnswer: "Honda ATF-DW1" }
        );
        break;
      case 'service':
        questions.push(
          { id: generateId(), question: "What is the service interval for engine oil change?", expectedAnswer: "Every 7,500 miles or 12 months" },
          { id: generateId(), question: "When should the timing belt be replaced?", expectedAnswer: "Every 100,000 miles" },
          { id: generateId(), question: "What is the coolant replacement interval?", expectedAnswer: "Every 120,000 miles or 10 years" }
        );
        break;
    }
    
    return questions;
  };

  // Testing methods
  const validateAnswer = useCallback((questionId: string, isCorrect: boolean) => {
    setState(prev => {
      const resultIndex = prev.testing?.results.findIndex(r => r.questionId === questionId);
      if (resultIndex === undefined || resultIndex === -1) return prev;
      
      const updatedResults = [...prev.testing!.results];
      updatedResults[resultIndex] = {
        ...updatedResults[resultIndex],
        isCorrect
      };
      
      const correctAnswers = updatedResults.filter(r => r.isCorrect).length;
      const averageConfidence = updatedResults.reduce((sum, r) => sum + r.confidence, 0) / updatedResults.length;
      
      return {
        ...prev,
        testing: {
          ...prev.testing!,
          results: updatedResults,
          metrics: {
            ...prev.testing!.metrics,
            correctAnswers,
            averageConfidence
          }
        }
      };
    });
  }, []);

  const getTestResults = useCallback(() => {
    return state.testing?.results || [];
  }, [state.testing]);

  const getTestMetrics = useCallback(() => {
    return state.testing?.metrics || {
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      averageConfidence: 0
    };
  }, [state.testing]);

  // Use debounced sync to avoid rapid state updates
  useConfigSync(
    (config) => {
      if (onProcessingConfigured) {
        console.log('useConversation: sending config to parent (debounced):', config);
        onProcessingConfigured(config);
      }
    },
    buildConfigFromState(),
    [state.multimodalPreferences, state.configuration, state.selectedProcessingTypes, state.processingPreferences, state.conversationStep]
  );

  return {
    state,
    sendMessage,
    handleAction,
    startConversation,
    resetConversation,
    getProcessingConfig,
    enableTesting,
    submitTestAnswer,
    validateAnswer,
    getTestResults,
    getTestMetrics
  };
}