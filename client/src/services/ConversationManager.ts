import { DocumentCharacteristics, ProcessingRecommendation } from '@/services/DocumentAnalyzer';

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
  conversationStep?: 'intro' | 'user_profile' | 'goals' | 'processing_selection' | 'multimodal_check' | 'audio_check' | 'visual_analysis_check' | 'kg_check' | 'confirmation';
  userProfile?: {
    role?: string;
    department?: string;
    experience?: string;
  };
  processingPreferences?: {
    urgency?: string;
    detailLevel?: string;
    primaryGoal?: string;
  };
  multimodalPreferences?: {
    hasImages?: boolean;
    hasAudio?: boolean;
    needsOCR?: boolean;
    visualAnalysis?: boolean;
    imageProcessing?: 'caption' | 'ocr' | 'both' | 'none';
  };
  kgPreferences?: {
    enabled?: boolean;
    entityTypes?: string | string[];
  };
  idpPreferences?: {
    enabled?: boolean;
    extractType?: 'structured' | 'metadata' | 'full';
  };
  highlightProcessButton?: boolean; // Flag to highlight the Process Document button
}

export interface ProcessingIntent {
  intent: string;
  processingTypes: ('rag' | 'kg' | 'idp')[];
  configuration: Record<string, any>;
  confidence: number;
}

export class ConversationManager {
  private static instance: ConversationManager;
  
  private intents: Map<string, ProcessingIntent> = new Map([
    // Sales use cases
    ['sales_proposals', {
      intent: 'sales_proposals',
      processingTypes: ['rag', 'idp', 'kg'],
      configuration: {
        rag: { 
          enabled: true, 
          chunking: true, 
          vectorization: true,
          multimodal: { imageCaption: true, ocr: true }
        },
        idp: { 
          enabled: true, 
          extractTables: true, 
          extractForms: true,
          textExtraction: true
        },
        kg: {
          enabled: true,
          entityExtraction: true,
          relationMapping: true
        }
      },
      confidence: 0.9
    }],
    ['sales_contracts', {
      intent: 'sales_contracts',
      processingTypes: ['rag', 'kg', 'idp'],
      configuration: {
        rag: { 
          enabled: true, 
          chunking: true, 
          vectorization: true,
          multimodal: { ocr: true }
        },
        kg: { 
          enabled: true, 
          entityExtraction: true, 
          relationMapping: true 
        },
        idp: {
          enabled: true,
          textExtraction: true,
          metadata: true
        }
      },
      confidence: 0.9
    }],
    
    // Service use cases
    ['service_tickets', {
      intent: 'service_tickets',
      processingTypes: ['rag', 'idp'],
      configuration: {
        rag: { 
          enabled: true, 
          chunking: true, 
          vectorization: true,
          multimodal: { transcription: true, ocr: true }
        },
        idp: { 
          enabled: true, 
          extractForms: true,
          classification: true
        }
      },
      confidence: 0.9
    }],
    ['customer_feedback', {
      intent: 'customer_feedback',
      processingTypes: ['rag', 'kg'],
      configuration: {
        rag: { 
          enabled: true, 
          chunking: true, 
          vectorization: true,
          multimodal: { transcription: true }
        },
        kg: { 
          enabled: true, 
          entityExtraction: true, 
          relationMapping: true,
          graphBuilding: true
        }
      },
      confidence: 0.9
    }],
    
    // Marketing use cases
    ['campaign_analytics', {
      intent: 'campaign_analytics',
      processingTypes: ['rag', 'idp'],
      configuration: {
        rag: { 
          enabled: true, 
          chunking: true, 
          vectorization: true,
          multimodal: { imageCaption: true, visualAnalysis: true }
        },
        idp: { 
          enabled: true, 
          extractTables: true,
          metadata: true
        }
      },
      confidence: 0.9
    }],
    ['content_library', {
      intent: 'content_library',
      processingTypes: ['rag', 'kg'],
      configuration: {
        rag: { 
          enabled: true, 
          chunking: true, 
          vectorization: true,
          multimodal: { imageCaption: true, ocr: true, visualAnalysis: true }
        },
        kg: { 
          enabled: true, 
          entityExtraction: true,
          graphBuilding: true
        }
      },
      confidence: 0.9
    }]
  ]);

