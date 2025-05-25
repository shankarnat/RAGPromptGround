import { FC, useState, useEffect } from "react";
import { useLocation } from "wouter";
// import Sidebar from "@/components/Sidebar"; // Removed sidebar
import DocumentHeader from "@/components/DocumentHeader";
import TabNavigation from "@/components/TabNavigation";
import DocumentPanel from "@/components/DocumentPanel";
import ChunksPanel from "@/components/ChunksPanel";
import DocumentRecordPanel from "@/components/DocumentRecordPanel";
import TestQueryInterface from "@/components/TestQueryInterface";
import NavigationButtons from "@/components/NavigationButtons";
import CombinedConfigurationPanel from "@/components/CombinedConfigurationPanel";
import DocumentExampleSwitcher from "@/components/DocumentExampleSwitcher";
import ProgressiveDocumentLoader from "@/components/ProgressiveDocumentLoader";
import IntentBasedProcessingTrigger from "@/services/IntentBasedProcessingTrigger";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useToast } from "@/hooks/use-toast";

const DocumentIntelligence: FC = () => {
  const { 
    state, 
    updateChunkingMethod, 
    updateChunkSize, 
    updateChunkOverlap, 
    updateProcessingMode, 
    updateActiveTab, 
    selectChunk, 
    updateFieldProperty,
    updateMetadataField,
    toggleRecordLevelIndexing,
    updateRecordStructure,
    addCustomMetadataField,
    // Vectorization methods
    selectEmbeddingModel,
    updateEmbeddingOptions,
    // Example switching
    switchDocumentExample,
    // Processing methods
    processWithIntent
  } = useDocumentProcessing();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // State for document analysis and progressive loading
  const [documentReady, setDocumentReady] = useState(false);
  const [basicAnalysis, setBasicAnalysis] = useState<any>(null);
  const [showProgressiveLoader, setShowProgressiveLoader] = useState(true);

  const handlePrevious = () => {
    toast({
      title: "Navigation",
      description: "Going to previous step: Upload Document"
    });
    navigate("/upload");
  };
  
  const handleNext = () => {
    toast({
      title: "Navigation",
      description: "Going to next step: Configure Index"
    });
    navigate("/configure-index");
  };
  
  // Handle on-demand processing requests
  const handleProcessingRequest = (type: 'idp' | 'rag' | 'kg' | 'combined', config?: any) => {
    // Close the progressive loader
    setShowProgressiveLoader(false);
    
    // Trigger processing via the service
    const result = IntentBasedProcessingTrigger.triggerFromUI(type, {
      ...config,
      document: state.selectedDocument || state.document
    });
    
    if (result.success) {
      toast({
        title: "Processing Started",
        description: `Starting ${type.toUpperCase()} processing...`
      });
      
      // Use the processing system based on type
      if (type === 'combined' && config?.types) {
        IntentBasedProcessingTrigger.triggerCombinedProcessing(config.types, {
          document: state.selectedDocument || state.document
        });
      }
    } else {
      toast({
        title: "Processing Failed",
        description: result.error || "Failed to start processing",
        variant: "destructive"
      });
    }
  };
  
  // Handle document analysis completion
  const handleDocumentReady = (preview: any, analysis: any) => {
    setDocumentReady(true);
    setBasicAnalysis(analysis);
  };

  // Show different content based on the active tab
  const renderMainContent = () => {
    // The configuration panel is consistent across all views
    const configPanel = (
      <div className="w-80 lg:w-96 flex-shrink-0">
        <CombinedConfigurationPanel 
          // Chunking props
          chunkingMethod={state.chunkingMethod}
          onChunkingMethodChange={updateChunkingMethod}
          chunkSize={state.chunkSize}
          onChunkSizeChange={updateChunkSize}
          chunkOverlap={state.chunkOverlap}
          onChunkOverlapChange={updateChunkOverlap}
          // Metadata props
          metadataFields={state.metadataFields}
          onMetadataFieldChange={updateMetadataField}
          recordStructure={state.recordStructure}
          onRecordStructureChange={updateRecordStructure}
          onAddCustomField={addCustomMetadataField}
          // Field-level indexing props
          fields={state.fields}
          onFieldPropertyChange={updateFieldProperty}
          // Vectorization props
          selectedModelId={state.selectedModelId}
          onSelectModel={selectEmbeddingModel}
          advancedOptions={state.advancedEmbeddingOptions}
          onUpdateOptions={updateEmbeddingOptions}
        />
      </div>
    );

    switch (state.activeTab) {
      case "document":
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0">
              <DocumentPanel documentContent={state.document.content} pdfUrl={state.document.pdfUrl} />
            </div>
            {configPanel}
          </div>
        );
      
      case "chunks":
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0">
              <ChunksPanel 
                chunks={state.chunks} 
                selectedChunk={state.selectedChunk} 
                onChunkSelect={selectChunk} 
                chunkingMethod={state.chunkingMethod}
                chunkSize={state.chunkSize}
                chunkOverlap={state.chunkOverlap}
              />
            </div>
            {configPanel}
          </div>
        );
      
      case "documentRecord":
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0">
              <DocumentRecordPanel 
                metadataFields={state.metadataFields}
                recordStructure={state.recordStructure}
                fields={state.fields}
              />
            </div>
            {configPanel}
          </div>
        );
        
      case "test":
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0">
              <TestQueryInterface 
                fields={state.fields}
              />
            </div>
            {configPanel}
          </div>
        );

      case "split":
      default:
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0 flex space-x-6">
              <div className="flex-1 min-w-0">
                <DocumentPanel documentContent={state.document.content} pdfUrl={state.document.pdfUrl} />
              </div>
              <div className="flex-1 min-w-0">
                <ChunksPanel 
                  chunks={state.chunks} 
                  selectedChunk={state.selectedChunk} 
                  onChunkSelect={selectChunk}
                  chunkingMethod={state.chunkingMethod}
                  chunkSize={state.chunkSize}
                  chunkOverlap={state.chunkOverlap}
                />
              </div>
            </div>
            {configPanel}
          </div>
        );
    }
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar removed - full width layout */}
      
      <div className="flex-1 flex flex-col">
        <DocumentHeader 
          documentTitle={state.document.title}
          pageCount={state.document.pageCount}
          processingMode={state.processingMode}
          onProcessingModeChange={updateProcessingMode}
          onProcessingRequest={handleProcessingRequest}
          hasAnalysis={documentReady}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <DocumentExampleSwitcher
            currentExample={state.currentExample}
            onExampleChange={switchDocumentExample}
          />
          
          {/* Show progressive loader if document is newly selected */}
          {showProgressiveLoader && state.selectedDocument && (
            <div className="max-w-4xl mx-auto mb-6">
              <ProgressiveDocumentLoader
                document={state.selectedDocument}
                onProcessingRequest={handleProcessingRequest}
                onDocumentReady={handleDocumentReady}
                autoAnalyze={true}
              />
            </div>
          )}
          
          {/* Regular content once document is ready */}
          {(!showProgressiveLoader || documentReady) && (
            <>
              <TabNavigation 
                activeTab={state.activeTab} 
                onTabChange={updateActiveTab} 
              />
              
              {renderMainContent()}
              
              <NavigationButtons 
                onPrevious={handlePrevious} 
                onNext={handleNext} 
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocumentIntelligence;
