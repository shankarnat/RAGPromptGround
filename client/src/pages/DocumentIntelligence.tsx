import { FC } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import DocumentHeader from "@/components/DocumentHeader";
import TabNavigation from "@/components/TabNavigation";
import DocumentPanel from "@/components/DocumentPanel";
import ChunksPanel from "@/components/ChunksPanel";
import DocumentRecordPanel from "@/components/DocumentRecordPanel";
import TestQueryInterface from "@/components/TestQueryInterface";
import NavigationButtons from "@/components/NavigationButtons";
import CombinedConfigurationPanel from "@/components/CombinedConfigurationPanel";
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
    updateEmbeddingOptions
  } = useDocumentProcessing();
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
          recordLevelIndexingEnabled={state.recordLevelIndexingEnabled}
          onRecordLevelIndexingToggle={toggleRecordLevelIndexing}
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
              <DocumentPanel documentContent={state.document.content} />
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
                <DocumentPanel documentContent={state.document.content} />
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
      <Sidebar activePage="parse-chunk" />
      
      <div className="flex-1 flex flex-col ml-64">
        <DocumentHeader 
          documentTitle={state.document.title}
          pageCount={state.document.pageCount}
          processingMode={state.processingMode}
          onProcessingModeChange={updateProcessingMode}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <TabNavigation 
            activeTab={state.activeTab} 
            onTabChange={updateActiveTab} 
          />
          
          {renderMainContent()}
          
          <NavigationButtons 
            onPrevious={handlePrevious} 
            onNext={handleNext} 
          />
        </main>
      </div>
    </div>
  );
};

export default DocumentIntelligence;
