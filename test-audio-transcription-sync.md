# Test: Audio Transcription Toggle Sync

## Objective
When user clicks "Yes, audio transcription needed" in the AI conversation pane, the Audio Transcription switch should be automatically enabled in the Multimodal processing section under RAG configuration in the left pane.

## Implementation Summary

### 1. useConversation.ts
- `set_has_audio` action sends configuration update with `transcription: true`
- Uses 'ai_assistant' source to identify multimodal updates
- Matches delay and pattern with image captioning for consistency

### 2. UnifiedDashboard.tsx
- Enhanced logging for multimodal updates
- Proper state merging to preserve existing settings
- Clear separation of incoming changes and merged state
- Updates both processingConfig and multimodal hooks

### 3. State Preservation
- All existing multimodal settings are preserved
- Only the specific option being updated changes
- Uses spread operator for proper state merging

## Test Steps

1. Open browser console
2. Navigate to Unified Dashboard
3. Upload a document
4. Enable RAG if not already enabled
5. When asked about audio, click "Yes, audio transcription needed"
6. Watch left pane for RAG configuration to expand (if not already)
7. Verify Audio Transcription switch is enabled
8. Check that other multimodal options maintain their state

## Expected Console Output

1. `useConversation: User has audio: true`
2. `useConversation: Sending audio transcription update:`
3. `handleConversationalConfig called with: {source: 'ai_assistant'...}`
4. `AI Assistant multimodal update:`
5. `  Current multimodal config:` (shows current state)
6. `  Incoming multimodal update: {transcription: true}`
7. `  Current processingConfig.rag.multimodal:` (shows current config)
8. `Multimodal state merge:`
9. `  Previous state:` (shows existing multimodal state)
10. `  Incoming changes: {transcription: true}`
11. `  Merged result:` (shows merged state with transcription: true)
12. `  Enabling transcription via updateMultimodal`
13. `Audio Transcription Enabled` (toast notification)
14. `Passing multimodal to CombinedConfigurationPanel:` (should show transcription: true)
15. `MultimodalSection render - multimodalProcessing:` (should show transcription: true)

## Expected UI Behavior

1. When clicking "Yes, audio transcription needed":
   - RAG Search remains enabled
   - RAG Configuration section is visible
   - Audio Transcription switch toggles to ON
   - Other multimodal switches maintain their current state
   - Toast notification appears

## State Flow Example

### Before clicking "Yes, audio transcription needed":
```javascript
{
  rag: {
    enabled: true,
    multimodal: {
      transcription: false,  // will change
      ocr: false,           // preserved
      imageCaption: true,   // preserved (if previously enabled)
      visualAnalysis: false // preserved
    }
  }
}
```

### After clicking:
```javascript
{
  rag: {
    enabled: true,
    multimodal: {
      transcription: true,  // changed
      ocr: false,           // preserved
      imageCaption: true,   // preserved
      visualAnalysis: false // preserved
    }
  }
}
```

## Key Points

1. **State Preservation**: Previous multimodal settings must be retained
2. **Single Update**: Only transcription changes from false to true
3. **No Side Effects**: Other switches remain unchanged
4. **Proper Merge**: Uses spread operator to merge states correctly
5. **Consistent Timing**: Uses same delay (300ms) as image captioning

## Success Criteria

✓ Audio Transcription switch becomes checked
✓ Previous multimodal settings are preserved
✓ Toast notification appears
✓ Console logs show proper state merging
✓ No errors or warnings in console
✓ UI updates smoothly without flicker