import { useState, useEffect } from "react";
import { sampleDocument, sampleChunks, sampleFields } from "@/data/sampleDocument";
import { ChunkingMethod, ProcessingMode, TabView } from "@shared/schema";

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
    fields: sampleFields
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

  return {
    state,
    updateChunkingMethod,
    updateChunkSize,
    updateChunkOverlap,
    updateProcessingMode,
    updateActiveTab,
    selectChunk,
    updateFieldProperty
  };
}
