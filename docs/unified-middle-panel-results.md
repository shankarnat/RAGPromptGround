# Unified Middle Panel for Processing and Results

## Changes Made
Updated all three processing steps (upload, process, results) to use a consistent three-panel layout with the middle panel showing the main content.

## Implementation Details

### 1. Upload Step (Already updated)
- Left panel: Manual configuration
- **Middle panel: Document upload/results view**
- Right panel: AI assistant

### 2. Process Step (Updated)
- Left panel: Processing configuration summary
- **Middle panel: Processing status with pipeline visualization**
- Right panel: AI assistant (monitoring progress)

### 3. Results Step (Updated)
- Left panel: Processing summary with actions
- **Middle panel: Results view (UnifiedResultsView)**
- Right panel: AI assistant (explore results)

## Key Features

### Process Step Middle Panel
```tsx
<ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
  <div className="h-full p-6 bg-gray-50">
    <ProcessingPipelineVisualization ... />
    <Button onClick={() => goToStep("results")}>View Results</Button>
  </div>
</ResizablePanel>
```

### Results Step Middle Panel
```tsx
<ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
  <div className="h-full p-6 bg-gray-50">
    <UnifiedResultsView
      ragResults={...}
      kgResults={...}
      idpResults={...}
    />
  </div>
</ResizablePanel>
```

## Benefits

1. **Consistent Layout**: All three steps now use the same three-panel structure
2. **Better UX**: Users always see the main content in the middle panel
3. **Context Preservation**: Configuration and assistant panels remain visible
4. **Progressive Enhancement**: Content updates in place as the user progresses

## User Flow

1. **Upload**: Middle panel shows upload interface, then switches to results when document is loaded
2. **Process**: Middle panel shows real-time processing progress and pipeline visualization
3. **Results**: Middle panel displays final processing results

The layout maintains consistency throughout the workflow while adapting the middle panel content to the current step.