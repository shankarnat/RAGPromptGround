import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileSearch, Network, FileText, PlayCircle, Wand2, Check, Settings, ChevronRight, ChevronLeft, ChevronDown, Image, Mic, Eye, Layers, Hash, Timer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  highlightProcessButton?: boolean;
  pulseEffect?: boolean;
  initialCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
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
  const [collapsed, setCollapsed] = useState(initialCollapsed);

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
                onClick={() => onProcessDocument && !disabled && onProcessDocument()}
                disabled={disabled || !activeMethods.length}
                className={`${highlightProcessButton ? 'bg-green-600 hover:bg-green-700' : ''} ${pulseEffect ? 'animate-pulse' : ''}`}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Process
              </Button>
            </div>

            {/* Compact processing method cards */}
            <div className="space-y-2">
              {processingTypes.map(type => {
                const Icon = type.icon;
                const isEnabled = processingConfig[type.id]?.enabled || false;
                const isRAG = type.id === 'rag';
                
                return (
                  <div key={type.id}>
                    <Card className={`p-3 cursor-pointer transition-all ${isEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={(checked) => !disabled && handleProcessingToggle(type.id, checked as boolean, true)}
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
                          {/* Bullet points for features */}
                          <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                            {type.id === 'rag' && (
                              <>
                                <li>• Semantic search</li>
                                <li>• Smart chunking</li>
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
                                onCheckedChange={(checked) => !disabled && handleOptionToggle('kg', option, checked as boolean)}
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
                    
                    {/* Advanced settings for IDP when enabled */}
                    {type.id === 'idp' && isEnabled && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Advanced Processing</h5>
                        <div className="space-y-1">
                          {['textExtraction', 'classification', 'metadata'].map(option => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`idp-${option}`}
                                checked={processingConfig.idp?.[option] || false}
                                onCheckedChange={(checked) => !disabled && handleOptionToggle('idp', option, checked as boolean)}
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
                    )}

                    {/* Inline chunking, multimodal, and prompt parsing for RAG when enabled */}
                    {isRAG && isEnabled && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 space-y-3">
                        {/* Chunking settings */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Method</label>
                            <Select
                              value={state.chunkingMethod?.value || 'sentence'}
                              onValueChange={(value) => !disabled && updateChunkingMethod({ value, label: value })}
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
                              onChange={(e) => !disabled && updateChunkSize(parseInt(e.target.value))}
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
                              onChange={(e) => !disabled && updateChunkOverlap(parseInt(e.target.value))}
                              className="h-8 text-xs"
                              disabled={disabled}
                            />
                          </div>
                        </div>
                        
                        {/* Multimodal options */}
                        <div className="border-t pt-2">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Multimodal</h5>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="ocr"
                                checked={processingConfig.rag?.multimodal?.ocr || false}
                                onCheckedChange={(checked) => !disabled && handleOptionToggle('rag', 'ocr', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="ocr" className="text-xs cursor-pointer flex items-center gap-1">
                                <Eye className="w-3 h-3" /> OCR
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id="audioTranscription"
                                checked={processingConfig.rag?.multimodal?.audioTranscription || false}
                                onCheckedChange={(checked) => !disabled && handleOptionToggle('rag', 'audioTranscription', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="audioTranscription" className="text-xs cursor-pointer flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Audio
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id="imageCaptioning"
                                checked={processingConfig.rag?.multimodal?.imageCaptioning || false}
                                onCheckedChange={(checked) => !disabled && handleOptionToggle('rag', 'imageCaptioning', checked)}
                                disabled={disabled}
                              />
                              <Label htmlFor="imageCaptioning" className="text-xs cursor-pointer flex items-center gap-1">
                                <Image className="w-3 h-3" /> Images
                              </Label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Custom prompt if set */}
                        {state.promptParsing?.customPrompt && (
                          <div className="border-t pt-2">
                            <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <Wand2 className="w-3 h-3" /> Custom Prompt
                            </h5>
                            <p className="text-xs text-gray-600 italic">{state.promptParsing.customPrompt}</p>
                          </div>
                        )}
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