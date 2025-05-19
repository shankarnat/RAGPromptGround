export interface DocumentCharacteristics {
  documentType: DocumentType;
  structure: DocumentStructure;
  contentFeatures: ContentFeatures;
  relationships: RelationshipFeatures;
  processingRecommendations: ProcessingRecommendation[];
  confidence: number;
}

export type DocumentType = 
  | 'form'
  | 'report'
  | 'contract'
  | 'invoice'
  | 'email'
  | 'article'
  | 'presentation'
  | 'spreadsheet'
  | 'proposal'
  | 'quote'
  | 'ticket'
  | 'sla'
  | 'feedback'
  | 'campaign'
  | 'analytics'
  | 'content'
  | 'unknown';

export interface DocumentStructure {
  hasTables: boolean;
  hasLists: boolean;
  hasHeaders: boolean;
  hasFooters: boolean;
  pageCount: number;
  hasImages: boolean;
  hasCharts: boolean;
  formFields: number;
  structureComplexity: 'simple' | 'moderate' | 'complex';
}

export interface ContentFeatures {
  language: string;
  wordCount: number;
  avgSentenceLength: number;
  technicalContent: boolean;
  financialData: boolean;
  legalContent: boolean;
  hasNamedEntities: boolean;
  hasDates: boolean;
  hasAmounts: boolean;
  topKeywords: string[];
}

export interface RelationshipFeatures {
  entityCount: number;
  potentialRelations: number;
  hierarchicalStructure: boolean;
  temporalReferences: boolean;
  crossReferences: boolean;
  entityTypes: string[];
}

export interface ProcessingRecommendation {
  processingType: 'rag' | 'kg' | 'idp';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedConfig: Record<string, any>;
}

export class DocumentAnalyzer {
  private static instance: DocumentAnalyzer;

  private constructor() {}

  static getInstance(): DocumentAnalyzer {
    if (!DocumentAnalyzer.instance) {
      DocumentAnalyzer.instance = new DocumentAnalyzer();
    }
    return DocumentAnalyzer.instance;
  }

  async analyzeDocument(file: File): Promise<DocumentCharacteristics> {
    // Initial analysis based on file type and name
    const fileType = this.detectFileType(file);
    const documentType = this.inferDocumentType(file.name, fileType);
    
    // Simulate async analysis - in production, this would call actual analysis APIs
    await this.simulateProcessing();
    
    // Perform different analysis based on document type
    const structure = await this.analyzeStructure(file, documentType);
    const content = await this.analyzeContent(file, documentType);
    const relationships = await this.analyzeRelationships(content);
    const recommendations = this.generateRecommendations(documentType, structure, content, relationships);
    
    return {
      documentType,
      structure,
      contentFeatures: content,
      relationships,
      processingRecommendations: recommendations,
      confidence: this.calculateConfidence(documentType, structure, content)
    };
  }

