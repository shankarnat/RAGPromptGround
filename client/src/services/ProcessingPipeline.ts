import { ProcessingIntent } from './ConversationManager';
import { DocumentProcessingState } from '@/hooks/useDocumentProcessing';

export interface ProcessingConfiguration {
  rag?: {
    enabled: boolean;
    chunking: boolean;
    vectorization: boolean;
    indexing: boolean;
    chunkSize?: number;
    chunkOverlap?: number;
  };
  kg?: {
    enabled: boolean;
    entityExtraction: boolean;
    relationMapping: boolean;
    graphBuilding: boolean;
  };
  idp?: {
    enabled: boolean;
    textExtraction: boolean;
    classification: boolean;
    metadata: boolean;
    extractTables?: boolean;
    extractForms?: boolean;
  };
}

export interface ProcessingStep {
  id: string;
  type: 'rag' | 'kg' | 'idp';
  name: string;
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  results?: any;
  dependencies?: string[];
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface PipelineStatus {
  status: 'idle' | 'preparing' | 'processing' | 'completed' | 'error';
  currentStep: string | null;
  totalSteps: number;
  completedSteps: number;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export class ProcessingPipeline {
  private static instance: ProcessingPipeline;
  
  private steps: Map<string, ProcessingStep> = new Map();
  private pipelineStatus: PipelineStatus = {
    status: 'idle',
    currentStep: null,
    totalSteps: 0,
    completedSteps: 0,
    progress: 0
  };
  
  private progressCallbacks: Set<(status: PipelineStatus) => void> = new Set();
  private stepCallbacks: Set<(step: ProcessingStep) => void> = new Set();
  
  private constructor() {}
  
  static getInstance(): ProcessingPipeline {
    if (!ProcessingPipeline.instance) {
      ProcessingPipeline.instance = new ProcessingPipeline();
    }
    return ProcessingPipeline.instance;
  }
  
  /**
   * Configure and prepare the pipeline based on user intent and processing config
   */
  configureFromIntent(intent: ProcessingIntent, document: any): ProcessingStep[] {
    this.reset();
    const steps: ProcessingStep[] = [];
    
    // Configure steps based on the intent
    switch (intent.intent) {
      case 'find_answers_tables':
        // For table Q&A, we need table extraction and RAG indexing
        if (intent.configuration.idp?.enabled) {
          steps.push({
            id: 'idp-table-extraction',
            type: 'idp',
            name: 'Extract Tables',
            status: 'pending',
            progress: 0
          });
        }
        
        if (intent.configuration.rag?.enabled) {
          steps.push({
            id: 'rag-table-chunking',
            type: 'rag',
            name: 'Process Table Data',
            status: 'pending',
            progress: 0,
            dependencies: ['idp-table-extraction']
          });
          
          steps.push({
            id: 'rag-indexing',
            type: 'rag',
            name: 'Index for Search',
            status: 'pending',
            progress: 0,
            dependencies: ['rag-table-chunking']
          });
        }
        break;
        
      case 'extract_form_fields':
        // For form extraction, configure IDP with field recognition
        if (intent.configuration.idp?.enabled) {
          steps.push({
            id: 'idp-field-detection',
            type: 'idp',
            name: 'Detect Form Fields',
            status: 'pending',
            progress: 0
          });
          
          steps.push({
            id: 'idp-field-extraction',
            type: 'idp',
            name: 'Extract Field Values',
            status: 'pending',
            progress: 0,
            dependencies: ['idp-field-detection']
          });
        }
        break;
        
      case 'understand_relationships':
        // For entity relationships, configure KG with entity and relationship extraction
        if (intent.configuration.kg?.enabled) {
          steps.push({
            id: 'kg-entity-extraction',
            type: 'kg',
            name: 'Extract Entities',
            status: 'pending',
            progress: 0
          });
          
          steps.push({
            id: 'kg-relation-mapping',
            type: 'kg',
            name: 'Map Relationships',
            status: 'pending',
            progress: 0,
            dependencies: ['kg-entity-extraction']
          });
          
          steps.push({
            id: 'kg-graph-building',
            type: 'kg',
            name: 'Build Knowledge Graph',
            status: 'pending',
            progress: 0,
            dependencies: ['kg-relation-mapping']
          });
        }
        break;
    }
    
    // Store steps in the map
    steps.forEach(step => this.steps.set(step.id, step));
    
    // Update pipeline status
    this.pipelineStatus = {
      status: 'preparing',
      currentStep: null,
      totalSteps: steps.length,
      completedSteps: 0,
      progress: 0,
      startTime: new Date()
    };
    
    this.notifyProgress();
    return steps;
  }
  
  /**
   * Execute the pipeline steps in order, respecting dependencies
   */
  async execute(): Promise<void> {
    if (this.steps.size === 0) {
      throw new Error('Pipeline not configured. Call configureFromIntent first.');
    }
    
    this.pipelineStatus.status = 'processing';
    this.pipelineStatus.startTime = new Date();
    this.notifyProgress();
    
    try {
      // Get ordered list of steps based on dependencies
      const orderedSteps = this.getOrderedSteps();
      
      for (const step of orderedSteps) {
        this.pipelineStatus.currentStep = step.id;
        this.notifyProgress();
        
        // Wait for dependencies to complete
        await this.waitForDependencies(step);
        
        // Execute the step
        await this.executeStep(step);
        
        // Update progress
        this.pipelineStatus.completedSteps++;
        this.pipelineStatus.progress = (this.pipelineStatus.completedSteps / this.pipelineStatus.totalSteps) * 100;
        this.notifyProgress();
      }
      
      this.pipelineStatus.status = 'completed';
      this.pipelineStatus.endTime = new Date();
      this.pipelineStatus.currentStep = null;
      this.notifyProgress();
      
    } catch (error) {
      this.pipelineStatus.status = 'error';
      this.pipelineStatus.error = error instanceof Error ? error.message : 'Pipeline execution failed';
      this.pipelineStatus.endTime = new Date();
      this.notifyProgress();
      throw error;
    }
  }
  
  /**
   * Execute a single processing step
   */
  private async executeStep(step: ProcessingStep): Promise<void> {
    step.status = 'processing';
    step.startTime = new Date();
    this.notifyStep(step);
    
    try {
      // Simulate different processing based on step type
      switch (step.type) {
        case 'rag':
          step.results = await this.executeRAGStep(step);
          break;
        case 'kg':
          step.results = await this.executeKGStep(step);
          break;
        case 'idp':
          step.results = await this.executeIDPStep(step);
          break;
      }
      
      step.status = 'completed';
      step.progress = 100;
      step.endTime = new Date();
      this.notifyStep(step);
      
    } catch (error) {
      step.status = 'error';
      step.error = error instanceof Error ? error.message : 'Step execution failed';
      step.endTime = new Date();
      this.notifyStep(step);
      throw error;
    }
  }
  
  /**
   * Execute RAG processing step
   */
  private async executeRAGStep(step: ProcessingStep): Promise<any> {
    // Simulate RAG processing
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        step.progress = Math.min(step.progress + 20, 95);
        this.notifyStep(step);
      }, 500);
      
      setTimeout(() => {
        clearInterval(interval);
        
        let results: any = {};
        
        if (step.id === 'rag-table-chunking') {
          results = {
            chunks: [
              {
                id: 1,
                content: 'Revenue data for Q1-Q4',
                metadata: { type: 'table', rows: 4, columns: 5 }
              },
              {
                id: 2,
                content: 'Expense breakdown by category',
                metadata: { type: 'table', rows: 10, columns: 3 }
              }
            ]
          };
        } else if (step.id === 'rag-indexing') {
          results = {
            indexStatus: 'completed',
            vectorsCreated: 2,
            searchReady: true
          };
        }
        
        resolve(results);
      }, 2000);
    });
  }
  
  /**
   * Execute Knowledge Graph processing step
   */
  private async executeKGStep(step: ProcessingStep): Promise<any> {
    // Simulate KG processing
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        step.progress = Math.min(step.progress + 25, 95);
        this.notifyStep(step);
      }, 400);
      
      setTimeout(() => {
        clearInterval(interval);
        
        let results: any = {};
        
        if (step.id === 'kg-entity-extraction') {
          results = {
            entities: [
              { id: 1, type: 'COMPANY', name: 'ACME Corp', confidence: 0.98 },
              { id: 2, type: 'PERSON', name: 'John Smith', confidence: 0.95 },
              { id: 3, type: 'PRODUCT', name: 'Widget Pro', confidence: 0.92 }
            ]
          };
        } else if (step.id === 'kg-relation-mapping') {
          results = {
            relations: [
              { source: 2, target: 1, type: 'WORKS_AT', confidence: 0.93 },
              { source: 1, target: 3, type: 'PRODUCES', confidence: 0.96 }
            ]
          };
        } else if (step.id === 'kg-graph-building') {
          results = {
            graph: {
              nodes: 3,
              edges: 2,
              components: 1,
              density: 0.67
            }
          };
        }
        
        resolve(results);
      }, 2500);
    });
  }
  
  /**
   * Execute IDP processing step
   */
  private async executeIDPStep(step: ProcessingStep): Promise<any> {
    // Simulate IDP processing
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        step.progress = Math.min(step.progress + 15, 95);
        this.notifyStep(step);
      }, 600);
      
      setTimeout(() => {
        clearInterval(interval);
        
        let results: any = {};
        
        if (step.id === 'idp-table-extraction') {
          results = {
            tables: [
              {
                id: 'table-1',
                rows: 4,
                columns: 5,
                headers: ['Quarter', 'Revenue', 'Expenses', 'Profit', 'Growth'],
                data: [
                  ['Q1', '$1.2M', '$0.8M', '$0.4M', '12%'],
                  ['Q2', '$1.5M', '$0.9M', '$0.6M', '25%'],
                  ['Q3', '$1.8M', '$1.0M', '$0.8M', '20%'],
                  ['Q4', '$2.1M', '$1.2M', '$0.9M', '17%']
                ]
              }
            ]
          };
        } else if (step.id === 'idp-field-detection') {
          results = {
            fields: [
              { name: 'Customer Name', type: 'text', required: true },
              { name: 'Order Date', type: 'date', required: true },
              { name: 'Order Total', type: 'currency', required: true },
              { name: 'Notes', type: 'text', required: false }
            ]
          };
        } else if (step.id === 'idp-field-extraction') {
          results = {
            extractedData: {
              'Customer Name': 'John Doe',
              'Order Date': '2024-01-15',
              'Order Total': '$1,234.56',
              'Notes': 'Rush delivery requested'
            }
          };
        }
        
        resolve(results);
      }, 3000);
    });
  }
  
  /**
   * Get steps ordered by dependencies
   */
  private getOrderedSteps(): ProcessingStep[] {
    const visited = new Set<string>();
    const result: ProcessingStep[] = [];
    
    const visit = (stepId: string) => {
      if (visited.has(stepId)) return;
      
      const step = this.steps.get(stepId);
      if (!step) return;
      
      // Visit dependencies first
      if (step.dependencies && step.dependencies.length > 0) {
        for (const depId of step.dependencies) {
          visit(depId);
        }
      }
      
      visited.add(stepId);
      result.push(step);
    };
    
    // Visit all steps
    const stepIds = Array.from(this.steps.keys());
    for (const stepId of stepIds) {
      visit(stepId);
    }
    
    return result;
  }
  
  /**
   * Wait for all dependencies of a step to complete
   */
  private async waitForDependencies(step: ProcessingStep): Promise<void> {
    if (!step.dependencies || step.dependencies.length === 0) return;
    
    const checkDependencies = async () => {
      for (const depId of step.dependencies!) {
        const dep = this.steps.get(depId);
        if (!dep || dep.status !== 'completed') {
          await new Promise(resolve => setTimeout(resolve, 100));
          await checkDependencies();
          return;
        }
      }
    };
    
    await checkDependencies();
  }
  
  /**
   * Get the combined results from all completed steps
   */
  getCombinedResults(): any {
    const results: any = {
      rag: {},
      kg: {},
      idp: {}
    };
    
    const steps = Array.from(this.steps.values());
    for (const step of steps) {
      if (step.status === 'completed' && step.results) {
        if (!results[step.type]) results[step.type] = {};
        results[step.type][step.id] = step.results;
      }
    }
    
    return results;
  }
  
  /**
   * Reset the pipeline
   */
  reset(): void {
    this.steps.clear();
    this.pipelineStatus = {
      status: 'idle',
      currentStep: null,
      totalSteps: 0,
      completedSteps: 0,
      progress: 0
    };
  }
  
  /**
   * Subscribe to pipeline progress updates
   */
  onProgress(callback: (status: PipelineStatus) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }
  
  /**
   * Subscribe to step updates
   */
  onStepUpdate(callback: (step: ProcessingStep) => void): () => void {
    this.stepCallbacks.add(callback);
    return () => this.stepCallbacks.delete(callback);
  }
  
  /**
   * Notify progress callbacks
   */
  private notifyProgress(): void {
    const callbacks = Array.from(this.progressCallbacks);
    for (const callback of callbacks) {
      callback(this.pipelineStatus);
    }
  }
  
  /**
   * Notify step callbacks
   */
  private notifyStep(step: ProcessingStep): void {
    const callbacks = Array.from(this.stepCallbacks);
    for (const callback of callbacks) {
      callback(step);
    }
  }
  
  /**
   * Get current pipeline status
   */
  getPipelineStatus(): PipelineStatus {
    return { ...this.pipelineStatus };
  }
  
  /**
   * Get current steps
   */
  getSteps(): ProcessingStep[] {
    return Array.from(this.steps.values());
  }
}

export default ProcessingPipeline.getInstance();