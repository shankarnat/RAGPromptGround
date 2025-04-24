import { FC } from "react";
import { ChunkingMethod } from "@shared/schema";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface Field {
  id: number;
  name: string;
  retrievable: boolean;
  filterable: boolean;
}

interface ConfigurationPanelProps {
  chunkingMethod: ChunkingMethod;
  onChunkingMethodChange: (method: ChunkingMethod) => void;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  chunkOverlap: number;
  onChunkOverlapChange: (overlap: number) => void;
  fields: Field[];
  onFieldPropertyChange: (fieldId: number, property: "retrievable" | "filterable", value: boolean) => void;
}

const ConfigurationPanel: FC<ConfigurationPanelProps> = ({
  chunkingMethod,
  onChunkingMethodChange,
  chunkSize,
  onChunkSizeChange,
  chunkOverlap,
  onChunkOverlapChange,
  fields,
  onFieldPropertyChange
}) => {
  const handleSliderChunkSizeChange = (value: number[]) => {
    onChunkSizeChange(value[0]);
  };

  const handleSliderChunkOverlapChange = (value: number[]) => {
    onChunkOverlapChange(value[0]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">Chunking Configuration</h3>
      </div>
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chunking Method</label>
          <div className="grid grid-cols-1 gap-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                name="chunking-method"
                checked={chunkingMethod === "semantic"}
                onChange={() => onChunkingMethodChange("semantic")}
              />
              <span className="ml-2 text-sm text-gray-700">Semantic</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                name="chunking-method"
                checked={chunkingMethod === "fixed"}
                onChange={() => onChunkingMethodChange("fixed")}
              />
              <span className="ml-2 text-sm text-gray-700">Fixed Size</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                name="chunking-method"
                checked={chunkingMethod === "header"}
                onChange={() => onChunkingMethodChange("header")}
              />
              <span className="ml-2 text-sm text-gray-700">Header-based</span>
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chunk Size (tokens)
          </label>
          <div className="flex items-center space-x-4">
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
            <span className="text-sm text-gray-700 w-12 text-right">{chunkSize}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chunk Overlap (tokens)
          </label>
          <div className="flex items-center space-x-4">
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
            <span className="text-sm text-gray-700 w-12 text-right">{chunkOverlap}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Field Indexing</label>
          <p className="text-sm text-gray-500 mb-4">
            Configure which fields should be retrievable or filterable
          </p>
          
          <div className="space-y-3">
            {fields.map((field) => (
              <div 
                key={field.id}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">{field.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="inline-flex items-center text-xs">
                    <Checkbox
                      checked={field.retrievable}
                      onCheckedChange={(checked) => 
                        onFieldPropertyChange(field.id, "retrievable", !!checked)
                      }
                      className="mr-1 h-3 w-3"
                    />
                    <span className="text-xs text-gray-600">Retrievable</span>
                  </label>
                  <label className="inline-flex items-center text-xs">
                    <Checkbox
                      checked={field.filterable}
                      onCheckedChange={(checked) => 
                        onFieldPropertyChange(field.id, "filterable", !!checked)
                      }
                      className="mr-1 h-3 w-3"
                    />
                    <span className="text-xs text-gray-600">Filterable</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
