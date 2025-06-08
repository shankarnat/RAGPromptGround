import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileSearch, Network, FileText, PlayCircle, Check, Settings, ChevronRight, ChevronLeft, ChevronDown, Image, Mic, Eye, Layers, Hash, Timer, Sparkles, ScrollText, ScanEye, ScanLine, Filter, Plus, Info, TestTube, FileType, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { embeddingModels } from "@/data/embeddingModelsData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ManualConfigurationPanelProps {
  processingTypes: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{className?: string}>;
    description: string;
  }>;
  processingConfig: any;
  handleProcessingToggle: (type: any, enabled: boolean, forceUpdate?: boolean) => void;
  handleOptionToggle: (type: any, option: string, enabled: boolean, skipToast?: boolean) => void;
  onProcessDocument?: () => void;
  state: any;
  updateChunkingMethod: (method: any) => void;
  updateChunkSize: (size: number) => void;
  updateChunkOverlap: (overlap: number) => void;
  disabled?: boolean;
  highlightProcessButton?: boolean;
  pulseEffect?: boolean;
  initialCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  selectedEmbeddingModel?: string;
  onEmbeddingModelChange?: (modelId: string) => void;
  parsingInstructions?: string;
  onParsingInstructionsChange?: (instructions: string) => void;
  useCustomParsing?: boolean;
  onToggleCustomParsing?: (enabled: boolean) => void;
  selectedMetadataFilters?: string[];
  onMetadataFiltersChange?: (filters: string[]) => void;
  prependMetadata?: boolean;
  onTogglePrependMetadata?: (enabled: boolean) => void;
  prependedFields?: string[];
  onPrependedFieldsChange?: (fields: string[]) => void;
  metadataFields?: Array<{ id: string; name: string; type: string }>;
  onViewParsedOutput?: () => void;
  onViewMultimodal?: () => void;
  onEvaluateIndex?: () => void;
  onViewIDP?: () => void;
  onApplyPromptParsing?: () => void;
}

