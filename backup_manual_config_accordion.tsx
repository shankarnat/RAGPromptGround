import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileSearch, Network, FileText, PlayCircle, Check, Settings, ChevronRight, ChevronLeft, ChevronDown, Image, Mic, Eye, Layers, Hash, Timer, Sparkles, ScrollText, ScanEye, Filter, Plus, Info, TestTube } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  onCollapseChange,
  selectedEmbeddingModel = "openai-text-embedding-3-large",
  onEmbeddingModelChange,
  parsingInstructions = "",
  onParsingInstructionsChange,
  useCustomParsing = false,
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
  onViewIDP
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [tempSelectedFilters, setTempSelectedFilters] = useState<string[]>(selectedMetadataFilters);
  const [showPrependModal, setShowPrependModal] = useState(false);
  const [tempPrependedFields, setTempPrependedFields] = useState<string[]>(prependedFields);

  useEffect(() => {
    if (initialCollapsed !== collapsed) {
      setCollapsed(initialCollapsed);
      if (onCollapseChange) {
        onCollapseChange(initialCollapsed);
      }
    }
  }, [initialCollapsed, collapsed, onCollapseChange]);
  
  useEffect(() => {
    setTempSelectedFilters(selectedMetadataFilters);
  }, [selectedMetadataFilters]);
  
  useEffect(() => {
    setTempPrependedFields(prependedFields);
  }, [prependedFields]);

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  // Determine active methods for summary
  const activeMethods = processingTypes.filter(type => processingConfig[type.id]?.enabled);

  return (
    <div className="h-full overflow-hidden flex w-full">
      {/* Enhanced collapse toggle */}
      <div className="relative h-full w-8 flex-shrink-0">
        <button 
          type="button"
          className="group flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-300 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-300 shadow-sm"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
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
        </button>
        
        {/* Subtle indicator dots */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col space-y-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={`h-full transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'flex-1'}`}
           style={{overflow: collapsed ? 'hidden' : 'visible'}}>
        {!collapsed && (
          <div className="h-full overflow-y-auto p-3 space-y-3">
            {/* Compact header with Process button */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📋 Content Config
              </h3>
              <Button 
                size="sm"
                onClick={() => onProcessDocument && onProcessDocument()}
                disabled={disabled || !activeMethods.length}
                className={`${highlightProcessButton ? 'bg-green-600 hover:bg-green-700' : ''} ${pulseEffect ? 'animate-pulse' : ''}`}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Finalize
              </Button>
            </div>

            {/* Accordion-based processing configuration */}
            <Accordion type="multiple" className="space-y-2">
              {/* RAG Processing Accordion */}
              <AccordionItem value="rag" className="border rounded-lg">
                <AccordionTrigger className="hover:no-underline px-4 py-3">
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox
                      checked={processingConfig.rag?.enabled || false}
                      onCheckedChange={(checked) => handleProcessingToggle('rag', checked as boolean, true)}
                      disabled={disabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <FileSearch className={`w-4 h-4 ${processingConfig.rag?.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-left font-medium">🔍 RAG Processing</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {processingConfig.rag?.enabled && (
                    <div className="space-y-4">
                      {/* Parse & Chunk Configuration */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-blue-900">🔍 Parse & Chunk</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              onClick={() => onViewParsedOutput?.()}
                              disabled={disabled}
                              title="Content Understanding - Chunk"
                            >
                              <Eye className="h-4 w-4 text-blue-700" />
                            </Button>
                          </div>
                          <p className="text-xs text-blue-600">Configure document parsing and chunking strategy</p>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Chunking Method</label>
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
                                  <SelectItem value="fixed">Fixed Size</SelectItem>
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
                                min="100"
                                max="8000"
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
                                min="0"
                                max="500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multimodal Configuration */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-green-900">🖼️ Multimodal</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              onClick={() => onViewMultimodal?.()}
                              disabled={disabled}
                              title="Content Understanding - Multimodal"
                            >
                              <Eye className="h-4 w-4 text-blue-700" />
                            </Button>
                          </div>
                          <p className="text-xs text-green-600">Configure multimodal content extraction</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="ocr-enabled"
                              checked={processingConfig.rag?.ocrExtraction || false}
                              onCheckedChange={(checked) => handleOptionToggle('rag', 'ocrExtraction', checked)}
                              disabled={disabled}
                              className="h-4 w-7"
                            />
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> OCR
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="audio-transcription"
                              checked={processingConfig.rag?.audioTranscription || false}
                              onCheckedChange={(checked) => handleOptionToggle('rag', 'audioTranscription', checked)}
                              disabled={disabled}
                              className="h-4 w-7"
                            />
                            <div className="flex items-center gap-1">
                              <Mic className="w-3 h-3" /> Audio
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="visual-analysis"
                              checked={processingConfig.rag?.visualAnalysis || false}
                              onCheckedChange={(checked) => handleOptionToggle('rag', 'visualAnalysis', checked)}
                              disabled={disabled}
                              className="h-4 w-7"
                            />
                            <div className="flex items-center gap-1">
                              <ScanEye className="w-3 h-3" /> Visual
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="image-captioning"
                              checked={processingConfig.rag?.imageCaptioning || false}
                              onCheckedChange={(checked) => handleOptionToggle('rag', 'imageCaptioning', checked)}
                              disabled={disabled}
                              className="h-4 w-7"
                            />
                            <div className="flex items-center gap-1">
                              <Image className="w-3 h-3" /> Caption
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Index Configuration */}
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-indigo-900">🧪 Index Configuration</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              onClick={() => onEvaluateIndex?.()}
                              disabled={disabled}
                              title="Content Understanding - Index Config"
                            >
                              <Eye className="h-4 w-4 text-blue-700" />
                            </Button>
                          </div>
                          <p className="text-xs text-indigo-600">Configure vectorization and indexing options</p>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-blue-800 mb-1 block">Embedding Model</Label>
                            <Select 
                              value={selectedEmbeddingModel} 
                              onValueChange={onEmbeddingModelChange}
                              disabled={disabled}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {embeddingModels.map(model => (
                                  <SelectItem key={model.id} value={model.id} className="text-xs">
                                    {model.name} ({model.dimensions}d)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Knowledge Graph Accordion */}
              <AccordionItem value="kg" className="border rounded-lg">
                <AccordionTrigger className="hover:no-underline px-4 py-3">
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox
                      checked={processingConfig.kg?.enabled || false}
                      onCheckedChange={(checked) => handleProcessingToggle('kg', checked as boolean, true)}
                      disabled={disabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Network className={`w-4 h-4 ${processingConfig.kg?.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className="text-left font-medium">🕸️ Knowledge Graph</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {processingConfig.kg?.enabled && (
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Advanced Graph Options</h5>
                      <div className="space-y-1">
                        {['entityExtraction', 'relationMapping', 'graphBuilding'].map(option => (
                          <div key={option} className="flex items-center gap-2">
                            <Checkbox
                              id={`kg-${option}`}
                              checked={processingConfig.kg?.[option] || false}
                              onCheckedChange={(checked) => handleOptionToggle('kg', option, checked as boolean)}
                              disabled={disabled}
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`kg-${option}`} className="text-xs cursor-pointer">
                              {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Document AI Accordion */}
              <AccordionItem value="idp" className="border rounded-lg">
                <AccordionTrigger className="hover:no-underline px-4 py-3">
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox
                      checked={processingConfig.idp?.enabled || false}
                      onCheckedChange={(checked) => handleProcessingToggle('idp', checked as boolean, true)}
                      disabled={disabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <FileText className={`w-4 h-4 ${processingConfig.idp?.enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="text-left font-medium">🤖 Document AI</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {processingConfig.idp?.enabled && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-purple-900">🤖 Document AI Configuration</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-purple-100"
                            onClick={() => onViewIDP?.()}
                            disabled={disabled}
                            title="Content Understanding - Document AI"
                          >
                            <Eye className="h-4 w-4 text-purple-700" />
                          </Button>
                        </div>
                        <p className="text-xs text-purple-600">Configure intelligent document processing and extraction</p>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-md border border-purple-200 shadow-sm">
                          <h5 className="text-xs font-medium text-purple-900 mb-2">🔍 Processing Options</h5>
                          <div className="space-y-1">
                            {['textExtraction', 'classification', 'metadata'].map(option => (
                              <div key={option} className="flex items-center gap-2">
                                <Checkbox
                                  id={`idp-${option}`}
                                  checked={processingConfig.idp?.[option] || false}
                                  onCheckedChange={(checked) => handleOptionToggle('idp', option, checked as boolean)}
                                  disabled={disabled}
                                  className="h-3 w-3"
                                />
                                <Label htmlFor={`idp-${option}`} className="text-xs cursor-pointer">
                                  {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
                            <span className={`font-medium text-sm ${isEnabled ? 'text-blue-900' : 'text-gray-600'}`}>
                              {type.label}
                            </span>
                            {isEnabled && <Check className="w-3 h-3 text-green-600 ml-auto" />}
                          </div>
                          {/* Bullet points for features */}
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
                                <li>• Text extraction</li>
                                <li>• Classification</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Advanced settings for KG when enabled */}
                    {type.id === 'kg' && isEnabled && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Advanced Graph Options</h5>
                        <div className="space-y-1">
                          {['entityExtraction', 'relationMapping', 'graphBuilding'].map(option => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`kg-${option}`}
                                checked={processingConfig.kg?.[option] || false}
                                onCheckedChange={(checked) => handleOptionToggle('kg', option, checked as boolean)}
                                disabled={disabled}
                                className="h-3 w-3"
                              />
                              <Label htmlFor={`kg-${option}`} className="text-xs cursor-pointer">
                                {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Document AI Configuration for IDP */}
                    {type.id === 'idp' && isEnabled && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-purple-900">🤖 Document AI Configuration</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-purple-100"
                              onClick={() => onViewIDP?.()}
                              disabled={disabled}
                              title="Content Understanding - Document AI"
                            >
                              <Eye className="h-4 w-4 text-purple-700" />
                            </Button>
                          </div>
                          <p className="text-xs text-purple-600">Configure intelligent document processing and extraction</p>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-md border border-purple-200 shadow-sm">
                            <h5 className="text-xs font-medium text-purple-900 mb-2">🔍 Processing Options</h5>
                            <div className="space-y-1">
                              {['textExtraction', 'classification', 'metadata'].map(option => (
                                <div key={option} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`idp-${option}`}
                                    checked={processingConfig.idp?.[option] || false}
                                    onCheckedChange={(checked) => handleOptionToggle('idp', option, checked as boolean)}
                                    disabled={disabled}
                                    className="h-3 w-3"
                                  />
                                  <Label htmlFor={`idp-${option}`} className="text-xs cursor-pointer">
                                    {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Group 1: Parse & Index Configuration for RAG */}
                    {isRAG && isEnabled && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">🔍 Parse & Index Configuration</h4>
                          <p className="text-xs text-blue-600">Configure how documents are parsed, chunked, and indexed</p>
                        </div>
                        <div className="space-y-4">
                          {/* Parse and Chunk Section */}
                          <div className="p-3 bg-white rounded-md border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-blue-900">📊 Parse and Chunk</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                onClick={() => onViewParsedOutput?.()}
                                disabled={disabled}
                                title="Content Understanding - Chunk"
                              >
                                <Eye className="h-4 w-4 text-blue-700" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                        {/* Chunking settings */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Chunking Method</label>
                            <Select
                              value={state.chunkingMethod?.value || 'sentence'}
                              onValueChange={(value) => updateChunkingMethod({ value, label: value })}
                              disabled={disabled}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sentence">Sentence</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="semantic">Semantic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 flex items-center gap-1">
                              <Hash className="w-3 h-3" /> Size
                            </label>
                            <Input
                              type="number"
                              value={state.chunkSize}
                              onChange={(e) => updateChunkSize(parseInt(e.target.value))}
                              className="h-8 text-xs"
                              disabled={disabled}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 flex items-center gap-1">
                              <Layers className="w-3 h-3" /> Overlap
                            </label>
                            <Input
                              type="number"
                              value={state.chunkOverlap}
                              onChange={(e) => updateChunkOverlap(parseInt(e.target.value))}
                              className="h-8 text-xs"
                              disabled={disabled}
                            />
                          </div>
                        </div>
                        
                        {/* Parsing Instructions */}
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                              <ScrollText className="w-3 h-3" /> Prompt Based Parsing
                            </h5>
                            <Switch
                              id="useCustomParsing"
                              checked={useCustomParsing || state.promptParsing?.isApplied}
                              onCheckedChange={(checked) => onToggleCustomParsing?.(checked)}
                              disabled={disabled}
                              className="h-4 w-7"
                            />
                          </div>
                          {(useCustomParsing || state.promptParsing?.isApplied) && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Enter custom instructions for parsing (e.g., 'Extract all warranty information and technical specifications')"
                                value={parsingInstructions || state.promptParsing?.customPrompt || ""}
                                onChange={(e) => onParsingInstructionsChange?.(e.target.value)}
                                className="h-16 text-xs resize-none"
                                disabled={false}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  const currentInstructions = parsingInstructions || state.promptParsing?.customPrompt || "";
                                  if (onParsingInstructionsChange && currentInstructions.trim()) {
                                    onParsingInstructionsChange(currentInstructions);
                                  }
                                  if (onProcessDocument) {
                                    onProcessDocument();
                                  }
                                }}
                                disabled={disabled || !(parsingInstructions?.trim() || state.promptParsing?.customPrompt?.trim())}
                                className="w-full h-7 text-xs"
                              >
                                <ScrollText className="w-3 h-3 mr-1" />
                                Apply Prompt Parsing
                              </Button>
                            </div>
                          )}
                          
                          {/* Prepend Metadata Section - moved here from Index Configuration */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                <Switch
                                  id="prependMetadata"
                                  checked={prependMetadata}
                                  onCheckedChange={(checked) => onTogglePrependMetadata?.(checked)}
                                  disabled={disabled}
                                  className="h-4 w-7"
                                />
                                <Label htmlFor="prependMetadata" className="text-xs cursor-pointer flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Prepend metadata
                                </Label>
                              </div>
                              {prependMetadata && (
                                <Dialog open={showPrependModal} onOpenChange={setShowPrependModal}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      disabled={disabled}
                                    >
                                      Select Fields
                                      {prependedFields.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">
                                          {prependedFields.length}
                                        </Badge>
                                      )}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Select Fields to Prepend</DialogTitle>
                                      <DialogDescription>
                                        Choose which metadata fields to prepend to chunks during indexing
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 max-h-[300px] overflow-y-auto">
                                      <div className="space-y-2">
                                        {metadataFields.map(field => (
                                          <div key={field.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`prepend-${field.id}`}
                                              checked={tempPrependedFields.includes(field.id)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setTempPrependedFields([...tempPrependedFields, field.id]);
                                                } else {
                                                  setTempPrependedFields(tempPrependedFields.filter(f => f !== field.id));
                                                }
                                              }}
                                            />
                                            <Label
                                              htmlFor={`prepend-${field.id}`}
                                              className="text-sm font-normal cursor-pointer flex-1"
                                            >
                                              <span>{field.name}</span>
                                              <span className="text-xs text-gray-500 ml-1">({field.type})</span>
                                            </Label>
                                          </div>
                                        ))}
                                        {metadataFields.length === 0 && (
                                          <p className="text-sm text-gray-500 text-center py-4">
                                            No metadata fields available
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setTempPrependedFields(prependedFields);
                                          setShowPrependModal(false);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          onPrependedFieldsChange?.(tempPrependedFields);
                                          setShowPrependModal(false);
                                        }}
                                      >
                                        Apply
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                            </div>
                          </div>
                          
                          {/* Multimodal Section */}
                          <div className="p-3 bg-white rounded-md border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-blue-900">🎯 Multimodal</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                onClick={() => onViewMultimodal?.()}
                                disabled={disabled}
                                title="Content Understanding - Multimodal"
                              >
                                <Eye className="h-4 w-4 text-blue-700" />
                              </Button>
                            </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="ocr"
                                checked={processingConfig.rag?.multimodal?.ocr || false}
                                onCheckedChange={(checked) => handleOptionToggle('rag', 'ocr', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="ocr" className="text-xs cursor-pointer flex items-center gap-1">
                                <Eye className="w-3 h-3" /> OCR
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id="transcription"
                                checked={processingConfig.rag?.multimodal?.transcription || false}
                                onCheckedChange={(checked) => handleOptionToggle('rag', 'transcription', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="transcription" className="text-xs cursor-pointer flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Audio
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id="imageCaption"
                                checked={processingConfig.rag?.multimodal?.imageCaption || false}
                                onCheckedChange={(checked) => handleOptionToggle('rag', 'imageCaption', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="imageCaption" className="text-xs cursor-pointer flex items-center gap-1">
                                <Image className="w-3 h-3" /> Images
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id="visualAnalysis"
                                checked={processingConfig.rag?.multimodal?.visualAnalysis || false}
                                onCheckedChange={(checked) => handleOptionToggle('rag', 'visualAnalysis', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="visualAnalysis" className="text-xs cursor-pointer flex items-center gap-1">
                                <ScanEye className="w-3 h-3" /> Visual
                              </Label>
                            </div>
                          </div>
                          </div>
                          
                          {/* Index Configuration Section */}
                          <div className="p-3 bg-white rounded-md border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-blue-900">⚙️ Index Configuration</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                onClick={() => onEvaluateIndex?.()}
                                disabled={disabled}
                                title="Content Understanding - Index Config"
                              >
                                <Eye className="h-4 w-4 text-blue-700" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs text-blue-800 mb-1 block">Embedding Model</Label>
                                <Select
                                  value={selectedEmbeddingModel}
                                  onValueChange={(value) => onEmbeddingModelChange?.(value)}
                                  disabled={disabled}
                                >
                                  <SelectTrigger className="h-8 text-xs border-blue-200 focus:border-blue-400">
                                    <SelectValue placeholder="Select embedding model" className="truncate" />
                                  </SelectTrigger>
                                  <SelectContent className="max-w-[300px]">
                                    {embeddingModels.map(model => (
                                      <SelectItem key={model.id} value={model.id} className="text-xs">
                                        <div className="flex items-center gap-2 max-w-full">
                                          <Sparkles className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate flex-1">{model.name}</span>
                                          {model.isRecommended && (
                                            <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1 h-4 flex-shrink-0">
                                              Recommended
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                          
                          {/* Metadata Filter */}
                          <div className="space-y-2">
                            <Dialog open={showMetadataModal} onOpenChange={setShowMetadataModal}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs justify-between"
                                  disabled={disabled}
                                >
                                  <span className="flex items-center gap-1">
                                    <Filter className="w-3 h-3" />
                                    Filter on related metadata
                                  </span>
                                  {selectedMetadataFilters.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">
                                      {selectedMetadataFilters.length}
                                    </Badge>
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Select Metadata Filters</DialogTitle>
                                  <DialogDescription>
                                    Choose which metadata fields to filter on during indexing
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 max-h-[300px] overflow-y-auto">
                                  <div className="space-y-2">
                                    {metadataFields.map(field => (
                                      <div key={field.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={field.id}
                                          checked={tempSelectedFilters.includes(field.id)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setTempSelectedFilters([...tempSelectedFilters, field.id]);
                                            } else {
                                              setTempSelectedFilters(tempSelectedFilters.filter(f => f !== field.id));
                                            }
                                          }}
                                        />
                                        <Label
                                          htmlFor={field.id}
                                          className="text-sm font-normal cursor-pointer flex-1"
                                        >
                                          <span>{field.name}</span>
                                          <span className="text-xs text-gray-500 ml-1">({field.type})</span>
                                        </Label>
                                      </div>
                                    ))}
                                    {metadataFields.length === 0 && (
                                      <p className="text-sm text-gray-500 text-center py-4">
                                        No metadata fields available
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setTempSelectedFilters(selectedMetadataFilters);
                                      setShowMetadataModal(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      onMetadataFiltersChange?.(tempSelectedFilters);
                                      setShowMetadataModal(false);
                                    }}
                                  >
                                    Apply
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>



            {/* Bottom summary bar */}
            {activeMethods.length > 0 && (
              <div className="sticky bottom-0 bg-gray-100 rounded-md p-2 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Active:</span>
                  <div className="flex gap-1">
                    {activeMethods.map(method => {
                      const Icon = method.icon;
                      return (
                        <div key={method.id} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          <Icon className="w-3 h-3" />
                          <span>{method.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  const prevRagEnabled = prevProps.processingConfig.rag?.enabled;
  const nextRagEnabled = nextProps.processingConfig.rag?.enabled;
  
  if (prevRagEnabled !== nextRagEnabled) {
    return false;
  }
  
  for (const key of ['kg', 'idp'] as const) {
    if (prevProps.processingConfig[key]?.enabled !== nextProps.processingConfig[key]?.enabled) {
      return false;
    }
  }
  
  const configEqual = JSON.stringify(prevProps.processingConfig) === JSON.stringify(nextProps.processingConfig);
  const disabledEqual = prevProps.disabled === nextProps.disabled;
  const stateEqual = JSON.stringify(prevProps.state) === JSON.stringify(nextProps.state);
  const highlightEqual = prevProps.highlightProcessButton === nextProps.highlightProcessButton;
  const pulseEqual = prevProps.pulseEffect === nextProps.pulseEffect;
  const collapsedEqual = prevProps.initialCollapsed === nextProps.initialCollapsed;
  const onCollapseChangeEqual = prevProps.onCollapseChange === nextProps.onCollapseChange;
  
  return configEqual && disabledEqual && stateEqual && highlightEqual && pulseEqual && collapsedEqual && onCollapseChangeEqual;
});

ManualConfigurationPanel.displayName = 'ManualConfigurationPanel';

export default ManualConfigurationPanel;