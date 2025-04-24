import { useState, useEffect } from "react";
import { sampleDocument, sampleChunks, sampleFields, sampleMetadataFields } from "@/data/sampleDocument";
import { recentDocuments, dataModels } from "@/data/sampleUploadData";
import { 
  ChunkingMethod, 
  ProcessingMode, 
  TabView, 
  UploadedDocument, 
  DataModel, 
  MetadataField,
  RecordStructure 
} from "@shared/schema";

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
  }[];
  // Metadata & record-level indexing state
  metadataFields: MetadataField[];
  recordLevelIndexingEnabled: boolean;
  recordStructure: RecordStructure;
  // Upload document view state
  activePage: string;
  uploadProgress: number;
  isUploading: boolean;
  recentDocuments: UploadedDocument[];
  selectedDocument: UploadedDocument | null;
  dataModels: DataModel[];
  selectedDataModel: DataModel | null;
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
    // Upload document view state
    activePage: "upload", // Default to upload page
    uploadProgress: 0,
    isUploading: false,
    recentDocuments: recentDocuments,
    selectedDocument: null,
    dataModels: dataModels,
    selectedDataModel: null
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

  const updateFieldProperty = (fieldId: number, property: "retrievable" | "filterable", value: boolean) => {
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
  };

  const toggleRecordLevelIndexing = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      recordLevelIndexingEnabled: enabled,
      // If turning it on, also switch to the record tab
      activeTab: enabled && prev.activeTab === "split" ? "documentRecord" : prev.activeTab
    }));
  };

  const updateRecordStructure = (structure: RecordStructure) => {
    setState(prev => ({
      ...prev,
      recordStructure: structure
    }));
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
    // Upload view methods
    setActivePage,
    selectDocument,
    selectDataModel,
    uploadDocument,
    navigateToParseChunk
  };
}
