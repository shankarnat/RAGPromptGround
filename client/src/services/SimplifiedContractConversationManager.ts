import { DocumentCharacteristics } from '@/services/DocumentAnalyzer';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ConversationAction[];
}

export interface ConversationAction {
  id: string;
  label: string;
  action: string;
  data?: any;
}

export interface ConversationState {
  messages: ConversationMessage[];
  currentQuestion?: string;
  documentAnalysis?: DocumentCharacteristics;
  userGoal?: string;
  selectedProcessingTypes: string[];
  isComplete: boolean;
  useCase?: string;
  configuration?: Record<string, any>;
  conversationStep?: string;
  multimodalPreferences?: {
    hasImages?: boolean;
    imageProcessing?: boolean;
    semanticChunking?: boolean;
  };
  triggerProcessing?: boolean;
}

export class SimplifiedContractConversationManager {
  private static instance: SimplifiedContractConversationManager;
  
  private constructor() {}

  static getInstance(): SimplifiedContractConversationManager {
    if (!SimplifiedContractConversationManager.instance) {
      SimplifiedContractConversationManager.instance = new SimplifiedContractConversationManager();
    }
    return SimplifiedContractConversationManager.instance;
  }

  startConversation(documentAnalysis: DocumentCharacteristics): ConversationState {
    // Turn 1: Initial Understanding
    const welcomeMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'assistant',
      content: `I've identified this as a contract document. Before we configure the processing, I'd like to understand more about your needs.`,
      timestamp: new Date(),
      actions: []
    };
    return {
      messages: [welcomeMessage],
      currentQuestion: welcomeMessage.content,
      documentAnalysis,
      selectedProcessingTypes: [],
      isComplete: false,
      conversationStep: 'initial_understanding'
    };
  }

  processUserMessage(message: string, state: ConversationState): ConversationState {
    const userMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    const newMessages = [...state.messages, userMessage];
    const currentStep = state.conversationStep || 'initial_understanding';
    let nextStep = currentStep;
    let responseMessage: ConversationMessage;

    // Handle action-based responses
    if (message.startsWith('action:')) {
      const actionData = JSON.parse(message.substring(7));
      return this.handleAction(actionData.action, actionData.data, state);
    }

    // Based on current step and user message, determine the next step and response
    switch (currentStep) {
      case 'initial_understanding':
        // Turn 2: Document Analysis
        nextStep = 'document_analysis';
        responseMessage = {
          id: this.generateId(),
          type: 'assistant',
          content: `I've analyzed your "${state.documentAnalysis?.documentName || 'Contract_Agreement.pdf'}" (${state.documentAnalysis?.pageCount || 42} pages) with terms, definitions, and tables. Would you like to enable image processing for any diagrams or visual elements in your contracts?`,
          timestamp: new Date(),
          actions: [
            {
              id: this.generateId(),
              label: 'Yes, enable image processing',
              action: 'enable_image_processing',
              data: { 
                hasImages: true, 
                imageProcessing: true,
                nextStep: 'processing_config'
              }
            },
            {
              id: this.generateId(),
              label: 'No, text processing only',
              action: 'disable_image_processing',
              data: { 
                hasImages: false, 
                imageProcessing: false,
                nextStep: 'processing_config'
              }
            }
          ]
        };
        break;
      case 'document_analysis':
        // Turn 3: Processing Configuration
        nextStep = 'processing_config';
        
        // Check if message mentions semantic chunking
        const hasSemantic = message.toLowerCase().includes('semantic chunking');
        
        // Enable both semantic chunking and image processing by default
        responseMessage = {
          id: this.generateId(),
          type: 'assistant',
          content: `Semantic chunking is enabled, preserving contract clauses and their relationships. ${state.multimodalPreferences?.imageProcessing ? 'Image processing activated for floor plans and drawings.' : 'Text-only processing configured.'} Your document is indexed with ${state.multimodalPreferences?.imageProcessing ? 'both' : 'these'} features.\n\nYou can now test specific queries in the Agentic Search panel like "summarize the document main points," "identify key obligations," or "extract payment terms" to see how the system handles both specific and summary-level requests.`,
          timestamp: new Date(),
          actions: []
        };
        
        // Update configuration with semantic chunking and advanced RAG features
        state.configuration = {
          ...state.configuration,
          rag: {
            enabled: true,
            method: 'semantic',
            chunking: true,
            vectorization: true, // Enable vectorization
            embeddings: true, // Enable embeddings for better semantic search
            multimodal: {
              imageCaption: state.multimodalPreferences?.imageProcessing || false,
              visualAnalysis: state.multimodalPreferences?.imageProcessing || false,
              ocr: state.multimodalPreferences?.imageProcessing || false,
              transcription: true // Enable audio transcription by default
            }
          }
        };
        
        // Add processing types
        state.selectedProcessingTypes = ['rag'];
        
        // Flag to trigger immediate processing
        state.triggerProcessing = true;
        break;
      case 'processing_config':
        // Turn 4: Configuration Editing Question
        if (message.toLowerCase().includes('edit') || message.toLowerCase().includes('configuration') || message.toLowerCase().includes('manual')) {
          nextStep = 'config_editing';
          responseMessage = {
            id: this.generateId(),
            type: 'assistant',
            content: `You can manually edit configurations via the left configuration pane. Click the "Settings" icon to adjust chunking parameters, image processing options, and advanced search settings. All changes will apply to future processing and can be saved as templates.`,
            timestamp: new Date(),
            actions: []
          };
        } 
        // Turn 5: Table Extraction Question
        else if (message.toLowerCase().includes('table') || message.toLowerCase().includes('extract')) {
          nextStep = 'table_extraction';
          responseMessage = {
            id: this.generateId(),
            type: 'assistant',
            content: `Yes, let me enable Intelligent Document Processing for you. This will extract structured data from tables in your contracts, making them searchable and exportable for analysis.`,
            timestamp: new Date(),
            actions: []
          };
          
          // Update configuration with IDP
          state.configuration = {
            ...state.configuration,
            idp: {
              enabled: true,
              textExtraction: true,
              classification: true,
              metadata: true,
              tables: true
            }
          };
          
          // Add processing types
          state.selectedProcessingTypes = [...state.selectedProcessingTypes, 'idp'];
          state.isComplete = true;
        } 
        // Unknown query - provide general help
        else {
          responseMessage = {
            id: this.generateId(),
            type: 'assistant',
            content: `Is there anything specific you'd like to know about the configuration or processing options? You can ask about table extraction, editing configurations, or start searching your documents right away.`,
            timestamp: new Date(),
            actions: [
              {
                id: this.generateId(),
                label: 'Extract tables from documents',
                action: 'quick_intent',
                data: 'Can I extract tables?'
              },
              {
                id: this.generateId(),
                label: 'Edit configuration manually',
                action: 'quick_intent',
                data: 'How can I edit configurations manually?'
              }
            ]
          };
        }
        break;
      case 'config_editing':
      case 'table_extraction':
        // Final state - any further questions get a completion message
        responseMessage = {
          id: this.generateId(),
          type: 'assistant',
          content: `Your configuration is complete and ready to use. Click the "Process Document" button in the left panel to apply these settings to your document.`,
          timestamp: new Date(),
          actions: []
        };
        state.isComplete = true;
        break;

      default:
        // Fallback for unknown state
        responseMessage = {
          id: this.generateId(),
          type: 'assistant',
          content: `I'm ready to help process your contract documents. What would you like to know?`,
          timestamp: new Date(),
          actions: []
        };
    }

    return {
      ...state,
      messages: [...newMessages, responseMessage],
      currentQuestion: responseMessage.content,
      conversationStep: nextStep
    };
  }

  handleAction(action: string, data: any, state: ConversationState): ConversationState {
    const newState = { ...state };
    
    switch (action) {
      case 'enable_image_processing':
      case 'disable_image_processing':
        newState.multimodalPreferences = { 
          hasImages: data.hasImages,
          imageProcessing: data.imageProcessing,
          semanticChunking: true  // Always enable semantic chunking
        };
        newState.conversationStep = data.nextStep;
        
        // Update configuration
        newState.configuration = {
          ...newState.configuration,
          rag: {
            enabled: true,
            method: 'semantic',
            chunking: true,
            multimodal: {
              imageCaption: data.imageProcessing,
              visualAnalysis: data.imageProcessing
            }
          }
        };
        
        // Add RAG to processing types
        newState.selectedProcessingTypes = ['rag'];
        break;
      
      case 'quick_intent':
        // Handle direct intents by simulating a user message
        return this.processUserMessage(data, state);
    }    
    // Get the next message based on the updated state
    const nextMessage = this.getNextMessage(newState);
    newState.messages = [...newState.messages, nextMessage];
    newState.currentQuestion = nextMessage.content;
    
    return newState;
  }
  
  private getNextMessage(state: ConversationState): ConversationMessage {
    const step = state.conversationStep || 'initial_understanding';
    
    switch (step) {
      case 'document_analysis':
        return {
          id: this.generateId(),
          type: 'assistant',
          content: `I've analyzed your "${state.documentAnalysis?.documentName || 'Contract_Agreement.pdf'}" (${state.documentAnalysis?.pageCount || 42} pages) with terms, definitions, and tables. Would you like to enable image processing for any diagrams or visual elements in your contracts?`,
          timestamp: new Date(),
          actions: [
            {
              id: this.generateId(),
              label: 'Yes, enable image processing',
              action: 'enable_image_processing',
              data: { 
                hasImages: true, 
                imageProcessing: true,
                nextStep: 'processing_config'
              }
            },
            {
              id: this.generateId(),
              label: 'No, text processing only',
              action: 'disable_image_processing',
              data: { 
                hasImages: false, 
                imageProcessing: false,
                nextStep: 'processing_config'
              }
            }
          ]
        };
        
      case 'processing_config':
        return {
          id: this.generateId(),
          type: 'assistant',
          content: `Semantic chunking is enabled, preserving contract clauses and their relationships. ${state.multimodalPreferences?.imageProcessing ? 'Image processing activated for floor plans and drawings.' : 'Text-only processing configured.'} Your document is indexed with ${state.multimodalPreferences?.imageProcessing ? 'both' : 'these'} features.\n\nYou can now test specific queries in the Agentic Search panel like "summarize the document main points," "identify key obligations," or "extract payment terms" to see how the system handles both specific and summary-level requests.`,
          timestamp: new Date(),
          actions: []
        };        
      default:
        return {
          id: this.generateId(),
          type: 'assistant',
          content: `I'm ready to help process your contract documents. What would you like to know?`,
          timestamp: new Date(),
          actions: []
        };
    }
  }

  generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  buildFinalConfiguration(state: ConversationState): any {
    // Always include RAG with semantic chunking
    const ragConfig = {
      enabled: true,
      method: 'semantic',
      chunking: true,
      vectorization: true,
      embeddings: true,
      multimodal: {
        imageCaption: state.multimodalPreferences?.imageProcessing || false,
        visualAnalysis: state.multimodalPreferences?.imageProcessing || false,
        ocr: state.multimodalPreferences?.imageProcessing || false,
        transcription: state.configuration?.rag?.multimodal?.transcription || true
      }
    };
    
    // Add IDP if requested
    const idpConfig = {
      enabled: state.selectedProcessingTypes.includes('idp'),
      textExtraction: true,
      classification: true,
      metadata: true,
      tables: true
    };
    
    return {
      configuration: {
        rag: ragConfig,
        idp: idpConfig
      },
      processingTypes: [
        'rag',
        ...(idpConfig.enabled ? ['idp'] : [])
      ],
      intent: true,
      triggerType: 'conversation',
      triggerProcessing: state.triggerProcessing,
      // Flag that this configuration is from the AI assistant
      source: 'ai_assistant',
      // Also enable all advanced processing by default
      allAdvancedProcessing: true
    };
  }

  confirmProcessing(state: ConversationState): ConversationState {
    const config = this.buildFinalConfiguration(state);
    
    const confirmationMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'assistant',
      content: `Your document is ready for processing with the following features:\n- Semantic chunking: Enabled\n- Image processing: ${state.multimodalPreferences?.imageProcessing ? 'Enabled' : 'Disabled'}\n- Table extraction: ${state.selectedProcessingTypes.includes('idp') ? 'Enabled' : 'Disabled'}`,
      timestamp: new Date(),
      actions: [
        {
          id: this.generateId(),
          label: 'Process Document',
          action: 'process_document',
          data: config
        }
      ]
    };    
    return {
      ...state,
      messages: [...state.messages, confirmationMessage],
      isComplete: true,
      configuration: config
    };
  }
}

export default SimplifiedContractConversationManager.getInstance();