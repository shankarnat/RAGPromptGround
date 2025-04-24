import { FC, useState } from "react";
import { Settings, Save, RotateCcw, Sparkles } from "lucide-react";
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
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

export interface AdvancedEmbeddingOptions {
  normalizeEmbeddings: boolean;
  poolingStrategy: 'mean' | 'max' | 'cls';
  truncationMethod: 'head' | 'tail' | 'middle';
  batchSize: number;
  enableCaching: boolean;
}

interface EmbeddingAdvancedOptionsProps {
  options: AdvancedEmbeddingOptions;
  onUpdateOptions: (options: AdvancedEmbeddingOptions) => void;
}

const EmbeddingAdvancedOptions: FC<EmbeddingAdvancedOptionsProps> = ({
  options,
  onUpdateOptions
}) => {
  const [localOptions, setLocalOptions] = useState<AdvancedEmbeddingOptions>(options);
  const [isEdited, setIsEdited] = useState(false);
  
  const handleOptionChange = <K extends keyof AdvancedEmbeddingOptions>(
    key: K, 
    value: AdvancedEmbeddingOptions[K]
  ) => {
    setLocalOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      setIsEdited(true);
      return newOptions;
    });
  };
  
  const handleSaveChanges = () => {
    onUpdateOptions(localOptions);
    setIsEdited(false);
  };
  
  const handleResetDefaults = () => {
    setLocalOptions({
      normalizeEmbeddings: true,
      poolingStrategy: 'mean',
      truncationMethod: 'tail',
      batchSize: 32,
      enableCaching: true
    });
    setIsEdited(true);
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="text-base font-medium flex items-center">
          <Settings className="h-5 w-5 text-primary-500 mr-2" />
          Advanced Embedding Options
        </h3>
        
        <div className="flex space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetDefaults}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Reset to default settings</p>
            </TooltipContent>
          </Tooltip>
          
          <Button 
            size="sm"
            onClick={handleSaveChanges}
            disabled={!isEdited}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <Accordion type="multiple" defaultValue={["basic", "advanced"]} className="space-y-4">
          <AccordionItem value="basic" className="border rounded-md">
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                <span className="font-medium text-sm">Basic Configuration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-sm font-medium">Normalize Embeddings</label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Normalize vectors to unit length (recommended)
                  </p>
                </div>
                <Switch
                  checked={localOptions.normalizeEmbeddings}
                  onCheckedChange={(checked) => handleOptionChange('normalizeEmbeddings', checked)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Pooling Strategy</label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  Method used to combine token embeddings
                </p>
                <Select
                  value={localOptions.poolingStrategy}
                  onValueChange={(value) => handleOptionChange('poolingStrategy', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mean">Mean Pooling (averaging)</SelectItem>
                    <SelectItem value="max">Max Pooling</SelectItem>
                    <SelectItem value="cls">CLS Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Truncation Method</label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  How to truncate text exceeding token limit
                </p>
                <Select
                  value={localOptions.truncationMethod}
                  onValueChange={(value) => handleOptionChange('truncationMethod', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Head (beginning)</SelectItem>
                    <SelectItem value="tail">Tail (ending)</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="advanced" className="border rounded-md">
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2 text-purple-500" />
                <span className="font-medium text-sm">Performance Settings</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 space-y-4">
              <div>
                <label className="text-sm font-medium">Batch Size</label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  Number of inputs to process at once: {localOptions.batchSize}
                </p>
                <div className="flex items-center space-x-3">
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
                    className="w-16 h-8"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-sm font-medium">Enable Caching</label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cache embeddings to improve performance
                  </p>
                </div>
                <Switch
                  checked={localOptions.enableCaching}
                  onCheckedChange={(checked) => handleOptionChange('enableCaching', checked)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default EmbeddingAdvancedOptions;