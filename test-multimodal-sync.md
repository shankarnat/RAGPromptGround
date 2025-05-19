# Test: Multimodal Image Captioning Sync

## Objective
When user clicks "Yes, it has images" in the AI conversation pane, the Image Captioning checkbox should be automatically enabled in the Multimodal processing section under RAG configuration in the left pane.

## Implementation Summary

### 1. useConversation.ts
- `set_has_images` action sends configuration update with `imageCaption: true`
- Uses 'ai_assistant' source to identify multimodal updates

### 2. UnifiedDashboard.tsx
- Handles 'ai_assistant' source specifically for multimodal updates
- Merges multimodal state to preserve existing settings
- Updates processingConfig.rag.multimodal with spread operator

### 3. ManualConfigurationPanel.tsx
- Added accordion state management to auto-expand sections
- RAG configuration section shows when enabled
- Contains CombinedConfigurationPanel with multimodal options

### 4. CombinedConfigurationPanel.tsx
- MultimodalSection component displays toggle switches
- Image Captioning switch bound to multimodalProcessing.imageCaption

## Test Steps

1. Open browser console
2. Navigate to Unified Dashboard
3. Upload a document
4. In AI Assistant, when asked about images, click "Yes, it has images"
5. Watch left pane for RAG configuration to expand
6. Verify Image Captioning checkbox is enabled

## Expected Console Output

1. `useConversation: User has images: true`
2. `handleConversationalConfig called with: {source: 'ai_assistant'...}`
3. `Before update, multimodal config:` (shows current state)
4. `Incoming multimodal config: {imageCaption: true}`
5. `Updating multimodal config - previous:` (shows old state)
6. `Updating multimodal config - incoming: {imageCaption: true}`
7. `Updating multimodal config - merged:` (shows combined state)
8. `Image Captioning Enabled` (toast notification)
9. `ManualConfigurationPanel render` - should show updated config
10. `MultimodalSection render - multimodalProcessing: {...imageCaption: true...}`

## Expected UI Behavior

1. When clicking "Yes, it has images":
   - RAG Search checkbox remains checked (if already enabled)
   - RAG Configuration accordion expands automatically
   - Multimodal Processing section is visible
   - Image Captioning switch is toggled ON
   - Toast notification appears
   - Other multimodal options retain their previous state

## Key State Management

- Previous multimodal state is preserved using spread operator
- Only imageCaption is updated when user has images
- RAG must be enabled for configuration to show
- Accordion state managed separately from config state

## Success Criteria

✓ Image Captioning enabled when user confirms images
✓ Previous multimodal settings retained
✓ RAG configuration section auto-expands
✓ No state conflicts or race conditions
✓ Proper toast notifications