# User Message Persistence Fix

## Issue
User messages selected via buttons were not being properly persisted in the conversation history, leading to a chat that only showed AI responses without the corresponding user inputs.

## Solution
Implemented a direct state update approach to ensure user messages appear in the chat immediately, rather than relying on the `sendMessage` method which had timing issues.

## Key Changes

1. **Direct State Manipulation for User Messages**
```javascript
// Create a direct user message instead of using sendMessage
if (data?.userResponse) {
  const userMessage: ConversationMessage = {
    id: Math.random().toString(36).substring(2, 9),
    type: 'user',
    content: data.userResponse,
    timestamp: new Date()
  };
  
  // Directly add to state instead of using sendMessage
  setState(prev => ({
    ...prev,
    messages: [...prev.messages, userMessage]
  }));
}
```

2. **Added Sequencing with Timeouts**
```javascript
// Add a small delay before proceeding to ensure user message is visible
setTimeout(() => {
  // Configure RAG checkbox
  // ...
  
  // Then continue with the standard action handling
  handleAction(action, data);
}, 100);
```

3. **Conditional Logic for Different Paths**
```javascript
// If no user response, just handle the action directly
if (data?.step === 'processing_confirmation' && onProcessingConfigured) {
  const config = {
    ragEnabled: true,
    // ...
  };
  onProcessingConfigured(config);
}
```

## Benefits

1. **Complete Conversation History**
   - Both AI messages and user responses are now properly displayed in the chat
   - The conversation appears as a natural back-and-forth dialog

2. **Improved UI Feedback**
   - Users can now see their selected responses immediately in the chat
   - The conversation flow is more intuitive and easier to follow

3. **Better Debugging**
   - The complete conversation is visible, making it easier to debug issues
   - The sequence of interactions is preserved for analysis

This fix ensures that when users interact with the custom contract conversation flow, all parts of the conversation are properly displayed, creating a complete and coherent chat history.