import { useState, useEffect } from "react";
import { 
  sampleDocument, 
  financialCsvDocument,
  sampleChunks, 
  financialCsvChunks,
  sampleFields, 
  sampleMetadataFields,
  financialCsvMetadataFields 
} from "@/data/sampleDocument";
import { recentDocuments, dataModels } from "@/data/sampleUploadData";
import { embeddingModels, defaultAdvancedOptions } from "@/data/embeddingModelsData";
import { mockIDPResults } from "@/data/mockIDPData";
import { 
  ChunkingMethod, 
  ProcessingMode, 
  TabView, 
  UploadedDocument, 
  DataModel, 
  MetadataField,
  RecordStructure 
} from "@shared/schema";
import ProcessingPipeline, { ProcessingStep, PipelineStatus } from "@/services/ProcessingPipeline";
import { ProcessingIntent } from "@/services/ConversationManager";

// Document example type
export type DocumentExample = "financialReport" | "financialCsv";

export interface DocumentProcessingState {
  document: {
    title: string;
    pageCount: number;
    content: string;
    pdfUrl?: string;
  };
  chunks: {
    id: number;
    documentId: number;
    title: string;
    content: string;
    tokenCount: number;
    chunkIndex: number;
    tags: string[];
    isMarkdownFormatted?: boolean;
  }[];
  activeTab: TabView;
  selectedChunk: number | null;
  processingMode: ProcessingMode;
  chunkingMethod: ChunkingMethod;
  chunkSize: number;
  chunkOverlap: number;
  fields: {
    id: number;
    name: string;
    documentId: number;
    retrievable: boolean;
    filterable: boolean;
    typehead?: boolean;
  }[];
  // Metadata & record-level indexing state
  metadataFields: MetadataField[];
  recordLevelIndexingEnabled: boolean;
  recordStructure: RecordStructure;
  // Vectorization state
  selectedModelId: string;
  advancedEmbeddingOptions: typeof defaultAdvancedOptions;
  // Upload document view state
  activePage: string;
  uploadProgress: number;
  isUploading: boolean;
  recentDocuments: UploadedDocument[];
  selectedDocument: UploadedDocument | null;
  dataModels: DataModel[];
  selectedDataModel: DataModel | null;
  // Example switching
  currentExample: DocumentExample;
  // Vehicle information for automotive context
  vehicleInfo?: {
    vin?: string;
    model?: string;
    year?: string;
    make?: string;
  };
  // Prompt-based parsing state
  promptParsing: {
    isApplied: boolean;
    customPrompt: string;
  };
  // Unified processing state
  unifiedProcessing: {
    ragEnabled: boolean;
    kgEnabled: boolean;
    idpEnabled: boolean;
    ragResults?: any;
    kgResults?: any;
    idpResults?: any;
    processingStatus: {
      rag: "idle" | "processing" | "completed" | "error";
      kg: "idle" | "processing" | "completed" | "error";
      idp: "idle" | "processing" | "completed" | "error";
    };
    // New unified processing properties
    selectedProcessingTypes: ("standard" | "kg" | "idp")[];
    unifiedResults: {
      standard?: {
        chunks: any[];
        vectors: any[];
        indexStatus: string;
      };
      kg?: {
        entities: any[];
        relationships: any[];
        graph: any;
      };
      idp?: {
        metadata: Record<string, any>;
        classification: string[];
        extractedData: any;
      };
    };
    // Pipeline state
    pipeline: {
      status: PipelineStatus;
      steps: ProcessingStep[];
      currentIntent?: ProcessingIntent;
    };
  };
}

