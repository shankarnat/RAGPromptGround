# Intelligent Document Analysis System

The NewsletterNexus application now includes an intelligent document analysis system that automatically examines uploaded documents and suggests optimal processing approaches.

## Overview

When a document is uploaded, the system performs the following analysis:

1. **Document Type Detection**: Identifies the document type (form, report, contract, invoice, etc.)
2. **Structure Analysis**: Detects tables, lists, headers, images, charts, and form fields
3. **Content Analysis**: Analyzes word count, language, technical/financial/legal content, and keywords
4. **Relationship Detection**: Identifies entities and potential relationships for knowledge graph construction
5. **Processing Recommendations**: Suggests optimal processing methods based on document characteristics

## Key Components

### DocumentAnalyzer Service (`/client/src/services/DocumentAnalyzer.ts`)

The core service that performs document analysis. It provides:
- Document type inference based on file name and content
- Structure analysis (tables, forms, images, etc.)
- Content feature extraction
- Relationship detection
- Processing recommendations with confidence scores

### useDocumentAnalysis Hook (`/client/src/hooks/useDocumentAnalysis.ts`)

A React hook that provides:
- Document analysis state management
- Analysis and recommendation functions
- Error handling
- Toast notifications for user feedback

### DocumentAnalysisContext (`/client/src/context/DocumentAnalysisContext.tsx`)

A React context that makes document analysis available throughout the application.

### DocumentAnalysisCard Component (`/client/src/components/DocumentAnalysisCard.tsx`)

UI component that displays:
- Document type and confidence score
- Document structure analysis
- Content features and keywords
- Processing recommendations with apply buttons
- Compact and full view modes

## Usage

The document analysis is automatically triggered when:
1. A document is uploaded in the UnifiedDashboard
2. The DocumentAnalysisCard component receives a file prop

### Example Analysis Results

For a financial report document:
```javascript
{
  documentType: 'report',
  structure: {
    hasTables: true,
    hasCharts: true,
    structureComplexity: 'complex'
  },
  contentFeatures: {
    technicalContent: true,
    financialData: true,
    topKeywords: ['analysis', 'results', 'data']
  },
  processingRecommendations: [
    {
      processingType: 'rag',
      priority: 'high',
      reason: 'Document contains substantial text content suitable for semantic search'
    },
    {
      processingType: 'kg',
      priority: 'medium',
      reason: 'Document contains named entities that could be mapped to a knowledge graph'
    }
  ]
}
```

## Processing Recommendations

The system provides intelligent recommendations based on document characteristics:

- **RAG Processing**: Recommended for documents with substantial text content (>1000 words), articles, and reports
- **Knowledge Graph**: Recommended for documents with multiple entities and relationships
- **IDP Processing**: Recommended for structured documents, forms, tables, and invoices

## Integration Points

The document analysis integrates with:
1. **UnifiedDashboard**: Shows analysis results and allows applying recommendations
2. **Document Upload Workflow**: Automatically analyzes uploaded documents
3. **Processing Configuration**: Recommendations can be applied with one click

## Future Enhancements

Currently, the system uses intelligent pattern matching and mocked responses. Future enhancements could include:
- Integration with actual OCR and NLP services
- ML-based document classification
- Real-time entity extraction
- Custom recommendation rules
- Historical analysis patterns