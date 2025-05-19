import { ProcessingIntent } from '@/services/ConversationManager';
import ProcessingPipeline from '@/services/ProcessingPipeline';

export interface ProcessingRequest {
  type: 'idp' | 'rag' | 'kg' | 'combined';
  source: 'ui' | 'conversation';
  config?: any;
  intent?: string;
  combinedTypes?: ('idp' | 'rag' | 'kg')[];
}

export interface ProcessingTriggerResult {
  success: boolean;
  processingId: string;
  error?: string;
}

export class IntentBasedProcessingTrigger {
  private static instance: IntentBasedProcessingTrigger;
  private activeProcessing: Map<string, ProcessingRequest> = new Map();
  
  private constructor() {}
  
  static getInstance(): IntentBasedProcessingTrigger {
    if (!IntentBasedProcessingTrigger.instance) {
      IntentBasedProcessingTrigger.instance = new IntentBasedProcessingTrigger();
    }
    return IntentBasedProcessingTrigger.instance;
  }
  
  /**
   * Trigger processing based on UI interaction
   */
  triggerFromUI(type: 'idp' | 'rag' | 'kg' | 'combined', config?: any): ProcessingTriggerResult {
    const processingId = this.generateProcessingId();
    
    const request: ProcessingRequest = {
      type,
      source: 'ui',
      config
    };
    
    this.activeProcessing.set(processingId, request);
    
    // Map UI request to processing configuration
    const processingConfig = this.mapUIToProcessingConfig(type, config);
    
    try {
      // Configure and execute pipeline
      const steps = ProcessingPipeline.configureFromIntent(
        processingConfig,
        config?.document
      );
      
      ProcessingPipeline.execute().catch(error => {
        console.error('Processing failed:', error);
      });
      
      return {
        success: true,
        processingId
      };
    } catch (error) {
      return {
        success: false,
        processingId,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }
  
  /**
   * Trigger processing based on conversation intent
   */
  triggerFromConversation(intent: ProcessingIntent): ProcessingTriggerResult {
    const processingId = this.generateProcessingId();
    
    const request: ProcessingRequest = {
      type: this.mapIntentToType(intent),
      source: 'conversation',
      intent: intent.intent,
      config: intent.configuration
    };
    
    this.activeProcessing.set(processingId, request);
    
    try {
      // Use ProcessingPipeline directly with the intent
      const steps = ProcessingPipeline.configureFromIntent(
        intent,
        {} // document will be provided by the pipeline
      );
      
      ProcessingPipeline.execute().catch(error => {
        console.error('Processing failed:', error);
      });
      
      return {
        success: true,
        processingId
      };
    } catch (error) {
      return {
        success: false,
        processingId,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }
  
  /**
   * Trigger combined processing for multiple types
   */
  triggerCombinedProcessing(types: ('idp' | 'rag' | 'kg')[], config?: any): ProcessingTriggerResult {
    const processingId = this.generateProcessingId();
    
    const request: ProcessingRequest = {
      type: 'combined',
      source: 'ui',
      combinedTypes: types,
      config
    };
    
    this.activeProcessing.set(processingId, request);
    
    try {
      // Create combined processing configuration
      const combinedConfig = this.createCombinedConfig(types, config);
      
      const steps = ProcessingPipeline.configureFromIntent(
        combinedConfig,
        config?.document
      );
      
      ProcessingPipeline.execute().catch(error => {
        console.error('Processing failed:', error);
      });
      
      return {
        success: true,
        processingId
      };
    } catch (error) {
      return {
        success: false,
        processingId,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }
  
  /**
   * Map UI processing type to processing configuration
   */
  private mapUIToProcessingConfig(type: 'idp' | 'rag' | 'kg' | 'combined', config?: any): ProcessingIntent {
    // Handle combined type
    if (type === 'combined') {
      return this.createCombinedConfig(config?.types || ['idp', 'rag'], config);
    }
    switch (type) {
      case 'idp':
        return {
          intent: 'extract_form_fields',
          processingTypes: ['idp'],
          configuration: {
            idp: {
              enabled: true,
              extractForms: true,
              extractTables: false,
              textExtraction: true,
              classification: false,
              metadata: true
            }
          },
          confidence: 1.0
        };
        
      case 'rag':
        return {
          intent: 'find_answers_tables',
          processingTypes: ['rag'],
          configuration: {
            rag: {
              enabled: true,
              chunking: true,
              vectorization: true,
              indexing: true,
              chunkSize: config?.chunkSize || 150,
              chunkOverlap: config?.chunkOverlap || 20
            }
          },
          confidence: 1.0
        };
        
      case 'kg':
        return {
          intent: 'understand_relationships',
          processingTypes: ['kg'],
          configuration: {
            kg: {
              enabled: true,
              entityExtraction: true,
              relationMapping: true,
              graphBuilding: true
            }
          },
          confidence: 1.0
        };
        
      default:
        throw new Error(`Unknown processing type: ${type}`);
    }
  }
  
  /**
   * Map conversation intent to processing type
   */
  private mapIntentToType(intent: ProcessingIntent): ProcessingRequest['type'] {
    // If multiple processing types, it's combined
    if (intent.processingTypes.length > 1) {
      return 'combined';
    }
    
    // Map single processing type
    switch (intent.processingTypes[0]) {
      case 'rag':
        return 'rag';
      case 'kg':
        return 'kg';
      case 'idp':
        return 'idp';
      default:
        return 'combined';
    }
  }
  
  /**
   * Create combined processing configuration
   */
  private createCombinedConfig(types: ('idp' | 'rag' | 'kg')[], config?: any): ProcessingIntent {
    const configuration: any = {};
    let intent = 'combined_processing';
    
    // Special case: Table Q&A requires both IDP and RAG
    if (types.includes('idp') && types.includes('rag')) {
      intent = 'find_answers_tables';
      configuration.idp = {
        enabled: true,
        extractTables: true,
        extractForms: false,
        textExtraction: true
      };
      configuration.rag = {
        enabled: true,
        chunking: true,
        vectorization: true,
        indexing: true
      };
    } else {
      // Build configuration for each type
      types.forEach(type => {
        const singleConfig = this.mapUIToProcessingConfig(type, config);
        Object.assign(configuration, singleConfig.configuration);
      });
    }
    
    return {
      intent,
      processingTypes: types,
      configuration,
      confidence: 1.0
    };
  }
  
  /**
   * Get active processing request
   */
  getActiveProcessing(processingId: string): ProcessingRequest | undefined {
    return this.activeProcessing.get(processingId);
  }
  
  /**
   * Complete processing
   */
  completeProcessing(processingId: string): void {
    this.activeProcessing.delete(processingId);
  }
  
  /**
   * Generate unique processing ID
   */
  private generateProcessingId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Cancel active processing
   */
  cancelProcessing(processingId: string): boolean {
    if (this.activeProcessing.has(processingId)) {
      // Attempt to cancel the pipeline
      ProcessingPipeline.reset();
      this.activeProcessing.delete(processingId);
      return true;
    }
    return false;
  }
  
  /**
   * Check if processing is active
   */
  isProcessingActive(processingId: string): boolean {
    return this.activeProcessing.has(processingId);
  }
}

export default IntentBasedProcessingTrigger.getInstance();