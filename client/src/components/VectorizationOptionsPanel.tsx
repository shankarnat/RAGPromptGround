import { FC, useState } from "react";
import { Settings, Save, RotateCcw, Sparkles, Layers } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmbeddingModel } from "./EmbeddingModelCard";
import { embeddingModels, defaultAdvancedOptions } from "@/data/embeddingModelsData";

interface VectorizationOptionsPanelProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  advancedOptions: typeof defaultAdvancedOptions;
  onUpdateOptions: (options: typeof defaultAdvancedOptions) => void;
}

const VectorizationOptionsPanel: FC<VectorizationOptionsPanelProps> = ({
  selectedModelId = "openai-text-embedding-3-large",
  onSelectModel,
  advancedOptions = defaultAdvancedOptions,
  onUpdateOptions
}) => {
  const [isOptionsEdited, setIsOptionsEdited] = useState(false);
  const [localOptions, setLocalOptions] = useState(advancedOptions);
  
  const selectedModel = embeddingModels.find(model => model.id === selectedModelId);
  
  const handleOptionChange = <K extends keyof typeof defaultAdvancedOptions>(
    key: K, 
    value: typeof defaultAdvancedOptions[K]
  ) => {
    setLocalOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      setIsOptionsEdited(true);
      return newOptions;
    });
  };
  
  const handleSaveOptions = () => {
    onUpdateOptions(localOptions);
    setIsOptionsEdited(false);
  };
  
  const handleResetDefaults = () => {
    setLocalOptions(defaultAdvancedOptions);
    setIsOptionsEdited(true);
  };

  return (
    <div className="space-y-4">
      {/* Model Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Embedding Model</h4>
        </div>
        
        <Select
          value={selectedModelId}
          onValueChange={onSelectModel}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {embeddingModels.map(model => (
              <SelectItem key={model.id} value={model.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>{model.name}</span>
                  {model.isRecommended && (
                    <Badge variant="default" className="ml-2 text-[10px] py-0 px-1.5 bg-green-100 text-green-800">
                      Recommended
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedModel && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Dimensions:</span>
              <span className="font-medium">{selectedModel.dimensions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-medium">{selectedModel.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Tokens:</span>
              <span className="font-medium">{selectedModel.maxTokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quality:</span>
              <span className="font-medium capitalize">{selectedModel.quality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Speed:</span>
              <span className="font-medium capitalize">{selectedModel.speed}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Advanced Options */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="options">
          <AccordionTrigger className="text-sm font-medium py-2">
            Advanced Options
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-medium">Normalize Embeddings</label>
                  <p className="text-[10px] text-gray-500">
                    Normalize vectors to unit length
                  </p>
                </div>
                <Switch
                  checked={localOptions.normalizeEmbeddings}
                  onCheckedChange={(checked) => handleOptionChange('normalizeEmbeddings', checked)}
                  className="h-4 w-7"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium">Pooling Strategy</label>
                <div className="mt-1">
                  <Select
                    value={localOptions.poolingStrategy}
                    onValueChange={(value) => handleOptionChange('poolingStrategy', value as any)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mean">Mean Pooling</SelectItem>
                      <SelectItem value="max">Max Pooling</SelectItem>
                      <SelectItem value="cls">CLS Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium">Truncation Method</label>
                <div className="mt-1">
                  <Select
                    value={localOptions.truncationMethod}
                    onValueChange={(value) => handleOptionChange('truncationMethod', value as any)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">Head (beginning)</SelectItem>
                      <SelectItem value="tail">Tail (ending)</SelectItem>
                      <SelectItem value="middle">Middle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <label className="text-xs font-medium">Batch Size: {localOptions.batchSize}</label>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Slider
                    value={[localOptions.batchSize]}
                    min={1}
                    max={128}
                    step={1}
                    onValueChange={(values) => handleOptionChange('batchSize', values[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={128}
                    value={localOptions.batchSize}
                    onChange={(e) => handleOptionChange('batchSize', Number(e.target.value))}
                    className="w-16 h-7 text-xs"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-medium">Enable Caching</label>
                  <p className="text-[10px] text-gray-500">
                    Cache embeddings for performance
                  </p>
                </div>
                <Switch
                  checked={localOptions.enableCaching}
                  onCheckedChange={(checked) => handleOptionChange('enableCaching', checked)}
                  className="h-4 w-7"
                />
              </div>
              
              {isOptionsEdited && (
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResetDefaults}
                    className="h-7 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={handleSaveOptions}
                    className="h-7 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default VectorizationOptionsPanel;