import { FC } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import UploadPanel from "@/components/UploadPanel";
import DataModelPanel from "@/components/DataModelPanel";
import { Button } from "@/components/ui/button";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useToast } from "@/hooks/use-toast";

const DocumentUpload: FC = () => {
  const { state, selectDocument, selectDataModel, uploadDocument, navigateToParseChunk } = useDocumentProcessing();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleNext = () => {
    if (!state.selectedDocument) {
      toast({
        title: "Document Required",
        description: "Please upload or select a document to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!state.selectedDataModel) {
      toast({
        title: "Data Model Required",
        description: "Please select a data model to continue.",
        variant: "destructive"
      });
      return;
    }

    // Update state and navigate to Parse & Chunk
    navigateToParseChunk();
    navigate('/parse-chunk');
    
    toast({
      title: "Document Ready",
      description: "Now you can parse and chunk your document.",
    });
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar activePage="upload" />
      
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">Document Ingestion</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex space-x-6 h-full">
            <div className="flex-1 min-w-0">
              <UploadPanel 
                isUploading={state.isUploading}
                uploadProgress={state.uploadProgress}
                recentDocuments={state.recentDocuments}
                selectedDocument={state.selectedDocument}
                onSelectDocument={selectDocument}
                onUploadDocument={uploadDocument}
              />
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <DataModelPanel 
                dataModels={state.dataModels}
                selectedDataModel={state.selectedDataModel}
                onSelectDataModel={selectDataModel}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              size="lg"
              onClick={handleNext}
              disabled={!state.selectedDocument || !state.selectedDataModel}
            >
              Next: Parse & Chunk
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentUpload;