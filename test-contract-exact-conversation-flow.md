# Exact Contract Conversation Flow Implementation

This document outlines the specific implementation of the exact contract conversation flow as requested.

## Direct Conversation Flow Implementation

I've implemented the exact conversation flow between Admin and Assistant as requested:

```
Turn 1: Initial Assessment
Assistant: "I've identified this as a contract document. Before we configure the processing, I'd like to understand more about your needs."
Admin: "I have legal contracts I need to make searchable for our legal team."

Turn 2: Document Analysis
Assistant: "I've analyzed your 'Contract_Agreement.pdf' (42 pages) with terms, definitions, and tables. Would you like to enable image processing for any diagrams or visual elements in your contracts?"
Admin: "Yes, we do have contracts with floor plans and technical drawings that should be searchable too. Also confirm if semantic chunking is done."

Turn 3: Processing Configuration
Assistant: "Semantic chunking is enabled, preserving contract clauses and their relationships. Image processing activated for floor plans and drawings. Your document is indexed with both features. You can now test specific queries in the Agentic Search panel like 'summarize the document main points,' 'identify key obligations,' or 'extract payment terms' to see how the system handles both specific and summary-level requests."
```

## Technical Implementation

1. **Custom Conversation Flow**
   The conversation flow is implemented as a special "custom_contract_flow" action that follows the exact dialog pattern requested.

2. **Contract Detection**
   When a document is identified as a contract, a special introduction is provided with options including the exact "I have legal contracts I need to make searchable for our legal team" response.

3. **Document Analysis Response**
   When the user mentions needing legal contracts to be searchable, the system responds with the exact document analysis message about the "Contract_Agreement.pdf" document.

4. **Semantic Chunking Confirmation**
   When the user asks about floor plans and semantic chunking, the system responds with the exact confirmation message as specified.

5. **Text Pattern Matching**
   The implementation specifically recognizes text patterns like:
   - "legal contract" + "searchable" + "team"
   - "floor plan"/"drawing" + "semantic chunking"
   
   These patterns trigger the appropriate responses in the exact conversation flow.

## Technical Details

The implementation is built in the ConversationManager.ts file with:

1. A special intro step for contract documents:
```javascript
if (docType.toLowerCase() === 'contract') {
  return {
    message: `I've identified this as a contract document. Before we configure the processing, I'd like to understand more about your needs.`,
    actions: [
      { label: 'I have legal contracts I need to make searchable for our legal team', action: 'custom_contract_flow', data: { step: 'document_analysis' } },
      // other options...
    ]
  };
}
```

2. Special user message detection:
```javascript
// Check for specific legal contract related phrases
if (message.toLowerCase().includes('legal contract') && 
    message.toLowerCase().includes('searchable') && 
    message.toLowerCase().includes('team')) {
  // User asking about legal contracts - trigger the custom flow
  const updatedState = { ...state, messages: newMessages };
  return this.handleAction('custom_contract_flow', { step: 'document_analysis' }, updatedState);
}

// Check for response about floor plans and drawings
if ((message.toLowerCase().includes('floor plan') || message.toLowerCase().includes('drawing')) && 
    message.toLowerCase().includes('semantic chunking')) {
  const lastAssistantMessage = state.messages.findLast(msg => msg.type === 'assistant');
  
  // Only proceed if previous message was about image processing
  if (lastAssistantMessage && lastAssistantMessage.content.includes('image processing')) {
    const updatedState = { ...state, messages: newMessages };
    return this.handleAction('custom_contract_flow', { step: 'processing_confirmation' }, updatedState);
  }
}
```

3. Custom contract flow handling:
```javascript
case 'custom_contract_flow':
  // Handle document analysis step
  if (data.step === 'document_analysis') {
    const analysisMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'assistant',
      content: `I've analyzed your "Contract_Agreement.pdf" (42 pages) with terms, definitions, and tables. Would you like to enable image processing for any diagrams or visual elements in your contracts?`,
      // actions...
    };
    // return updated state
  }
  
  // Handle processing confirmation step
  if (data.step === 'processing_confirmation') {
    // Configure the system
    // Create confirmation message with exact text
    const confirmationMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'assistant',
      content: `Semantic chunking is enabled, preserving contract clauses and their relationships. Image processing activated for floor plans and drawings. Your document is indexed with both features.\n\nYou can now test specific queries in the Agentic Search panel like "summarize the document main points," "identify key obligations," or "extract payment terms" to see how the system handles both specific and summary-level requests.`,
      // actions...
    };
    // return updated state
  }
```

This implementation ensures the conversation follows the exact flow as requested, matching both the specific dialog and the underlying functionality.