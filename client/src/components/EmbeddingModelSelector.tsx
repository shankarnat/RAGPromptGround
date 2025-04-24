import { FC, useState } from "react";
import { Search, ChevronDown, BadgeCheck } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup, 
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EmbeddingModelCard, { EmbeddingModel } from "./EmbeddingModelCard";

interface EmbeddingModelSelectorProps {
  models: EmbeddingModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

const EmbeddingModelSelector: FC<EmbeddingModelSelectorProps> = ({ 
  models,
  selectedModelId,
  onSelectModel
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  
  const filteredModels = models.filter(model => {
    const matchesSearch = searchQuery === "" || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider = provider === null || model.provider === provider;
    
    return matchesSearch && matchesProvider;
  });
  
  const providers = Array.from(new Set(models.map(model => model.provider)));
  
  const selectedModel = models.find(model => model.id === selectedModelId);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-base font-medium flex items-center">
          <BadgeCheck className="h-5 w-5 text-primary-500 mr-2" />
          Select Embedding Model
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose an embedding model for vectorizing your document content
        </p>
      </div>
      
      <div className="p-4">
        <div className="flex space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={provider || ""} onValueChange={(value) => setProvider(value || null)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModels.map(model => (
              <EmbeddingModelCard
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                onSelect={() => onSelectModel(model.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No models found matching your search criteria</p>
          </div>
        )}
      </div>
      
      {selectedModel && (
        <div className="p-4 border-t bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Selected Model: {selectedModel.name}</h4>
              <p className="text-xs text-gray-600">{selectedModel.dimensions} dimensions • {selectedModel.maxTokens} max tokens</p>
            </div>
            <div>
              <button className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded hover:bg-primary-600">
                Test Embedding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddingModelSelector;