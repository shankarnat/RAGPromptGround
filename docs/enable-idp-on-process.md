# Enable Document Processing (IDP) on Process Document

## Change Made
Updated the `handleProcessDocument` function to automatically enable Document Processing (IDP) when the "Process Document" button is clicked, while maintaining all existing enabled configurations.

## Implementation Details

### Code Changes
```typescript
// Enable Document Processing (IDP) when process document is clicked
if (!processingConfig.idp.enabled) {
  setProcessingConfig(prev => ({
    ...prev,
    idp: {
      ...prev.idp,
      enabled: true
    }
  }));
  
  // Also enable IDP in unified processing
  if (!state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
    toggleProcessingType('idp');
  }
}
```

## Behavior

1. When user clicks "Process Document" button:
   - Document Processing (IDP) is automatically enabled if not already enabled
   - All other currently enabled processing types (RAG, KG) remain enabled
   - The document is processed with all enabled methods

2. Benefits:
   - Ensures document always gets basic processing (IDP)
   - Preserves user's existing configuration choices
   - Provides comprehensive document analysis by default

## Example Flow

1. User enables RAG
2. User clicks "Process Document"
3. System automatically enables IDP (in addition to RAG)
4. Document is processed with both RAG and IDP
5. Toast shows: "Processing document with: RAG, IDP"

This change ensures users always get document processing results even if they forget to explicitly enable IDP.