import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileSearch, Network, FileText, PlayCircle } from "lucide-react";
import CombinedConfigurationPanel from "@/components/CombinedConfigurationPanel";

interface ManualConfigurationPanelProps {
  processingTypes: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{className?: string}>;
    description: string;
  }>;
  processingConfig: any;
  handleProcessingToggle: (type: string, enabled: boolean) => void;
  handleOptionToggle: (type: string, option: string, enabled: boolean, skipToast?: boolean) => void;
  onProcessDocument?: () => void;
  state: any;
  updateChunkingMethod: (method: any) => void;
  updateChunkSize: (size: number) => void;
  updateChunkOverlap: (overlap: number) => void;
  disabled?: boolean;
  highlightProcessButton?: boolean; // Flag to highlight the Process Document button
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
  highlightProcessButton = false
}) => {
  console.log('ManualConfigurationPanel render - processingConfig:', processingConfig);
  console.log('ManualConfigurationPanel render - processingConfig.rag:', processingConfig.rag);
  console.log('ManualConfigurationPanel render - processingConfig.rag.enabled:', processingConfig.rag?.enabled);
  console.log('ManualConfigurationPanel render - processingConfig.kg:', processingConfig.kg);
  console.log('ManualConfigurationPanel render - processingConfig.kg.enabled:', processingConfig.kg?.enabled);
  
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
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 relative">
      {/* Processing Methods - always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Methods</CardTitle>
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
                      handleProcessingToggle(configKey, checked as boolean);
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
                        handleOptionToggle("kg", "entityExtraction", checked as boolean);
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
                        handleOptionToggle("kg", "relationMapping", checked as boolean);
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
                        handleOptionToggle("kg", "graphBuilding", checked as boolean);
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
                        handleOptionToggle("idp", "textExtraction", checked as boolean);
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
                        handleOptionToggle("idp", "classification", checked as boolean);
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
                        handleOptionToggle("idp", "metadata", checked as boolean);
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
      
      {/* Spacer to ensure content isn't hidden behind sticky button */}
      {onProcessDocument && !disabled && (
        <div className="h-20"></div>
      )}
      
      {/* Process Document Button */}
      {onProcessDocument && !disabled && (
        <div className={`sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-10 -mx-4 ${highlightProcessButton ? 'ring-2 ring-blue-500 rounded-md animate-pulse' : ''}`}>
          {(Object.values(processingConfig).some((config: any) => config.enabled) || highlightProcessButton) && (
            <div className="mb-3 text-center">
              <p className={`text-sm font-medium animate-pulse ${highlightProcessButton ? 'text-blue-600 text-base' : 'text-blue-500'}`}>
                {highlightProcessButton 
                  ? "Configuration complete! Click here to process your document."
                  : "Ready to process! Click the button below to start."
                }
              </p>
            </div>
          )}
          <Button
            className={`w-full ${highlightProcessButton ? 'ring-2 ring-blue-500 shadow-lg transform scale-105 transition-all' : ''}`}
            size="lg"
            onClick={onProcessDocument}
            disabled={!Object.values(processingConfig).some((config: any) => config.enabled)}
            title={highlightProcessButton ? "Click to process the document with the configuration from the AI assistant" : "Process the document with the current configuration"}
          >
            <PlayCircle className={`w-5 h-5 mr-2 ${highlightProcessButton ? 'text-blue-500' : ''}`} />
            Process Document
          </Button>
        </div>
      )}
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
  
  const shouldSkipRender = configEqual && disabledEqual && stateEqual && highlightEqual;
  console.log('  Deep comparison:', { configEqual, disabledEqual, stateEqual, highlightEqual, shouldSkipRender });
  
  return shouldSkipRender;
});

ManualConfigurationPanel.displayName = 'ManualConfigurationPanel';

export default ManualConfigurationPanel;