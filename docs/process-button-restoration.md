# Process Document Button Restoration

## Problem
The "Process Document" button was missing from the left pane (Manual Configuration panel).

## Solution
Added the Process Document button back to the ManualConfigurationPanel component.

## Changes Made

### 1. ManualConfigurationPanel.tsx Interface
Added the missing `onProcessDocument` prop:
```typescript
interface ManualConfigurationPanelProps {
  // ... existing props
  onProcessDocument?: () => void;
  // ... rest of props
}
```

### 2. Component Parameters
Added `onProcessDocument` to the component's destructured parameters:
```typescript
const ManualConfigurationPanel: React.FC<ManualConfigurationPanelProps> = memo(({
  // ... existing params
  onProcessDocument,
  // ... rest of params
}) => {
```

### 3. Added Process Button
Added a button at the bottom of the component:
```tsx
{onProcessDocument && !disabled && (
  <div className="mt-6 px-4">
    <Button
      className="w-full"
      size="lg"
      onClick={onProcessDocument}
      disabled={!Object.values(processingConfig).some((config: any) => config.enabled)}
    >
      <PlayCircle className="w-5 h-5 mr-2" />
      Process Document
    </Button>
  </div>
)}
```

### 4. Imports
Added necessary imports:
- `Button` from UI components
- `PlayCircle` icon from lucide-react

## Button Behavior

1. **Visibility**: Only shows when:
   - `onProcessDocument` prop is provided
   - Component is not in disabled state

2. **Disabled State**: Button is disabled when:
   - No processing methods are enabled
   - Checks all processingConfig values for at least one enabled method

3. **Styling**:
   - Full width button
   - Large size
   - PlayCircle icon with text
   - Margin top for spacing

## Implementation Notes

- The button was already being passed as a prop from UnifiedDashboard
- Only needed to restore the prop definition and UI rendering
- Maintains consistency with original functionality
- Button state properly reflects configuration state