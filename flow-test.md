# Test Flow for Multimodal Questions

## Expected Flow

1. Click on "contract_agreement.pdf"
   - Should show: "I've identified this as a contract document..."
   - Action: "Let's get started"

2. Click "Let's get started"
   - Should go to: user_profile step
   - Should show: "First, could you tell me about your role in the organization?"

3. Select a role (e.g., "Sales Representative")
   - Should go to: department step
   - Should show: "Which department are you working with?"

4. Select department (e.g., "Sales/Business Development")
   - Should go to: experience step
   - Should show: "How familiar are you with document processing systems?"

5. Select experience (e.g., "Some experience")
   - Should go to: goals step
   - Should show: "What's your primary goal with this document?"

6. Select goal (e.g., "Extract structured data")
   - Should go to: urgency step
   - Should show: "How urgent is this task?"

7. Select urgency (e.g., "Within a few hours")
   - Should go to: detail_level step
   - Should show: "What level of detail do you need?"

8. Select detail (e.g., "Detailed analysis")
   - Should go to: processing_selection step
   - Should show: "Based on your needs, I recommend the following processing methods:"

9. Select a processing method
   - Should go to: multimodal_check step
   - Should show: "Does your document contain images that need to be indexed or analyzed?"

10. Continue with multimodal questions...

## Debugging Points

- After set_detail, check that conversationStep moves to 'processing_selection'
- After select_processing, check that conversationStep moves to 'multimodal_check'
- Verify that getProcessingRecommendations returns at least one recommendation
- Check that the nextStep is properly set in the recommendation data

## Console Logs to Watch

```
ConversationManager: Handling action select_processing
ConversationManager: Updated conversationStep to: multimodal_check
ConversationManager: Getting next message for step: multimodal_check
ConversationManager: Next message: Does your document contain images...
```