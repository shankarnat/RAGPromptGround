import React, { createContext, useContext, ReactNode } from 'react';
import { useDocumentAnalysis, UseDocumentAnalysisReturn } from '@/hooks/useDocumentAnalysis';

interface DocumentAnalysisContextType extends UseDocumentAnalysisReturn {
  // Add any additional context-specific methods or state here
}

const DocumentAnalysisContext = createContext<DocumentAnalysisContextType | undefined>(undefined);

export const useDocumentAnalysisContext = () => {
  const context = useContext(DocumentAnalysisContext);
  if (!context) {
    throw new Error('useDocumentAnalysisContext must be used within DocumentAnalysisProvider');
  }
  return context;
};

interface DocumentAnalysisProviderProps {
  children: ReactNode;
}

export const DocumentAnalysisProvider: React.FC<DocumentAnalysisProviderProps> = ({ children }) => {
  const documentAnalysis = useDocumentAnalysis();

  const contextValue: DocumentAnalysisContextType = {
    ...documentAnalysis,
    // Add any additional context-specific functionality here
  };

  return (
    <DocumentAnalysisContext.Provider value={contextValue}>
      {children}
    </DocumentAnalysisContext.Provider>
  );
};

export default DocumentAnalysisProvider;