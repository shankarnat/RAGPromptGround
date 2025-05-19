# Image Captioning Enable Test

## Changes Made

1. **Modified useConversation.ts**
   - Removed OCR from automatic selection
   - Only enable Image Captioning when user selects "Yes, it has images"
   - Removed setTimeout delay for immediate update

2. **Updated UnifiedDashboard.tsx**
   - Added detailed logging to track state changes
   - Increased timeout for clearing isUpdatingFromAI flag from 500ms to 1000ms
   - Added useEffect to monitor processingConfig changes
   - Separated toast notifications for Image Captioning and OCR

3. **State Update Flow**
   - When user selects "Yes, it has images" in AI conversation
   - useConversation sends configuration update with imageCaption: true
   - UnifiedDashboard receives update via handleConversationalConfig
   - Sets isUpdatingFromAI flag to prevent conflicts
   - Updates processingConfig.rag.multimodal.imageCaption
   - Shows toast notification
   - Clears flag after 1 second

## Test Procedure

1. Open browser console (F12)
2. Navigate to unified dashboard
3. Select a PDF document
4. In AI assistant, select "Yes, it has images"
5. Check console logs for:
   - "useConversation: User has images: true"
   - "handleConversationalConfig called with:"
   - "Incoming multimodal config:"
   - "Final multimodal config:"
   - "processingConfig updated:"
6. Verify Image Captioning checkbox is checked in RAG multimodal section
7. Verify checkbox remains checked (state persists)
8. Verify toast notification appears

## Expected Console Output

```
useConversation: User has images: true
handleConversationalConfig called with: {configuration: {...}, source: 'ai_assistant'}
Before update, processingConfig.rag.multimodal: {transcription: false, ocr: false, imageCaption: false, visualAnalysis: false}
Incoming multimodal config: {imageCaption: true}
Final multimodal config: {transcription: false, ocr: false, imageCaption: true, visualAnalysis: false}
processingConfig updated: {...}
```