  private conversationSteps = {
    intro: (docType: string) => ({
      message: `I've identified this as a ${docType} document. Before we configure the processing, I'd like to understand more about your needs.`,
      actions: [
        { label: 'Let\'s get started', action: 'next_step', data: { nextStep: 'user_profile' } }
      ]
    }),
    
    user_profile: () => ({
      message: 'First, could you tell me about your role in the organization?',
      actions: [
        { label: 'Sales Representative', action: 'set_role', data: { role: 'sales_rep', nextStep: 'department' } },
        { label: 'Sales Manager', action: 'set_role', data: { role: 'sales_manager', nextStep: 'department' } },
        { label: 'Customer Service Agent', action: 'set_role', data: { role: 'service_agent', nextStep: 'department' } },
        { label: 'Marketing Specialist', action: 'set_role', data: { role: 'marketing_specialist', nextStep: 'department' } },
        { label: 'Business Analyst', action: 'set_role', data: { role: 'business_analyst', nextStep: 'department' } }
      ]
    }),
    
    department: () => ({
      message: 'Which department are you working with?',
      actions: [
        { label: 'Sales/Business Development', action: 'set_department', data: { department: 'sales', nextStep: 'goals' } },
        { label: 'Customer Service/Support', action: 'set_department', data: { department: 'service', nextStep: 'goals' } },
        { label: 'Marketing/Communications', action: 'set_department', data: { department: 'marketing', nextStep: 'goals' } },
        { label: 'Operations/Analytics', action: 'set_department', data: { department: 'operations', nextStep: 'goals' } }
      ]
    }),
    
    /* experience step removed - now department goes directly to goals */
    // experience: () => ({ ... }),
    
    goals: () => ({
      message: 'What\'s your primary goal with this document?',
      actions: [
        { label: 'Quick information retrieval', action: 'set_goal', data: { goal: 'retrieval', nextStep: 'processing_selection' } },
        { label: 'Extract structured data', action: 'set_goal', data: { goal: 'extraction', nextStep: 'processing_selection' } },
        { label: 'Understand relationships', action: 'set_goal', data: { goal: 'relationships', nextStep: 'processing_selection' } },
        { label: 'Comprehensive analysis', action: 'set_goal', data: { goal: 'comprehensive', nextStep: 'processing_selection' } }
      ]
    }),
    
    /* urgency and detail_level steps removed - now goals goes directly to processing_selection */
    // urgency: () => ({ ... }),
    // detail_level: () => ({ ... }),
    
    processing_selection: (state: ConversationState) => {
      const recommendations = this.getProcessingRecommendations(state);
      return {
        message: 'Based on your needs, I recommend the following processing methods:',
        actions: recommendations.map(rec => ({
          label: rec.label,
          action: 'select_processing',
          data: { 
            ...rec.data, 
            nextStep: 'multimodal_check'  // Always go to multimodal check after processing selection
          }
        }))
      };
    },
    
    multimodal_check: () => ({
      message: 'Does your document contain images that need to be indexed or analyzed?',
      actions: [
        { label: 'Yes, it has images', action: 'set_has_images', data: { hasImages: true, nextStep: 'audio_check' } },
        { label: 'No images', action: 'set_has_images', data: { hasImages: false, nextStep: 'audio_check' } }
      ]
    }),
    
    audio_check: () => ({
      message: 'Are there any audio files or recordings that need transcription?',
      actions: [
        { label: 'Yes, audio transcription needed', action: 'set_has_audio', data: { hasAudio: true, nextStep: 'visual_analysis_check' } },
        { label: 'No audio content', action: 'set_has_audio', data: { hasAudio: false, nextStep: 'visual_analysis_check' } }
      ]
    }),
    
    visual_analysis_check: () => ({
      message: 'Would you like AI to analyze and describe visual content (charts, diagrams, etc.)?',
      actions: [
        { label: 'Yes, analyze visuals', action: 'set_visual_analysis', data: { visualAnalysis: true, nextStep: 'idp_check' } },
        { label: 'No visual analysis needed', action: 'set_visual_analysis', data: { visualAnalysis: false, nextStep: 'idp_check' } }
      ]
    }),
    
    kg_check: () => ({
      message: 'Would you like to extract entities and relationships to build a knowledge graph?',
      actions: [
        /* Special case to enable KG checkbox first then proceed */
        { label: 'Yes, all entities', action: 'process_directly', data: { idpEnabled: true, kgEnabled: true, entityTypes: 'all', extractType: 'full' } },
        { label: 'Yes, specific entities', action: 'set_kg_preferences', data: { kgEnabled: true, entityTypes: 'specific', nextStep: 'kg_entity_selection' } },
        { label: 'No graph needed', action: 'process_directly', data: { idpEnabled: true, kgEnabled: false, extractType: 'full' } }
      ]
    }),
    
    kg_entity_selection: () => ({
      message: 'Which types of entities should we extract?',
      actions: [
        { label: 'People & Orgs', action: 'process_directly', data: { idpEnabled: true, kgEnabled: true, entityTypes: ['person', 'organization'], extractType: 'full' } },
        { label: 'Products & Services', action: 'process_directly', data: { idpEnabled: true, kgEnabled: true, entityTypes: ['product', 'service'], extractType: 'full' } },
        { label: 'Locations & Events', action: 'process_directly', data: { idpEnabled: true, kgEnabled: true, entityTypes: ['location', 'event'], extractType: 'full' } },
        { label: 'All entities', action: 'process_directly', data: { idpEnabled: true, kgEnabled: true, entityTypes: ['all'], extractType: 'full' } }
      ]
    }),
    
    idp_check: () => ({
      message: 'What type of document data extraction do you need?',
      actions: [
        { label: 'Structured data', action: 'set_idp_preferences', data: { idpEnabled: true, extractType: 'structured', nextStep: 'kg_check' } },
        { label: 'Metadata', action: 'set_idp_preferences', data: { idpEnabled: true, extractType: 'metadata', nextStep: 'kg_check' } },
        { label: 'Full processing', action: 'set_idp_preferences', data: { idpEnabled: true, extractType: 'full', nextStep: 'kg_check' } },
        { label: 'No processing', action: 'set_idp_preferences', data: { idpEnabled: false, nextStep: 'kg_check' } }
      ]
    }),
    
    confirmation: (state: ConversationState) => {
      const config = this.buildFinalConfiguration(state);
      return {
        message: 'Your document is ready to be processed with the selected settings.',
        actions: [
          { 
            label: 'Process Document', 
            action: 'confirm_processing', 
            data: config 
          },
          { 
            label: 'Modify Configuration', 
            action: 'modify_processing', 
            data: config 
          }
        ]
      };
    }
  };
  
