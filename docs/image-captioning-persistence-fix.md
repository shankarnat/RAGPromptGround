# Image Captioning State Persistence Fix

## Problem
When selecting "Yes, it has images" in AI conversation, the Image Captioning checkbox was being enabled but then immediately disabled. The state was not persisting.

## Solution
Implemented a comprehensive state management approach to prevent race conditions:

### 1. Created State Management Utilities (`lib/stateUtils.ts`)
- `StateManager` class that queues state updates and prevents duplicates
- Ensures state updates are processed sequentially
- Prevents race conditions between multiple simultaneous updates

### 2. Created Multimodal Config Hook (`hooks/useMultimodalConfig.ts`)
- Dedicated state management for multimodal configuration
- Tracks update sources (AI, user, system)
- Implements update blocking logic to prevent conflicts
- Uses StateManager for robust state updates

### 3. Updated UnifiedDashboard Component
- Added `multimodalUpdateRef` to track AI updates without state re-renders
- Increased timeouts from 500ms to 2000ms for proper state settling
- Added useEffect to sync multimodal config with processing config
- Modified handleConversationalConfig to use the new multimodal hook
- Updated handleOptionToggle to respect update blocking

### 4. Improved Timing
- Increased delay in useConversation from 150ms to 300ms
- Increased flag clearing timeouts to 2000ms
- Added proper state synchronization using useEffect

### 5. State Flow
1. User selects "Yes, it has images" in AI conversation
2. ConversationManager sends action to useConversation
3. useConversation waits 300ms then sends config update
4. UnifiedDashboard receives update via handleConversationalConfig
5. Sets multimodalUpdateRef to block conflicting updates
6. Updates multimodal config using dedicated hook
7. Syncs with processing config via useEffect
8. Shows toast notification
9. Clears flags after 2000ms

## Key Improvements
- Centralized state management prevents conflicting updates
- Proper queueing ensures updates are processed sequentially
- Update source tracking prevents race conditions
- Increased timeouts give React time to process state changes
- Multimodal state separated from general processing config

## Testing
1. Open browser console for debugging
2. Navigate to unified dashboard
3. Select a PDF document
4. In AI assistant, select "Yes, it has images"
5. Verify Image Captioning checkbox gets enabled and stays enabled
6. Check console logs for state update flow
7. Verify checkbox remains checked (state persists)

The fix ensures that state updates from the AI assistant properly persist and don't get overridden by conflicting updates.