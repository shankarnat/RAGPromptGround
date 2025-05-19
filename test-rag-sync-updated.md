# Test: Updated RAG Sync Between AI Assistant and Manual Configuration

## Problem Statement
When clicking "Enable RAG Search for basic document processing" in AI configuration, the "RAG Search" checkbox under Processing Methods in the manual configuration panel is not getting enabled.

## Solution Implemented

### 1. Added immediate handling in useConversation.ts
- When `select_processing` action is triggered with RAG configuration
- Immediately calls onProcessingConfigured with 'ai_basic_rag' source

### 2. Streamlined handleConversationalConfig in UnifiedDashboard.tsx
- Detects 'ai_basic_rag' source specifically
- Immediately updates processingConfig state
- Temporarily clears isUpdatingFromAI flag to allow toggle
- Calls handleProcessingToggle to sync manual configuration
- Manages timing properly to avoid race conditions

## Test Steps

1. Open Unified Dashboard
2. Upload a document
3. Click "Enable RAG Search for basic document processing" in AI Assistant panel
4. Verify Manual Configuration panel shows:
   - RAG Search checkbox is checked under Processing Methods
   - RAG Configuration section expands with options

## Expected Console Logs

```
useConversation: select_processing action with: {configuration: {rag: {enabled: true...}}}
useConversation: Enabling RAG from select_processing
handleConversationalConfig called with: {source: 'ai_basic_rag'...}
Enabling RAG search from AI assistant recommendation
```

## Expected UI Behavior

1. When clicking the AI recommendation:
   - RAG Search checkbox immediately becomes checked
   - Toast shows "RAG Search Enabled"
   - Manual configuration panel updates without UI glitches

## Key Implementation Points

1. **Immediate Response**: select_processing action now immediately triggers configuration update
2. **Source Identification**: Using 'ai_basic_rag' source for clear identification
3. **State Management**: Proper timing to avoid circular updates
4. **Flag Management**: Temporarily clears isUpdatingFromAI to allow toggle

## Debug Checklist

- [ ] Check that `select_processing` action is triggered
- [ ] Verify onProcessingConfigured is called with correct config
- [ ] Confirm handleConversationalConfig receives 'ai_basic_rag' source
- [ ] Ensure processingConfig state updates
- [ ] Verify handleProcessingToggle is called
- [ ] Check Manual Configuration panel reflects the change

## Success Criteria

✓ RAG Search checkbox is checked immediately after clicking AI recommendation
✓ No delay or glitch in UI update
✓ Toast notification appears
✓ Configuration sections expand properly
✓ No console errors or warnings