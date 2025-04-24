import { FC } from "react";
import { ProcessingMode } from "@shared/schema";

interface DocumentHeaderProps {
  documentTitle: string;
  pageCount: number;
  processingMode: ProcessingMode;
  onProcessingModeChange: (mode: ProcessingMode) => void;
}

const DocumentHeader: FC<DocumentHeaderProps> = ({
  documentTitle,
  pageCount,
  processingMode,
  onProcessingModeChange
}) => {
  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">{documentTitle}</h2>
        <span className="ml-2 text-sm text-gray-500">• {pageCount} pages</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button 
            type="button" 
            className={`py-2 px-4 text-sm font-medium rounded-l-lg border border-gray-200 focus:z-10 focus:ring-2 focus:ring-primary-500 ${
              processingMode === "standard" 
                ? "text-primary-600 bg-primary-50" 
                : "text-gray-900 bg-white hover:bg-gray-100"
            }`}
            onClick={() => onProcessingModeChange("standard")}
          >
            Standard
          </button>
          <button 
            type="button" 
            className="py-2 px-4 text-sm font-medium border-t border-b border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
            disabled
          >
            IDP
          </button>
          <button 
            type="button" 
            className="py-2 px-4 text-sm font-medium rounded-r-md border border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
            disabled
          >
            KG
          </button>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm cursor-pointer">
          JD
        </div>
      </div>
    </header>
  );
};

export default DocumentHeader;
