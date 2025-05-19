import { useState, useEffect } from 'react';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';

export interface ProcessingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'user';
  version: string;
  createdAt: string;
  updatedAt: string;
  configuration: {
    processingTypes: {
      rag: boolean;
      kg: boolean;
      idp: boolean;
    };
    ragSettings?: {
      chunking: boolean;
      vectorization: boolean;
      indexing: boolean;
      chunkSize?: number;
      chunkOverlap?: number;
      chunkingMethod?: string;
    };
    kgSettings?: {
      entityExtraction: boolean;
      relationMapping: boolean;
      graphBuilding: boolean;
      entityTypes?: string[];
      relationTypes?: string[];
    };
    idpSettings?: {
      textExtraction: boolean;
      classification: boolean;
      metadata: boolean;
      extractionRules?: any[];
    };
  };
  metadata?: {
    author?: string;
    tags?: string[];
    usageCount?: number;
    lastUsed?: string;
  };
}

const STORAGE_KEY = 'documentProcessingTemplates';
const CURRENT_VERSION = '1.0.0';

// Predefined system templates
const systemTemplates: ProcessingTemplate[] = [
  {
    id: 'financial-analysis',
    name: 'Financial Document Analysis',
    description: 'Comprehensive analysis for financial reports, earnings statements, and annual reports',
    category: 'system',
    version: CURRENT_VERSION,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    configuration: {
      processingTypes: {
        rag: true,
        kg: true,
        idp: true
      },
      ragSettings: {
        chunking: true,
        vectorization: true,
        indexing: true,
        chunkSize: 200,
        chunkOverlap: 40,
        chunkingMethod: 'semantic'
      },
      kgSettings: {
        entityExtraction: true,
        relationMapping: true,
        graphBuilding: true,
        entityTypes: ['COMPANY', 'PERSON', 'MONEY', 'DATE', 'PERCENTAGE', 'METRIC'],
        relationTypes: ['REPORTS_TO', 'OWNS', 'INVESTS_IN', 'ACQUIRED_BY']
      },
      idpSettings: {
        textExtraction: true,
        classification: true,
        metadata: true,
        extractionRules: [
          { field: 'revenue', pattern: 'revenue.*\\$[0-9,]+' },
          { field: 'profit', pattern: 'profit.*\\$[0-9,]+' },
          { field: 'date', pattern: '\\d{4}-\\d{2}-\\d{2}' }
        ]
      }
    },
    metadata: {
      tags: ['financial', 'analysis', 'comprehensive'],
      usageCount: 0
    }
  },
  {
    id: 'contract-analysis',
    name: 'Contract Analysis',
    description: 'Optimized for legal documents, contracts, and agreements',
    category: 'system',
    version: CURRENT_VERSION,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    configuration: {
      processingTypes: {
        rag: true,
        kg: false,
        idp: true
      },
      ragSettings: {
        chunking: true,
        vectorization: true,
        indexing: true,
        chunkSize: 150,
        chunkOverlap: 30,
        chunkingMethod: 'fixed'
      },
      idpSettings: {
        textExtraction: true,
        classification: true,
        metadata: true,
        extractionRules: [
          { field: 'parties', pattern: 'between.*and' },
          { field: 'date', pattern: 'dated.*\\d{4}' },
          { field: 'term', pattern: 'term.*years?' }
        ]
      }
    },
    metadata: {
      tags: ['legal', 'contract', 'analysis'],
      usageCount: 0
    }
  },
  {
    id: 'research-paper',
    name: 'Research Paper Analysis',
    description: 'Ideal for academic papers, scientific articles, and technical documentation',
    category: 'system',
    version: CURRENT_VERSION,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    configuration: {
      processingTypes: {
        rag: true,
        kg: true,
        idp: false
      },
      ragSettings: {
        chunking: true,
        vectorization: true,
        indexing: true,
        chunkSize: 300,
        chunkOverlap: 50,
        chunkingMethod: 'semantic'
      },
      kgSettings: {
        entityExtraction: true,
        relationMapping: true,
        graphBuilding: true,
        entityTypes: ['PERSON', 'ORGANIZATION', 'CONCEPT', 'METHOD', 'TECHNOLOGY'],
        relationTypes: ['AUTHORED_BY', 'CITES', 'USES', 'IMPROVES_UPON']
      }
    },
    metadata: {
      tags: ['research', 'academic', 'scientific'],
      usageCount: 0
    }
  },
  {
    id: 'quick-search',
    name: 'Quick Search Index',
    description: 'Fast document indexing for search and retrieval only',
    category: 'system',
    version: CURRENT_VERSION,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    configuration: {
      processingTypes: {
        rag: true,
        kg: false,
        idp: false
      },
      ragSettings: {
        chunking: true,
        vectorization: true,
        indexing: true,
        chunkSize: 100,
        chunkOverlap: 20,
        chunkingMethod: 'fixed'
      }
    },
    metadata: {
      tags: ['search', 'fast', 'simple'],
      usageCount: 0
    }
  }
];

