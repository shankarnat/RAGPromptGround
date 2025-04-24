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
        
        <div className="pt-3 border-t border-gray-200">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Field Indexing</label>
          <p className="text-xs md:text-sm text-gray-500 mb-3">
            Configure which fields should be retrievable or filterable
          </p>
          
          <div className="space-y-2">
            {fields.map((field) => (
              <div 
                key={field.id}
                className="flex flex-wrap md:flex-nowrap items-center justify-between py-1.5 border-b border-gray-100"
              >
                <div className="flex items-center w-full md:w-auto mb-1 md:mb-0">
                  <span className="text-xs md:text-sm font-medium text-gray-700">{field.name}</span>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                  <label className="inline-flex items-center">
                    <Checkbox
                      checked={field.retrievable}
                      onCheckedChange={(checked) => 
                        onFieldPropertyChange(field.id, "retrievable", !!checked)
                      }
                      className="mr-1 h-3 w-3 md:h-4 md:w-4"
                    />
                    <span className="text-xs text-gray-600">Retrievable</span>
                  </label>
                  <label className="inline-flex items-center">
                    <Checkbox
                      checked={field.filterable}
                      onCheckedChange={(checked) => 
                        onFieldPropertyChange(field.id, "filterable", !!checked)
                      }
                      className="mr-1 h-3 w-3 md:h-4 md:w-4"
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
