# Test: RAG Sync Between AI Assistant and Manual Configuration

## Test Case: Enable RAG Search for Basic Document Processing

### Steps to Test:
1. Open the Unified Dashboard
2. Upload a document
3. In the AI Assistant configuration panel, click "Enable RAG search for basic document processing"
4. Verify that in the Manual Configuration panel, the RAG Search checkbox is checked

### Expected Behavior:
- When clicking "Enable RAG search for basic document processing" in AI configuration
- The RAG Search checkbox in the Manual Configuration panel should automatically be selected
- A toast message should appear: "RAG Search Enabled" with description "Document search and retrieval processing has been activated based on AI recommendation"
- The RAG configuration section should expand with default settings:
  - Chunking: enabled
  - Vectorization: enabled
  - Indexing: enabled
  - Multimodal options: all disabled

### Implementation Details:
1. `ConversationManager.ts` - Added multimodal configuration to basic RAG recommendation
2. `useConversation.ts` - Added source flag 'ai_basic_rag' when RAG is enabled from AI assistant
3. `UnifiedDashboard.tsx` - Added special handling to sync RAG enablement with manual configuration:
   - Detects when source is 'ai_basic_rag' or when config has RAG enabled without specific source
   - Temporarily disables AI update check to allow manual configuration update
   - Calls handleProcessingToggle to sync the checkbox state

### Code Changes Made:
1. Updated `ConversationManager.ts` to include multimodal config in basic RAG recommendation
2. Modified `useConversation.ts` to add source identification for basic RAG
3. Enhanced `UnifiedDashboard.tsx` to handle synchronization properly with timing controls

### Debugging Steps:
1. Check console logs for:
   - "handleConversationalConfig called with:"
   - "Enabling RAG search from AI assistant recommendation"
2. Verify that processingConfig state updates properly
3. Ensure manual configuration panel reflects the change

### Success Criteria:
✓ RAG Search checkbox is automatically checked when clicking AI recommendation
✓ Toast notification appears confirming the action
✓ Manual configuration panel shows RAG as enabled
✓ No UI glitches or state synchronization issues