// UDMO (Unified Data Model Objects) options
const udmoOptions = [
  {
    id: 'auto',
    name: 'Auto-Generated UDMO',
    description: 'Automatically generated based on document analysis',
    icon: Sparkles,
    recommended: true
  },
  {
    id: 'automotive',
    name: 'Automotive UDMO',
    description: 'Pre-configured for automotive documents and specifications',
    icon: FileType,
    category: 'Industry'
  },
  {
    id: 'financial',
    name: 'Financial UDMO',
    description: 'Optimized for financial reports and statements',
    icon: FileText,
    category: 'Industry'
  },
  {
    id: 'legal',
    name: 'Legal UDMO',
    description: 'Structured for contracts and legal documents',
    icon: ScrollText,
    category: 'Industry'
  },
  {
    id: 'custom',
    name: 'Custom UDMO',
    description: 'Create your own custom data model',
    icon: Settings,
    category: 'Custom'
  }
];


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
  onCollapseChange,
  selectedEmbeddingModel = "openai-text-embedding-3-large",
  onEmbeddingModelChange,
  parsingInstructions = "Convert any tables (especially drivetrain specifications) to clean markdown format. Extract key technical specifications and present them in structured tables with proper headers.",
  onParsingInstructionsChange,
  useCustomParsing = true,
  onToggleCustomParsing,
  selectedMetadataFilters = [],
  onMetadataFiltersChange,
  prependMetadata = false,
  onTogglePrependMetadata,
  prependedFields = [],
  onPrependedFieldsChange,
  metadataFields = [],
  onViewParsedOutput,
  onViewMultimodal,
  onEvaluateIndex,
  onViewIDP,
  onApplyPromptParsing
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedUDMO, setSelectedUDMO] = useState('auto');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (initialCollapsed !== collapsed) {
      setCollapsed(initialCollapsed);
      if (onCollapseChange) {
        onCollapseChange(initialCollapsed);
      }
    }
  }, [initialCollapsed, collapsed, onCollapseChange]);

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    console.log('Toggling collapse from', collapsed, 'to', newCollapsedState);
    setCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate publishing process (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsPublishing(false);
    setShowFinalizeModal(false);
    
    // Call the original process document function
    if (onProcessDocument) {
      onProcessDocument();
    }
  };

  const getConfigurationSummary = () => {
    const summary: Array<{section: string, items: Array<{label: string, value: string, enabled?: boolean}>}> = [];
    
    // Processing Methods
    const enabledMethods = processingTypes.filter(type => processingConfig[type.id]?.enabled);
    if (enabledMethods.length > 0) {
      summary.push({
        section: 'Processing Methods',
        items: enabledMethods.map(method => ({
          label: method.label,
          value: 'Enabled',
          enabled: true
        }))
      });
    }

    // Parse & Chunk Configuration
    if (processingConfig.rag?.enabled) {
      const parseConfig = [];
      
      if (state.chunkingMethod) {
        parseConfig.push({
          label: 'Chunking Method',
          value: state.chunkingMethod.label || state.chunkingMethod.value || 'sentence'
        });
      }
      
      if (state.chunkSize) {
        parseConfig.push({
          label: 'Chunk Size',
          value: state.chunkSize.toString()
        });
      }
      
      if (state.chunkOverlap) {
        parseConfig.push({
          label: 'Chunk Overlap',
          value: state.chunkOverlap.toString()
        });
      }

      if (useCustomParsing && parsingInstructions?.trim()) {
        parseConfig.push({
          label: 'Custom Parsing',
          value: 'Enabled',
          enabled: true
        });
      }

      if (prependMetadata && prependedFields?.length > 0) {
        parseConfig.push({
          label: 'Prepend Metadata',
          value: `${prependedFields.length} fields`,
          enabled: true
        });
      }

      // Multimodal options
      const multimodalOptions = [];
      if (processingConfig.rag?.multimodal?.ocr) multimodalOptions.push('OCR');
      if (processingConfig.rag?.multimodal?.imageCaption) multimodalOptions.push('Image Captions');
      if (processingConfig.rag?.multimodal?.visualAnalysis) multimodalOptions.push('Visual Analysis');
      if (processingConfig.rag?.multimodal?.transcription) multimodalOptions.push('Audio Transcription');
      
      if (multimodalOptions.length > 0) {
        parseConfig.push({
          label: 'Multimodal Processing',
          value: multimodalOptions.join(', '),
          enabled: true
        });
      }

      if (parseConfig.length > 0) {
        summary.push({
          section: 'Parse & Index Configuration',
          items: parseConfig
        });
      }
    }

    // Index & Search Configuration
    if (processingConfig.rag?.enabled) {
      const indexConfig = [];
      
      if (selectedEmbeddingModel) {
        const model = embeddingModels.find(m => m.id === selectedEmbeddingModel);
        indexConfig.push({
          label: 'Embedding Model',
          value: model ? `${model.name} (${model.dimensions}d)` : selectedEmbeddingModel
        });
      }

      if (selectedMetadataFilters?.length > 0) {
        indexConfig.push({
          label: 'Prefilters',
          value: `${selectedMetadataFilters.length} filters`,
          enabled: true
        });
      }

      if (indexConfig.length > 0) {
        summary.push({
          section: 'Index & Search Configuration',
          items: indexConfig
        });
      }
    }

    // Document AI Configuration
    if (processingConfig.idp?.enabled) {
      const idpConfig = [];
      
      if (processingConfig.idp?.textExtraction) {
        idpConfig.push({
          label: 'Text Extraction',
          value: 'Enabled',
          enabled: true
        });
      }
      
      if (processingConfig.idp?.classification) {
        idpConfig.push({
          label: 'Classification',
          value: 'Enabled',
          enabled: true
        });
      }
      
      if (processingConfig.idp?.metadata) {
        idpConfig.push({
          label: 'Metadata Extraction',
          value: 'Enabled',
          enabled: true
        });
      }

      if (idpConfig.length > 0) {
        summary.push({
          section: 'Document AI Configuration',
          items: idpConfig
        });
      }
    }

    return summary;
  };

  // Determine active methods for summary
  const activeMethods = processingTypes.filter(type => processingConfig[type.id]?.enabled);


  return (
    <div className="h-full overflow-hidden flex w-full">
      {/* Enhanced collapse toggle */}
      <div className="relative h-full w-8 flex-shrink-0">
        <button 
          type="button"
          className="group relative h-full w-full bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-300 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-300 shadow-sm cursor-pointer"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {/* Center the chevron and line */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            {collapsed ? (
              <>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <div className="w-0.5 h-8 bg-gray-300 group-hover:bg-blue-400 transition-colors rounded-full"></div>
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <div className="w-0.5 h-8 bg-gray-300 group-hover:bg-blue-400 transition-colors rounded-full"></div>
              </>
            )}
          </div>
          
          {/* Subtle indicator dots */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col space-y-1 pointer-events-none">
            <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
          </div>
        </button>
      </div>
      
      {/* Main content */}
      <div className={`h-full transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'flex-1'}`}
           style={{overflow: collapsed ? 'hidden' : 'visible'}}>
        {!collapsed && (
          <div className="h-full overflow-y-auto p-3 space-y-3">
            {/* Compact header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📋 Content Config
              </h3>
            </div>

            {/* Accordion-based configuration */}
            <Accordion type="multiple" defaultValue={["processing", "parse-index", "document-ai"]} className="space-y-2">
              
              {/* Processing Methods - Always visible and expanded */}
              <AccordionItem value="processing" className="border rounded-lg">
                <AccordionTrigger className="px-3 py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">Processing Methods</span>
                    <Badge variant="outline" className="ml-auto mr-2 text-xs">
                      {activeMethods.length} selected
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="space-y-2">
                    {processingTypes.map(type => {
                      const Icon = type.icon;
                      const isEnabled = processingConfig[type.id]?.enabled || false;
                      
                      return (
                        <Card key={type.id} className={`p-3 cursor-pointer transition-all ${isEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isEnabled}
                              onCheckedChange={(checked) => handleProcessingToggle(type.id, checked as boolean, true)}
                              disabled={disabled}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className={`font-medium text-sm ${isEnabled ? 'text-blue-900' : 'text-gray-600'}`}>
                                  {type.label}
                                </span>
                                {isEnabled && <Check className="w-3 h-3 text-green-600 ml-auto" />}
                              </div>
                              <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                                {type.id === 'rag' && (
                                  <>
                                    <li>• Parse multimodal</li>
                                    <li>• Hybrid index</li>
                                  </>
                                )}
                                {type.id === 'kg' && (
                                  <>
                                    <li>• Entity extraction</li>
                                    <li>• Relationship mapping</li>
                                  </>
                                )}
                                {type.id === 'idp' && (
                                  <>
                                    <li>• Document processing</li>
                                    <li>• Form extraction</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Parse & Index Configuration - Only visible when RAG is enabled */}
              {processingConfig.rag?.enabled && (
                <AccordionItem value="parse-index" className="border rounded-lg">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                      <span className="font-medium">Parse & Index Configuration</span>
                      <Badge variant="outline" className="ml-auto mr-2 text-xs">
                        {(() => {
                          let activeCount = 0;
                          if (processingConfig.rag?.multimodal?.ocr) activeCount++;
                          if (processingConfig.rag?.multimodal?.imageCaption) activeCount++;
                          if (processingConfig.rag?.multimodal?.visualAnalysis) activeCount++;
                          if (processingConfig.rag?.multimodal?.transcription) activeCount++;
                          if (useCustomParsing) activeCount++;
                          if (prependMetadata) activeCount++;
                          if (selectedEmbeddingModel) activeCount++;
                          return activeCount > 0 ? `${activeCount} active` : 'Configure';
                        })()}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 space-y-3">
                    
                    {/* Nested accordion for Parse & Index sub-sections */}
                    <Accordion type="multiple" defaultValue={["parse-chunk", "index-search"]} className="space-y-2">
                      
                      {/* Parse & Chunk Sub-Section */}
                      <AccordionItem value="parse-chunk" className="border border-blue-200 rounded-md">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📝</span>
                            <span className="font-medium text-sm">Parse & Chunk</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-100 ml-auto mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewParsedOutput?.();
                              }}
                              disabled={disabled}
                              title="Trigger Content Understanding"
                            >
                              <Eye className="h-3 w-3 text-blue-700" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 space-y-3">
                          
                          {/* Prompt-Based Parsing */}
                          <div className="p-3 bg-white rounded-md border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-blue-900">🧠 Prompt-Based Parsing</h5>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={useCustomParsing === true}
                                  onCheckedChange={(checked) => {
                                    console.log('Toggle clicked:', checked);
                                    onToggleCustomParsing?.(checked);
                                  }}
                                  disabled={disabled}
                                />
                                <Badge 
                                  variant={useCustomParsing === true && parsingInstructions?.trim() ? "default" : "secondary"} 
                                  className="text-xs"
                                >
                                  {useCustomParsing === true && parsingInstructions?.trim() ? 'Active' : 'Off'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Always show the textarea when toggle is on */}
                            {useCustomParsing === true && (
                              <div className="space-y-2">
                                <textarea
                                  placeholder="Enter custom parsing instructions here..."
                                  value={parsingInstructions || 'Convert any tables (especially drivetrain specifications) to clean markdown format. Extract key technical specifications and present them in structured tables with proper headers.'}
                                  onChange={(e) => {
                                    console.log('Textarea changed:', e.target.value);
                                    onParsingInstructionsChange?.(e.target.value);
                                  }}
                                  disabled={disabled}
                                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[80px] text-xs"
                                  rows={4}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      console.log('Apply parsing clicked');
                                      if (parsingInstructions?.trim()) {
                                        // Enable the toggle if not already enabled
                                        if (useCustomParsing !== true) {
                                          onToggleCustomParsing?.(true);
                                        }
                                        onApplyPromptParsing?.();
                                      }
                                    }}
                                    disabled={disabled || !parsingInstructions?.trim()}
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {state?.promptParsing?.isApplied ? 'Update Parsing' : 'Apply Parsing'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      onParsingInstructionsChange?.('');
                                    }}
                                    disabled={disabled || !parsingInstructions?.trim()}
                                    className="h-7 text-xs"
                                  >
                                    Clear
                                  </Button>
                                </div>
                                {state?.promptParsing?.isApplied && (
                                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                                    ✅ Custom parsing rules applied successfully
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Show message when toggle is off */}
                            {useCustomParsing !== true && (
                              <div className="text-xs text-gray-500 italic">
                                Enable to add custom parsing instructions for better document understanding
                              </div>
                            )}
                            
                            {/* Bring Your Own Code Toggle */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-700">
                                    Bring Your Own Code
                                  </label>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" title="Use custom code for advanced parsing strategies" />
                                </div>
                                <Switch
                                  checked={state.bringYourOwnCodeParsing || false}
                                  onCheckedChange={(checked) => {
                                    // Handle bring your own code toggle for parsing
                                    // This would need to be connected to state management
                                    console.log('Bring Your Own Code (Parsing) toggled:', checked);
                                  }}
                                  disabled={disabled}
                                  className="h-5 w-9 data-[state=checked]:bg-blue-600"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Chunking Settings */}
                          <div className="p-3 bg-white rounded-md border border-blue-100 shadow-sm">
                            <h5 className="text-xs font-medium text-blue-900 mb-2">📊 Chunking Settings</h5>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">Method</label>
                                <Select
                                  value={state.chunkingMethod?.value || 'sentence'}
                                  onValueChange={(value) => updateChunkingMethod({ value, label: value })}
                                  disabled={disabled}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sentence">Sentence</SelectItem>
                                    <SelectItem value="paragraph">Paragraph</SelectItem>
                                    <SelectItem value="semantic">Semantic</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Size</label>
                                <Input
                                  type="number"
                                  value={state.chunkSize || 1000}
                                  onChange={(e) => updateChunkSize(parseInt(e.target.value))}
                                  disabled={disabled}
                                  className="h-7 text-xs"
                                  min={100}
                                  max={5000}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Overlap</label>
                                <Input
                                  type="number"
                                  value={state.chunkOverlap || 200}
                                  onChange={(e) => updateChunkOverlap(parseInt(e.target.value))}
                                  disabled={disabled}
                                  className="h-7 text-xs"
                                  min={0}
                                  max={1000}
                                />
                              </div>
                            </div>
                            
                            {/* Prompt Chunking Toggle */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-700">
                                    Prompt chunking
                                  </label>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" title="Use AI prompts to intelligently determine chunk boundaries" />
                                </div>
                                <Switch
                                  checked={state.promptChunking || false}
                                  onCheckedChange={(checked) => {
                                    // Handle prompt chunking toggle
                                    // This would need to be connected to state management
                                    console.log('Prompt chunking toggled:', checked);
                                  }}
                                  disabled={disabled}
                                  className="h-5 w-9 data-[state=checked]:bg-blue-600"
                                />
                              </div>
                            </div>
                            
                            {/* Bring Your Own Code Toggle */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-gray-700">
                                    Bring Your Own Code
                                  </label>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" title="Use custom code for advanced chunking strategies" />
                                </div>
                                <Switch
                                  checked={state.bringYourOwnCode || false}
                                  onCheckedChange={(checked) => {
                                    // Handle bring your own code toggle
                                    // This would need to be connected to state management
                                    console.log('Bring Your Own Code toggled:', checked);
                                  }}
                                  disabled={disabled}
                                  className="h-5 w-9 data-[state=checked]:bg-blue-600"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Prepend Metadata */}
                          <div className="p-3 bg-white rounded-md border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-blue-900">🔖 Prepend Metadata</h5>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={prependMetadata === true}
                                  onCheckedChange={(checked) => {
                                    onTogglePrependMetadata?.(checked);
                                    if (!checked) {
                                      onPrependedFieldsChange?.([]);
                                    }
                                  }}
                                  disabled={disabled || !metadataFields || metadataFields.length === 0}
                                />
                                <Badge 
                                  variant={prependMetadata === true && prependedFields && prependedFields.length > 0 ? "default" : "secondary"} 
                                  className="text-xs"
                                >
                                  {prependMetadata === true && prependedFields && prependedFields.length > 0 ? 'Active' : 'Off'}
                                </Badge>
                              </div>
                            </div>
                            {(prependMetadata === true || (metadataFields && metadataFields.length > 0)) && (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-600">
                                  Selected fields: {prependMetadata === true && prependedFields && prependedFields.length > 0 ? 
                                    prependedFields.map(fieldId => 
                                      metadataFields?.find(f => f.id === fieldId)?.name || fieldId
                                    ).join(', ') : 'None'}
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                      Configure Fields
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Configure Prepend Metadata</DialogTitle>
                                      <DialogDescription>
                                        Select metadata fields to prepend to chunks
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                      {metadataFields && metadataFields.length > 0 ? (
                                        metadataFields.map((field) => (
                                          <div key={field.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={prependedFields ? prependedFields.includes(field.id) : false}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  onPrependedFieldsChange?.([...(prependedFields || []), field.id]);
                                                } else {
                                                  onPrependedFieldsChange?.((prependedFields || []).filter(f => f !== field.id));
                                                }
                                              }}
                                            />
                                            <Label className="text-sm">{field.name}</Label>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-sm text-gray-500 py-4 text-center">
                                          No metadata fields available. Process a document first to see available fields.
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>

                          {/* Multimodal Options */}
                          <div className="p-3 bg-white rounded-md border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-xs font-medium text-blue-900">🎭 Multimodal Processing</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-blue-100"
                                onClick={onViewMultimodal}
                                disabled={disabled}
                                title="Trigger Content Understanding"
                              >
                                <Eye className="h-3 w-3 text-blue-700" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={processingConfig.rag?.multimodal?.ocr || false}
                                  onCheckedChange={(checked) => handleOptionToggle('rag', 'ocrExtraction', checked)}
                                  disabled={disabled}
                                />
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs">OCR</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={processingConfig.rag?.multimodal?.imageCaption || false}
                                  onCheckedChange={(checked) => handleOptionToggle('rag', 'imageCaptioning', checked)}
                                  disabled={disabled}
                                />
                                <div className="flex items-center gap-1">
                                  <Image className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs">Captions</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={processingConfig.rag?.multimodal?.visualAnalysis || false}
                                  onCheckedChange={(checked) => handleOptionToggle('rag', 'visualAnalysis', checked)}
                                  disabled={disabled}
                                />
                                <div className="flex items-center gap-1">
                                  <ScanLine className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs">Visual</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={processingConfig.rag?.multimodal?.transcription || false}
                                  onCheckedChange={(checked) => handleOptionToggle('rag', 'audioTranscription', checked)}
                                  disabled={disabled}
                                />
                                <div className="flex items-center gap-1">
                                  <Mic className="h-3 w-3 text-gray-600" />
                                  <span className="text-xs">Audio</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </AccordionContent>
                      </AccordionItem>

                      {/* Index & Search Sub-Section */}
                      <AccordionItem value="index-search" className="border border-blue-200 rounded-md">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🔍</span>
                            <span className="font-medium text-sm">Index & Search</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-blue-100 ml-auto mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEvaluateIndex?.();
                              }}
                              disabled={disabled}
                              title="Trigger Content Understanding"
                            >
                              <Eye className="h-3 w-3 text-blue-700" />
                            </Button>
                            <Badge variant="outline" className="text-xs">
                              {selectedEmbeddingModel ? 'Configured' : 'Setup needed'}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 space-y-3">
                          
                          {/* Embedding Model Selection */}
                          <div className="p-3 bg-white rounded-md border border-blue-100 shadow-sm">
                            <h5 className="text-xs font-medium text-blue-900 mb-2">🔤 Embedding Model</h5>
                            <Select
                              value={selectedEmbeddingModel}
                              onValueChange={onEmbeddingModelChange}
                              disabled={disabled}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select embedding model" />
                              </SelectTrigger>
                              <SelectContent>
                                {embeddingModels.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{model.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {model.dimensions}d
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Metadata Filters */}
                          <div className="p-3 bg-white rounded-md border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-blue-900">📋 Prefilters</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-blue-100"
                                onClick={onEvaluateIndex}
                                disabled={disabled}
                                title="Test Index Configuration"
                              >
                                <TestTube className="h-3 w-3 text-blue-700" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600">
                                Active filters: {selectedMetadataFilters && selectedMetadataFilters.length > 0 ? 
                                  selectedMetadataFilters.map(fieldId => 
                                    metadataFields?.find(f => f.id === fieldId)?.name || fieldId
                                  ).join(', ') : 'None'}
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-7 text-xs">
                                    <Filter className="h-3 w-3 mr-1" />
                                    Configure Filters
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Configure Metadata Filters</DialogTitle>
                                    <DialogDescription>
                                      Select metadata fields to filter search results
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-2">
                                    {metadataFields && metadataFields.length > 0 ? (
                                      metadataFields.map((field) => (
                                        <div key={field.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            checked={selectedMetadataFilters ? selectedMetadataFilters.includes(field.id) : false}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                onMetadataFiltersChange?.([...(selectedMetadataFilters || []), field.id]);
                                              } else {
                                                onMetadataFiltersChange?.((selectedMetadataFilters || []).filter(f => f !== field.id));
                                              }
                                            }}
                                          />
                                          <Label className="text-sm">{field.name}</Label>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-sm text-gray-500 py-4 text-center">
                                        No metadata fields available. Process a document first to see available fields.
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                        </AccordionContent>
                      </AccordionItem>
                      
                    </Accordion>

                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Document AI Section - Only visible when IDP is enabled */}
              {processingConfig.idp?.enabled && (
                <AccordionItem value="document-ai" className="border rounded-lg">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <span className="font-medium">Document AI Config</span>
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          let activeCount = 0;
                          if (processingConfig.idp?.textExtraction) activeCount++;
                          if (processingConfig.idp?.classification) activeCount++;
                          if (processingConfig.idp?.metadata) activeCount++;
                          return activeCount > 0 ? `${activeCount} active` : 'Configure';
                        })()}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 space-y-4">
                    
                    {/* Document Processing Options */}
                    <div className="p-3 bg-white rounded-md border border-purple-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-medium text-purple-900">🔍 Processing Options</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-purple-100"
                          onClick={onViewIDP}
                          disabled={disabled}
                          title="Trigger Content Understanding"
                        >
                          <Eye className="h-4 w-4 text-purple-700" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium">Text Extraction</span>
                          </div>
                          <Switch
                            checked={processingConfig.idp?.textExtraction || false}
                            onCheckedChange={(checked) => handleOptionToggle('idp', 'textExtraction', checked)}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium">Classification</span>
                          </div>
                          <Switch
                            checked={processingConfig.idp?.classification || false}
                            onCheckedChange={(checked) => handleOptionToggle('idp', 'classification', checked)}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium">Metadata Extraction</span>
                          </div>
                          <Switch
                            checked={processingConfig.idp?.metadata || false}
                            onCheckedChange={(checked) => handleOptionToggle('idp', 'metadata', checked)}
                            disabled={disabled}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advanced IDP Options */}
                    <div className="p-3 bg-white rounded-md border border-purple-200 shadow-sm">
                      <h5 className="text-xs font-medium text-purple-900 mb-2">⚙️ Advanced Options</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Form Processing</span>
                          <Badge variant="outline" className="text-xs">Auto-detect</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Table Extraction</span>
                          <Badge variant="outline" className="text-xs">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Layout Analysis</span>
                          <Badge variant="outline" className="text-xs">Enabled</Badge>
                        </div>
                      </div>
                    </div>

                  </AccordionContent>
                </AccordionItem>
              )}

            </Accordion>


            {/* Publish Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                size="default"
                onClick={() => setShowFinalizeModal(true)}
                disabled={disabled || !activeMethods.length}
                className={`w-full ${highlightProcessButton ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} ${pulseEffect ? 'animate-pulse' : ''}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Publish Configuration
              </Button>
              {activeMethods.length === 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Select at least one processing method to publish
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Publish Configuration Modal */}
      <Dialog open={showFinalizeModal} onOpenChange={setShowFinalizeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Publish Configuration & Select UDMO
            </DialogTitle>
            <DialogDescription>
              Select a Unified Data Model Object (UDMO) and review your configuration before publishing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UDMO Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select UDMO</h3>
              <div className="space-y-3">
                {udmoOptions.map((udmo) => {
                  const Icon = udmo.icon;
                  return (
                    <Card 
                      key={udmo.id}
                      className={`cursor-pointer transition-all ${
                        selectedUDMO === udmo.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${udmo.recommended ? 'ring-2 ring-green-200' : ''}`}
                      onClick={() => setSelectedUDMO(udmo.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Icon className={`w-5 h-5 ${
                              selectedUDMO === udmo.id ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{udmo.name}</h4>
                              {udmo.recommended && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Recommended
                                </Badge>
                              )}
                              {udmo.category && (
                                <Badge variant="outline" className="text-xs">
                                  {udmo.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{udmo.description}</p>
                          </div>
                          {selectedUDMO === udmo.id && (
                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration Summary</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getConfigurationSummary().map((section, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{section.section}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{item.value}</span>
                              {item.enabled && (
                                <Check className="w-3 h-3 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {getConfigurationSummary().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No configuration settings available</p>
                    <p className="text-xs">Enable processing methods to see configuration options</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileType className="w-4 h-4" />
              <span>Selected UDMO: {udmoOptions.find(u => u.id === selectedUDMO)?.name}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFinalizeModal(false)}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePublish}
                disabled={isPublishing || !selectedUDMO}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPublishing ? (
                  <>
                    <Timer className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Publish Configuration
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

const areEqual = (prevProps: ManualConfigurationPanelProps, nextProps: ManualConfigurationPanelProps) => {
  // Compare processing types enabled state
  for (const key of ['rag', 'kg', 'idp']) {
    if (prevProps.processingConfig[key]?.enabled !== nextProps.processingConfig[key]?.enabled) {
      return false;
    }
  }
  
  const configEqual = JSON.stringify(prevProps.processingConfig) === JSON.stringify(nextProps.processingConfig);
  const disabledEqual = prevProps.disabled === nextProps.disabled;
  const stateEqual = JSON.stringify(prevProps.state) === JSON.stringify(nextProps.state);
  const highlightEqual = prevProps.highlightProcessButton === nextProps.highlightProcessButton;
  const pulseEqual = prevProps.pulseEffect === nextProps.pulseEffect;

  return configEqual && disabledEqual && stateEqual && highlightEqual && pulseEqual;
};

export default memo(ManualConfigurationPanel, areEqual);
