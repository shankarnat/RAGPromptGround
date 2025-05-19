import { FC, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Save, Layers, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EmbeddingModelSelector from "@/components/EmbeddingModelSelector";
import EmbeddingDimensionVisualizer from "@/components/EmbeddingDimensionVisualizer";
import EmbeddingAdvancedOptions, { AdvancedEmbeddingOptions } from "@/components/EmbeddingAdvancedOptions";
import { embeddingModels, defaultAdvancedOptions } from "@/data/embeddingModelsData";
import { useToast } from "@/hooks/use-toast";

const Vectorization: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedModelId, setSelectedModelId] = useState("openai-text-embedding-3-large");
  const [advancedOptions, setAdvancedOptions] = useState(defaultAdvancedOptions);
  
  const selectedModel = embeddingModels.find(model => model.id === selectedModelId);
  
  const handleSaveConfiguration = () => {
    toast({
      title: "Vectorization Settings Saved",
      description: `Using ${selectedModel?.name} with ${selectedModel?.dimensions} dimensions`
    });
  };
  
  const handleUpdateOptions = (newOptions: any) => {
    setAdvancedOptions(newOptions);
    toast({
      title: "Advanced Options Updated",
      description: "Your embedding configuration has been updated"
    });
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar removed - full width layout */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 bg-blue-700 flex items-center px-6">
          <h1 className="text-xl font-semibold text-white flex items-center">
            <Layers className="h-6 w-6 mr-2" />
            Vectorization Configuration
          </h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Embedding Model Selection</AlertTitle>
            <AlertDescription>
              Choose an embedding model to vectorize your document chunks. The embedding model determines how your text is converted into numerical vectors for retrieval.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <EmbeddingModelSelector
                models={embeddingModels}
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModelId}
              />
            </div>
            
            <div>
              {selectedModel && (
                <EmbeddingDimensionVisualizer
                  dimensions={selectedModel.dimensions}
                  modelName={selectedModel.name}
                />
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <EmbeddingAdvancedOptions
              options={advancedOptions}
              onUpdateOptions={handleUpdateOptions}
            />
          </div>
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/configure-index")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Configure Index
            </Button>
            
            <div className="space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSaveConfiguration}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
              
              <Button 
                onClick={() => {
                  toast({
                    title: "Moving to Next Step",
                    description: "Proceeding to test your vectorized index."
                  });
                  navigate("/test");
                }}
                className="flex items-center"
              >
                Next: Test Results
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Vectorization;