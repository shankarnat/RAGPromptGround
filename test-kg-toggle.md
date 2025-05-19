# Test Plan: Knowledge Graph Toggle Synchronization

## Objective
Verify that clicking "Yes, extract all entities and relationships" in the AI conversation automatically enables the Knowledge Graph checkbox in the manual configuration panel while preserving all previous configuration states.

## Test Steps

1. **Initial State**
   - Open the application in development mode
   - Navigate to the document upload page
   - Upload or use an example document
   - Click "Configure with AI Assistant"

2. **Enable Knowledge Graph through AI**
   - In the conversation, when asked about knowledge graph preferences, click "Yes, extract all entities and relationships"
   - Observe the following:
     - Console logs should show:
       ```
       useConversation: User wants Knowledge Graph: true
       useConversation: Sending KG update:
       ```
     - Manual Configuration panel should update automatically
     - Knowledge Graph checkbox should become checked
     - Previous processing type selections should remain unchanged

3. **Verify State Persistence**
   - Check that other processing types maintain their state:
     - Document Search (RAG) (should remain as was)
     - Document Intelligence Processing (should remain as was)
   - Check that multimodal toggles maintain their state:
     - Image Captioning
     - Audio Transcription  
     - OCR (Text Extraction)
     - Visual Analysis
   - Observe console logs showing proper state merging

4. **Multiple Processing Types**
   - Test enabling multiple processing types in sequence:
     1. Click "Yes, extract all entities and relationships" → KG checkbox should check
     2. Click "Enable RAG search" → RAG checkbox should check, KG remains checked
     3. Click any multimodal option → Multimodal toggle should check, previous settings remain

5. **Process Document**
   - With Knowledge Graph enabled, click "Process Document"
   - Verify that the processing configuration includes KG in the configuration

## Expected Behavior

### Console Logs
```
useConversation: User wants Knowledge Graph: true
useConversation: Sending KG update:
{
  configuration: {
    kg: {
      enabled: true,
      entityExtraction: true,
      relationMapping: true,
      entityTypes: 'all',
      graphBuilding: true
    }
  },
  source: 'ai_assistant',
  kgUpdate: true
}
UnifiedDashboard handleProcessingConfigured called with config: ...
UnifiedDashboard: Handling KG update from AI assistant
UnifiedDashboard setProcessingConfig: updating KG config
```

### UI Behavior
1. Knowledge Graph checkbox animates to checked state
2. Toast notification confirms "Knowledge Graph Enabled"
3. Other processing types and multimodal toggles maintain their state
4. Processing config shows KG as enabled with entity extraction and relationship mapping
5. Left pane remains scrollable and functional

## Knowledge Graph Configuration Details
When enabled, the KG configuration includes:
- `enabled: true`
- `entityExtraction: true`
- `relationMapping: true`
- `entityTypes: 'all'` (when selecting "extract all entities")
- `graphBuilding: true`

## Integration Points
- Works alongside RAG and IDP processing types
- Independent of multimodal options
- Preserves all previous configuration states
- Maintains left pane scroll and layout

## Debugging Tips

If the Knowledge Graph checkbox doesn't update:

1. Check browser console for errors
2. Verify useConversation hook is properly handling 'set_kg_preferences' action
3. Ensure UnifiedDashboard is receiving the configuration update with kgUpdate flag
4. Check that ManualConfigurationPanel is re-rendering with new props
5. Verify processingConfig state includes KG configuration
6. Confirm unified processing state includes 'kg' type

## Code References

- KG Handler: client/src/hooks/useConversation.ts:~548-575
- Config Processing: client/src/components/UnifiedDashboard.tsx:~474-505
- KG State: client/src/hooks/useProcessingConfig.ts (kg object)
- UI Checkbox: client/src/components/ManualConfigurationPanel.tsx (KG section)
- KG Question: client/src/services/ConversationManager.ts:~316-323