  private questions: Map<string, string[]> = new Map([
    // Sales-related documents
    ['proposal', [
      'I see this is a sales proposal. Which CRM workflow would you like to optimize?',
      'Would you like to extract product details and pricing for opportunity tracking, or analyze competitor mentions?',
      'Should I set up multimodal processing to capture images and diagrams from the proposal?'
    ]],
    ['contract', [
      'I\'ve identified this as a sales contract. What CRM process should I configure?',
      'Would you like to extract key terms, parties, and obligations for deal tracking?',
      'Should I enable entity extraction to link this contract to accounts and contacts in your CRM?'
    ]],
    ['quote', [
      'This appears to be a sales quote. How can I help integrate it with your CRM?',
      'Would you like to extract pricing tiers and product configurations for opportunity management?',
      'Should I analyze discount patterns and approval workflows mentioned in the quote?'
    ]],
    
    // Service-related documents
    ['ticket', [
      'This looks like a support ticket. What service workflow should I optimize?',
      'Would you like to extract issue details and customer information for case management?',
      'Should I enable audio transcription for any attached call recordings or voice notes?'
    ]],
    ['sla', [
      'I\'ve detected an SLA document. How should I process it for your service team?',
      'Would you like to extract service levels and response times for automated escalations?',
      'Should I map customer entities to monitor compliance across accounts?'
    ]],
    ['feedback', [
      'This appears to be customer feedback. What insights are you looking for?',
      'Would you like sentiment analysis and entity extraction to link feedback to accounts?',
      'Should I enable transcription for any audio feedback or survey responses?'
    ]],
    
    // Marketing-related documents
    ['campaign', [
      'I see this is campaign material. Which marketing workflow should I support?',
      'Would you like to extract campaign metrics, channels, and target segments?',
      'Should I enable image captioning and visual analysis for marketing assets?'
    ]],
    ['analytics', [
      'This looks like marketing analytics. What insights do you need for your CRM?',
      'Would you like to extract KPIs and conversion data for campaign attribution?',
      'Should I analyze tables and charts to update lead scoring models?'
    ]],
    ['content', [
      'I\'ve identified marketing content. How should I process it for your content library?',
      'Would you like OCR for infographics and visual analysis for brand assets?',
      'Should I extract topics and entities to improve content recommendation?'
    ]],
    
    // General CRM documents
    ['report', [
      'This appears to be a CRM report. What insights are you looking for?',
      'Would you like to extract metrics and KPIs for dashboard automation?',
      'Should I identify entities and relationships to update your CRM data model?'
    ]],
    ['email', [
      'I see this is an email communication. How should I process it for your CRM?',
      'Would you like to extract action items and link them to relevant accounts?',
      'Should I analyze sentiment and intent for lead scoring or case routing?'
    ]],
    ['form', [
      'This is a form submission. Which CRM process should I optimize?',
      'Would you like to extract form fields for automatic lead/contact creation?',
      'Should I classify the form type to route it to the right team?'
    ]],
    ['unknown', [
      'I\'ve analyzed your document. Which CRM workflow would you like to enhance?',
      'Are you looking to improve sales processes, service efficiency, or marketing insights?',
      'What\'s your main goal - lead generation, customer service, or data enrichment?'
    ]]
  ]);

