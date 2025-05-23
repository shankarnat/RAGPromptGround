import { FC, useState, useCallback, memo } from "react";
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
  Layers,
  Image,
  Headphones,
  FileImage,
  Video
} from "lucide-react";
import VectorizationOptionsPanel from "./VectorizationOptionsPanel";
import FinalizeIndexButton from "./FinalizeIndexButton";
import { defaultAdvancedOptions } from "@/data/embeddingModelsData";

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
  multimodalProcessing?: {
    transcription: boolean;
    ocr: boolean;
    imageCaption: boolean;
    visualAnalysis: boolean;
  };
  onMultimodalProcessingToggle?: (type: 'transcription' | 'ocr' | 'imageCaption' | 'visualAnalysis', enabled: boolean) => void;
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

// Memoized Chunk Configuration Component
const ChunkingSection = memo<{
  chunkingMethod: ChunkingMethod;
  onChunkingMethodChange: (method: ChunkingMethod) => void;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  chunkOverlap: number;
  onChunkOverlapChange: (overlap: number) => void;
}>(({ chunkingMethod, onChunkingMethodChange, chunkSize, onChunkSizeChange, chunkOverlap, onChunkOverlapChange }) => {
  // Calculate chunk metrics for display
  const estimatedTokens = chunkSize * Math.ceil(2000 / chunkSize); // Assuming 2000 tokens in document
  const estimatedChunks = Math.ceil(2000 / (chunkSize - chunkOverlap));
  
  // Slider change handlers
  const handleSliderChunkSizeChange = useCallback((value: number[]) => {
    onChunkSizeChange(value[0]);
    console.log('Chunk size changed to:', value[0]);
    console.log('Triggering config change in CombinedConfigurationPanel');
  }, [onChunkSizeChange]);

  const handleSliderChunkOverlapChange = useCallback((value: number[]) => {
    onChunkOverlapChange(value[0]);
    console.log('Chunk overlap changed to:', value[0]);
    console.log('Triggering config change in CombinedConfigurationPanel');
  }, [onChunkOverlapChange]);

  return (
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
              onChange={() => {
                console.log('Changing chunking method to: semantic');
                onChunkingMethodChange("semantic");
                console.log('Chunking method changed, should trigger config change');
              }}
            />
            <span className="ml-2 text-xs md:text-sm text-gray-700">Semantic</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              name="chunking-method"
              checked={chunkingMethod === "fixed"}
              onChange={() => {
                console.log('Changing chunking method to: fixed');
                onChunkingMethodChange("fixed");
                console.log('Chunking method changed, should trigger config change');
              }}
            />
            <span className="ml-2 text-xs md:text-sm text-gray-700">Fixed Size</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              name="chunking-method"
              checked={chunkingMethod === "header"}
              onChange={() => {
                console.log('Changing chunking method to: header');
                onChunkingMethodChange("header");
                console.log('Chunking method changed, should trigger config change');
              }}
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
              {estimatedChunks}
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
        </div>
      </div>
    </div>
  );
});

ChunkingSection.displayName = 'ChunkingSection';

// Memoized Multimodal Processing Section
const MultimodalSection = memo<{
  multimodalProcessing: {
    transcription: boolean;
    ocr: boolean;
    imageCaption: boolean;
    visualAnalysis: boolean;
  };
  onMultimodalProcessingToggle: (type: 'transcription' | 'ocr' | 'imageCaption' | 'visualAnalysis', enabled: boolean) => void;
}>(({ multimodalProcessing, onMultimodalProcessingToggle }) => {
  console.log('MultimodalSection render - multimodalProcessing:', multimodalProcessing);
  return (
    <div className="space-y-4 pt-2">
      {/* Audio Processing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Headphones className="w-4 h-4 text-gray-500" />
          <label className="text-sm text-gray-700">Audio Transcription</label>
        </div>
        <Switch 
          id="audio-transcription"
          checked={multimodalProcessing.transcription}
          onCheckedChange={(checked) => onMultimodalProcessingToggle('transcription', checked)}
        />
      </div>
      <p className="text-xs text-gray-500 ml-6">Convert audio files to searchable text</p>

      {/* OCR Processing */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <FileImage className="w-4 h-4 text-gray-500" />
          <label className="text-sm text-gray-700">OCR (Text Extraction)</label>
        </div>
        <Switch 
          id="ocr-processing"
          checked={multimodalProcessing.ocr}
          onCheckedChange={(checked) => onMultimodalProcessingToggle('ocr', checked)}
        />
      </div>
      <p className="text-xs text-gray-500 ml-6">Extract text from images and scanned documents</p>

      {/* Image Captioning */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Image className="w-4 h-4 text-gray-500" />
          <label className="text-sm text-gray-700">Image Captioning</label>
        </div>
        <Switch 
          id="image-captioning"
          checked={multimodalProcessing.imageCaption}
          onCheckedChange={(checked) => onMultimodalProcessingToggle('imageCaption', checked)}
        />
      </div>
      <p className="text-xs text-gray-500 ml-6">Generate descriptions for images using GPT-4o</p>

      {/* Visual Analysis */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-gray-500" />
          <label className="text-sm text-gray-700">Visual Analysis</label>
        </div>
        <Switch 
          id="visual-analysis"
          checked={multimodalProcessing.visualAnalysis}
          onCheckedChange={(checked) => onMultimodalProcessingToggle('visualAnalysis', checked)}
        />
      </div>
      <p className="text-xs text-gray-500 ml-6">Deep analysis of images and video content</p>
    </div>
  );
});

MultimodalSection.displayName = 'MultimodalSection';

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
  multimodalProcessing = {
    transcription: false,
    ocr: false,
    imageCaption: false,
    visualAnalysis: false
  },
  onMultimodalProcessingToggle = () => {},
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

  // Count how many fields are included for document record
  const includedFieldsCount = metadataFields.filter(field => field.included).length;

  // Metadata field handlers
  const handleStartEditing = useCallback((field: MetadataField) => {
    setEditingFieldId(field.id);
    setEditFieldValue(field.value);
  }, []);

  const handleSaveEdit = useCallback((fieldId: number) => {
    onMetadataFieldChange(fieldId, "value", editFieldValue);
    setEditingFieldId(null);
  }, [editFieldValue, onMetadataFieldChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingFieldId(null);
  }, []);

  const handleAddCustomField = useCallback(() => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      onAddCustomField(newFieldName.trim(), newFieldValue.trim());
      setNewFieldName("");
      setNewFieldValue("");
    }
  }, [newFieldName, newFieldValue, onAddCustomField]);

  const handleSelectAll = useCallback(() => {
    metadataFields.forEach(field => {
      if (!field.included) {
        onMetadataFieldChange(field.id, "included", true);
      }
    });
  }, [metadataFields, onMetadataFieldChange]);

  const handleClearAll = useCallback(() => {
    metadataFields.forEach(field => {
      if (field.included) {
        onMetadataFieldChange(field.id, "included", false);
      }
    });
  }, [metadataFields, onMetadataFieldChange]);

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
              <ChunkingSection
                chunkingMethod={chunkingMethod}
                onChunkingMethodChange={onChunkingMethodChange}
                chunkSize={chunkSize}
                onChunkSizeChange={onChunkSizeChange}
                chunkOverlap={chunkOverlap}
                onChunkOverlapChange={onChunkOverlapChange}
              />
            </AccordionContent>
          </AccordionItem>
          
          {/* Multimodal Processing Section */}
          <AccordionItem value="multimodal-processing">
            <AccordionTrigger className="text-sm font-medium">
              Multimodal Processing
              <Badge 
                variant={Object.values(multimodalProcessing).some(v => v) ? "default" : "outline"} 
                className="ml-2 text-[10px] h-5"
              >
                {Object.values(multimodalProcessing).filter(v => v).length} Active
              </Badge>
            </AccordionTrigger>
            <AccordionContent>
              <MultimodalSection
                multimodalProcessing={multimodalProcessing}
                onMultimodalProcessingToggle={onMultimodalProcessingToggle}
              />
            </AccordionContent>
          </AccordionItem>
          
          {/* Document Metadata Section */}
          <AccordionItem value="document-metadata">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-1.5 text-gray-600" />
                Document Metadata
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
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
      
      {/* Finalize and Create Index Button has been hidden */}
    </div>
  );
};

// Custom comparison function for memo
const arePropsEqual = (
  prevProps: CombinedConfigurationPanelProps,
  nextProps: CombinedConfigurationPanelProps
) => {
  // Check multimodal changes specifically
  const multimodalChanged = JSON.stringify(prevProps.multimodalProcessing) !== JSON.stringify(nextProps.multimodalProcessing);
  if (multimodalChanged) {
    console.log('CombinedConfigurationPanel memo: Multimodal changed');
    console.log('Previous:', prevProps.multimodalProcessing);
    console.log('Next:', nextProps.multimodalProcessing);
    return false; // Force re-render on multimodal change
  }
  
  // Deep compare only essential props that affect rendering
  return (
    prevProps.chunkingMethod === nextProps.chunkingMethod &&
    prevProps.chunkSize === nextProps.chunkSize &&
    prevProps.chunkOverlap === nextProps.chunkOverlap &&
    JSON.stringify(prevProps.metadataFields) === JSON.stringify(nextProps.metadataFields) &&
    JSON.stringify(prevProps.fields) === JSON.stringify(nextProps.fields) &&
    prevProps.selectedModelId === nextProps.selectedModelId &&
    JSON.stringify(prevProps.advancedOptions) === JSON.stringify(nextProps.advancedOptions)
  );
};

export default memo(CombinedConfigurationPanel, arePropsEqual);