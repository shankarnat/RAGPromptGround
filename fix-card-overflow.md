# Card Overflow Fix in Conversational UI

## Problem
The conversation cards with action buttons were overflowing their container, causing UI issues when displaying longer button labels or multiple buttons in the contract conversation flow.

## Solution
Made several UI improvements to fix the overflow issues:

1. **Added scrollable action container**
   - Added a `max-h-60` height limit with `overflow-y-auto` for the buttons container
   - This allows many buttons to fit within the container with a scrollbar when needed

2. **Added proper width constraints**
   - Changed action container from `max-w-full` to `w-full` to ensure proper width handling
   - Added a small right padding (`pr-1`) to the scrollable area for better aesthetics when scrollbar appears

3. **Improved button spacing**
   - Added `mb-2` margin to each button to provide better separation between buttons
   - This helps with touch targets and visual distinction

4. **Extended message container width**
   - Added `w-full` class to the message container to ensure it properly utilizes available space
   - This gives more room for the button container to expand appropriately

## Benefits
- Cards now properly fit within the chat interface without overflowing
- Long button labels are properly truncated with the existing `truncate` class
- Multiple buttons are contained within a scrollable area when they exceed the height limit
- The UI maintains its clean appearance while supporting the rich conversational features

These changes maintain all the functionality of the contract conversation flow while ensuring a better visual presentation that fits properly within the chat interface.