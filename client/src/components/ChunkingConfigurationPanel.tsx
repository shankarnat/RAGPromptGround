import { FC } from "react";
import { ChunkingMethod, MetadataField, RecordStructure } from "@shared/schema";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface ChunkingConfigurationPanelProps {
  chunkingMethod: ChunkingMethod;
  onChunkingMethodChange: (method: ChunkingMethod) => void;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  chunkOverlap: number;
  onChunkOverlapChange: (overlap: number) => void;
  // Document record options
  metadataFields?: MetadataField[];
  recordLevelIndexingEnabled?: boolean;
  onRecordLevelIndexingToggle?: (enabled: boolean) => void;
  recordStructure?: RecordStructure;
  onRecordStructureChange?: (structure: RecordStructure) => void;
}

const ChunkingConfigurationPanel: FC<ChunkingConfigurationPanelProps> = ({
  chunkingMethod,
  onChunkingMethodChange,
  chunkSize,
  onChunkSizeChange,
  chunkOverlap,
  onChunkOverlapChange,
  // Document record options with defaults
  metadataFields = [],
  recordLevelIndexingEnabled = false,
  onRecordLevelIndexingToggle = () => {},
  recordStructure = "flat",
  onRecordStructureChange = () => {}
}) => {
  const handleSliderChunkSizeChange = (value: number[]) => {
    onChunkSizeChange(value[0]);
  };

  const handleSliderChunkOverlapChange = (value: number[]) => {
    onChunkOverlapChange(value[0]);
  };

  // Calculate chunk metrics for display
  const estimatedTokens = chunkSize * Math.ceil(2000 / chunkSize); // Assuming 2000 tokens in document
  const estimatedChunks = Math.ceil(2000 / (chunkSize - chunkOverlap));
  
  // Count how many fields are included for document record
  const includedFieldsCount = metadataFields.filter(field => field.included).length;
  
  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700 text-sm md:text-base">Chunking Configuration</h3>
      </div>
      <div className="p-3 md:p-4 overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="mb-5">
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
        
        <div className="mb-5">
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
        
        <div className="mb-5">
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
        
        {/* Document Record Options */}
        <div className="mb-5 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700">Record-Level Indexing</label>
            <div className="flex items-center">
              <Switch 
                id="chunking-record-indexing-toggle"
                checked={recordLevelIndexingEnabled}
                onCheckedChange={onRecordLevelIndexingToggle}
                className="mr-2"
              />
              <span className="text-xs text-gray-700">
                {recordLevelIndexingEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          
          <div className={!recordLevelIndexingEnabled ? 'opacity-50 pointer-events-none' : ''}>
            <p className="text-xs text-gray-500 mb-3">
              Include document metadata as an additional chunk with all selected fields.
            </p>
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Record Structure</label>
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
                </label>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-2 mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">Selected Fields:</span>
                <span className="text-xs font-medium">{includedFieldsCount} fields</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Structure Type:</span>
                <span className="text-xs font-medium">{recordStructure}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Configure fields in the Document Record tab for a complete setup.
            </p>
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
          
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Note:</span> Smaller chunks improve retrieval precision but may lose context. Larger chunks preserve context but may retrieve irrelevant information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChunkingConfigurationPanel;