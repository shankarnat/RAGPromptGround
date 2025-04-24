import { FC } from "react";
import { 
  ChunkingMethod, 
  MetadataField, 
  RecordStructure,
  IndexField
} from "@shared/schema";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  Edit, 
  CheckCircle, 
  Circle, 
  Database, 
  Search, 
  Filter,
  FileText,
  Layers
} from "lucide-react";
import VectorizationOptionsPanel from "./VectorizationOptionsPanel";
import FinalizeIndexButton from "./FinalizeIndexButton";
import { defaultAdvancedOptions } from "@/data/embeddingModelsData";
import { useState } from "react";

interface CombinedConfigurationPanelProps {
  // Chunking configuration props
  chunkingMethod: ChunkingMethod;
  onChunkingMethodChange: (method: ChunkingMethod) => void;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  chunkOverlap: number;
  onChunkOverlapChange: (overlap: number) => void;
  
  // Document metadata props
  metadataFields: MetadataField[];
  onMetadataFieldChange: (fieldId: number, property: "included" | "value", value: boolean | string) => void;
  recordLevelIndexingEnabled: boolean;
  onRecordLevelIndexingToggle: (enabled: boolean) => void;
  recordStructure: RecordStructure;
  onRecordStructureChange: (structure: RecordStructure) => void;
  onAddCustomField: (name: string, value: string) => void;
  
  // Field-level indexing props
  fields?: {
    id: number;
    name: string;
    retrievable: boolean;
    filterable: boolean;
    typehead?: boolean;
  }[];
  onFieldPropertyChange?: (fieldId: number, property: "retrievable" | "filterable" | "typehead", value: boolean) => void;
  
  // Vectorization props - all optional
  selectedModelId?: string;
  onSelectModel?: (modelId: string) => void;
  advancedOptions?: typeof defaultAdvancedOptions;
  onUpdateOptions?: (options: typeof defaultAdvancedOptions) => void;
}

const CombinedConfigurationPanel: FC<CombinedConfigurationPanelProps> = ({
  // Chunking configuration props
  chunkingMethod,
  onChunkingMethodChange,
  chunkSize,
  onChunkSizeChange,
  chunkOverlap,
  onChunkOverlapChange,
  
  // Document metadata props
  metadataFields,
  onMetadataFieldChange,
  recordLevelIndexingEnabled,
  onRecordLevelIndexingToggle,
  recordStructure,
  onRecordStructureChange,
  onAddCustomField,
  
  // Field-level indexing props
  fields = [],
  onFieldPropertyChange,
  
  // Vectorization props
  selectedModelId = "openai-text-embedding-3-large",
  onSelectModel = () => {},
  advancedOptions = defaultAdvancedOptions,
  onUpdateOptions = () => {}
}) => {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  // Calculate chunk metrics for display
  const estimatedTokens = chunkSize * Math.ceil(2000 / chunkSize); // Assuming 2000 tokens in document
  const estimatedChunks = Math.ceil(2000 / (chunkSize - chunkOverlap));
  
  // Count how many fields are included for document record
  const includedFieldsCount = metadataFields.filter(field => field.included).length;

  // Slider change handlers
  const handleSliderChunkSizeChange = (value: number[]) => {
    onChunkSizeChange(value[0]);
  };

  const handleSliderChunkOverlapChange = (value: number[]) => {
    onChunkOverlapChange(value[0]);
  };

  // Metadata field handlers
  const handleStartEditing = (field: MetadataField) => {
    setEditingFieldId(field.id);
    setEditFieldValue(field.value);
  };

  const handleSaveEdit = (fieldId: number) => {
    onMetadataFieldChange(fieldId, "value", editFieldValue);
    setEditingFieldId(null);
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      onAddCustomField(newFieldName.trim(), newFieldValue.trim());
      setNewFieldName("");
      setNewFieldValue("");
    }
  };

  const handleSelectAll = () => {
    metadataFields.forEach(field => {
      if (!field.included) {
        onMetadataFieldChange(field.id, "included", true);
      }
    });
  };

  const handleClearAll = () => {
    metadataFields.forEach(field => {
      if (field.included) {
        onMetadataFieldChange(field.id, "included", false);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700 text-sm md:text-base">Document Processing Configuration</h3>
      </div>
      
      <div className="p-3 md:p-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        <Accordion type="single" collapsible className="w-full" defaultValue="chunking">
          {/* Chunking Configuration Section */}
          <AccordionItem value="chunking">
            <AccordionTrigger className="text-sm font-medium">
              Chunking Configuration
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Chunking Method */}
                <div className="mb-4">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Chunking Method</label>
                  <div className="grid grid-cols-1 gap-1 md:gap-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        name="chunking-method"
                        checked={chunkingMethod === "semantic"}
                        onChange={() => onChunkingMethodChange("semantic")}
                      />
                      <span className="ml-2 text-xs md:text-sm text-gray-700">Semantic</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        name="chunking-method"
                        checked={chunkingMethod === "fixed"}
                        onChange={() => onChunkingMethodChange("fixed")}
                      />
                      <span className="ml-2 text-xs md:text-sm text-gray-700">Fixed Size</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        name="chunking-method"
                        checked={chunkingMethod === "header"}
                        onChange={() => onChunkingMethodChange("header")}
                      />
                      <span className="ml-2 text-xs md:text-sm text-gray-700">Header-based</span>
                    </label>
                  </div>
                </div>
                
                {/* Chunk Size */}
                <div className="mb-4">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Chunk Size (tokens)
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="w-full">
                      <Slider
                        defaultValue={[chunkSize]}
                        max={1000}
                        min={50}
                        step={1}
                        onValueChange={handleSliderChunkSizeChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700 w-9 md:w-12 text-right">{chunkSize}</span>
                  </div>
                </div>
                
                {/* Chunk Overlap */}
                <div className="mb-4">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Chunk Overlap (tokens)
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="w-full">
                      <Slider
                        defaultValue={[chunkOverlap]}
                        max={100}
                        min={0}
                        step={1}
                        onValueChange={handleSliderChunkOverlapChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700 w-9 md:w-12 text-right">{chunkOverlap}</span>
                  </div>
                </div>
                
                {/* Chunk Metrics */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Chunk Metrics</label>
                  
                  <div className="bg-gray-50 rounded-md p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Estimated Chunks:</span>
                      <span className="text-xs font-medium">
                        {estimatedChunks + (recordLevelIndexingEnabled ? 1 : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Average Tokens per Chunk:</span>
                      <span className="text-xs font-medium">{chunkSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Total Tokens (with overlap):</span>
                      <span className="text-xs font-medium">{estimatedTokens}</span>
                    </div>
                    {recordLevelIndexingEnabled && (
                      <div className="flex justify-between text-primary-700">
                        <span className="text-xs">Document Record Chunk:</span>
                        <span className="text-xs font-medium">+1</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Record Level Indexing Section */}
          <AccordionItem value="record-indexing">
            <AccordionTrigger className="text-sm font-medium">
              Record-Level Indexing
              <Badge 
                variant={recordLevelIndexingEnabled ? "default" : "outline"} 
                className="ml-2 text-[10px] h-5"
              >
                {recordLevelIndexingEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Toggle for Record Indexing */}
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm text-gray-700">Enable Record-Level Indexing</label>
                  <Switch 
                    id="record-indexing-toggle"
                    checked={recordLevelIndexingEnabled}
                    onCheckedChange={onRecordLevelIndexingToggle}
                  />
                </div>
                
                <div className={!recordLevelIndexingEnabled ? 'opacity-50 pointer-events-none' : ''}>
                  {/* Record Structure */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Record Structure</label>
                    <div className="grid grid-cols-1 gap-1">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="h-3.5 w-3.5 text-primary-600 border-gray-300 focus:ring-primary-500"
                          name="record-structure"
                          checked={recordStructure === "flat"}
                          onChange={() => onRecordStructureChange("flat")}
                        />
                        <span className="ml-2 text-xs text-gray-700">Flat Structure</span>
                        <span className="ml-1 text-xs text-gray-500">(All fields at root level)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="h-3.5 w-3.5 text-primary-600 border-gray-300 focus:ring-primary-500"
                          name="record-structure"
                          checked={recordStructure === "nested"}
                          onChange={() => onRecordStructureChange("nested")}
                        />
                        <span className="ml-2 text-xs text-gray-700">Nested Structure</span>
                        <span className="ml-1 text-xs text-gray-500">(Group by field types)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="h-3.5 w-3.5 text-primary-600 border-gray-300 focus:ring-primary-500"
                          name="record-structure"
                          checked={recordStructure === "custom"}
                          onChange={() => onRecordStructureChange("custom")}
                        />
                        <span className="ml-2 text-xs text-gray-700">Custom Structure</span>
                        <span className="ml-1 text-xs text-gray-500">(Content & metadata separation)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Metadata Fields */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-700">Metadata Fields</label>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSelectAll}
                          className="text-xs py-0 h-6 px-2"
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleClearAll}
                          className="text-xs py-0 h-6 px-2"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                      {metadataFields.map(field => (
                        <div 
                          key={field.id} 
                          className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-50 border border-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`field-${field.id}`}
                              checked={field.included}
                              onCheckedChange={(checked) => onMetadataFieldChange(field.id, "included", checked)}
                              className="h-4 w-7"
                            />
                            <div>
                              <label 
                                htmlFor={`field-${field.id}`} 
                                className="text-xs font-medium cursor-pointer block"
                              >
                                {field.name}
                              </label>
                              <div className="flex items-center">
                                {editingFieldId === field.id ? (
                                  <div className="flex items-center space-x-1">
                                    <Input 
                                      value={editFieldValue}
                                      onChange={(e) => setEditFieldValue(e.target.value)}
                                      className="h-5 text-xs w-28 py-0"
                                    />
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => handleSaveEdit(field.id)}
                                      className="h-4 w-4 p-0"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={handleCancelEdit}
                                      className="h-4 w-4 p-0"
                                    >
                                      <Circle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{field.value}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {editingFieldId !== field.id && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleStartEditing(field)}
                              className="h-5 w-5 text-gray-400 hover:text-gray-700"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Add Custom Field */}
                  <div className="pt-2 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Add Custom Field</label>
                    <div className="grid grid-cols-[2fr_2fr_1fr] gap-1">
                      <Input 
                        placeholder="Field name" 
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="text-xs h-7"
                      />
                      <Input 
                        placeholder="Field value" 
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="text-xs h-7"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddCustomField}
                        disabled={!newFieldName.trim() || !newFieldValue.trim()}
                        className="h-7 text-xs"
                      >
                        <PlusCircle className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Other Indexing Config Section */}
          <AccordionItem value="field-indexing">
            <AccordionTrigger className="text-sm font-medium">
              Other Indexing Config
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {fields.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 px-2 mb-2">
                      <div className="text-xs text-gray-500 font-medium">Field Name</div>
                      <div className="col-span-2 flex items-center justify-between pr-2">
                        <div className="text-xs text-gray-500 font-medium flex items-center">
                          <Search className="h-3 w-3 mr-1" />
                          <span>Retrievable</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex items-center">
                          <Filter className="h-3 w-3 mr-1" />
                          <span>Filterable</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Type Ahead</span>
                        </div>
                      </div>
                    </div>
                    
                    {fields.map((field) => (
                      <div key={field.id} className="px-2 py-2 border border-gray-100 rounded-md hover:bg-gray-50">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-xs font-medium">{field.name}</div>
                          <div className="col-span-2 flex items-center justify-between">
                            <Switch 
                              id={`retrievable-${field.id}`}
                              checked={field.retrievable}
                              onCheckedChange={(checked) => 
                                onFieldPropertyChange && onFieldPropertyChange(field.id, "retrievable", checked)
                              }
                              className="h-4 w-7"
                            />
                            <Switch 
                              id={`filterable-${field.id}`}
                              checked={field.filterable}
                              onCheckedChange={(checked) => 
                                onFieldPropertyChange && onFieldPropertyChange(field.id, "filterable", checked)
                              }
                              className="h-4 w-7"
                            />
                            <Switch 
                              id={`typehead-${field.id}`}
                              checked={field.typehead || false}
                              onCheckedChange={(checked) => 
                                onFieldPropertyChange && onFieldPropertyChange(field.id, "typehead", checked)
                              }
                              className="h-4 w-7"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-md p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Total Fields:</span>
                          <span className="text-xs font-medium">{fields.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Retrievable Fields:</span>
                          <span className="text-xs font-medium">
                            {fields.filter(f => f.retrievable).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Filterable Fields:</span>
                          <span className="text-xs font-medium">
                            {fields.filter(f => f.filterable).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Type Ahead Fields:</span>
                          <span className="text-xs font-medium">
                            {fields.filter(f => f.typehead).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No fields available for indexing configuration.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Vectorization Section */}
          <AccordionItem value="vectorization">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-1.5 text-blue-600" />
                Vectorization Options
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <VectorizationOptionsPanel
                selectedModelId={selectedModelId}
                onSelectModel={onSelectModel}
                advancedOptions={advancedOptions}
                onUpdateOptions={onUpdateOptions}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Fixed Finalize and Create Index Button */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 mt-auto">
        <FinalizeIndexButton className="w-full text-white font-medium" />
      </div>
    </div>
  );
};

export default CombinedConfigurationPanel;