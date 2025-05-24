import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileSearch, Network, FileText, PlayCircle, Wand2, Check, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import CombinedConfigurationPanel from "@/components/CombinedConfigurationPanel";

interface ManualConfigurationPanelProps {
  processingTypes: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{className?: string}>;
    description: string;
  }>;
  processingConfig: any;
  handleProcessingToggle: (type: string, enabled: boolean, forceUpdate?: boolean) => void;
  handleOptionToggle: (type: string, option: string, enabled: boolean, skipToast?: boolean) => void;
  onProcessDocument?: () => void;
  state: any;
  updateChunkingMethod: (method: any) => void;
  updateChunkSize: (size: number) => void;
  updateChunkOverlap: (overlap: number) => void;
  disabled?: boolean;
  highlightProcessButton?: boolean; // Flag to highlight the Process Document button
  pulseEffect?: boolean; // Flag to add extra pulse effect for more attention
  initialCollapsed?: boolean; // Flag to determine if sidebar is initially collapsed
  onCollapseChange?: (collapsed: boolean) => void; // Callback for collapse state changes
}

const ManualConfigurationPanel: React.FC<ManualConfigurationPanelProps> = memo(({
  processingTypes,
  processingConfig,
  handleProcessingToggle,
  handleOptionToggle,
  onProcessDocument,
  state,
  updateChunkingMethod,
  updateChunkSize,
  updateChunkOverlap,
  disabled = false,
  highlightProcessButton = false,
  pulseEffect = false,
  initialCollapsed = false,
  onCollapseChange
}) => {
  console.log('ManualConfigurationPanel render - processingConfig:', processingConfig);
  console.log('ManualConfigurationPanel render - processingConfig.rag:', processingConfig.rag);
  console.log('ManualConfigurationPanel render - processingConfig.rag.enabled:', processingConfig.rag?.enabled);
  console.log('ManualConfigurationPanel render - processingConfig.kg:', processingConfig.kg);
  console.log('ManualConfigurationPanel render - processingConfig.kg.enabled:', processingConfig.kg?.enabled);
  
  // State for tracking if sidebar is collapsed
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  
  // Sync collapsed state with initialCollapsed prop when it changes
  useEffect(() => {
    if (initialCollapsed !== collapsed) {
      console.log('Syncing collapsed state from props:', initialCollapsed);
      setCollapsed(initialCollapsed);
      
      // Notify parent component about collapse state change if needed
      if (onCollapseChange) {
        onCollapseChange(initialCollapsed);
      }
    }
  }, [initialCollapsed, collapsed, onCollapseChange]);
  
  // Track which accordions should be open based on enabled state
  const [openSections, setOpenSections] = useState<string[]>(() => {
    const initial = [];
    if (processingConfig.rag?.enabled) initial.push('rag');
    if (processingConfig.kg?.enabled) initial.push('kg');
    if (processingConfig.idp?.enabled) initial.push('idp');
    return initial;
  });
  
  // Update open sections when config changes
  useEffect(() => {
    const newOpenSections = [];
    if (processingConfig.rag?.enabled) newOpenSections.push('rag');
    if (processingConfig.kg?.enabled) newOpenSections.push('kg');
    if (processingConfig.idp?.enabled) newOpenSections.push('idp');
    setOpenSections(newOpenSections);
  }, [processingConfig.rag?.enabled, processingConfig.kg?.enabled, processingConfig.idp?.enabled]);
  
  // Toggle sidebar collapse
  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Notify parent component about collapse state change
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };
  
  return (
    <div className="h-full overflow-hidden flex w-full">
      {/* Collapsible toggle button - always visible */}
      <button 
        type="button"
        className="flex flex-col items-center justify-between h-full bg-gray-700 border-r border-gray-600 shadow-md cursor-pointer hover:bg-gray-600 transition-all duration-200 py-8 px-1 w-8 flex-shrink-0"
        style={{zIndex: 100}} 
        onClick={toggleCollapse}
        aria-label={collapsed ? "Expand configuration panel" : "Collapse configuration panel"}
      >
        {/* Top section with icon */}
        <div className="flex flex-col items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-6 w-6 text-gray-300" />
          ) : (
            <ChevronLeft className="h-6 w-6 text-gray-300" />
          )}
        </div>
        
        {/* Middle section with text */}
        <div className="flex-grow flex items-center justify-center">
          <div className="transform rotate-90 text-gray-300 text-xs font-medium tracking-wide whitespace-nowrap">
            {collapsed ? "CONFIGURATION" : "COLLAPSE PANEL"}
          </div>
        </div>
        
        {/* Bottom section with icons representing different parts */}
        <div className="flex flex-col gap-3 items-center">
          <Settings className="h-5 w-5 text-gray-400" />
          <FileSearch className="h-5 w-5 text-gray-400" />
          <FileText className="h-5 w-5 text-gray-400" />
          <Network className="h-5 w-5 text-gray-400" />
        </div>
      </button>
      
      {/* Main content area - content changes based on collapsed state */}
      <div className={`h-full transition-all duration-300 ease-in-out ${collapsed ? 'w-0 opacity-0' : 'flex-1'}`}
           style={{overflow: collapsed ? 'hidden' : 'visible'}}>
        {!collapsed && (
          /* Expanded state - show full configuration */
          <div className="h-full overflow-y-auto p-4 space-y-6 relative">
            {/* Content Configuration - always visible */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <CardTitle>Content Configuration</CardTitle>
          </div>
          <CardDescription>
            {disabled ? "Configuration used for processing" : "Select or edit which methods to apply"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processingTypes.map(type => {
            const Icon = type.icon;
            const configKey = type.id;
            return (
              <div key={type.id} className="flex items-start space-x-3">
                <Checkbox
                  checked={processingConfig[configKey]?.enabled || false}
                  onCheckedChange={(checked) => {
                    if (!disabled) {
                      // Pass true for forceUpdate to ensure the change is registered immediately
                      handleProcessingToggle(configKey, checked as boolean, true);
                    }
                  }}
                  disabled={disabled}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Finalize and Create button - placed below Processing Methods */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="pt-4 pb-4">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-all hover:scale-[1.01]"
            size="lg"
            onClick={() => {
              // Add any finalization logic here
              // For now, just call onProcessDocument if available
              if (onProcessDocument && !disabled) {
                onProcessDocument();
              }
            }}
            disabled={disabled || !Object.values(processingConfig).some((config: any) => config.enabled)}
          >
            <Wand2 className="w-5 h-5 mr-1" />
            Finalize and Create
          </Button>
        </CardContent>
      </Card>

      {/* Collapsible configuration sections */}
      <Accordion 
        type="multiple" 
        className="w-full"
        value={openSections}
        onValueChange={setOpenSections}
      >
        {/* RAG Configuration */}
        {processingConfig.rag?.enabled && (
          <AccordionItem value="rag">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <FileSearch className="w-4 h-4" />
                <span>RAG Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CombinedConfigurationPanel
                chunkingMethod={state.chunkingMethod}
                chunkSize={state.chunkSize}
                chunkOverlap={state.chunkOverlap}
                metadataFields={state.metadataFields}
                multimodalProcessing={(() => {
                  console.log('Passing multimodal to CombinedConfigurationPanel:', processingConfig.rag.multimodal);
                  return processingConfig.rag.multimodal;
                })()}
                onMultimodalProcessingToggle={(type, enabled) => {
                  console.log(`ManualConfigurationPanel: onMultimodalProcessingToggle called - type: ${type}, enabled: ${enabled}`);
                  if (!disabled) {
                    handleOptionToggle('rag', type, enabled);
                  }
                }}
                recordStructure={state.recordStructure}
                onChunkingMethodChange={disabled ? () => {} : updateChunkingMethod}
                onChunkSizeChange={disabled ? () => {} : updateChunkSize}
                onChunkOverlapChange={disabled ? () => {} : updateChunkOverlap}
                onMetadataFieldChange={() => {}}
                onRecordStructureChange={() => {}}
                onAddCustomField={() => {}}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* KG Configuration */}
        {processingConfig.kg?.enabled && (
          <AccordionItem value="kg">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4" />
                <span>Knowledge Graph Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={processingConfig.kg.entityExtraction}
                    onCheckedChange={(checked) => {
                      if (!disabled) {
                        handleOptionToggle("kg", "entityExtraction", checked as boolean, false);
                      }
                    }}
                    disabled={disabled}
                  />
                  <label>Entity Extraction</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={processingConfig.kg.relationMapping}
                    onCheckedChange={(checked) => {
                      if (!disabled) {
                        handleOptionToggle("kg", "relationMapping", checked as boolean, false);
                      }
                    }}
                    disabled={disabled}
                  />
                  <label>Relation Mapping</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={processingConfig.kg.graphBuilding}
                    onCheckedChange={(checked) => {
                      if (!disabled) {
                        handleOptionToggle("kg", "graphBuilding", checked as boolean, false);
                      }
                    }}
                    disabled={disabled}
                  />
                  <label>Graph Building</label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* IDP Configuration */}
        {processingConfig.idp?.enabled && (
          <AccordionItem value="idp">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Document Processing Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={processingConfig.idp.textExtraction}
                    onCheckedChange={(checked) => {
                      if (!disabled) {
                        handleOptionToggle("idp", "textExtraction", checked as boolean, false);
                      }
                    }}
                    disabled={disabled}
                  />
                  <label>Text Extraction</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={processingConfig.idp.classification}
                    onCheckedChange={(checked) => {
                      if (!disabled) {
                        handleOptionToggle("idp", "classification", checked as boolean, false);
                      }
                    }}
                    disabled={disabled}
                  />
                  <label>Document Classification</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={processingConfig.idp.metadata}
                    onCheckedChange={(checked) => {
                      if (!disabled) {
                        handleOptionToggle("idp", "metadata", checked as boolean, false);
                      }
                    }}
                    disabled={disabled}
                  />
                  <label>Metadata Extraction</label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      
      {/* Process Document button has been hidden */}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo - return true to skip render, false to re-render
  
  // Always check for processingConfig changes
  const prevRagEnabled = prevProps.processingConfig.rag?.enabled;
  const nextRagEnabled = nextProps.processingConfig.rag?.enabled;
  
  console.log('ManualConfigurationPanel memo comparison:');
  console.log('  Previous RAG enabled:', prevRagEnabled);
  console.log('  Next RAG enabled:', nextRagEnabled);
  
  // Force re-render if RAG enabled state changed
  if (prevRagEnabled !== nextRagEnabled) {
    console.log('  RAG enabled changed - forcing re-render');
    return false;
  }
  
  // Check other processing type changes
  for (const key of ['kg', 'idp'] as const) {
    if (prevProps.processingConfig[key]?.enabled !== nextProps.processingConfig[key]?.enabled) {
      console.log(`  ${key} enabled changed - forcing re-render`);
      return false;
    }
  }
  
  // Only do deep comparison if enabled states haven't changed
  const configEqual = JSON.stringify(prevProps.processingConfig) === JSON.stringify(nextProps.processingConfig);
  const disabledEqual = prevProps.disabled === nextProps.disabled;
  const stateEqual = JSON.stringify(prevProps.state) === JSON.stringify(nextProps.state);
  
  const highlightEqual = prevProps.highlightProcessButton === nextProps.highlightProcessButton;
  const pulseEqual = prevProps.pulseEffect === nextProps.pulseEffect;
  const collapsedEqual = prevProps.initialCollapsed === nextProps.initialCollapsed;
  
  // Also check if collapse handlers are the same
  const onCollapseChangeEqual = prevProps.onCollapseChange === nextProps.onCollapseChange;
  
  const shouldSkipRender = configEqual && disabledEqual && stateEqual && 
                           highlightEqual && pulseEqual && collapsedEqual && 
                           onCollapseChangeEqual;
                           
  console.log('  Deep comparison:', { 
    configEqual, disabledEqual, stateEqual, highlightEqual, 
    pulseEqual, collapsedEqual, onCollapseChangeEqual, shouldSkipRender 
  });
  
  return shouldSkipRender;
});

ManualConfigurationPanel.displayName = 'ManualConfigurationPanel';

export default ManualConfigurationPanel;