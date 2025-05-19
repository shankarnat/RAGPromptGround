# Debug: Image Caption Toggle Issue

## Problem
When user clicks "Yes, it has images" button, the Image Captioning switch in the multimodal section is not being updated to checked state.

## Debug Flow

### 1. Button Click Trigger
- User clicks "Yes, it has images" in AI conversation
- Triggers `set_has_images` action in useConversation hook

### 2. Configuration Update Path
```
useConversation.ts: set_has_images action
  ↓
onProcessingConfigured(imageConfig) 
  ↓
UnifiedDashboard.tsx: handleConversationalConfig
  ↓
setProcessingConfig update
  ↓
ManualConfigurationPanel re-render
  ↓
CombinedConfigurationPanel re-render
  ↓
MultimodalSection switch update
```

## Expected Console Logs

1. `useConversation: User has images: true`
2. `useConversation: Sending imageCaption update:` 
3. `handleConversationalConfig called with: {source: 'ai_assistant'...}`
4. `Before update, multimodal config:` (shows current hook state)
5. `Incoming multimodal config: {imageCaption: true}`
6. `Current processingConfig.rag.multimodal:` (shows current processing config)
7. `Updating multimodal config - previous:` (shows existing state)
8. `Updating multimodal config - incoming: {imageCaption: true}`
9. `Updating multimodal config - merged:` (shows merged state with imageCaption: true)
10. `Image Captioning Enabled` (toast notification)
11. `ManualConfigurationPanel render` (component re-render)
12. `MultimodalSection render - multimodalProcessing:` (should show imageCaption: true)

## Critical State Updates

### 1. Initial State (processingConfig)
```javascript
{
  rag: {
    enabled: false,
    multimodal: {
      transcription: false,
      ocr: false,
      imageCaption: false,
      visualAnalysis: false
    }
  }
}
```

### 2. After "Yes, it has images" click
```javascript
{
  rag: {
    enabled: true,  // RAG gets enabled
    multimodal: {
      transcription: false,  // preserved
      ocr: false,           // preserved
      imageCaption: true,   // updated
      visualAnalysis: false // preserved
    }
  }
}
```

## State Preservation
- Previous multimodal settings must be preserved
- Only imageCaption should change from false to true
- RAG must be enabled for multimodal section to show

## Common Issues

1. **State Not Merging**: Check if spread operator is properly merging states
2. **Component Not Re-rendering**: Check memo comparison in ManualConfigurationPanel
3. **Wrong State Path**: Ensure processingConfig.rag.multimodal path is correct
4. **Race Conditions**: Timing issues between state updates
5. **Prop Drilling**: Check if props are passed correctly through component hierarchy

## Debug Actions

1. Check browser console for all expected logs
2. Use React DevTools to inspect:
   - processingConfig state in UnifiedDashboard
   - multimodalProcessing prop in CombinedConfigurationPanel
   - Switch checked state in MultimodalSection
3. Add breakpoints at state update points
4. Verify toast notification appears