# Complete RAG Sync Testing Guide

## Problem
RAG Search checkbox in Manual Configuration is not updating when "Enable RAG Search for basic document processing" is clicked in AI Assistant.

## Implementation Summary

### Key Changes Made

1. **useConversation.ts**
   - Added immediate config update for select_processing action
   - Sends config with 'ai_basic_rag' source

2. **UnifiedDashboard.tsx**
   - Uses updateOption to set enabled flag
   - Follows up with updateProcessingType for full config
   - Added comprehensive logging

3. **useProcessingConfig.ts**
   - Added logging to all update methods
   - Tracks state changes at each step

4. **ManualConfigurationPanel.tsx**
   - Improved memo comparison to force re-render on RAG enabled changes
   - Added detailed logging for debugging

## Test Steps

1. Open browser console (F12)
2. Navigate to Unified Dashboard
3. Upload a document
4. Click "Enable RAG Search for basic document processing"
5. Watch console logs and observe checkbox

## Expected Console Output (in order)

1. `useConversation: select_processing action with:`
2. `useConversation: Enabling RAG from select_processing`
3. `handleConversationalConfig called with: {source: 'ai_basic_rag'...}`
4. `Enabling RAG search from AI assistant recommendation`
5. `Current processingConfig.rag.enabled: false`
6. `useProcessingConfig updateOption called - type: rag, option: enabled, value: true`
7. `useProcessingConfig updateOption - current value: false, new value: true`
8. `useProcessingConfig updateOption - new config for rag: {enabled: true...}`
9. `Called updateOption to enable RAG`
10. `ManualConfigurationPanel memo comparison:`
11. `  Previous RAG enabled: false`
12. `  Next RAG enabled: true`
13. `  RAG enabled changed - forcing re-render`
14. `ManualConfigurationPanel render - processingConfig: {...}`
15. `ManualConfigurationPanel render - processingConfig.rag.enabled: true`

## Success Indicators

✓ Checkbox shows checked state (aria-checked="true")
✓ Console shows RAG enabled changed from false to true
✓ Component re-renders with new state
✓ Toast notification appears

## Troubleshooting

### If checkbox still not updating:

1. **Check processingTypes array**
   - Ensure it includes { id: 'rag', label: 'RAG Search', ... }

2. **Verify prop passing**
   - Check that processingConfig is passed to ManualConfigurationPanel
   - Use React DevTools to inspect props

3. **State timing issues**
   - The setTimeout ensures state updates complete
   - May need to adjust timing if still not working

4. **Component hierarchy**
   - Ensure no parent components are blocking updates
   - Check for any error boundaries

## Debug Commands in Console

```javascript
// Check current config state
console.log(processingConfig)

// Check if component is mounted
document.querySelector('[aria-label="RAG Search"]')

// Check checkbox state
document.querySelector('[role="checkbox"]').getAttribute('aria-checked')
```

## Final Notes

- The solution uses multiple update approaches to ensure state propagation
- Memo comparison explicitly checks for RAG enabled changes
- Extensive logging helps identify where the flow might break
- The checkbox should update immediately after button click