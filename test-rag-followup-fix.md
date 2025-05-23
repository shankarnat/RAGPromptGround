# RAG Followup Message Fix

The issue has been fixed by:

1. Removing the timeout call in the semantic chunking effect in ConversationalUI.tsx that was sending the follow-up message
2. Removing the 'sendMessage' from the dependency array of that effect to ensure it doesn't trigger unnecessarily

The fix was achieved with this edit:

```tsx
// Before:
// After a 2-second delay, send a follow-up message
setTimeout(() => {
  // Add a message to the conversation
  sendMessage("I have now enabled RAG, what else would you like to do?");
}, 2000);

// After:
// No follow-up message for RAG
```

This ensures the RAG feature is still enabled when semantic chunking is detected, but prevents the automatic message "I have now enabled RAG, what else would you like to do?".