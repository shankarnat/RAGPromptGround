import { FC } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import IndexStatisticsPanel from "@/components/IndexStatisticsPanel";
import IndexPlayground from "@/components/IndexPlayground";
import IndexFAQPanel from "@/components/IndexFAQPanel";
import { sampleIndexConfiguration } from "@/data/sampleIndexData";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConfigureIndex: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Your index configuration has been saved successfully."
    });
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar activePage="configure-index" />
      
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 border-b border-gray-200 bg-blue-700 flex items-center px-6">
          <h1 className="text-xl font-semibold text-white">New Configuration</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Statistics Panel */}
          <IndexStatisticsPanel statistics={sampleIndexConfiguration.statistics} />
          
          {/* Main content */}
          <div className="flex space-x-6 h-full">
            <div className="flex-1 min-w-0">
              <IndexPlayground fields={sampleIndexConfiguration.fields} />
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <IndexFAQPanel />
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/vectorization")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vectorization
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
                    description: "Proceeding to build the search pipeline."
                  });
                  navigate("/pipeline");
                }}
                className="flex items-center"
              >
                Next: Build Pipeline
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