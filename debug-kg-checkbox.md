# Debug Test: Knowledge Graph Checkbox

## Steps to Debug

1. Open the application
2. Open browser console (F12)
3. Upload a document or use example
4. Click "Configure with AI Assistant"
5. When asked about knowledge graph, click "Yes, extract all entities and relationships"

## Expected Console Output

```javascript
// When button is clicked:
useConversation: User wants Knowledge Graph: true
useConversation: onProcessingConfigured available: true
useConversation: Sending KG update: {configuration: {kg: {...}}, source: 'ai_assistant', kgUpdate: true}
useConversation: Actually calling onProcessingConfigured

// In UnifiedDashboard:
UnifiedDashboard handleProcessingConfigured called with config: ...
UnifiedDashboard: Handling KG update from AI assistant
UnifiedDashboard: Current processingConfig.kg: {...}
UnifiedDashboard: Incoming config.configuration.kg: {...}
UnifiedDashboard: Updated processingConfig will be: {...}
UnifiedDashboard: Adding kg to unified processing types

// In ManualConfigurationPanel:
ManualConfigurationPanel render - processingConfig.kg: {...}
ManualConfigurationPanel render - processingConfig.kg.enabled: true
```

## If Not Working

1. Check if `useConversation: onProcessingConfigured available: false`
   - This means the callback isn't being passed properly

2. Check if the KG update config is being sent:
   - Look for "useConversation: Sending KG update"
   - Verify the config object structure

3. Check if UnifiedDashboard receives the update:
   - Look for "UnifiedDashboard: Handling KG update"
   - Verify state updates

4. Check ManualConfigurationPanel re-rendering:
   - Look for "ManualConfigurationPanel render"
   - Verify kg.enabled becomes true

## Common Issues

1. Race condition with state updates
2. Component not re-rendering after state change
3. Callback not connected properly
4. State merging issues

## Next Steps

Based on console output, we can identify exactly where the issue is and fix it.