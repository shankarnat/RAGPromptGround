# Debug RAG Sync Issue

## Problem
When clicking "Enable RAG Search for basic document processing" in AI configuration, the RAG Search checkbox in Manual Configuration is not getting checked.

## Debug Points Added

1. **useConversation.ts**
   - Added immediate config update when `select_processing` action is triggered
   - Added console logging to track the action

2. **UnifiedDashboard.tsx**
   - Added logging for processingConfig updates
   - Added logging in handleConversationalConfig
   - Added logging in handleProcessingToggle
   - Removed unnecessary toggle calls - just updating state directly

3. **ManualConfigurationPanel.tsx**
   - Added render logging to see when component re-renders
   - Added memo comparison logging to detect prop changes

## Expected Console Output

When clicking "Enable RAG Search for basic document processing":

1. `useConversation: select_processing action with:` - Shows action data
2. `useConversation: Enabling RAG from select_processing` - Confirms AI config detected
3. `handleConversationalConfig called with:` - Shows config received
4. `Enabling RAG search from AI assistant recommendation` - Confirms special handling
5. `Current processingConfig.rag.enabled:` - Shows current state (should be false)
6. `Updated processingConfig - RAG enabled:` - Shows new state (should be true)
7. `processingConfig updated:` - From useEffect monitoring state
8. `ManualConfigurationPanel memo: RAG enabled changed from false to true` - Detects prop change
9. `ManualConfigurationPanel render - processingConfig.rag.enabled: true` - Component re-renders

## Key Findings

1. The checkbox is bound to `processingConfig[configKey]?.enabled` where configKey = 'rag'
2. This means it checks `processingConfig.rag.enabled`
3. We're updating this value in setProcessingConfig
4. The component should re-render when this prop changes

## Things to Check

1. Is the memo comparison preventing re-renders?
2. Is processingConfig being passed correctly to ManualConfigurationPanel?
3. Is the state update being batched and not triggering re-render?
4. Is there a race condition with the AI update flag?

## Solution Approach

1. Simplified the code to just update processingConfig state
2. Removed unnecessary handleProcessingToggle calls
3. Added comprehensive logging to track data flow
4. Ensured memo comparison detects changes