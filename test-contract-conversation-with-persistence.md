# Contract Conversation Flow With User Message Persistence

## Overview
This update ensures that user responses are fully persisted in the chat conversation flow for contracts, delivering the exact conversation sequence as specified.

## Changes Made

1. **User Message Persistence**
   - Modified the custom contract flow to include user messages in the conversation history
   - User responses are now properly displayed in the chat UI
   - When buttons are clicked, the corresponding text is added as a user message

2. **Exact Conversation Flow**
   The system now displays the exact 3-turn conversation:

   **Turn 1: Initial Assessment**
   - **Assistant**: "I've identified this as a contract document. Before we configure the processing, I'd like to understand more about your needs."
   - **User**: "I have legal contracts I need to make searchable for our legal team."

   **Turn 2: Document Analysis**
   - **Assistant**: "I've analyzed your 'Contract_Agreement.pdf' (42 pages) with terms, definitions, and tables. Would you like to enable image processing for any diagrams or visual elements in your contracts?"
   - **User**: "Yes, we do have contracts with floor plans and technical drawings that should be searchable too. Also confirm if semantic chunking is done."

   **Turn 3: Processing Configuration**
   - **Assistant**: "Semantic chunking is enabled, preserving contract clauses and their relationships. Image processing activated for floor plans and drawings. Your document is indexed with both features. You can now test specific queries in the Agentic Search panel like 'summarize the document main points,' 'identify key obligations,' or 'extract payment terms' to see how the system handles both specific and summary-level requests."

3. **Technical Implementation**

```javascript
// Store user messages in two ways:
// 1. When the user types a message directly:
if (message.toLowerCase().includes('legal contract') && 
    message.toLowerCase().includes('searchable') && 
    message.toLowerCase().includes('team')) {
  // User already added their message to newMessages, so we can use it directly
  return this.handleAction('custom_contract_flow', { step: 'document_analysis' }, 
                          { ...state, messages: newMessages });
}

// 2. When the user clicks an action button:
{ 
  label: 'Yes, we do have contracts with floor plans and technical drawings that should be searchable too. Also confirm if semantic chunking is done.', 
  action: 'custom_contract_flow', 
  data: { 
    step: 'processing_confirmation',
    userResponse: 'Yes, we do have contracts with floor plans and technical drawings that should be searchable too. Also confirm if semantic chunking is done.'
  } 
}

// Then in the action handler:
if (data.userResponse) {
  const userMessage: ConversationMessage = {
    id: this.generateId(),
    type: 'user',
    content: data.userResponse,
    timestamp: new Date()
  };
  updatedMessages.push(userMessage);
}
```

## Use Cases

1. **Direct Flow** - The user can click through the predefined options to experience the exact conversation flow.

2. **Natural Language** - The user can type messages that match the expected patterns and still get the same conversation flow.

3. **Mixed Approach** - Users can start with natural language and then use the buttons for subsequent steps.

This update ensures that regardless of how the user interacts with the system, the conversation will appear complete with all user messages properly displayed in the chat history.