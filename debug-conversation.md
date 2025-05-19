# Debugging Conversation Flow

## The Issue
When clicking on "contract_agreement.pdf", the new multimodal questions don't appear.

## Expected Flow
1. Intro: "I've identified this as a contract document..."
2. Click "Let's get started" → Should go to user_profile step
3. User Profile: "First, could you tell me about your role..."
4. Department selection
5. Experience level
6. Goals
7. Urgency
8. Detail level
9. Processing selection
10. **NEW: Multimodal check** - "Does your document contain images?"
11. **NEW: Audio check** - "Are there any audio files?"
12. **NEW: OCR check** - "Do you have scanned documents?"
13. **NEW: Visual analysis** - "Would you like AI to analyze visual content?"
14. **NEW: Image processing** - "What type of image processing?"
15. **NEW: KG check** - "Extract entities and relationships?"
16. **NEW: IDP check** - "What type of document data extraction?"
17. Confirmation with summary

## Debugging Steps

1. Check that the conversation flow is properly initialized
2. Verify action handlers are called correctly
3. Make sure conversation step transitions work
4. Confirm that multimodal questions are in the flow

## Code Structure
- ConversationManager manages the flow
- useConversation handles UI state and actions
- UnifiedDashboard coordinates everything

## To Test
1. Open browser console
2. Click on contract_agreement.pdf
3. Click "Let's get started"
4. Watch for console errors or state issues
5. Check if conversation step advances from 'intro' to 'user_profile'