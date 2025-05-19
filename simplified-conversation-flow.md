# Simplified AI Conversation Flow

## Changes Made

The AI conversation flow has been simplified by removing the multimodal questions (questions 4-7) and making the conversation flow directly from processing selection to knowledge graph configuration.

## Previous Flow (Questions 1-10)
1. Intro
2. User Profile 
3. Processing Selection
4. ~~Multimodal Check (Images)~~ - REMOVED
5. ~~Audio Check~~ - REMOVED
6. ~~OCR Check~~ - REMOVED  
7. ~~Visual Analysis Check~~ - REMOVED
8. Knowledge Graph Check
9. IDP Check (Document Data Extraction)
10. Confirmation

## New Flow (Questions 1-6)
1. Intro
2. User Profile
3. Processing Selection
4. Knowledge Graph Check (previously question 8)
5. IDP Check (previously question 9)
6. Confirmation (previously question 10)

## Technical Changes

1. **Updated conversation steps in ConversationManager.ts**:
   - Changed `nextStep` from `'multimodal_check'` to `'kg_check'` after processing selection
   - Removed multimodal conversation step definitions
   - Updated ConversationState type to remove multimodal steps

2. **Multimodal options are now**:
   - Available only in the manual configuration panel
   - Still synchronized with toggles when selected
   - No longer part of the AI conversation flow

## Benefits

1. **Faster configuration**: Users reach processing configuration in 6 steps instead of 10
2. **Cleaner flow**: Focus on high-level processing types rather than granular multimodal options
3. **Better UX**: Multimodal options remain available in manual config for users who need them

## Testing

To test the new flow:
1. Start a new conversation
2. Proceed through user profile setup
3. Select processing methods
4. Verify it jumps directly to Knowledge Graph configuration
5. Continue to IDP and confirmation

The multimodal options (image captioning, audio transcription, OCR, visual analysis) are still available in the manual configuration panel and work as before.