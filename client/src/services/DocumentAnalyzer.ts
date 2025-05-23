export interface DocumentCharacteristics {
  documentType: DocumentType;
  structure: DocumentStructure;
  contentFeatures: ContentFeatures;
  relationships: RelationshipFeatures;
  processingRecommendations: ProcessingRecommendation[];
  confidence: number;
}

export type DocumentType = 
  | 'service_manual'
  | 'parts_catalog'
  | 'owners_manual'
  | 'technical_bulletin'
  | 'specification_sheet'
  | 'form'
  | 'report'
  | 'presentation'
  | 'spreadsheet'
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
    
    // Automotive-specific document patterns
    if (lowerName.includes('service') && lowerName.includes('manual')) return 'service_manual';
    if (lowerName.includes('parts') && (lowerName.includes('catalog') || lowerName.includes('inventory'))) return 'parts_catalog';
    if (lowerName.includes('owner') && lowerName.includes('manual')) return 'owners_manual';
    if (lowerName.includes('technical') && lowerName.includes('bulletin')) return 'technical_bulletin';
    if (lowerName.includes('tsb')) return 'technical_bulletin';
    if (lowerName.includes('specification') || lowerName.includes('spec') && lowerName.includes('sheet')) return 'specification_sheet';
    
    // Standard document patterns
    if (lowerName.includes('report') || lowerName.includes('analysis')) return 'report';
    if (lowerName.includes('form') || lowerName.includes('application')) return 'form';
    if (fileType === 'ppt' || fileType === 'pptx') return 'presentation';
    if (fileType === 'xls' || fileType === 'xlsx' || fileType === 'csv') return 'spreadsheet';
    
    return 'unknown';
  }

  private async analyzeStructure(file: File, documentType: DocumentType): Promise<DocumentStructure> {
    // Mocked structure analysis based on document type
    const structures: Record<DocumentType, DocumentStructure> = {
      service_manual: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 150,
        hasImages: true,
        hasCharts: true,
        formFields: 0,
        structureComplexity: 'complex'
      },
      parts_catalog: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 200,
        hasImages: true,
        hasCharts: false,
        formFields: 0,
        structureComplexity: 'complex'
      },
      owners_manual: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 300,
        hasImages: true,
        hasCharts: true,
        formFields: 0,
        structureComplexity: 'moderate'
      },
      technical_bulletin: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: true,
        pageCount: 10,
        hasImages: true,
        hasCharts: false,
        formFields: 0,
        structureComplexity: 'moderate'
      },
      specification_sheet: {
        hasTables: true,
        hasLists: true,
        hasHeaders: true,
        hasFooters: false,
        pageCount: 5,
        hasImages: false,
        hasCharts: true,
        formFields: 0,
        structureComplexity: 'simple'
      },
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

    return structures[documentType] || structures.unknown;
  }

  private async analyzeContent(file: File, documentType: DocumentType): Promise<ContentFeatures> {
    // Mocked content analysis based on document type
    const contentFeatures: Record<DocumentType, ContentFeatures> = {
      service_manual: {
        language: 'en',
        wordCount: 50000,
        avgSentenceLength: 15,
        technicalContent: true,
        financialData: false,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['maintenance', 'procedure', 'specification', 'torque', 'diagnosis', 'repair']
      },
      parts_catalog: {
        language: 'en',
        wordCount: 30000,
        avgSentenceLength: 8,
        technicalContent: true,
        financialData: true,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: true,
        topKeywords: ['part number', 'component', 'assembly', 'price', 'availability', 'model']
      },
      owners_manual: {
        language: 'en',
        wordCount: 40000,
        avgSentenceLength: 12,
        technicalContent: true,
        financialData: false,
        legalContent: true,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: false,
        topKeywords: ['operation', 'safety', 'maintenance', 'warranty', 'features', 'controls']
      },
      technical_bulletin: {
        language: 'en',
        wordCount: 2000,
        avgSentenceLength: 18,
        technicalContent: true,
        financialData: false,
        legalContent: false,
        hasNamedEntities: true,
        hasDates: true,
        hasAmounts: false,
        topKeywords: ['issue', 'solution', 'affected', 'vehicles', 'procedure', 'update']
      },
      specification_sheet: {
        language: 'en',
        wordCount: 1000,
        avgSentenceLength: 10,
        technicalContent: true,
        financialData: false,
        legalContent: false,
        hasNamedEntities: false,
        hasDates: false,
        hasAmounts: true,
        topKeywords: ['dimension', 'weight', 'capacity', 'performance', 'rating', 'standard']
      },
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

    return contentFeatures[documentType] || contentFeatures.unknown;
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
    if (content.wordCount > 1000 || documentType === 'service_manual' || documentType === 'owners_manual' || documentType === 'report') {
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
        documentType === 'parts_catalog' || documentType === 'specification_sheet' || documentType === 'form') {
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