export function useTemplateSystem() {
  const { state, toggleProcessingType, updateChunkingMethod, updateChunkSize, updateChunkOverlap } = useDocumentProcessing();
  const [templates, setTemplates] = useState<ProcessingTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Load templates from localStorage on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Load templates from localStorage
  const loadTemplates = () => {
    try {
      const storedTemplates = localStorage.getItem(STORAGE_KEY);
      if (storedTemplates) {
        const userTemplates = JSON.parse(storedTemplates);
        setTemplates([...systemTemplates, ...userTemplates]);
      } else {
        setTemplates(systemTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(systemTemplates);
    }
  };

  // Save templates to localStorage
  const saveTemplates = (templatesToSave: ProcessingTemplate[]) => {
    try {
      const userTemplates = templatesToSave.filter(t => t.category === 'user');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
      setTemplates(templatesToSave);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  // Create a new template from current configuration
  const createTemplate = (name: string, description: string): ProcessingTemplate => {
    const newTemplate: ProcessingTemplate = {
      id: `user-${Date.now()}`,
      name,
      description,
      category: 'user',
      version: CURRENT_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configuration: {
        processingTypes: {
          rag: state.unifiedProcessing.ragEnabled,
          kg: state.unifiedProcessing.kgEnabled,
          idp: state.unifiedProcessing.idpEnabled
        },
        ragSettings: state.unifiedProcessing.ragEnabled ? {
          chunking: true,
          vectorization: true,
          indexing: true,
          chunkSize: state.chunkSize,
          chunkOverlap: state.chunkOverlap,
          chunkingMethod: state.chunkingMethod
        } : undefined,
        kgSettings: state.unifiedProcessing.kgEnabled ? {
          entityExtraction: true,
          relationMapping: true,
          graphBuilding: true
        } : undefined,
        idpSettings: state.unifiedProcessing.idpEnabled ? {
          textExtraction: true,
          classification: true,
          metadata: true
        } : undefined
      },
      metadata: {
        author: 'current-user',
        tags: [],
        usageCount: 0,
        lastUsed: new Date().toISOString()
      }
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    return newTemplate;
  };

  // Apply a template to current configuration
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const config = template.configuration;
    
    // Update processing types
    if (config.processingTypes.rag !== state.unifiedProcessing.ragEnabled) {
      toggleProcessingType('standard');
    }
    if (config.processingTypes.kg !== state.unifiedProcessing.kgEnabled) {
      toggleProcessingType('kg');
    }
    if (config.processingTypes.idp !== state.unifiedProcessing.idpEnabled) {
      toggleProcessingType('idp');
    }

    // Update RAG settings if available
    if (config.ragSettings) {
      if (config.ragSettings.chunkingMethod) {
        updateChunkingMethod(config.ragSettings.chunkingMethod as any);
      }
      if (config.ragSettings.chunkSize) {
        updateChunkSize(config.ragSettings.chunkSize);
      }
      if (config.ragSettings.chunkOverlap) {
        updateChunkOverlap(config.ragSettings.chunkOverlap);
      }
    }

    // Update usage metadata
    const updatedTemplate = {
      ...template,
      metadata: {
        ...template.metadata,
        usageCount: (template.metadata?.usageCount || 0) + 1,
        lastUsed: new Date().toISOString()
      }
    };

    const updatedTemplates = templates.map(t => 
      t.id === templateId ? updatedTemplate : t
    );
    
    saveTemplates(updatedTemplates);
    setSelectedTemplateId(templateId);
  };

  // Update an existing template
  const updateTemplate = (templateId: string, updates: Partial<ProcessingTemplate>) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || template.category === 'system') return;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: CURRENT_VERSION
    };

    const updatedTemplates = templates.map(t => 
      t.id === templateId ? updatedTemplate : t
    );
    
    saveTemplates(updatedTemplates);
  };

  // Delete a template
  const deleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || template.category === 'system') return;

    const updatedTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
    
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
    }
  };

  // Export a template
  const exportTemplate = (templateId: string): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    return JSON.stringify(template, null, 2);
  };

  // Import a template
  const importTemplate = (templateJson: string): ProcessingTemplate => {
    try {
      const template = JSON.parse(templateJson) as ProcessingTemplate;
      
      // Validate template structure
      if (!template.id || !template.name || !template.configuration) {
        throw new Error('Invalid template structure');
      }

      // Generate new ID to avoid conflicts
      const importedTemplate: ProcessingTemplate = {
        ...template,
        id: `imported-${Date.now()}`,
        category: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          ...template.metadata,
          author: 'imported',
          usageCount: 0
        }
      };

      const updatedTemplates = [...templates, importedTemplate];
      saveTemplates(updatedTemplates);
      
      return importedTemplate;
    } catch (error) {
      throw new Error('Failed to import template: ' + error);
    }
  };

  // Get templates by category
  const getTemplatesByCategory = (category: 'system' | 'user' | 'all' = 'all') => {
    if (category === 'all') return templates;
    return templates.filter(t => t.category === category);
  };

  // Search templates
  const searchTemplates = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(lowercaseQuery) ||
      t.description.toLowerCase().includes(lowercaseQuery) ||
      t.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  return {
    templates,
    selectedTemplateId,
    createTemplate,
    applyTemplate,
    updateTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
    getTemplatesByCategory,
    searchTemplates,
    setSelectedTemplateId
  };
}