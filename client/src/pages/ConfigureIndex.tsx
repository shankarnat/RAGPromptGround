import { FC, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndexStatisticsPanel from "@/components/IndexStatisticsPanel";
import EnhancedIndexPlayground from "@/components/EnhancedIndexPlayground";
import EnhancedIndexingPanel from "@/components/EnhancedIndexingPanel";
import { sampleIndexConfiguration } from "@/data/sampleIndexData";
import { ArrowLeft, ArrowRight, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";

const ConfigureIndex: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { state, updateFieldProperty } = useDocumentProcessing();
  const [activeTab, setActiveTab] = useState("document");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Your index configuration has been saved successfully."
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Add typehead property to the fields for the FieldIndexingPanel
  const enhancedFields = state.fields.map(field => ({
    ...field,
    typehead: false
  }));

  const handleFieldPropertyChange = (
    fieldId: number,
    property: "retrievable" | "filterable" | "typehead",
    value: boolean
  ) => {
    if (property === "retrievable" || property === "filterable") {
      updateFieldProperty(fieldId, property, value);
    }
    // We'd handle typehead separately if needed
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar removed - full width layout */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 bg-blue-700 flex items-center px-6">
          <h1 className="text-xl font-semibold text-white">Configure Index</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Statistics Panel */}
          <IndexStatisticsPanel statistics={sampleIndexConfiguration.statistics} />
          
          {/* Tabbed Interface */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Preview
              </Button>
              <div className="text-sm text-gray-600">
                Last updated: 5 minutes ago
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 px-4 pt-4">
                <TabsTrigger value="document">Original Document</TabsTrigger>
                <TabsTrigger value="chunks">Chunks</TabsTrigger>
                <TabsTrigger value="recordIndex">Record Index</TabsTrigger>
              </TabsList>
              
              <TabsContent value="document" className="p-4">
                <div className="border rounded-lg p-6 min-h-[300px]">
                  <h3 className="font-medium mb-3">Financial Report Q1 2023</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Executive Summary
                  </p>
                  <p className="text-sm mb-2">
                    For the first quarter of 2023, we recorded total revenue of $45.7 million, up 12.4% compared to $40.7 million in the first quarter of 2022. The revenue growth was primarily driven by a 28% increase in subscription services revenue and 15% growth in professional services compared to the same period last year.
                  </p>
                  <p className="text-sm mb-2">
                    Operating income was $5.3 million, representing an operating margin of 11.6%, compared to $3.8 million and 9.3% in the first quarter of 2022.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="chunks" className="p-4">
                <div className="border rounded-lg p-6 min-h-[300px]">
                  <h3 className="font-medium mb-3">Document Chunks</h3>
                  <div className="space-y-4">
                    {state.chunks.map((chunk) => (
                      <div key={chunk.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Chunk #{chunk.chunkIndex}</span>
                          <span className="text-xs text-gray-500">{chunk.tokenCount} tokens</span>
                        </div>
                        <p className="text-sm">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recordIndex" className="p-4">
                <div className="border rounded-lg p-6 min-h-[300px]">
                  <h3 className="font-medium mb-3">Record Index</h3>
                  <pre className="text-xs text-gray-700 overflow-auto bg-gray-50 p-4 rounded border">
{`{
  "id": "fin_report_q1_2023",
  "title": "Financial Report Q1 2023",
  "date": "2023-04-15",
  "fields": {
    "quarter": "Q1",
    "year": "2023",
    "revenue": "$45.7 million",
    "growth": "12.4%",
    "operating_income": "$5.3 million",
    "operating_margin": "11.6%"
  },
  "embeddings": {
    "model": "E5 Large V2",
    "dimensions": 1536,
    "vector": [0.0231, -0.0124, 0.0342, ...]
  }
}`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Main content */}
          <div className="flex space-x-6 h-full">
            <div className="flex-1 min-w-0">
              <EnhancedIndexPlayground fields={sampleIndexConfiguration.fields} />
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <EnhancedIndexingPanel 
                fields={enhancedFields}
                onFieldPropertyChange={handleFieldPropertyChange}
              />
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/parse-chunk")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parse & Chunk
            </Button>
            <div className="space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSave}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "Moving to Next Step",
                    description: "Proceeding to embedding model selection for vectorization."
                  });
                  navigate("/vectorization");
                }}
                className="flex items-center"
              >
                Next: Vectorization
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConfigureIndex;