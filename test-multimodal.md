# Multimodal Processing Test

## Test Steps

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the Document Upload page**
   - Open browser to http://localhost:3000
   - Click on "Document Upload" in the sidebar

3. **Upload a test document**
   - Click on "Choose file" and select a document with images or mixed content
   - Or use one of the example documents provided

4. **Test the AI Assistant conversation flow**
   - Once document is uploaded, look at the right side panel "Configure with AI Assistant"
   - Click through the conversation flow:
     - Select your role (e.g., Sales Representative)
     - Choose your department
     - Select experience level
     - Define your primary goal
     - Set urgency level
     - Choose detail level
     - Select processing method recommendation

5. **Test the multimodal questions**
   After processing selection, you should see:
   - "Does your document contain images that need to be indexed or analyzed?"
     - Click "Yes, it has images" to enable image caption and visual analysis
   - "Are there any audio files or recordings that need transcription?"
     - Click "Yes, audio transcription needed" if applicable
   - "Do you have scanned documents or images with text that need OCR?"
     - Click "Yes, OCR needed" if applicable
   - "Would you like AI to analyze and describe visual content (charts, diagrams, etc.)?"
     - Click "Yes, analyze visuals" if needed

6. **Verify configuration sync**
   - After answering multimodal questions, check the manual configuration panel on the left
   - Under "RAG Search" section, you should see:
     - Multimodal processing options enabled based on your AI assistant choices
     - Transcription: [Enabled if you said yes to audio]
     - OCR: [Enabled if you said yes to OCR]
     - Image Captioning: [Enabled if you said yes to images]
     - Visual Analysis: [Enabled if you said yes to visual analysis]

7. **Process the document**
   - After configuration confirmation, click "Process Document" button
   - The manual configuration should update in real-time
   - The process should start with the selected multimodal options

## Expected Results

1. **Conversation Flow**
   - Multi-step conversation works smoothly
   - Each step leads logically to the next
   - Multimodal questions appear after processing selection

2. **Configuration Sync**
   - AI assistant choices reflect in manual configuration
   - Multimodal options toggle correctly based on answers
   - Process Document button appears after questions complete

3. **Processing**
   - Document processes with selected multimodal features
   - Progress is shown in the processing panel
   - Results reflect the multimodal analysis when complete

## Debugging

If something doesn't work as expected:

1. Check browser console for JavaScript errors
2. Check network tab for API call failures
3. Verify the development server is running
4. Check that TypeScript compilation succeeds with `npm run check`

## Code Structure

The implementation includes:

- `/client/src/services/ConversationManager.ts` - Manages the multi-step conversation flow
- `/client/src/hooks/useConversation.ts` - React hook for conversation state management
- `/client/src/components/ConversationalUI.tsx` - UI component for the AI assistant
- `/client/src/components/UnifiedDashboard.tsx` - Main dashboard that coordinates everything
- `/client/src/components/CombinedConfigurationPanel.tsx` - Manual configuration with multimodal options