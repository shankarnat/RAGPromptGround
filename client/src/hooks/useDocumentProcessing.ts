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
import { 
  ChunkingMethod, 
  ProcessingMode, 
  TabView, 
  UploadedDocument, 
  DataModel, 
  MetadataField,
  RecordStructure 
} from "@shared/schema";

// Document example type
export type DocumentExample = "financialReport" | "financialCsv";

export interface DocumentProcessingState {
  document: {
    title: string;
    pageCount: number;
    content: string;
  };
  chunks: {
    id: number;
    documentId: number;
    title: string;
    content: string;
    tokenCount: number;
    chunkIndex: number;
    tags: string[];
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
}

export function useDocumentProcessing() {
  const [state, setState] = useState<DocumentProcessingState>({
    document: sampleDocument,
    chunks: sampleChunks,
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
    currentExample: "financialReport"
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
    setState((prev) => ({
      ...prev,
      selectedDocument: document
    }));
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

  return {
    state,
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
    navigateToParseChunk
  };
}
