# Test Plan: Visual Analysis Toggle Synchronization

## Objective
Verify that clicking "Yes, analyze visuals" in the AI conversation automatically enables the Visual Analysis toggle in the manual configuration panel while preserving all previous multimodal states.

## Test Steps

1. **Initial State**
   - Open the application in development mode
   - Navigate to the document upload page
   - Upload or use an example document
   - Click "Configure with AI Assistant"

2. **Enable Visual Analysis through AI**
   - In the conversation, when asked about visual analysis needs, click "Yes, analyze visuals"
   - Observe the following:
     - Console logs should show:
       ```
       useConversation: User wants visual analysis: true
       useConversation: Sending visual analysis update:
       ```
     - Manual Configuration panel should update automatically
     - Visual Analysis toggle should become checked
     - Previous multimodal settings should remain unchanged

3. **Verify State Persistence**
   - Check that other multimodal toggles maintain their state:
     - Image Captioning (should remain as was)
     - Audio Transcription (should remain as was)
     - OCR (Text Extraction) (should remain as was)
   - Observe console logs showing proper state merging

4. **Multiple Multimodal Options**
   - Test enabling multiple options in sequence:
     1. Click "Yes, analyze visuals" → Visual Analysis toggle should check
     2. Click "Yes, it has images" → Image Captioning should check, Visual Analysis remains checked
     3. Click "Yes, OCR needed" → OCR should check, previous settings remain
     4. Click "Yes, audio transcription needed" → Audio Transcription should check, all previous settings remain

5. **Process Document**
   - With Visual Analysis enabled, click "Process Document"
   - Verify that the processing configuration includes Visual Analysis in the configuration

## Expected Behavior

### Console Logs
```
useConversation: User wants visual analysis: true
useConversation: Sending visual analysis update:
{
  configuration: {
    rag: {
      enabled: true,
      multimodal: {
        visualAnalysis: true
      }
    },
    multimodalUpdate: true
  },
  source: 'ai_assistant',
  partialUpdate: true
}
UnifiedDashboard handleProcessingConfigured called with config: ...
UnifiedDashboard: Handling multimodal update from AI assistant
UnifiedDashboard setProcessingConfig: merging multimodal state
UnifiedDashboard: Merged multimodal config: {
  transcription: false,
  ocr: false,
  imageCaption: false,
  visualAnalysis: true
}
```

### UI Behavior
1. Visual Analysis toggle animates to checked state
2. Toast notification confirms "Visual Analysis enabled"
3. Other multimodal toggles maintain their state
4. Processing config shows Visual Analysis as enabled
5. Left pane remains scrollable and functional

## Known State Management
- The visual analysis toggle state is preserved across all configuration changes
- State merging maintains all previous multimodal settings
- No re-render issues causing toggles to reset
- Left pane configuration panel remains fully functional

## Debugging Tips

If the Visual Analysis toggle doesn't update:

1. Check browser console for errors
2. Verify useConversation hook is properly handling 'set_visual_analysis' action
3. Ensure UnifiedDashboard is receiving the configuration update
4. Check that ManualConfigurationPanel is re-rendering with new props
5. Verify memo comparison is not blocking the update
6. Confirm the left pane maintains scroll functionality

## Code References

- Visual Analysis Handler: client/src/hooks/useConversation.ts:519-546
- Config Processing: client/src/components/UnifiedDashboard.tsx:~115
- Multimodal State: client/src/hooks/useProcessingConfig.ts:~50
- UI Toggle: client/src/components/ManualConfigurationPanel.tsx:~250
- Visual Analysis Question: client/src/services/ConversationManager.ts:~301