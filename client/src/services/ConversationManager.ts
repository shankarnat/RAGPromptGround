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
  conversationStep?: 'intro' | 'user_profile' | 'department' | 'vehicle_info' | 'goals' | 'processing_selection' | 'multimodal_check' | 'visual_analysis_check' | 'idp_check' | 'audio_check' | 'kg_check' | 'confirmation' | 'qa_testing' | 'recommendations' | 'recommendation_applied' | 'results_validation';
  userProfile?: {
    role?: string;
    department?: string;
    experience?: string;
  };
  vehicleInfo?: {
    year?: string;
    make?: string;
    model?: string;
    vin?: string;
    documentType?: string;
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
    extractType?: 'structured' | 'metadata' | 'full' | 'automotive';
    automotiveOptions?: {
      extractVIN?: boolean;
      extractPartNumbers?: boolean;
      extractTorqueSpecs?: boolean;
      extractServiceIntervals?: boolean;
    };
  };
  qaTestingEnabled?: boolean;
  qaTestResults?: {
    questionsAnswered?: number;
    correctAnswers?: number;
    confidence?: number;
    testType?: string;
    details?: Array<{
      question: string;
      answer: string;
      isCorrect: boolean;
      confidence: number;
      sources?: string[];
    }>;
  };
  highlightProcessButton?: boolean; // Flag to highlight the Process Document button
  recommendationType?: string; // Type of recommendation applied
  recommendationDescription?: string; // Description of the applied recommendation
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
    // Automotive service use cases
    ['service_manual', {
      intent: 'service_manual',
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
          textExtraction: true,
          automotiveExtraction: true
        },
        kg: {
          enabled: true,
          entityExtraction: true,
          relationMapping: true,
          entityTypes: ['component', 'procedure', 'specification']
        }
      },
      confidence: 0.9
    }],
    ['parts_catalog', {
      intent: 'parts_catalog',
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
    
    // Automotive diagnostic use cases
    ['diagnostic_procedures', {
      intent: 'diagnostic_procedures',
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
    ['technical_bulletins', {
      intent: 'technical_bulletins',
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
    
    // Automotive Q&A use cases
    ['specification_lookup', {
      intent: 'specification_lookup',
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
    ['maintenance_schedules', {
      intent: 'maintenance_schedules',
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
      message: `I've analyzed this ${docType} and detected key content elements including technical specifications, parts information, and service procedures. I'm optimized to understand automotive documents like service manuals, parts catalogs, and technical bulletins. Type "analyze automotive data" or just click below to configure the optimal automotive intelligence extraction.`,
      actions: [
        { label: 'Let\'s get started', action: 'next_step', data: { nextStep: 'user_profile' } }
      ]
    }),
    
    user_profile: () => ({
      message: "Which automotive role will be using this analysis? Automotive document processing can be tailored to different roles and their specific needs.",
      actions: [
        { label: 'Service Technician', action: 'set_role', data: { role: 'service_technician', nextStep: 'department' } },
        { label: 'Parts Manager', action: 'set_role', data: { role: 'parts_manager', nextStep: 'department' } },
        { label: 'Technical Writer', action: 'set_role', data: { role: 'technical_writer', nextStep: 'department' } },
        { label: 'Quality Engineer', action: 'set_role', data: { role: 'quality_engineer', nextStep: 'department' } },
        { label: 'Fleet Manager', action: 'set_role', data: { role: 'fleet_manager', nextStep: 'department' } }
      ]
    }),
    
    department: () => ({
      message: 'Which automotive function or department will be leveraging this analysis? Different teams have specialized needs for document processing and intelligence extraction.',
      actions: [
        { label: 'Service Department', action: 'set_department', data: { department: 'service', nextStep: 'vehicle_info' } },
        { label: 'Parts Department', action: 'set_department', data: { department: 'parts', nextStep: 'vehicle_info' } },
        { label: 'Technical Publications', action: 'set_department', data: { department: 'tech_pubs', nextStep: 'vehicle_info' } },
        { label: 'Quality Assurance', action: 'set_department', data: { department: 'quality', nextStep: 'vehicle_info' } },
        { label: 'Fleet Operations', action: 'set_department', data: { department: 'fleet', nextStep: 'vehicle_info' } }
      ]
    }),
    
    vehicle_info: () => ({
      message: 'To provide the most accurate analysis, please provide vehicle information. You can enter a VIN for automatic detection or manually select the vehicle details.',
      actions: [
        { label: 'Enter VIN', action: 'request_vin_input', data: { nextStep: 'goals' } },
        { label: '2025 Honda Accord', action: 'set_vehicle', data: { year: '2025', make: 'Honda', model: 'Accord', nextStep: 'goals' } },
        { label: '2025 Honda CR-V', action: 'set_vehicle', data: { year: '2025', make: 'Honda', model: 'CR-V', nextStep: 'goals' } },
        { label: '2025 Acura MDX', action: 'set_vehicle', data: { year: '2025', make: 'Acura', model: 'MDX', nextStep: 'goals' } },
        { label: 'Other Honda/Acura Model', action: 'request_vehicle_input', data: { nextStep: 'goals' } }
      ]
    }),
    
    /* experience step removed - now department goes directly to goals */
    // experience: () => ({ ... }),
    
    goals: () => ({
      message: 'What automotive insights do you need to extract from this document? Your selection will optimize how we process the technical data.',
      actions: [
        { label: 'Technical Specification Search', action: 'set_goal', data: { goal: 'retrieval', nextStep: 'processing_selection' } },
        { label: 'Extract Parts & Service Data', action: 'set_goal', data: { goal: 'extraction', nextStep: 'processing_selection' } },
        { label: 'Map Component Relationships', action: 'set_goal', data: { goal: 'relationships', nextStep: 'processing_selection' } },
        { label: 'Comprehensive Technical Analysis', action: 'set_goal', data: { goal: 'comprehensive', nextStep: 'processing_selection' } }
      ]
    }),
    
    /* urgency and detail_level steps removed - now goals goes directly to processing_selection */
    // urgency: () => ({ ... }),
    // detail_level: () => ({ ... }),
    
    processing_selection: (state: ConversationState) => {
      const recommendations = this.getProcessingRecommendations(state);
      
      // Map the technical recommendation labels to more user-friendly automotive terms
      const userFriendlyLabels: Record<string, string> = {
        'RAG Search': 'Enable Technical Search & Retrieval',
        'Document Processing': 'Enable Automotive Data Extraction',
        'Knowledge Graph': 'Enable Component Relationship Mapping',
        'All Processing Methods': 'Enable Comprehensive Technical Analysis'
      };
      
      return {
        message: 'Based on your automotive analysis requirements, I recommend these specialized processing methods. When you approve, I\'ll create a technical intelligence index that allows you to search, analyze, and extract insights from this document. Does this configuration look appropriate for your needs?',
        actions: recommendations.map(rec => ({
          label: userFriendlyLabels[rec.label as string] || rec.label, // Use the user-friendly label if available
          action: 'select_processing',
          data: { 
            ...rec.data, 
            nextStep: 'multimodal_check'  // Always go to multimodal check after processing selection
          }
        }))
      };
    },
    
    multimodal_check: () => ({
      message: 'I\'ve detected that your automotive document contains diagrams, schematics, and technical illustrations. Would you like me to analyze these visual elements to extract additional technical insights?',
      actions: [
        { label: 'Yes, analyze technical diagrams', action: 'set_has_images', data: { hasImages: true, nextStep: 'visual_analysis_check' } },
        { label: 'No, process text content only', action: 'set_has_images', data: { hasImages: false, nextStep: 'visual_analysis_check' } }
      ]
    }),
    
    audio_check: () => ({
      message: 'Great! Have you tried our playground to evaluate and test technical content understanding, search functionality, and document structure analysis? It provides hands-on experience with your configured automotive intelligence.',
      actions: [
        { label: 'Yes, I\'ll explore the technical insights', action: 'highlight_playground', data: { nextStep: 'confirmation' } }
      ]
    }),
    
    visual_analysis_check: () => ({
      message: 'Would you like AI to interpret wiring diagrams, analyze component schematics, and extract insights from technical illustrations in your document?',
      actions: [
        { label: 'Yes, analyze technical visualizations', action: 'set_visual_analysis', data: { visualAnalysis: true, nextStep: 'idp_check' } },
        { label: 'No, focus on textual technical data', action: 'set_visual_analysis', data: { visualAnalysis: false, nextStep: 'idp_check' } }
      ]
    }),
    
    kg_check: () => ({
      message: 'You can explore additional configuration options in the left panel for index and document extraction settings. Would you like to check those options now?',
      actions: [
        { label: 'Yes, show me the configuration panel', action: 'highlight_process_button', data: { nextStep: 'confirmation' } },
        { label: 'Sounds good, I\'ll check it out', action: 'highlight_process_button', data: { nextStep: 'confirmation' } },
        { label: 'No thanks, continue with current settings', action: 'process_directly', data: { idpEnabled: true, kgEnabled: false, extractType: 'full', nextStep: 'confirmation' } }
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
      message: 'Which type of automotive data extraction do you need from this document?',
      actions: [
        { label: 'VIN & Part Numbers', action: 'set_idp_preferences', data: { 
          idpEnabled: true, 
          extractType: 'automotive',
          automotiveOptions: { extractVIN: true, extractPartNumbers: true },
          nextStep: 'audio_check' 
        }},
        { label: 'Torque Specifications', action: 'set_idp_preferences', data: { 
          idpEnabled: true, 
          extractType: 'automotive',
          automotiveOptions: { extractTorqueSpecs: true },
          nextStep: 'audio_check' 
        }},
        { label: 'Service Intervals', action: 'set_idp_preferences', data: { 
          idpEnabled: true, 
          extractType: 'automotive',
          automotiveOptions: { extractServiceIntervals: true },
          nextStep: 'audio_check' 
        }},
        { label: 'All Automotive Data', action: 'set_idp_preferences', data: { 
          idpEnabled: true, 
          extractType: 'automotive',
          automotiveOptions: { 
            extractVIN: true, 
            extractPartNumbers: true, 
            extractTorqueSpecs: true, 
            extractServiceIntervals: true 
          },
          nextStep: 'audio_check' 
        }}
      ]
    }),
    
    confirmation: (state: ConversationState) => {
      const config = this.buildFinalConfiguration(state);
      return {
        message: 'Your document has been processed! Would you like to test the Q&A capabilities with automotive-specific questions before exploring the full results?',
        actions: [
          { 
            label: 'Yes, test Q&A first', 
            action: 'next_step', 
            data: { nextStep: 'qa_testing', config }
          },
          { 
            label: 'Skip to results', 
            action: 'next_step', 
            data: { nextStep: 'recommendations', config }
          },
          { 
            label: 'Modify configuration', 
            action: 'modify_processing', 
            data: config 
          }
        ]
      };
    },
    
    qa_testing: (state: ConversationState) => {
      return {
        message: 'Let\'s test the Q&A capabilities! I\'ll ask you some questions about the document to verify the extraction quality. Ready?',
        actions: [
          { 
            label: 'Start with VIN/Part questions', 
            action: 'start_qa_test', 
            data: { testType: 'parts', nextStep: 'results_validation' }
          },
          { 
            label: 'Start with specification questions', 
            action: 'start_qa_test', 
            data: { testType: 'specifications', nextStep: 'results_validation' }
          },
          { 
            label: 'Start with service questions', 
            action: 'start_qa_test', 
            data: { testType: 'service', nextStep: 'results_validation' }
          },
          { 
            label: 'Skip testing', 
            action: 'next_step', 
            data: { nextStep: 'recommendations' }
          }
        ]
      };
    },
    
    results_validation: (state: ConversationState) => {
      const testResults = state.qaTestResults || { questionsAnswered: 0, correctAnswers: 0, confidence: 0 };
      const questionsAnswered = testResults.questionsAnswered ?? 0;
      const correctAnswers = testResults.correctAnswers ?? 0;
      const confidence = testResults.confidence ?? 0;
      const accuracy = questionsAnswered > 0 
        ? Math.round((correctAnswers / questionsAnswered) * 100)
        : 0;
        
      return {
        message: `Q&A Test Results: ${accuracy}% accuracy (${correctAnswers}/${questionsAnswered} correct). The system confidence is ${Math.round(confidence * 100)}%. Would you like to proceed with the recommendations?`,
        actions: [
          { 
            label: 'View recommendations', 
            action: 'next_step', 
            data: { nextStep: 'recommendations' }
          },
          { 
            label: 'Re-test with different questions', 
            action: 'next_step', 
            data: { nextStep: 'qa_testing' }
          },
          { 
            label: 'Adjust configuration', 
            action: 'modify_processing', 
            data: state.configuration 
          }
        ]
      };
    },
    
    recommendations: (state: ConversationState) => {
      const config = this.buildFinalConfiguration(state);
      return {
        message: 'Based on your evaluation, I want to recommend the following actions for your automotive document analysis:',
        actions: [
          { 
            label: 'Summarize', 
            action: 'apply_recommendation', 
            data: { 
              recommendationType: 'summarize',
              description: 'Generate a comprehensive summary of the technical document including key specifications, procedures, and requirements.',
              config
            } 
          },
          { 
            label: 'Content Generation', 
            action: 'apply_recommendation', 
            data: { 
              recommendationType: 'content_generation',
              description: 'Create new technical content based on the document analysis, such as service bulletins, work orders, or technical guides.',
              config
            } 
          },
          { 
            label: 'QnA', 
            action: 'apply_recommendation', 
            data: { 
              recommendationType: 'qna',
              description: 'Ask specific questions about the technical data and receive accurate, contextual answers.',
              config
            } 
          },
          { 
            label: 'Technical Data Extraction', 
            action: 'apply_recommendation', 
            data: { 
              recommendationType: 'technical_extraction',
              description: 'Extract structured technical data like specifications, part numbers, and service intervals for further analysis.',
              config
            } 
          },
          { 
            label: 'Test with Q&A', 
            action: 'apply_recommendation', 
            data: { 
              recommendationType: 'qa_test',
              description: 'Test the document understanding with automotive Q&A to verify extraction accuracy.',
              config
            } 
          }
        ]
      };
    },
    
    recommendation_applied: (state: ConversationState) => {
      return {
        message: 'Your selected technical analysis action has been initiated. The results will be available shortly. Would you like to try another approach or continue with this analysis?',
        actions: [
          { 
            label: 'Continue with current analysis', 
            action: 'process_directly', 
            data: { idpEnabled: true, kgEnabled: true, extractType: 'full', entityTypes: 'all' } 
          },
          { 
            label: 'Try another approach', 
            action: 'next_step', 
            data: { nextStep: 'recommendations' } 
          }
        ]
      };
    }
  };
  
  private questions: Map<string, string[]> = new Map([
    // Automotive service documents
    ['service_manual', [
      'I see this is a service manual. What technical information would you like to extract?',
      'Would you like to extract torque specifications, service procedures, or diagnostic codes?',
      'Should I analyze technical diagrams and schematics for component relationships?'
    ]],
    ['parts_catalog', [
      'I\'ve identified this as a parts catalog. What parts information do you need?',
      'Would you like to extract part numbers, compatibility information, or pricing data?',
      'Should I map part relationships and supersession information?'
    ]],
    ['technical_bulletin', [
      'This appears to be a technical bulletin. How should I process this TSB?',
      'Would you like to extract affected VINs, repair procedures, or warranty information?',
      'Should I identify related components and cross-reference with other bulletins?'
    ]],
    ['owners_manual', [
      'This is an owner\'s manual. What information would you like to make searchable?',
      'Would you like to extract maintenance schedules, warning messages, or operating procedures?',
      'Should I process diagrams showing controls and features?'
    ]],
    ['specification_sheet', [
      'I\'ve detected a specification sheet. Which specifications should I extract?',
      'Would you like to extract dimensions, capacities, or performance data?',
      'Should I create a searchable database of all technical specifications?'
    ]],
    
    // General automotive document patterns
    ['report', [
      'This appears to be an automotive report. What insights are you looking for?',
      'Would you like to extract test results, compliance data, or quality metrics?',
      'Should I identify failure patterns and root cause analysis?'
    ]],
    ['form', [
      'This is an automotive form. Which data should I extract?',
      'Would you like to extract VIN, mileage, service history, or inspection results?',
      'Should I validate the data against Honda/Acura specifications?'
    ]],
    ['unknown', [
      'I\'ve analyzed your automotive document. What information would you like to extract?',
      'Are you looking for specifications, part numbers, or service procedures?',
      'What\'s your main goal - troubleshooting, parts lookup, or maintenance planning?'
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
      processingPreferences: {},
      vehicleInfo: {},
      multimodalPreferences: {},
      kgPreferences: {},
      idpPreferences: {}
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
    const intent = this.detectIntent(message, state);
    
    if (intent && state.conversationStep !== 'intro') {
      // Handle confirmation step intents specially
      if ((intent as any).intent === 'confirmation_proceed') {
        // User typed "yes" in confirmation step - trigger next_step action
        return this.handleAction('next_step', { 
          nextStep: 'recommendations', 
          config: (intent as any).config 
        }, state);
      } else if ((intent as any).intent === 'confirmation_wait') {
        // User typed "no" in confirmation step - stay in current step
        const nextMessage = this.getNextStepMessage(state);
        return {
          ...state,
          messages: [...newMessages, nextMessage],
          currentQuestion: nextMessage.content
        };
      }
      
      // User has expressed a clear business intent
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


  private detectIntent(message: string, state?: ConversationState): ProcessingIntent | null {
    const lowerMessage = message.toLowerCase();

    // Handle confirmation step responses
    if (state?.conversationStep === 'confirmation') {
      if (lowerMessage.includes('yes') || 
          lowerMessage.includes('next') || 
          lowerMessage.includes('proceed') || 
          lowerMessage.includes('continue') ||
          lowerMessage.includes('recommend') ||
          lowerMessage.includes('step')) {
        
        // Return a special intent that will trigger the same action as the button
        return {
          intent: 'confirmation_proceed',
          processingTypes: [],
          configuration: {},
          confidence: 1.0,
          action: 'next_step',
          nextStep: 'qa_testing',
          config: state.configuration
        } as any;
      }
      
      if (lowerMessage.includes('no') || 
          lowerMessage.includes('wait') || 
          lowerMessage.includes('hold') ||
          lowerMessage.includes('stop')) {
        
        return {
          intent: 'confirmation_wait',
          processingTypes: [],
          configuration: {},
          confidence: 1.0,
          action: 'stay_current_step'
        } as any;
      }
    }

    // Automotive service intents
    if ((lowerMessage.includes('service') || lowerMessage.includes('manual')) && 
        (lowerMessage.includes('procedure') || lowerMessage.includes('torque') || lowerMessage.includes('specification'))) {
      return this.intents.get('service_manual')!;
    }
    
    if ((lowerMessage.includes('part') || lowerMessage.includes('parts')) && 
        (lowerMessage.includes('number') || lowerMessage.includes('catalog') || lowerMessage.includes('lookup'))) {
      return this.intents.get('parts_catalog')!;
    }
    
    // Automotive diagnostic intents
    if ((lowerMessage.includes('diagnostic') || lowerMessage.includes('troubleshoot') || lowerMessage.includes('dtc')) && 
        (lowerMessage.includes('code') || lowerMessage.includes('procedure') || lowerMessage.includes('test'))) {
      return this.intents.get('diagnostic_procedures')!;
    }
    
    if ((lowerMessage.includes('bulletin') || lowerMessage.includes('tsb')) && 
        (lowerMessage.includes('technical') || lowerMessage.includes('service') || lowerMessage.includes('recall'))) {
      return this.intents.get('technical_bulletins')!;
    }
    
    // Automotive Q&A intents
    if ((lowerMessage.includes('specification') || lowerMessage.includes('spec')) && 
        (lowerMessage.includes('engine') || lowerMessage.includes('transmission') || lowerMessage.includes('capacity'))) {
      return this.intents.get('specification_lookup')!;
    }
    
    if ((lowerMessage.includes('maintenance') || lowerMessage.includes('service')) && 
        (lowerMessage.includes('schedule') || lowerMessage.includes('interval') || lowerMessage.includes('when'))) {
      return this.intents.get('maintenance_schedules')!;
    }
    
    // VIN and part number detection
    if (lowerMessage.match(/\b[jh][a-z0-9]{2}[a-z0-9]{6}[0-9]{6}\b/) || lowerMessage.includes('vin')) {
      return this.intents.get('parts_catalog')!;
    }
    
    if (lowerMessage.match(/\b\d{5}-[a-z0-9]{3}-[a-z0-9]{3}\b/i)) {
      return this.intents.get('parts_catalog')!;
    }
    
    // Automotive Q&A patterns
    if (lowerMessage.includes('q&a') || lowerMessage.includes('question') || lowerMessage.includes('answer')) {
      return this.intents.get('specification_lookup')!;
    }
    
    // General automotive patterns
    if (lowerMessage.includes('multimodal') || lowerMessage.includes('diagram') || lowerMessage.includes('schematic')) {
      return this.intents.get('service_manual')!;
    }
    
    // Fallback patterns
    if (lowerMessage.includes('extract') || lowerMessage.includes('analyze') || lowerMessage.includes('process')) {
      if (lowerMessage.includes('torque') || lowerMessage.includes('specification') || lowerMessage.includes('procedure')) {
        return this.intents.get('service_manual')!;
      } else if (lowerMessage.includes('part') || lowerMessage.includes('component') || lowerMessage.includes('assembly')) {
        return this.intents.get('parts_catalog')!;
      } else if (lowerMessage.includes('maintenance') || lowerMessage.includes('service') || lowerMessage.includes('interval')) {
        return this.intents.get('maintenance_schedules')!;
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
    const messages: Record<string, string> = {
      'service_manual': 'Service manual processing configured. Ready to extract torque specs, procedures, and diagrams.',
      'parts_catalog': 'Parts catalog processing configured. Ready to extract part numbers and compatibility data.',
      'diagnostic_procedures': 'Diagnostic processing configured. Ready to extract DTCs and troubleshooting steps.',
      'technical_bulletins': 'TSB processing configured. Ready to extract affected VINs and repair procedures.',
      'specification_lookup': 'Specification search configured. Ready to answer technical questions.',
      'maintenance_schedules': 'Maintenance schedule processing configured. Ready to extract service intervals.'
    };
    
    return messages[intent.intent] || 'Automotive document processing has been configured and is ready to start.';
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
      case 'service_manual':
        actions.push({
          id: this.generateId(),
          label: 'Extract torque specifications',
          action: 'quick_intent',
          data: 'Extract all torque specifications and tightening sequences'
        });
        actions.push({
          id: this.generateId(),
          label: 'Find service procedures',
          action: 'quick_intent',
          data: 'Extract step-by-step service procedures with diagrams'
        });
        actions.push({
          id: this.generateId(),
          label: 'Process technical diagrams',
          action: 'quick_intent',
          data: 'Analyze wiring diagrams and component schematics'
        });
        break;
        
      case 'parts_catalog':
        actions.push({
          id: this.generateId(),
          label: 'Extract part numbers',
          action: 'quick_intent',
          data: 'Extract all Honda/Acura part numbers with descriptions'
        });
        actions.push({
          id: this.generateId(),
          label: 'Map part compatibility',
          action: 'quick_intent',
          data: 'Create compatibility matrix for parts across models'
        });
        actions.push({
          id: this.generateId(),
          label: 'Find superseded parts',
          action: 'quick_intent',
          data: 'Identify superseded parts and their replacements'
        });
        break;
        
      case 'technical_bulletin':
        actions.push({
          id: this.generateId(),
          label: 'Extract affected VINs',
          action: 'quick_intent',
          data: 'Extract VIN ranges and affected models'
        });
        actions.push({
          id: this.generateId(),
          label: 'Get repair procedures',
          action: 'quick_intent',
          data: 'Extract detailed repair procedures from TSB'
        });
        actions.push({
          id: this.generateId(),
          label: 'Find warranty info',
          action: 'quick_intent',
          data: 'Extract warranty and reimbursement information'
        });
        break;
        
      case 'owners_manual':
        actions.push({
          id: this.generateId(),
          label: 'Extract maintenance schedule',
          action: 'quick_intent',
          data: 'Extract complete maintenance schedule with intervals'
        });
        actions.push({
          id: this.generateId(),
          label: 'Find warning messages',
          action: 'quick_intent',
          data: 'Extract all warning and caution messages'
        });
        actions.push({
          id: this.generateId(),
          label: 'Map controls & features',
          action: 'quick_intent',
          data: 'Extract control locations and feature operations'
        });
        break;
        
      case 'specification_sheet':
        actions.push({
          id: this.generateId(),
          label: 'Extract specifications',
          action: 'quick_intent',
          data: 'Extract all technical specifications and capacities'
        });
        actions.push({
          id: this.generateId(),
          label: 'Compare models',
          action: 'quick_intent',
          data: 'Create comparison matrix across models'
        });
        actions.push({
          id: this.generateId(),
          label: 'Find performance data',
          action: 'quick_intent',
          data: 'Extract performance metrics and ratings'
        });
        break;
        
      default:
        actions.push({
          id: this.generateId(),
          label: 'Search technical data',
          action: 'quick_intent',
          data: 'I want to search for specifications in this document'
        });
        actions.push({
          id: this.generateId(),
          label: 'Extract VIN/Part numbers',
          action: 'quick_intent',
          data: 'I need to extract all VINs and part numbers'
        });
        actions.push({
          id: this.generateId(),
          label: 'Q&A about document',
          action: 'quick_intent',
          data: 'I want to ask questions about this automotive document'
        });
    }

    return actions;
  }

  private handleAction(action: string, data: any, state: ConversationState): ConversationState {
    const newState = { ...state };
    console.log('ConversationManager: Handling action', action, 'with data', data, 'current step:', state.conversationStep);
    
    switch (action) {
      case 'apply_recommendation':
        console.log('ConversationManager: Applying recommendation', data.recommendationType);
        // Process the recommendation based on type
        newState.recommendationType = data.recommendationType;
        newState.recommendationDescription = data.description;
        
        // Set the next step to show the recommendation applied message
        newState.conversationStep = 'recommendation_applied';
        break;
        
      case 'next_step':
        console.log('ConversationManager: Moving from', state.conversationStep, 'to', data.nextStep);
        console.log('ConversationManager: Full next_step data:', JSON.stringify(data));
        // Add extra debugging for recommendation step
        if (data.nextStep === 'recommendations') {
          console.log('ConversationManager: IMPORTANT - Moving to recommendations step!');
        }
        newState.conversationStep = data.nextStep;
        // If config is provided in the data, update the state configuration
        if (data.config) {
          console.log('ConversationManager: Setting configuration from data.config:', data.config);
          newState.configuration = data.config;
          console.log('ConversationManager: newState.configuration after setting:', newState.configuration);
        } else {
          console.log('ConversationManager: No data.config provided in next_step action');
        }
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
        
      case 'direct_to_recommendations':
        console.log('ConversationManager: Direct path to recommendations step');
        // Force transition to recommendations step
        newState.conversationStep = 'recommendations';
        break;
        
      case 'set_idp_preferences':
        console.log('ConversationManager: Setting IDP preferences:', { 
          enabled: data.idpEnabled, 
          extractType: data.extractType,
          automotiveOptions: data.automotiveOptions 
        });
        newState.idpPreferences = { 
          enabled: data.idpEnabled, 
          extractType: data.extractType,
          automotiveOptions: data.automotiveOptions
        };
        newState.conversationStep = data.nextStep;
        break;
        
      case 'set_vehicle':
        console.log('ConversationManager: Setting vehicle info:', data);
        newState.vehicleInfo = { 
          ...newState.vehicleInfo,
          year: data.year,
          make: data.make,
          model: data.model
        };
        newState.conversationStep = data.nextStep;
        console.log('ConversationManager: Vehicle info set, moving to:', data.nextStep);
        break;
        
      case 'request_vin_input':
        // This would trigger a VIN input modal or field
        newState.conversationStep = 'vehicle_info';
        // In real implementation, would show VIN input UI
        break;
        
      case 'request_vehicle_input':
        // This would trigger manual vehicle selection
        newState.conversationStep = 'vehicle_info';
        // In real implementation, would show vehicle selector UI
        break;
        
      case 'start_qa_test':
        newState.qaTestingEnabled = true;
        newState.qaTestResults = {
          questionsAnswered: 0,
          correctAnswers: 0,
          confidence: 0
        };
        // Would initiate Q&A testing based on testType
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
    console.log('ConversationManager: Next message actions:', nextMessage.actions?.map(a => a.label) || []);
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
      } else if (stepName === 'processing_selection' || stepName === 'confirmation' || 
                 stepName === 'recommendations' || stepName === 'qa_testing' || 
                 stepName === 'results_validation') {
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
    console.log('buildFinalConfiguration: Full state received:', state);
    console.log('buildFinalConfiguration: state.configuration:', state.configuration);
    const baseConfig = state.configuration || {};
    const multimodal = state.multimodalPreferences || {};
    const kg = state.kgPreferences || {};
    const idp = state.idpPreferences || {};
    
    console.log('buildFinalConfiguration: state.selectedProcessingTypes:', state.selectedProcessingTypes);
    console.log('buildFinalConfiguration: baseConfig:', baseConfig);
    
    // Build RAG configuration with multimodal preferences
    const ragConfig = {
      ...(baseConfig.rag || {}),
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
      ...(baseConfig.kg || {}),
      enabled: state.selectedProcessingTypes.includes('kg') || kg.enabled || baseConfig.kg?.enabled || false,
      entityExtraction: kg.enabled || baseConfig.kg?.entityExtraction || false,
      relationMapping: kg.enabled || baseConfig.kg?.relationMapping || false,
      entityTypes: kg.entityTypes || baseConfig.kg?.entityTypes || 'all'
    };
    
    // Build IDP configuration
    const idpConfig = {
      ...(baseConfig.idp || {}),
      enabled: state.selectedProcessingTypes.includes('idp') || idp.enabled || baseConfig.idp?.enabled || false,
      textExtraction: idp.enabled || baseConfig.idp?.textExtraction || false,
      classification: idp.extractType === 'metadata' || idp.extractType === 'full' || baseConfig.idp?.classification || false,
      metadata: idp.extractType === 'metadata' || idp.extractType === 'full' || baseConfig.idp?.metadata || false,
      tables: idp.extractType === 'structured' || idp.extractType === 'full' || idp.extractType === 'automotive' || baseConfig.idp?.tables || false,
      formFields: idp.extractType === 'structured' || idp.extractType === 'full' || baseConfig.idp?.formFields || false,
      // Add automotive-specific extraction options
      automotiveExtraction: idp.extractType === 'automotive' || false,
      extractVIN: idp.automotiveOptions?.extractVIN || false,
      extractPartNumbers: idp.automotiveOptions?.extractPartNumbers || false,
      extractTorqueSpecs: idp.automotiveOptions?.extractTorqueSpecs || false,
      extractServiceIntervals: idp.automotiveOptions?.extractServiceIntervals || false
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
      vehicleInfo: state.vehicleInfo,
      qaTestingEnabled: state.qaTestingEnabled,
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
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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