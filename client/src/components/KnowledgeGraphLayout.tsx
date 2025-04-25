import React, { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';

interface KnowledgeGraphLayoutProps {
  title: string;
  children: ReactNode;
  rightPanelContent: ReactNode;
  showHelpPanel?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
}

const KnowledgeGraphLayout: React.FC<KnowledgeGraphLayoutProps> = ({
  title,
  children,
  rightPanelContent,
  showHelpPanel = true,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(true);

  // Determine active page ID based on currentStep
  const getActivePageId = () => {
    switch(currentStep) {
      case 1: return 'kg-template';
      case 2: return 'kg-dmo';
      case 3: return 'kg-mapping';
      case 4: return 'kg-edge';
      case 5: return 'kg-analytics';
      case 6: return 'kg-visualization';
      case 7: return 'kg-share';
      default: return 'kg-template';
    }
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar activePage={getActivePageId()} />
      
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsHelpPanelOpen(!isHelpPanelOpen)}
            >
              {isHelpPanelOpen ? <X className="h-4 w-4 mr-1" /> : <HelpCircle className="h-4 w-4 mr-1" />}
              {isHelpPanelOpen ? 'Close Help' : 'Help'}
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onPrevious}
                disabled={!onPrevious || currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                size="sm"
                onClick={onNext}
                disabled={!onNext || currentStep === totalSteps}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content with right panel */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex space-x-6 h-full">
            {/* Main visualization area */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
            
            {/* Right panel (collapsible) */}
            {showHelpPanel && isHelpPanelOpen && (
              <div className="w-80 lg:w-96 flex-shrink-0 bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-2 text-gray-900">Configuration</h2>
                    <p className="text-sm text-gray-500">
                      Configure settings for this step of the knowledge graph creation process.
                    </p>
                  </div>
                  {rightPanelContent}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeGraphLayout;