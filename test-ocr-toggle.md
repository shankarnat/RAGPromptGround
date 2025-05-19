# Test Plan: OCR Toggle Synchronization

## Objective
Verify that clicking "Yes, OCR needed" in the AI conversation automatically enables the OCR (Text Extraction) toggle in the manual configuration panel.

## Test Steps

1. **Initial State**
   - Open the application in development mode
   - Navigate to the document upload page
   - Upload or use an example document
   - Click "Configure with AI Assistant"

2. **Enable OCR through AI**
   - In the conversation, when asked about OCR needs, click "Yes, OCR needed"
   - Observe the following:
     - Console logs should show:
       ```
       useConversation: User needs OCR: true
       useConversation: Calling onProcessingConfigured with OCR config
       ```
     - Manual Configuration panel should update automatically
     - OCR (Text Extraction) toggle should become checked
     - Previous multimodal settings should remain unchanged

3. **Verify State Persistence**
   - Check that other multimodal toggles maintain their state:
     - Image Captioning (should remain as was)
     - Audio Transcription (should remain as was)
     - Visual Analysis (should remain as was)
   - Observe console logs showing proper state merging

4. **Multiple Multimodal Options**
   - Test enabling multiple options in sequence:
     1. Click "Yes, OCR needed" → OCR toggle should check
     2. Click "Yes, it has images" → Image Captioning should check, OCR remains checked
     3. Click "Yes, audio transcription needed" → Audio Transcription should check, previous settings remain

5. **Process Document**
   - With OCR enabled, click "Process Document"
   - Verify that the processing configuration includes OCR in the configuration

## Expected Behavior

### Console Logs
```
useConversation: User needs OCR: true
useConversation: Calling onProcessingConfigured with OCR config
UnifiedDashboard handleProcessingConfigured called with config:
{
  configuration: {
    rag: {
      enabled: true,
      multimodal: {
        ocr: true
      }
    },
    multimodalUpdate: true
  },
  source: 'ai_assistant',
  partialUpdate: true
}
UnifiedDashboard: Handling multimodal update from AI assistant
UnifiedDashboard setProcessingConfig: merging multimodal state
UnifiedDashboard: Merged multimodal config: {
  transcription: false,
  ocr: true,
  imageCaption: false,
  visualAnalysis: false
}
```

### UI Behavior
1. OCR toggle animates to checked state
2. Toast notification confirms "OCR enabled"
3. Other multimodal toggles maintain their state
4. Processing config shows OCR as enabled

## Debugging Tips

If the OCR toggle doesn't update:

1. Check browser console for errors
2. Verify useConversation hook is properly handling 'set_needs_ocr' action
3. Ensure UnifiedDashboard is receiving the configuration update
4. Check that ManualConfigurationPanel is re-rendering with new props
5. Verify memo comparison is not blocking the update

## Code References

- OCR Handler: client/src/hooks/useConversation.ts:~206
- Config Processing: client/src/components/UnifiedDashboard.tsx:~115
- Multimodal State: client/src/hooks/useProcessingConfig.ts:~50
- UI Toggle: client/src/components/ManualConfigurationPanel.tsx:~250