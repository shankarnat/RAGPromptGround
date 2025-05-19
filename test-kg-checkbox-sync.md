# Quick Test: Knowledge Graph Checkbox Synchronization

## Test Steps

1. Open the application
2. Upload a document or use an example
3. Click "Configure with AI Assistant"
4. When asked about knowledge graph preferences, click "Yes, extract all entities and relationships"
5. Observe the Knowledge Graph checkbox in the left panel

## Expected Result
- The Knowledge Graph checkbox should automatically become checked
- Console should show:
  ```
  useConversation: User wants Knowledge Graph: true
  UnifiedDashboard: Handling KG update from AI assistant
  ```
- Toast should appear: "Knowledge Graph Enabled"

## Current Implementation
- Handler: `useConversation.ts` line 549
- Dashboard: `UnifiedDashboard.tsx` line 475
- Works with state preservation