  private constructor() {}

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  startConversation(documentAnalysis: DocumentCharacteristics): ConversationState {
    const documentType = documentAnalysis.documentType;
    console.log('ConversationManager: Starting conversation for', documentType, 'document');
    
    // Get the intro step
    const introStep = this.conversationSteps.intro(documentType);
    
    const welcomeMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'assistant',
      content: introStep.message,
      timestamp: new Date(),
      actions: introStep.actions.map(action => ({
        id: this.generateId(),
        label: action.label,
        action: action.action,
        data: action.data
      }))
    };

    console.log('ConversationManager: Initial message actions:', welcomeMessage.actions);

    return {
      messages: [welcomeMessage],
      currentQuestion: introStep.message,
      documentAnalysis,
      selectedProcessingTypes: [],
      isComplete: false,
      conversationStep: 'intro',
      userProfile: {},
      processingPreferences: {}
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

    // Handle action-based responses
    if (message.startsWith('action:')) {
      const actionData = JSON.parse(message.substring(7));
      return this.handleAction(actionData.action, actionData.data, state);
    }

    // Check for direct intent
    const intent = this.detectIntent(message);
    
    if (intent && state.conversationStep !== 'intro') {
      // User has expressed a clear intent
      const processingConfig = this.mapIntentToConfiguration(intent);
      const confirmationMessage: ConversationMessage = {
        id: this.generateId(),
        type: 'assistant',
        content: this.generateConfirmationMessage(intent),
        timestamp: new Date(),
        actions: [{
          id: this.generateId(),
          label: 'Confirm',
          action: 'confirm_processing',
          data: processingConfig
        }, {
          id: this.generateId(),
          label: 'Modify',
          action: 'modify_processing',
          data: processingConfig
        }]
      };

      return {
        ...state,
        messages: [...newMessages, confirmationMessage],
        userGoal: message,
        selectedProcessingTypes: intent.processingTypes,
        isComplete: false,
        conversationStep: 'confirmation'
      };
    } else {
      // Continue with the conversation flow
      const nextMessage = this.getNextStepMessage(state);
      return {
        ...state,
        messages: [...newMessages, nextMessage],
        currentQuestion: nextMessage.content
      };
    }
  }


  private detectIntent(message: string): ProcessingIntent | null {
    const lowerMessage = message.toLowerCase();

    // Sales intents
    if ((lowerMessage.includes('proposal') || lowerMessage.includes('opportunity')) && 
        (lowerMessage.includes('product') || lowerMessage.includes('pricing') || lowerMessage.includes('competitor'))) {
      return this.intents.get('sales_proposals')!;
    }
    
    if ((lowerMessage.includes('contract') || lowerMessage.includes('deal')) && 
        (lowerMessage.includes('terms') || lowerMessage.includes('parties') || lowerMessage.includes('obligations'))) {
      return this.intents.get('sales_contracts')!;
    }
    
    // Service intents
    if ((lowerMessage.includes('ticket') || lowerMessage.includes('support') || lowerMessage.includes('case')) && 
        (lowerMessage.includes('issue') || lowerMessage.includes('customer') || lowerMessage.includes('transcription'))) {
      return this.intents.get('service_tickets')!;
    }
    
    if ((lowerMessage.includes('feedback') || lowerMessage.includes('sentiment')) && 
        (lowerMessage.includes('customer') || lowerMessage.includes('account') || lowerMessage.includes('analyze'))) {
      return this.intents.get('customer_feedback')!;
    }
    
    // Marketing intents
    if ((lowerMessage.includes('campaign') || lowerMessage.includes('marketing')) && 
        (lowerMessage.includes('metrics') || lowerMessage.includes('analytics') || lowerMessage.includes('visual'))) {
      return this.intents.get('campaign_analytics')!;
    }
    
    if ((lowerMessage.includes('content') || lowerMessage.includes('library')) && 
        (lowerMessage.includes('ocr') || lowerMessage.includes('image') || lowerMessage.includes('brand'))) {
      return this.intents.get('content_library')!;
    }
    
    // General patterns
    if (lowerMessage.includes('multimodal') || lowerMessage.includes('image') || lowerMessage.includes('audio')) {
      // Determine context for multimodal
      if (lowerMessage.includes('sales') || lowerMessage.includes('proposal')) {
        return this.intents.get('sales_proposals')!;
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('content')) {
        return this.intents.get('content_library')!;
      } else if (lowerMessage.includes('service') || lowerMessage.includes('support')) {
        return this.intents.get('service_tickets')!;
      }
    }
    
    // Fallback patterns
    if (lowerMessage.includes('extract') || lowerMessage.includes('analyze') || lowerMessage.includes('process')) {
      if (lowerMessage.includes('sales') || lowerMessage.includes('opportunity') || lowerMessage.includes('deal')) {
        return this.intents.get('sales_proposals')!;
      } else if (lowerMessage.includes('service') || lowerMessage.includes('support') || lowerMessage.includes('ticket')) {
        return this.intents.get('service_tickets')!;
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('campaign')) {
        return this.intents.get('campaign_analytics')!;
      }
    }

    return null;
  }