export function useDocumentProcessing() {
  const [state, setState] = useState<DocumentProcessingState>({
    document: null,
    chunks: [],
    activeTab: "split",
    selectedChunk: 3,
    processingMode: "standard",
    chunkingMethod: "semantic",
    chunkSize: 150,
    chunkOverlap: 20,
    fields: sampleFields,
    // Metadata & record-level indexing state
    metadataFields: sampleMetadataFields,
    recordLevelIndexingEnabled: false,
    recordStructure: "flat",
    // Vectorization state
    selectedModelId: "openai-text-embedding-3-large",
    advancedEmbeddingOptions: defaultAdvancedOptions,
    // Upload document view state
    activePage: "upload", // Default to upload page
    uploadProgress: 0,
    isUploading: false,
    recentDocuments: recentDocuments,
    selectedDocument: null,
    dataModels: dataModels,
    selectedDataModel: null,
    // Example document switching
    currentExample: "financialReport",
    // Prompt-based parsing state
    promptParsing: {
      isApplied: false,
      customPrompt: ""
    },
    // Unified processing state
    unifiedProcessing: {
      ragEnabled: true,
      kgEnabled: false,
      idpEnabled: false,
      ragResults: null,
      kgResults: null,
      idpResults: null,
      processingStatus: {
        rag: "idle",
        kg: "idle",
        idp: "idle"
      },
      // New unified processing properties
      selectedProcessingTypes: ["standard"],
      unifiedResults: {
        standard: {
          chunks: [],
          vectors: [],
          indexStatus: "not_indexed"
        },
        kg: {
          entities: [],
          relationships: [],
          graph: {
            nodes: 0,
            edges: 0,
            density: 0
          }
        },
        idp: undefined
      },
      // Pipeline state
      pipeline: {
        status: {
          status: 'idle',
          currentStep: null,
          totalSteps: 0,
          completedSteps: 0,
          progress: 0
        },
        steps: []
      }
    }
  });

  const updateChunkingMethod = (method: ChunkingMethod) => {
    setState((prev) => ({
      ...prev,
      chunkingMethod: method
    }));
  };

  const updateChunkSize = (size: number) => {
    setState((prev) => ({
      ...prev,
      chunkSize: size
    }));
  };

  const updateChunkOverlap = (overlap: number) => {
    setState((prev) => ({
      ...prev,
      chunkOverlap: overlap
    }));
  };

  const updateProcessingMode = (mode: ProcessingMode) => {
    setState((prev) => ({
      ...prev,
      processingMode: mode
    }));
  };

  const updateActiveTab = (tab: TabView) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab
    }));
  };

  const selectChunk = (chunkId: number | null) => {
    setState((prev) => ({
      ...prev,
      selectedChunk: chunkId
    }));
  };

  const updateFieldProperty = (fieldId: number, property: "retrievable" | "filterable" | "typehead", value: boolean) => {
    setState((prev) => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    }));
  };

  // Upload view methods
  const setActivePage = (page: string) => {
    setState((prev) => ({
      ...prev,
      activePage: page
    }));
  };

  const selectDocument = (document: UploadedDocument | null) => {
    setState((prev) => {
      let pdfUrl: string | undefined;
      
      // If the document is the Acura RDX fact sheet, set its PDF URL
      if (document && document.name === "Acura_2025_RDX_Fact Sheet.pdf") {
        pdfUrl = `/pdfs/${encodeURIComponent(document.name)}`;
      }
      
      return {
        ...prev,
        selectedDocument: document,
        document: {
          ...prev.document,
          pdfUrl: pdfUrl
        }
      };
    });
  };

  const selectDataModel = (model: DataModel | null) => {
    setState((prev) => ({
      ...prev,
      selectedDataModel: model
    }));
  };

  const uploadDocument = (file: File) => {
    // Simulate upload process
    setState((prev) => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0
    }));

    const simulateUploadProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Create a new document and add it to recent documents
          const newDocument: UploadedDocument = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString()
          };

          setState((prev) => ({
            ...prev,
            isUploading: false,
            uploadProgress: 0,
            selectedDocument: newDocument,
            recentDocuments: [newDocument, ...prev.recentDocuments.slice(0, 4)]
          }));
        } else {
          setState((prev) => ({
            ...prev,
            uploadProgress: Math.floor(progress)
          }));
        }
      }, 300);
    };

    // Start simulated upload after a small delay
    setTimeout(simulateUploadProgress, 300);
  };

  const navigateToParseChunk = () => {
    // Switch to the Parse & Chunk page
    setState((prev) => ({
      ...prev,
      activePage: "parse-chunk"
    }));
  };

  // Create document record chunk from metadata
  const createDocumentRecordChunk = () => {
    const includedFields = state.metadataFields.filter(field => field.included);
    
    // Skip if no fields are included
    if (includedFields.length === 0) return;
    
    // Format JSON based on selected structure
    let recordData: Record<string, any> = {};
    
    if (state.recordStructure === "flat") {
      // Flat structure: all fields at the root level
      includedFields.forEach(field => {
        recordData[field.name] = field.value;
      });
    } 
    else if (state.recordStructure === "nested") {
      // Nested structure: group by field types
      const standardFields: Record<string, any> = {};
      const documentFields: Record<string, any> = {};
      const customFields: Record<string, any> = {};
      
      includedFields.forEach(field => {
        // Categorize fields based on name pattern
        if (["author", "creationDate", "lastModified", "title"].includes(field.name)) {
          standardFields[field.name] = field.value;
        } 
        else if (["fileSize", "fileType", "sourceLocation"].includes(field.name)) {
          documentFields[field.name] = field.value;
        } 
        else {
          customFields[field.name] = field.value;
        }
      });
      
      recordData = {
        standardMetadata: standardFields,
        documentMetadata: documentFields,
        customMetadata: customFields
      };
    } 
    else {
      // Custom structure (simplified example)
      const metadata: Record<string, any> = {};
      const content: Record<string, any> = {};
      
      includedFields.forEach(field => {
        if (["fileSize", "fileType", "sourceLocation"].includes(field.name)) {
          metadata[field.name] = field.value;
        } else {
          content[field.name] = field.value;
        }
      });
      
      recordData = {
        metadata: metadata,
        content: content,
        indexTimestamp: new Date().toISOString()
      };
    }
    
    // Create JSON string for display
    const jsonString = JSON.stringify(recordData, null, 2);
    
    // Find any existing document record chunk and remove it
    const existingRecordChunkIndex = state.chunks.findIndex(
      chunk => chunk.tags.includes('document-record')
    );
    
    const newChunks = [...state.chunks];
    if (existingRecordChunkIndex >= 0) {
      newChunks.splice(existingRecordChunkIndex, 1);
    }
    
    // Create a new chunk with the document record data
    const recordChunk = {
      id: Math.max(...state.chunks.map(c => c.id), 0) + 1,
      documentId: state.chunks[0]?.documentId || 1,
      title: "Document Record Metadata",
      content: jsonString,
      tokenCount: jsonString.length / 4, // Rough estimate of tokens
      chunkIndex: newChunks.length + 1,
      tags: ["document-record", "metadata", state.recordStructure]
    };
    
    // Add the new record chunk
    newChunks.push(recordChunk);
    
    return newChunks;
  };
  
  // Metadata handling methods
  const updateMetadataField = (fieldId: number, property: "included" | "value", value: boolean | string) => {
    setState(prev => ({
      ...prev,
      metadataFields: prev.metadataFields.map(field => 
        field.id === fieldId 
          ? { ...field, [property]: value } 
          : field
      )
    }));
    
    // After updating a metadata field, update chunks if record indexing is enabled
    if (state.recordLevelIndexingEnabled) {
      setTimeout(() => {
        const updatedChunks = createDocumentRecordChunk();
        if (updatedChunks) {
          setState(prev => ({
            ...prev,
            chunks: updatedChunks
          }));
        }
      }, 0);
    }
  };

  const toggleRecordLevelIndexing = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      recordLevelIndexingEnabled: enabled,
      // If turning it on, also switch to the record tab
      activeTab: enabled && prev.activeTab === "split" ? "documentRecord" : prev.activeTab
    }));
    
    // Update chunks when toggling on/off record-level indexing
    if (enabled) {
      // Add document record as a chunk
      setTimeout(() => {
        const updatedChunks = createDocumentRecordChunk();
        if (updatedChunks) {
          setState(prev => ({
            ...prev,
            chunks: updatedChunks
          }));
        }
      }, 0);
    } else {
      // Remove document record chunk when disabled
      setTimeout(() => {
        const filteredChunks = state.chunks.filter(
          chunk => !chunk.tags.includes('document-record')
        );
        
        setState(prev => ({
          ...prev,
          chunks: filteredChunks
        }));
      }, 0);
    }
  };

  const updateRecordStructure = (structure: RecordStructure) => {
    setState(prev => ({
      ...prev,
      recordStructure: structure
    }));
    
    // Update document record chunk when changing structure (if enabled)
    if (state.recordLevelIndexingEnabled) {
      setTimeout(() => {
        const updatedChunks = createDocumentRecordChunk();
        if (updatedChunks) {
          setState(prev => ({
            ...prev,
            chunks: updatedChunks
          }));
        }
      }, 0);
    }
  };

  const addCustomMetadataField = (name: string, value: string) => {
    const newField: MetadataField = {
      id: state.metadataFields.length + 1,
      name,
      value,
      included: true,
      confidence: 1.0 // Custom fields have full confidence
    };

    setState(prev => ({
      ...prev,
      metadataFields: [...prev.metadataFields, newField]
    }));
    
    // Update document record chunk when adding a new field (if enabled)
    if (state.recordLevelIndexingEnabled) {
      setTimeout(() => {
        const updatedChunks = createDocumentRecordChunk();
        if (updatedChunks) {
          setState(prev => ({
            ...prev,
            chunks: updatedChunks
          }));
        }
      }, 0);
    }
  };

  // Vectorization methods
  const selectEmbeddingModel = (modelId: string) => {
    setState(prev => ({
      ...prev,
      selectedModelId: modelId
    }));
  };

  const updateEmbeddingOptions = (options: typeof defaultAdvancedOptions) => {
    setState(prev => ({
      ...prev,
      advancedEmbeddingOptions: options
    }));
  };

  // Example document switching
  const switchDocumentExample = (example: DocumentExample) => {
    // Don't do anything if we're already on the selected example
    if (state.currentExample === example) {
      return;
    }
    
    // Prepare the data for the selected example
    let newDocument;
    let newChunks;
    let newMetadataFields;
    let newChunkingMethod: ChunkingMethod = "semantic";
    
    switch (example) {
      case "financialCsv":
        newDocument = financialCsvDocument;
        newChunks = financialCsvChunks;
        newMetadataFields = financialCsvMetadataFields;
        // For CSV data, we're simulating column-based chunking
        newChunkingMethod = "fixed";
        break;
      case "financialReport":
      default:
        newDocument = sampleDocument;
        newChunks = sampleChunks;
        newMetadataFields = sampleMetadataFields;
        newChunkingMethod = "semantic";
        break;
    }
    
    // Update the state with the new example data
    setState(prev => ({
      ...prev,
      document: newDocument,
      chunks: newChunks,
      metadataFields: newMetadataFields,
      currentExample: example,
      // Reset some settings to be appropriate for the document type
      chunkingMethod: newChunkingMethod,
      selectedChunk: example === "financialCsv" ? 101 : 3, // First chunk ID for each example
      recordLevelIndexingEnabled: example === "financialCsv", // Enable record indexing for CSV by default
      recordStructure: example === "financialCsv" ? "flat" : "flat"
    }));
  };

  // Unified processing methods
  const toggleUnifiedProcessing = (type: "rag" | "kg" | "idp", enabled: boolean) => {
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        [`${type}Enabled`]: enabled
      }
    }));
  };

  // New method to toggle processing type selection
  const toggleProcessingType = (type: "standard" | "kg" | "idp") => {
    setState(prev => {
      const currentTypes = prev.unifiedProcessing.selectedProcessingTypes;
      let newTypes: typeof currentTypes;
      
      if (currentTypes.includes(type)) {
        newTypes = currentTypes.filter(t => t !== type);
      } else {
        newTypes = [...currentTypes, type];
      }
      
      // Update the legacy enabled flags for backward compatibility
      const ragEnabled = newTypes.includes("standard");
      const kgEnabled = newTypes.includes("kg");
      const idpEnabled = newTypes.includes("idp");
      
      return {
        ...prev,
        unifiedProcessing: {
          ...prev.unifiedProcessing,
          selectedProcessingTypes: newTypes,
          ragEnabled,
          kgEnabled,
          idpEnabled
        }
      };
    });
  };

  const updateProcessingStatus = (type: "rag" | "kg" | "idp", status: "idle" | "processing" | "completed" | "error") => {
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        processingStatus: {
          ...prev.unifiedProcessing.processingStatus,
          [type]: status
        }
      }
    }));
  };

  const updateProcessingResults = (type: "rag" | "kg" | "idp", results: any) => {
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        [`${type}Results`]: results
      }
    }));
  };

  // New method to update unified results
  const updateUnifiedResults = (type: "standard" | "kg" | "idp", results: any) => {
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        unifiedResults: {
          ...prev.unifiedProcessing.unifiedResults,
          [type]: results
        }
      }
    }));
  };

  // Enhanced method to run unified processing
  const runUnifiedProcessing = async () => {
    const { selectedProcessingTypes } = state.unifiedProcessing;
    const document = state.selectedDocument || state.document;
    
    // Clear previous results
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        unifiedResults: {}
      }
    }));
    
    // Process standard RAG if selected
    if (selectedProcessingTypes.includes("standard")) {
      updateProcessingStatus("rag", "processing");
      
      // Simulate processing
      setTimeout(() => {
        // Get the latest state inside setTimeout to avoid stale closure
        setState(prev => {
          let currentChunks = prev.chunks.length > 0 ? prev.chunks : sampleChunks;
          console.log('🔥 Processing with chunks:', currentChunks.length, 'First chunk isMarkdownFormatted:', currentChunks[0]?.isMarkdownFormatted);
          console.log('🔥 Prompt parsing state:', prev.promptParsing);
          
          // If prompt parsing is applied, transform the chunks
          if (prev.promptParsing?.isApplied && prev.promptParsing?.customPrompt) {
            console.log('🔥 Applying prompt parsing transformation to chunks during processing');
            currentChunks = currentChunks.map(chunk => {
              // Check if this chunk contains table data that needs conversion
              if (chunk.content.includes('Drivetrain') || chunk.content.includes('Engine') || 
                  chunk.content.includes('towing') || chunk.content.includes('specifications')) {
                
                // Convert to Markdown table format
                let markdownContent = chunk.content;
                
                // Example conversion for drivetrain specifications
                if (chunk.content.includes('Drivetrain Type')) {
                  markdownContent = `## Drivetrain Specifications\n\n| Component | Specification | Details |\n|-----------|--------------|---------|\n| Drivetrain Type | SH-AWD® | Super Handling All-Wheel Drive™ |\n| Transmission | 10-Speed Automatic | 10AT with paddle shifters |\n| Towing Capacity | 1,500 lbs | When properly equipped |`;
                }
                // Example conversion for engine specifications
                else if (chunk.content.includes('Engine Type')) {
                  markdownContent = `## Engine Specifications\n\n| Specification | Value |\n|--------------|-------|\n| Engine Type | 2.0L VTEC® Turbo |\n| Horsepower | 272 hp @ 6,500 rpm |\n| Torque | 280 lb-ft @ 1,600-4,500 rpm |\n| Fuel System | Direct Injection |`;
                }
                
                console.log('🔥 TRANSFORMING CHUNK:', chunk.title, 'FROM:', chunk.content.substring(0, 50), 'TO:', markdownContent.substring(0, 50));
                return {
                  ...chunk,
                  content: markdownContent,
                  isMarkdownFormatted: true
                };
              }
              
              // For other chunks, try to apply general Markdown formatting
              let formattedContent = chunk.content;
              formattedContent = formattedContent.replace(/^([A-Z][A-Za-z\s]+):/gm, '### $1:');
              formattedContent = formattedContent.replace(/^[•·-]\s+/gm, '- ');
              formattedContent = formattedContent.replace(/\b(IMPORTANT|NOTE|WARNING)\b/g, '**$1**');
              
              return {
                ...chunk,
                content: formattedContent,
                isMarkdownFormatted: true
              };
            });
          }
          
          const standardResults = {
            chunks: currentChunks,
            vectors: currentChunks.map(chunk => ({
              id: chunk.id,
              vector: Array(768).fill(0).map(() => Math.random()),
              metadata: { chunkIndex: chunk.chunkIndex }
            })),
            indexStatus: "indexed"
          };
          
          console.log('🔥 Final chunks after processing:', currentChunks.length, 'First chunk isMarkdownFormatted:', (currentChunks[0] as any)?.isMarkdownFormatted);
          
          // Update state with the results
          return {
            ...prev,
            chunks: currentChunks, // Also update the main chunks array
            unifiedProcessing: {
              ...prev.unifiedProcessing,
              processingStatus: {
                ...prev.unifiedProcessing.processingStatus,
                rag: "completed"
              },
              unifiedResults: {
                ...prev.unifiedProcessing.unifiedResults,
                standard: standardResults
              }
            }
          };
        });
        
        // Update other states after setState
        updateProcessingResults("rag", { chunks: state.chunks });
      }, 2000);
    }
    
    // Process Knowledge Graph if selected
    if (selectedProcessingTypes.includes("kg")) {
      updateProcessingStatus("kg", "processing");
      
      // Simulate processing
      setTimeout(() => {
        const kgResults = {
          entities: [
            { 
              id: 1, 
              type: "Person", 
              name: "John Doe", 
              properties: {
                role: "CEO",
                experience: "15 years",
                location: "San Francisco"
              },
              relationships: [
                { type: "WORKS_AT", target: "Acme Corp", direction: "outbound" }
              ]
            },
            { 
              id: 2, 
              type: "Organization", 
              name: "Acme Corp", 
              properties: {
                industry: "Technology",
                founded: "2010",
                size: "500+ employees"
              },
              relationships: [
                { type: "EMPLOYS", target: "John Doe", direction: "outbound" }
              ]
            },
            { 
              id: 3, 
              type: "Date", 
              name: "2024",
              properties: {},
              relationships: []
            }
          ],
          relations: [
            { source: 1, target: 2, type: "WORKS_AT", confidence: 0.92 }
          ],
          graph: {
            nodes: 3,
            edges: 1,
            density: 0.33
          }
        };
        
        updateProcessingStatus("kg", "completed");
        updateProcessingResults("kg", kgResults);
        updateUnifiedResults("kg", kgResults);
      }, 3000);
    }
    
    // Process IDP if selected
    if (selectedProcessingTypes.includes("idp")) {
      updateProcessingStatus("idp", "processing");
      
      // Simulate processing
      setTimeout(() => {
        // Use proper mock IDP data with tables
        const idpResults = mockIDPResults;
        
        updateProcessingStatus("idp", "completed");
        updateProcessingResults("idp", idpResults);
        updateUnifiedResults("idp", idpResults);
      }, 2500);
    }
  };

  // Process document with intent from conversation
  const processWithIntent = async (intent: ProcessingIntent) => {
    // Configure pipeline based on intent
    const steps = ProcessingPipeline.configureFromIntent(intent, state.selectedDocument || state.document);
    
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        pipeline: {
          status: ProcessingPipeline.getPipelineStatus(),
          steps,
          currentIntent: intent
        }
      }
    }));
    
    // Subscribe to pipeline updates
    const unsubscribeProgress = ProcessingPipeline.onProgress((status) => {
      setState(prev => ({
        ...prev,
        unifiedProcessing: {
          ...prev.unifiedProcessing,
          pipeline: {
            ...prev.unifiedProcessing.pipeline,
            status
          }
        }
      }));
    });
    
    const unsubscribeStep = ProcessingPipeline.onStepUpdate((step) => {
      setState(prev => ({
        ...prev,
        unifiedProcessing: {
          ...prev.unifiedProcessing,
          pipeline: {
            ...prev.unifiedProcessing.pipeline,
            steps: prev.unifiedProcessing.pipeline.steps.map(s => 
              s.id === step.id ? step : s
            )
          }
        }
      }));
    });
    
    try {
      // Execute the pipeline
      await ProcessingPipeline.execute();
      
      // Get combined results
      const results = ProcessingPipeline.getCombinedResults();
      
      // Update results based on intent type
      if (intent.intent === 'find_answers_tables') {
        if (results.idp && results.rag) {
          setState(prev => ({
            ...prev,
            unifiedProcessing: {
              ...prev.unifiedProcessing,
              unifiedResults: {
                ...prev.unifiedProcessing.unifiedResults,
                idp: {
                  metadata: {},
                  classification: ['table-data'],
                  extractedData: results.idp['idp-table-extraction']
                },
                standard: {
                  chunks: results.rag['rag-table-chunking']?.chunks || [],
                  vectors: [],
                  indexStatus: results.rag['rag-indexing']?.searchReady ? 'indexed' : 'pending'
                }
              }
            }
          }));
        }
      } else if (intent.intent === 'extract_form_fields') {
        if (results.idp) {
          setState(prev => ({
            ...prev,
            unifiedProcessing: {
              ...prev.unifiedProcessing,
              unifiedResults: {
                ...prev.unifiedProcessing.unifiedResults,
                idp: mockIDPResults
              }
            }
          }));
        }
      } else if (intent.intent === 'understand_relationships') {
        if (results.kg) {
          setState(prev => ({
            ...prev,
            unifiedProcessing: {
              ...prev.unifiedProcessing,
              unifiedResults: {
                ...prev.unifiedProcessing.unifiedResults,
                kg: {
                  entities: results.kg['kg-entity-extraction']?.entities || [],
                  relationships: results.kg['kg-relation-mapping']?.relations || [],
                  graph: results.kg['kg-graph-building']?.graph || {}
                }
              }
            }
          }));
        }
      }
      
    } finally {
      unsubscribeProgress();
      unsubscribeStep();
    }
  };

  // Set up pipeline subscriptions on mount
  // Initialize with sample document on mount
  useEffect(() => {
    setState(prev => ({
      ...prev,
      document: sampleDocument,
      chunks: sampleChunks
    }));
  }, []);
  
  useEffect(() => {
    const unsubscribeProgress = ProcessingPipeline.onProgress((status) => {
      setState(prev => ({
        ...prev,
        unifiedProcessing: {
          ...prev.unifiedProcessing,
          pipeline: {
            ...prev.unifiedProcessing.pipeline,
            status
          }
        }
      }));
    });
    
    const unsubscribeStep = ProcessingPipeline.onStepUpdate((step) => {
      setState(prev => ({
        ...prev,
        unifiedProcessing: {
          ...prev.unifiedProcessing,
          pipeline: {
            ...prev.unifiedProcessing.pipeline,
            steps: prev.unifiedProcessing.pipeline.steps.map(s => 
              s.id === step.id ? step : s
            )
          }
        }
      }));
    });
    
    return () => {
      unsubscribeProgress();
      unsubscribeStep();
    };
  }, []);

  // Clear all results and reset to initial state
  const clearAllResults = () => {
    setState(prev => ({
      ...prev,
      unifiedProcessing: {
        ...prev.unifiedProcessing,
        ragResults: null,
        kgResults: null,
        idpResults: null,
        processingStatus: {
          rag: "idle",
          kg: "idle",
          idp: "idle"
        },
        unifiedResults: {
          standard: {
            chunks: sampleChunks,
            vectors: sampleChunks.map(chunk => ({
              id: chunk.id,
              vector: Array(768).fill(0).map(() => Math.random()),
              metadata: { chunkIndex: chunk.chunkIndex }
            })),
            indexStatus: "indexed"
          },
          kg: {
            entities: [
              { 
                id: 1, 
                type: "Person", 
                name: "John Smith", 
                properties: {
                  role: "Chief Financial Officer",
                  department: "Finance",
                  tenure: "5 years"
                },
                relationships: [
                  { type: "REPORTS_TO", target: "Jane Doe", direction: "outbound" },
                  { type: "MANAGES", target: "Finance Team", direction: "outbound" }
                ]
              },
              { 
                id: 2, 
                type: "Organization", 
                name: "Acme Corporation", 
                properties: {
                  industry: "Technology",
                  size: "Enterprise",
                  location: "San Francisco, CA"
                },
                relationships: [
                  { type: "EMPLOYS", target: "John Smith", direction: "outbound" },
                  { type: "PARTNER_WITH", target: "TechCorp", direction: "outbound" }
                ]
              },
              { 
                id: 3, 
                type: "Date", 
                name: "Q4 2023",
                properties: {
                  year: "2023",
                  quarter: "Q4"
                },
                relationships: []
              }
            ],
            relationships: [
              { id: 1, source: "John Smith", target: "Acme Corporation", type: "WORKS_AT", properties: { confidence: 0.95 } }
            ],
            graph: {
              nodes: 3,
              edges: 2,
              density: 0.33
            }
          },
          idp: mockIDPResults
        }
      }
    }));
  };
  
  // Legacy method for backward compatibility
  const processDocument = async () => {
    return runUnifiedProcessing();
  };

  // Prompt-based parsing methods
  const updatePromptParsing = (isApplied: boolean, customPrompt: string) => {
    setState(prev => ({
      ...prev,
      promptParsing: {
        isApplied,
        customPrompt
      }
    }));
  };

  const applyPromptParsing = (customPrompt?: string) => {
    // Use provided prompt or get it from current state
    const promptToApply = customPrompt || state.promptParsing?.customPrompt || 
      "Convert any tables (especially drivetrain specifications) to clean markdown format. Extract key technical specifications and present them in structured tables with proper headers.";
    
    console.log('🔥 applyPromptParsing called with:', promptToApply);
    updatePromptParsing(true, promptToApply);
    
    // If no unified results, process document first and then apply transformation
    const currentState = state;
    if (!currentState.unifiedProcessing.unifiedResults.standard?.chunks || 
        currentState.unifiedProcessing.unifiedResults.standard.chunks.length === 0) {
      console.log('🔥 No unified results found, processing document first then applying transformation');
      // Process the document to populate unified results, then apply transformation
      processDocument();
      // The transformation will be applied after processDocument completes via the updated state
      return;
    }
    
    console.log('🔥 Unified results exist, applying transformation immediately');
    // Convert chunks to Markdown format when prompt parsing is applied
    setState(prev => {
      console.log('Current chunks before transformation:', prev.chunks);
      console.log('Number of chunks:', prev.chunks.length);
      console.log('Current unified results:', prev.unifiedProcessing.unifiedResults);
      
      // Get chunks from either the main chunks array or unified results
      let chunksToTransform = prev.chunks;
      if (chunksToTransform.length === 0 && prev.unifiedProcessing.unifiedResults.standard?.chunks) {
        console.log('Using chunks from unified results');
        chunksToTransform = prev.unifiedProcessing.unifiedResults.standard.chunks;
      }
      
      // If still no chunks, use sample chunks
      if (chunksToTransform.length === 0) {
        console.log('No chunks found, using sample chunks');
        chunksToTransform = sampleChunks;
      }
      
      const updatedChunks = chunksToTransform.map(chunk => {
        // Check if this chunk contains table data that needs conversion
        if (chunk.content.includes('Drivetrain') || chunk.content.includes('Engine') || 
            chunk.content.includes('towing') || chunk.content.includes('specifications')) {
          
          // Convert to Markdown table format
          let markdownContent = chunk.content;
          
          // Example conversion for drivetrain specifications
          if (chunk.content.includes('Drivetrain Type')) {
            markdownContent = `## Drivetrain Specifications\n\n| Component | Specification | Details |\n|-----------|--------------|---------|\n| Drivetrain Type | SH-AWD® | Super Handling All-Wheel Drive™ |\n| Transmission | 10-Speed Automatic | 10AT with paddle shifters |\n| Towing Capacity | 1,500 lbs | When properly equipped |`;
          }
          // Example conversion for engine specifications
          else if (chunk.content.includes('Engine Type')) {
            markdownContent = `## Engine Specifications\n\n| Specification | Value |\n|--------------|-------|\n| Engine Type | 2.0L VTEC® Turbo |\n| Horsepower | 272 hp @ 6,500 rpm |\n| Torque | 280 lb-ft @ 1,600-4,500 rpm |\n| Fuel System | Direct Injection |`;
          }
          // Example conversion for dimensions
          else if (chunk.content.includes('dimensions') || chunk.content.includes('Length')) {
            markdownContent = `## Vehicle Dimensions\n\n| Dimension | Measurement |\n|-----------|-------------|\n| Length | 187.4 inches |\n| Width | 74.8 inches |\n| Height | 65.7 inches |\n| Wheelbase | 108.3 inches |\n| Ground Clearance | 8.2 inches |`;
          }
          
          return {
            ...chunk,
            content: markdownContent,
            // Add a flag to indicate this chunk has been converted
            isMarkdownFormatted: true
          };
        }
        
        // For other chunks, try to apply general Markdown formatting
        let formattedContent = chunk.content;
        
        // Add headers for sections
        formattedContent = formattedContent.replace(/^([A-Z][A-Za-z\s]+):/gm, '### $1:');
        
        // Convert bullet points
        formattedContent = formattedContent.replace(/^[•·-]\s+/gm, '- ');
        
        // Add emphasis to key terms
        formattedContent = formattedContent.replace(/\b(IMPORTANT|NOTE|WARNING)\b/g, '**$1**');
        
        return {
          ...chunk,
          content: formattedContent,
          isMarkdownFormatted: true
        };
      });
      
      // Also update the unified results if they exist
      const updatedUnifiedResults = { ...prev.unifiedProcessing.unifiedResults };
      if (updatedUnifiedResults.standard?.chunks) {
        console.log('Updating unified results chunks with Markdown formatting');
        updatedUnifiedResults.standard = {
          ...updatedUnifiedResults.standard,
          chunks: updatedChunks
        };
      } else {
        console.log('No unified results found, creating new standard results with transformed chunks');
        updatedUnifiedResults.standard = {
          chunks: updatedChunks,
          vectors: updatedChunks.map(chunk => ({
            id: chunk.id,
            vector: Array(768).fill(0).map(() => Math.random()),
            metadata: { chunkIndex: chunk.chunkIndex }
          })),
          indexStatus: "indexed"
        };
      }
      
      // Update the state and force a timestamp change to trigger re-renders
      const newState = {
        ...prev,
        chunks: updatedChunks,
        unifiedProcessing: {
          ...prev.unifiedProcessing,
          unifiedResults: updatedUnifiedResults,
          // Add a timestamp to force updates
          lastUpdated: Date.now()
        }
      };
      
      console.log('State after prompt parsing:', {
        chunksCount: newState.chunks.length,
        hasMarkdownChunks: newState.chunks.some((c: any) => c.isMarkdownFormatted),
        unifiedResultsChunks: newState.unifiedProcessing.unifiedResults.standard?.chunks?.length,
        firstChunkIsMarkdown: newState.unifiedProcessing.unifiedResults.standard?.chunks?.[0]?.isMarkdownFormatted
      });
      
      return newState;
    });
  };

  const clearPromptParsing = () => {
    updatePromptParsing(false, "");
  };

  // Generic state update method
  const updateState = (updates: Partial<DocumentProcessingState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  return {
    state,
    updateState,
    updateChunkingMethod,
    updateChunkSize,
    updateChunkOverlap,
    updateProcessingMode,
    updateActiveTab,
    selectChunk,
    updateFieldProperty,
    // Metadata methods
    updateMetadataField,
    toggleRecordLevelIndexing,
    updateRecordStructure,
    addCustomMetadataField,
    // Vectorization methods
    selectEmbeddingModel,
    updateEmbeddingOptions,
    // Example switching
    switchDocumentExample,
    // Upload view methods
    setActivePage,
    selectDocument,
    selectDataModel,
    uploadDocument,
    navigateToParseChunk,
    // Unified processing methods
    toggleUnifiedProcessing,
    updateProcessingStatus,
    updateProcessingResults,
    processDocument,
    // New unified processing methods
    toggleProcessingType,
    updateUnifiedResults,
    runUnifiedProcessing,
    // Intent-based processing
    processWithIntent,
    // Clear results
    clearAllResults,
    // Prompt-based parsing methods
    updatePromptParsing,
    applyPromptParsing,
    clearPromptParsing
  };
}
