# Test Plan: Document Intelligence Processing (IDP) Toggle Synchronization

## Objective
Verify that clicking "Extract structured data (tables, forms)" in the AI conversation automatically enables the Document Intelligence Processing checkbox in the manual configuration panel while preserving all previous configuration states.

## Test Steps

1. **Initial State**
   - Open the application in development mode
   - Navigate to the document upload page
   - Upload or use an example document
   - Click "Configure with AI Assistant"

2. **Enable IDP through AI**
   - In the conversation, when asked about document data extraction, click "Extract structured data (tables, forms)"
   - Observe the following:
     - Console logs should show:
       ```
       useConversation: User wants IDP: true
       useConversation: IDP extract type: structured
       useConversation: Setting up IDP configuration update
       ```
     - Manual Configuration panel should update automatically
     - Document Intelligence Processing checkbox should become checked
     - Previous processing types and multimodal settings should remain unchanged

3. **Verify State Persistence**
   - Check that other processing types maintain their state:
     - Document Search (RAG) (should remain as was)
     - Knowledge Graph (should remain as was)
   - Check that multimodal toggles maintain their state:
     - Image Captioning
     - Audio Transcription  
     - OCR (Text Extraction)
     - Visual Analysis
   - Observe console logs showing proper state merging

4. **Multiple Processing Types**
   - Test enabling multiple processing types in sequence:
     1. Click "Extract structured data (tables, forms)" → IDP checkbox should check
     2. Click "Yes, extract all entities and relationships" → KG checkbox should check, IDP remains checked
     3. Click "Enable RAG search" → RAG checkbox should check, previous settings remain

5. **Process Document**
   - With IDP enabled, click "Process Document"
   - Verify that the processing configuration includes IDP with structured data extraction

## Expected Behavior

### Console Logs
```
useConversation: User wants IDP: true
useConversation: IDP extract type: structured
useConversation: Setting up IDP configuration update
useConversation: IDP config created: {
  configuration: {
    idp: {
      enabled: true,
      textExtraction: true,
      classification: false,
      metadata: false,
      tables: true,
      formFields: true
    }
  },
  source: 'ai_assistant',
  idpUpdate: true
}
UnifiedDashboard: Handling IDP update from AI assistant
UnifiedDashboard: Called setProcessingConfig with IDP config
```

### UI Behavior
1. Document Intelligence Processing checkbox animates to checked state
2. Toast notification shows: "Document Processing Enabled - AI assistant has enabled structured data extraction for tables and forms"
3. Other processing types maintain their state
4. Processing config shows IDP as enabled with table and form extraction
5. Left pane remains scrollable and functional

## IDP Configuration Details
When "Extract structured data (tables, forms)" is selected:
- `enabled: true`
- `textExtraction: true`
- `classification: false`
- `metadata: false` 
- `tables: true`
- `formFields: true`

When "Extract metadata and classifications" is selected:
- `enabled: true`
- `textExtraction: true`
- `classification: true`
- `metadata: true`
- `tables: false`
- `formFields: false`

When "Full document processing (all data)" is selected:
- All options are set to `true`

## Known Issues & Solutions
1. If checkbox doesn't update, check console for state merging logs
2. Verify the `idpUpdate` flag is being recognized in UnifiedDashboard
3. Ensure state persistence across all processing types

## Debugging Tips

If the IDP checkbox doesn't update:

1. Check browser console for errors
2. Verify useConversation hook is properly handling 'set_idp_preferences' action
3. Ensure UnifiedDashboard is receiving the configuration update with idpUpdate flag
4. Check that ManualConfigurationPanel is re-rendering with new props
5. Verify processingConfig state includes IDP configuration
6. Confirm unified processing state includes 'idp' type

## Code References

- IDP Handler: client/src/hooks/useConversation.ts:~592-633
- Config Processing: client/src/components/UnifiedDashboard.tsx:~516-561
- IDP State: client/src/hooks/useProcessingConfig.ts (idp object)
- UI Checkbox: client/src/components/ManualConfigurationPanel.tsx (IDP section)
- IDP Question: client/src/services/ConversationManager.ts:~336-343