  private mapIntentToConfiguration(intent: ProcessingIntent): any {
    return {
      processingTypes: intent.processingTypes,
      configuration: intent.configuration,
      confidence: intent.confidence,
      intent: intent,
      // Add processing trigger information
      triggerType: 'conversation',
      timestamp: new Date()
    };
  }

  private generateConfirmationMessage(intent: ProcessingIntent): string {
    return 'Document processing has been configured and is ready to start.';
  }

  private generateFollowUpQuestion(userMessage: string, state: ConversationState): ConversationMessage {
    const documentType = state.documentAnalysis?.documentType || 'unknown';
    const questions = this.questions.get(documentType) || this.questions.get('unknown')!;
    
    // Determine which question to ask based on conversation context
    const questionIndex = Math.min(state.messages.filter(m => m.type === 'assistant').length, questions.length - 1);
    
    return {
      id: this.generateId(),
      type: 'assistant',
      content: questions[questionIndex],
      timestamp: new Date(),
      actions: this.generateSuggestedActions(documentType)
    };
  }

  private generateSuggestedActions(documentType: string): ConversationAction[] {
    const actions: ConversationAction[] = [];

    switch (documentType) {
      case 'proposal':
        actions.push({
          id: this.generateId(),
          label: 'Extract for opportunity tracking',
          action: 'quick_intent',
          data: 'Extract product details and pricing for opportunity tracking'
        });
        actions.push({
          id: this.generateId(),
          label: 'Analyze competitors',
          action: 'quick_intent',
          data: 'Analyze competitor mentions in the proposal'
        });
        actions.push({
          id: this.generateId(),
          label: 'Process visual content',
          action: 'quick_intent',
          data: 'Enable multimodal processing for images and diagrams'
        });
        break;
        
      case 'contract':
        actions.push({
          id: this.generateId(),
          label: 'Extract contract terms',
          action: 'quick_intent',
          data: 'Extract key terms and parties for deal tracking'
        });
        actions.push({
          id: this.generateId(),
          label: 'Link to CRM entities',
          action: 'quick_intent',
          data: 'Enable entity extraction to link contract to accounts'
        });
        break;
        
      case 'ticket':
      case 'support':
        actions.push({
          id: this.generateId(),
          label: 'Extract for case management',
          action: 'quick_intent',
          data: 'Extract issue details and customer information for case management'
        });
        actions.push({
          id: this.generateId(),
          label: 'Transcribe audio',
          action: 'quick_intent',
          data: 'Enable audio transcription for call recordings'
        });
        break;
        
      case 'feedback':
        actions.push({
          id: this.generateId(),
          label: 'Analyze sentiment',
          action: 'quick_intent',
          data: 'Sentiment analysis and entity extraction to link feedback to accounts'
        });
        actions.push({
          id: this.generateId(),
          label: 'Process audio feedback',
          action: 'quick_intent',
          data: 'Enable transcription for audio feedback'
        });
        break;
        
      case 'campaign':
      case 'marketing':
        actions.push({
          id: this.generateId(),
          label: 'Extract campaign metrics',
          action: 'quick_intent',
          data: 'Extract campaign metrics and target segments'
        });
        actions.push({
          id: this.generateId(),
          label: 'Analyze visual content',
          action: 'quick_intent',
          data: 'Enable image captioning and visual analysis for marketing assets'
        });
        break;
        
      case 'form':
        actions.push({
          id: this.generateId(),
          label: 'Create lead/contact',
          action: 'quick_intent',
          data: 'Extract form fields for automatic lead creation'
        });
        actions.push({
          id: this.generateId(),
          label: 'Route to team',
          action: 'quick_intent',
          data: 'Classify form type to route to right team'
        });
        break;
      default:
        actions.push({
          id: this.generateId(),
          label: 'Search document',
          action: 'quick_intent',
          data: 'I want to find answers to questions about the tables in this document'
        });
        actions.push({
          id: this.generateId(),
          label: 'Extract data',
          action: 'quick_intent',
          data: 'I need to extract all the form fields into a structured format'
        });
        actions.push({
          id: this.generateId(),
          label: 'Analyze relationships',
          action: 'quick_intent',
          data: 'I want to understand the relationships between entities'
        });
    }

    return actions;
  }

