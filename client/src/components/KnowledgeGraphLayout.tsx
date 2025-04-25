import React, { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
        
        {/* Main visualization area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </div>
      </div>
      
      {/* Right panel (collapsible) */}
      {showHelpPanel && isHelpPanelOpen && (
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
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
  );
};

export default KnowledgeGraphLayout;