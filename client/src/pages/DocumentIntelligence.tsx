import { FC } from "react";
import Sidebar from "@/components/Sidebar";
import DocumentHeader from "@/components/DocumentHeader";
import TabNavigation from "@/components/TabNavigation";
import DocumentPanel from "@/components/DocumentPanel";
import ChunksPanel from "@/components/ChunksPanel";
import ConfigurationPanel from "@/components/ConfigurationPanel";
import NavigationButtons from "@/components/NavigationButtons";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useToast } from "@/hooks/use-toast";

const DocumentIntelligence: FC = () => {
  const { state, updateChunkingMethod, updateChunkSize, updateChunkOverlap, updateProcessingMode, updateActiveTab, selectChunk, updateFieldProperty } = useDocumentProcessing();
  const { toast } = useToast();

  const handlePrevious = () => {
    toast({
      title: "Navigation",
      description: "Going to previous step: Upload Document",
    });
  };

  const handleNext = () => {
    toast({
      title: "Navigation",
      description: "Going to next step: Embed Vectors",
    });
  };

  // Show different content based on the active tab
  const renderMainContent = () => {
    switch (state.activeTab) {
      case "document":
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0">
              <DocumentPanel documentContent={state.document.content} />
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <ConfigurationPanel 
                chunkingMethod={state.chunkingMethod}
                onChunkingMethodChange={updateChunkingMethod}
                chunkSize={state.chunkSize}
                onChunkSizeChange={updateChunkSize}
                chunkOverlap={state.chunkOverlap}
                onChunkOverlapChange={updateChunkOverlap}
                fields={state.fields}
                onFieldPropertyChange={updateFieldProperty}
              />
            </div>
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
              />
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <ConfigurationPanel 
                chunkingMethod={state.chunkingMethod}
                onChunkingMethodChange={updateChunkingMethod}
                chunkSize={state.chunkSize}
                onChunkSizeChange={updateChunkSize}
                chunkOverlap={state.chunkOverlap}
                onChunkOverlapChange={updateChunkOverlap}
                fields={state.fields}
                onFieldPropertyChange={updateFieldProperty}
              />
            </div>
          </div>
        );
      case "fieldIndex":
        return (
          <div className="flex space-x-6">
            <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Field Index Configuration</h3>
              <p className="text-gray-500 mb-6">
                Configure how each detected field will be indexed and used in your retrieval system.
              </p>
              {/* More detailed field index configuration would go here */}
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <ConfigurationPanel 
                chunkingMethod={state.chunkingMethod}
                onChunkingMethodChange={updateChunkingMethod}
                chunkSize={state.chunkSize}
                onChunkSizeChange={updateChunkSize}
                chunkOverlap={state.chunkOverlap}
                onChunkOverlapChange={updateChunkOverlap}
                fields={state.fields}
                onFieldPropertyChange={updateFieldProperty}
              />
            </div>
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
                />
              </div>
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <ConfigurationPanel 
                chunkingMethod={state.chunkingMethod}
                onChunkingMethodChange={updateChunkingMethod}
                chunkSize={state.chunkSize}
                onChunkSizeChange={updateChunkSize}
                chunkOverlap={state.chunkOverlap}
                onChunkOverlapChange={updateChunkOverlap}
                fields={state.fields}
                onFieldPropertyChange={updateFieldProperty}
              />
            </div>
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