  private handleAction(action: string, data: any, state: ConversationState): ConversationState {
    const newState = { ...state };
    console.log('ConversationManager: Handling action', action, 'with data', data, 'current step:', state.conversationStep);
    
    switch (action) {
      case 'next_step':
        console.log('ConversationManager: Moving from', state.conversationStep, 'to', data.nextStep);
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_role':
        newState.userProfile = { ...newState.userProfile, role: data.role };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_department':
        newState.userProfile = { ...newState.userProfile, department: data.department };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_experience':
        newState.userProfile = { ...newState.userProfile, experience: data.experience };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_goal':
        newState.processingPreferences = { ...newState.processingPreferences, primaryGoal: data.goal };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_urgency':
        newState.processingPreferences = { ...newState.processingPreferences, urgency: data.urgency };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_detail':
        newState.processingPreferences = { ...newState.processingPreferences, detailLevel: data.detail };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'select_processing':
        console.log('ConversationManager: select_processing action with data:', data);
        console.log('ConversationManager: processingTypes:', data.processingTypes);
        console.log('ConversationManager: configuration:', data.configuration);
        newState.selectedProcessingTypes = data.processingTypes;
        newState.configuration = data.configuration;
        newState.conversationStep = data.nextStep;
        console.log('ConversationManager: Updated conversationStep to:', newState.conversationStep);
        break;
        
      case 'set_has_images':
        newState.multimodalPreferences = { ...newState.multimodalPreferences, hasImages: data.hasImages };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_has_audio':
        newState.multimodalPreferences = { ...newState.multimodalPreferences, hasAudio: data.hasAudio };
        newState.conversationStep = data.nextStep;
        break;
        
      // The set_needs_ocr case has been removed as we no longer need this step
        
      case 'set_visual_analysis':
        newState.multimodalPreferences = { ...newState.multimodalPreferences, visualAnalysis: data.visualAnalysis };
        newState.conversationStep = data.nextStep;
        break;
        
      // The set_image_processing case has been removed as we no longer need this step
        
      case 'set_kg_preferences':
        newState.kgPreferences = { enabled: data.kgEnabled, entityTypes: data.entityTypes };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_kg_entities':
        newState.kgPreferences = { ...newState.kgPreferences, entityTypes: data.entities };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_idp_preferences':
        console.log('ConversationManager: Setting IDP preferences:', { enabled: data.idpEnabled, extractType: data.extractType });
        newState.idpPreferences = { enabled: data.idpEnabled, extractType: data.extractType };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'process_directly':
        // Save both IDP and KG preferences if provided
        newState.idpPreferences = { enabled: data.idpEnabled, extractType: data.extractType };
        
        // Save KG preferences if provided
        if (data.kgEnabled !== undefined) {
          newState.kgPreferences = { 
            enabled: data.kgEnabled, 
            entityTypes: data.entityTypes || 'all' 
          };
        }
        
        // Generate the final configuration
        const config = this.buildFinalConfiguration(newState);
        
        // Skip to completion message with a tooltip guidance to the Process Document button
        const completeMessage: ConversationMessage = {
          id: this.generateId(),
          type: 'assistant',
          content: 'Configuration complete! ✅ Now click the highlighted "Process Document" button on the left panel to start processing your document. →',
          timestamp: new Date(),
          actions: [{
            id: this.generateId(),
            label: 'Go to Process Document button',
            action: 'highlight_process_button',
            data: {}
          }]  // Add a clear action to direct the user
        };
        
        // Mark the conversation as complete and pass configuration to be available
        newState.isComplete = true;
        newState.configuration = config;
        newState.highlightProcessButton = true; // Signal to highlight the Process Document button
        
        // Add the completion message
        return {
          ...newState,
          messages: [...newState.messages, completeMessage]
        };
    }
    
    // Get the next message based on the new state
    console.log('ConversationManager: Getting next message for step:', newState.conversationStep);
    const nextMessage = this.getNextStepMessage(newState);
    console.log('ConversationManager: Next message:', nextMessage.content);
    console.log('ConversationManager: Next message actions:', nextMessage.actions.map(a => a.label));
    newState.messages = [...newState.messages, nextMessage];
    newState.currentQuestion = nextMessage.content;
    
    return newState;
  }
  
