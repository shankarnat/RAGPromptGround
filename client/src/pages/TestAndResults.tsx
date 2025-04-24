import { FC } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import TestQueryInterface from "@/components/TestQueryInterface";
import ConfigurationSummaryPanel from "@/components/ConfigurationSummaryPanel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleFields } from "@/data/sampleDocument";

const TestAndResults: FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleDeploy = () => {
    toast({
      title: "Deployment Initiated",
      description: "Your search pipeline is being built and deployed."
    });
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar activePage="deploy" />
      
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 border-b border-gray-200 bg-blue-700 flex items-center px-6">
          <h1 className="text-xl font-semibold text-white">Review and Test</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Main content */}
          <div className="flex space-x-6 h-full">
            <div className="flex-1 min-w-0">
              <TestQueryInterface fields={sampleFields} />
            </div>
            <div className="w-80 lg:w-96 flex-shrink-0">
              <ConfigurationSummaryPanel />
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/configure-index")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Configuration
            </Button>
            <Button 
              onClick={handleDeploy}
              className="flex items-center"
            >
              Build & Deploy
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestAndResults;