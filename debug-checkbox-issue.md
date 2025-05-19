# Debug Checkbox Issue

## Problem
The RAG Search checkbox (aria-checked="false") is not updating when "Enable RAG Search for basic document processing" button is clicked.

## Architecture
1. Button click triggers `select_processing` action in useConversation
2. This sends config to UnifiedDashboard via onProcessingConfigured
3. UnifiedDashboard uses useProcessingConfig hook for state management
4. ManualConfigurationPanel receives processingConfig prop
5. Checkbox checked state is bound to `processingConfig[configKey]?.enabled`

## Debug Points Added

### useConversation.ts
- Logs when select_processing action is triggered
- Immediately calls onProcessingConfigured with config

### UnifiedDashboard.tsx  
- Logs when handleConversationalConfig is called
- Uses updateProcessingType method to update state
- Logs current and new state

### useProcessingConfig.ts
- Added extensive logging to updateProcessingType
- Logs previous state, changes, and new state
- Added logging to batchUpdate

### ManualConfigurationPanel.tsx
- Logs full processingConfig object
- Logs rag config specifically
- Added memo detection for RAG enabled changes

## Expected Console Output

1. `useConversation: select_processing action with:` - Initial action
2. `handleConversationalConfig called with:` - Config received
3. `Enabling RAG search from AI assistant recommendation`
4. `Current processingConfig.rag.enabled: false`
5. `useProcessingConfig updateProcessingType called - type: rag`
6. `useProcessingConfig updateProcessingType - previous rag config:`
7. `useProcessingConfig updateProcessingType - hasChanges: true`
8. `useProcessingConfig updateProcessingType - new rag config: {enabled: true...}`
9. `ManualConfigurationPanel memo: RAG enabled changed from false to true`
10. `ManualConfigurationPanel render - processingConfig.rag.enabled: true`

## Key Points to Check

1. Is updateProcessingType detecting changes correctly?
2. Is the new config object being created properly?
3. Is the component re-rendering after state update?
4. Is the checkbox binding correct?

## Potential Issues

1. **Object Reference**: State updates might not trigger re-renders if object references aren't changing
2. **Memo Comparison**: Even with our fix, memo might still prevent re-renders
3. **State Update Timing**: React batching might delay updates
4. **Prop Drilling**: Config might not be passed correctly through component hierarchy