  private getNextStepMessage(state: ConversationState): ConversationMessage {
    const stepName = state.conversationStep || 'intro';
    let stepFunction = this.conversationSteps[stepName as keyof typeof this.conversationSteps];
    
    if (!stepFunction) {
      return this.generateFallbackMessage(state);
    }
    
    let step: any;
    if (typeof stepFunction === 'function') {
      // Check if it needs specific arguments
      if (stepName === 'intro') {
        step = (stepFunction as any)(state.documentAnalysis?.documentType || 'document');
      } else if (stepName === 'processing_selection' || stepName === 'confirmation') {
        step = (stepFunction as any)(state);
      } else {
        step = (stepFunction as any)();
      }
    } else {
      step = stepFunction;
    }
    
    return {
      id: this.generateId(),
      type: 'assistant',
      content: step.message,
      timestamp: new Date(),
      actions: step.actions.map((action: any) => ({
        id: this.generateId(),
        label: action.label,
        action: action.action,
        data: action.data
      }))
    };
  }
  
  private getProcessingRecommendations(state: ConversationState): any[] {
    const recommendations = [];
    const goal = state.processingPreferences?.primaryGoal;
    const urgency = state.processingPreferences?.urgency;
    const detail = state.processingPreferences?.detailLevel;
    
    console.log('ConversationManager: Getting recommendations for goal:', goal, 'urgency:', urgency, 'detail:', detail);
    
    // RAG recommendation
    if (goal === 'retrieval' || goal === 'comprehensive') {
      recommendations.push({
        label: 'RAG Search',
        data: {
          processingTypes: ['rag'],
          configuration: {
            rag: {
              enabled: true,
              chunking: true,
              vectorization: true,
              multimodal: urgency === 'high' ? { ocr: true } : { ocr: true, imageCaption: true }
            }
          }
        }
      });
    }
    
    // IDP recommendation
    if (goal === 'extraction' || goal === 'comprehensive') {
      recommendations.push({
        label: 'Document Processing',
        data: {
          processingTypes: ['idp'],
          configuration: {
            idp: {
              enabled: true,
              textExtraction: true,
              classification: detail !== 'overview',
              metadata: true,
              tables: true
            }
          }
        }
      });
    }
    
    // KG recommendation
    if (goal === 'relationships' || goal === 'comprehensive') {
      recommendations.push({
        label: 'Knowledge Graph',
        data: {
          processingTypes: ['kg'],
          configuration: {
            kg: {
              enabled: true,
              entityExtraction: true,
              relationMapping: true,
              graphBuilding: detail === 'comprehensive'
            }
          }
        }
      });
    }
    
    // Combined recommendation
    if (goal === 'comprehensive' && urgency !== 'high') {
      recommendations.push({
        label: 'All Processing Methods',
        data: {
          processingTypes: ['rag', 'idp', 'kg'],
          configuration: {
            rag: { enabled: true, chunking: true, vectorization: true, multimodal: { ocr: true, imageCaption: true, transcription: true } },
            idp: { enabled: true, textExtraction: true, classification: true, metadata: true },
            kg: { enabled: true, entityExtraction: true, relationMapping: true, graphBuilding: true }
          }
        }
      });
    }
    
    // Always provide at least one recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        label: 'RAG Search',
        data: {
          processingTypes: ['rag'],
          configuration: {
            rag: { 
              enabled: true, 
              chunking: true, 
              vectorization: true,
              multimodal: {
                transcription: false,
                ocr: false,
                imageCaption: false,
                visualAnalysis: false
              }
            }
          }
        }
      });
    }
    
    console.log('ConversationManager: Returning', recommendations.length, 'recommendations');
    return recommendations;
  }
  
  private generateFallbackMessage(state: ConversationState): ConversationMessage {
    return {
      id: this.generateId(),
      type: 'assistant',
      content: 'I\'m ready to help you process this document. What would you like to do?',
      timestamp: new Date(),
      actions: this.generateSuggestedActions(state.documentAnalysis?.documentType || 'unknown')
    };
  }

  private buildFinalConfiguration(state: ConversationState): any {
    const baseConfig = state.configuration || {};
    const multimodal = state.multimodalPreferences || {};
    const kg = state.kgPreferences || {};
    const idp = state.idpPreferences || {};
    
    console.log('buildFinalConfiguration: state.selectedProcessingTypes:', state.selectedProcessingTypes);
    console.log('buildFinalConfiguration: baseConfig:', baseConfig);
    
    // Build RAG configuration with multimodal preferences
    const ragConfig = {
      ...baseConfig.rag,
      enabled: state.selectedProcessingTypes.includes('rag') || baseConfig.rag?.enabled || false,
      multimodal: {
        transcription: multimodal.hasAudio || false,
        // Auto-enable OCR if images are present, as we removed the specific OCR question
        ocr: multimodal.hasImages || false,
        imageCaption: multimodal.hasImages || false,
        visualAnalysis: multimodal.visualAnalysis || false
      }
    };
    
    // Build KG configuration
    const kgConfig = {
      ...baseConfig.kg,
      enabled: state.selectedProcessingTypes.includes('kg') || kg.enabled || baseConfig.kg?.enabled || false,
      entityExtraction: kg.enabled || baseConfig.kg?.entityExtraction || false,
      relationMapping: kg.enabled || baseConfig.kg?.relationMapping || false,
      entityTypes: kg.entityTypes || baseConfig.kg?.entityTypes || 'all'
    };
    
    // Build IDP configuration
    const idpConfig = {
      ...baseConfig.idp,
      enabled: state.selectedProcessingTypes.includes('idp') || idp.enabled || baseConfig.idp?.enabled || false,
      textExtraction: idp.enabled || baseConfig.idp?.textExtraction || false,
      classification: idp.extractType === 'metadata' || idp.extractType === 'full' || baseConfig.idp?.classification || false,
      metadata: idp.extractType === 'metadata' || idp.extractType === 'full' || baseConfig.idp?.metadata || false,
      tables: idp.extractType === 'structured' || idp.extractType === 'full' || baseConfig.idp?.tables || false,
      formFields: idp.extractType === 'structured' || idp.extractType === 'full' || baseConfig.idp?.formFields || false
    };
    
    return {
      configuration: {
        rag: ragConfig,
        kg: kgConfig,
        idp: idpConfig
      },
      processingTypes: [
        ...(ragConfig.enabled ? ['rag'] : []),
        ...(kgConfig.enabled ? ['kg'] : []),
        ...(idpConfig.enabled ? ['idp'] : [])
      ],
      userProfile: state.userProfile,
      processingPreferences: state.processingPreferences,
      multimodalPreferences: state.multimodalPreferences,
      kgPreferences: state.kgPreferences,
      idpPreferences: state.idpPreferences,
      intent: true,
      triggerType: 'conversation'
    };
  }

  confirmProcessing(state: ConversationState, data: any): ConversationState {
    const config = this.buildFinalConfiguration(state);
    
    // Simplify the summary to a direct message
    let summary = 'Document processing configured and ready.';
    
    // Add confirmation message with Process Document button
    const confirmationMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'assistant',
      content: summary,
      timestamp: new Date(),
      actions: [
        {
          id: this.generateId(),
          label: 'Process Document',
          action: 'process_document',
          data: config
        },
        {
          id: this.generateId(),
          label: 'Modify Configuration',
          action: 'review_config',
          data: config
        }
      ]
    };
    
    console.log('ConversationManager: confirmProcessing returning config:', config);
    console.log('ConversationManager: config.configuration:', config.configuration);
    
    return {
      ...state,
      messages: [...state.messages, confirmationMessage],
      isComplete: true,
      configuration: config
    };
  }

  generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to get processing configuration from state
  getProcessingConfiguration(state: ConversationState): any {
    const intent = state.userGoal ? this.detectIntent(state.userGoal) : null;
    if (intent) {
      return this.mapIntentToConfiguration(intent);
    }
    return null;
  }
}

export default ConversationManager.getInstance();