  private detectFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return extension;
  }

  private inferDocumentType(fileName: string, fileType: string): DocumentType {
    const lowerName = fileName.toLowerCase();
    
    // CRM-specific document patterns
    if (lowerName.includes('proposal')) return 'proposal';
    if (lowerName.includes('quote') || lowerName.includes('quotation')) return 'quote';
    if (lowerName.includes('ticket') || lowerName.includes('case') || lowerName.includes('support')) return 'ticket';
    if (lowerName.includes('sla') || lowerName.includes('service-level') || lowerName.includes('service_level')) return 'sla';
    if (lowerName.includes('feedback') || lowerName.includes('survey') || lowerName.includes('review')) return 'feedback';
    if (lowerName.includes('campaign')) return 'campaign';
    if (lowerName.includes('analytics') || lowerName.includes('metrics') || lowerName.includes('kpi')) return 'analytics';
    if (lowerName.includes('content') || lowerName.includes('asset') || lowerName.includes('media')) return 'content';
    
    // Standard document patterns
    if (lowerName.includes('invoice') || lowerName.includes('bill')) return 'invoice';
    if (lowerName.includes('contract') || lowerName.includes('agreement')) return 'contract';
    if (lowerName.includes('report') || lowerName.includes('analysis')) return 'report';
    if (lowerName.includes('form') || lowerName.includes('application')) return 'form';
    if (lowerName.includes('email') || lowerName.includes('message')) return 'email';
    if (lowerName.includes('article') || lowerName.includes('blog')) return 'article';
    if (fileType === 'ppt' || fileType === 'pptx') return 'presentation';
    if (fileType === 'xls' || fileType === 'xlsx' || fileType === 'csv') return 'spreadsheet';
    
    return 'unknown';
  }

  private async analyzeStructure(file: File, documentType: DocumentType): Promise<DocumentStructure> {
    // Mocked structure analysis based on document type
    const structures: Record<DocumentType, DocumentStructure> = {
      form: {
        hasTables: true,
        hasLists: false,
        hasHeaders: true,
        hasFooters: false,
        pageCount: 2,
        hasImages: false,
        hasCharts: false,
        formFields: 15,
        structureComplexity: 'moderate'
      },
      report: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 10,
        hasImages: true,
        hasCharts: true,
        formFields: 0,
        structureComplexity: 'complex'
      },
      contract: {
        hasTables: false,
        hasLists: true,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 20,
        hasImages: false,
        hasCharts: false,
        formFields: 0,
        structureComplexity: 'complex'
      },
      invoice: {
        hasTables: true,
        hasLists: false,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 1,
        hasImages: true,
        hasCharts: false,
        formFields: 10,
        structureComplexity: 'simple'
      },
      email: {
        hasTables: false,
        hasLists: false,
        hasHeaders: true,
        hasFooters: false,
        pageCount: 1,
        hasImages: false,
        hasCharts: false,
        formFields: 0,
        structureComplexity: 'simple'
      },
      article: {
        hasTables: false,
        hasLists: true,
        hasHeaders: true,
        hasFooters: false,
        pageCount: 5,
        hasImages: true,
        hasCharts: false,
        formFields: 0,
        structureComplexity: 'simple'
      },
      presentation: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: false,
        pageCount: 25,
        hasImages: true,
        hasCharts: true,
        formFields: 0,
        structureComplexity: 'moderate'
      },
      spreadsheet: {
        hasTables: true,
        hasLists: false,
        hasHeaders: true,
        hasFooters: false,
        pageCount: 5,
        hasImages: false,
        hasCharts: true,
        formFields: 0,
        structureComplexity: 'moderate'
      },
      unknown: {
        hasTables: false,
        hasLists: false,
        hasHeaders: false,
        hasFooters: false,
        pageCount: 1,
        hasImages: false,
        hasCharts: false,
        formFields: 0,
        structureComplexity: 'simple'
      }
    };

    return structures[documentType];
  }

  private async analyzeContent(file: File, documentType: DocumentType): Promise<ContentFeatures> {
    // Mocked content analysis based on document type
    const contentFeatures: Record<DocumentType, ContentFeatures> = {
      form: {
        language: 'en',
        wordCount: 500,
        avgSentenceLength: 10,
        technicalContent: false,
        financialData: true,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['name', 'address', 'date', 'amount', 'signature']
      },
      report: {
        language: 'en',
        wordCount: 5000,
        avgSentenceLength: 20,
        technicalContent: true,
        financialData: true,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['analysis', 'results', 'conclusions', 'recommendations', 'data']
      },
      contract: {
        language: 'en',
        wordCount: 10000,
        avgSentenceLength: 30,
        technicalContent: false,
        financialData: true,
        legalContent: true,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['party', 'agreement', 'terms', 'conditions', 'liability']
      },
      invoice: {
        language: 'en',
        wordCount: 200,
        avgSentenceLength: 8,
        technicalContent: false,
        financialData: true,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['invoice', 'total', 'due', 'payment', 'item']
      },
      email: {
        language: 'en',
        wordCount: 300,
        avgSentenceLength: 15,
        technicalContent: false,
        financialData: false,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: false,
        topKeywords: ['meeting', 'follow-up', 'request', 'update', 'action']
      },
      article: {
        language: 'en',
        wordCount: 2000,
        avgSentenceLength: 18,
        technicalContent: true,
        financialData: false,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: false,
        topKeywords: ['technology', 'innovation', 'development', 'future', 'impact']
      },
      presentation: {
        language: 'en',
        wordCount: 1500,
        avgSentenceLength: 12,
        technicalContent: true,
        financialData: true,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['overview', 'objectives', 'results', 'strategy', 'timeline']
      },
      spreadsheet: {
        language: 'en',
        wordCount: 1000,
        avgSentenceLength: 5,
        technicalContent: false,
        financialData: true,
        legalContent: false,
        hasNamedEntities: false,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['data', 'column', 'row', 'total', 'average']
      },
      unknown: {
        language: 'en',
        wordCount: 1000,
        avgSentenceLength: 15,
        technicalContent: false,
        financialData: false,
        legalContent: false,
        hasNamedEntities: false,
        hasDates: false,
        hasAmounts: false,
        topKeywords: []
      }
    };

    return contentFeatures[documentType];
  }

  private async analyzeRelationships(content: ContentFeatures): Promise<RelationshipFeatures> {
    // Mock relationship analysis based on content features
    const hasRelationships = content.hasNamedEntities && content.wordCount > 1000;
    
    return {
      entityCount: content.hasNamedEntities ? Math.floor(content.wordCount / 100) : 0,
      potentialRelations: hasRelationships ? Math.floor(content.wordCount / 200) : 0,
      hierarchicalStructure: content.technicalContent || content.legalContent,
      temporalReferences: content.hasDates,
      crossReferences: content.wordCount > 2000,
      entityTypes: content.hasNamedEntities ? 
        ['Person', 'Organization', 'Location', 'Date'] : []
    };
  }

  private generateRecommendations(
    documentType: DocumentType,
    structure: DocumentStructure,
    content: ContentFeatures,
    relationships: RelationshipFeatures
  ): ProcessingRecommendation[] {
    const recommendations: ProcessingRecommendation[] = [];

    // RAG recommendation - best for long-form content and search
    if (content.wordCount > 1000 || documentType === 'article' || documentType === 'report') {
      recommendations.push({
        processingType: 'rag',
        priority: 'high',
        reason: 'Document contains substantial text content suitable for semantic search and retrieval',
        suggestedConfig: {
          chunkSize: content.avgSentenceLength > 20 ? 1000 : 500,
          chunkOverlap: 100,
          embeddingModel: content.technicalContent ? 'technical-bert' : 'general-bert'
        }
      });
    }

    // Knowledge Graph recommendation - best for entities and relationships
    if (relationships.entityCount > 5 && relationships.potentialRelations > 3) {
      recommendations.push({
        processingType: 'kg',
        priority: 'high',
        reason: 'Document contains multiple entities and relationships suitable for knowledge graph construction',
        suggestedConfig: {
          entityExtraction: true,
          relationshipMapping: true,
          entityTypes: relationships.entityTypes,
          minConfidence: 0.7
        }
      });
    }

    // IDP recommendation - best for structured documents
    if (structure.hasTables || structure.formFields > 0 || 
        documentType === 'invoice' || documentType === 'form') {
      recommendations.push({
        processingType: 'idp',
        priority: 'high',
        reason: 'Document contains structured data, forms, or tables that require specialized extraction',
        suggestedConfig: {
          extractTables: structure.hasTables,
          extractForms: structure.formFields > 0,
          extractMetadata: true,
          ocrRequired: structure.hasImages
        }
      });
    }

    // Secondary recommendations
    if (content.financialData && recommendations.every(r => r.processingType !== 'idp')) {
      recommendations.push({
        processingType: 'idp',
        priority: 'medium',
        reason: 'Document contains financial data that could benefit from structured extraction',
        suggestedConfig: {
          extractAmounts: true,
          extractDates: true,
          extractTables: true
        }
      });
    }

    if (content.hasNamedEntities && recommendations.every(r => r.processingType !== 'kg')) {
      recommendations.push({
        processingType: 'kg',
        priority: 'medium',
        reason: 'Document contains named entities that could be mapped to a knowledge graph',
        suggestedConfig: {
          entityExtraction: true,
          relationshipMapping: false,
          entityTypes: ['Person', 'Organization', 'Location']
        }
      });
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateConfidence(
    documentType: DocumentType,
    structure: DocumentStructure,
    content: ContentFeatures
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on clear document type
    if (documentType !== 'unknown') confidence += 0.2;

    // Increase confidence based on consistent structure
    if (structure.structureComplexity !== 'complex') confidence += 0.1;

    // Increase confidence based on content clarity
    if (content.topKeywords.length > 3) confidence += 0.1;
    if (content.hasNamedEntities) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private async simulateProcessing(): Promise<void> {
    // Simulate async processing delay
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Additional utility methods for specific analysis
  async quickAnalysis(file: File): Promise<{
    documentType: DocumentType;
    recommendedProcessing: ProcessingRecommendation[];
  }> {
    const documentType = this.inferDocumentType(file.name, this.detectFileType(file));
    const structure = await this.analyzeStructure(file, documentType);
    const content = await this.analyzeContent(file, documentType);
    const relationships = await this.analyzeRelationships(content);
    const recommendations = this.generateRecommendations(documentType, structure, content, relationships);

    return {
      documentType,
      recommendedProcessing: recommendations.filter(r => r.priority === 'high')
    };
  }
}

export default DocumentAnalyzer.getInstance();