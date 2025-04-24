import { FC } from "react";
import { Info, TrendingUp, Languages, Clock, TrendingDown } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export interface EmbeddingModel {
  id: string;
  name: string;
  provider: string;
  dimensions: number;
  languages: string[];
  maxTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
  description: string;
  isRecommended?: boolean;
}

interface EmbeddingModelCardProps {
  model: EmbeddingModel;
  isSelected: boolean;
  onSelect: () => void;
}

const EmbeddingModelCard: FC<EmbeddingModelCardProps> = ({ 
  model, 
  isSelected,
  onSelect
}) => {
  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'bg-green-100 text-green-800';
      case 'cohere': return 'bg-blue-100 text-blue-800';
      case 'e5': return 'bg-purple-100 text-purple-800';
      case 'bert': return 'bg-amber-100 text-amber-800';
      case 'sentence transformers': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Clock className="h-4 w-4 text-green-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'slow': return <Clock className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'high': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-amber-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div 
      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      {model.isRecommended && (
        <Badge 
          className="absolute top-0 right-0 transform translate-x-1/4 -translate
          y-1/4 bg-green-500 text-white text-[10px] px-1.5 py-0"
        >
          Recommended
        </Badge>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-sm">{model.name}</h3>
          <div 
            className={`inline-block px-2 py-0.5 text-xs rounded mt-1 ${getProviderColor(model.provider)}`}
          >
            {model.provider}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs font-medium mb-1">{model.name}</p>
            <p className="text-xs text-gray-500">{model.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Dimensions</span>
          <span className="text-xs font-medium">{model.dimensions}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Max Tokens</span>
          <span className="text-xs font-medium">{model.maxTokens}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Speed</span>
          <div className="flex items-center">
            {getSpeedIcon(model.speed)}
            <span className="text-xs font-medium ml-1 capitalize">{model.speed}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Quality</span>
          <div className="flex items-center">
            {getQualityIcon(model.quality)}
            <span className="text-xs font-medium ml-1 capitalize">{model.quality}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex items-center">
          <Languages className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
          <span className="text-xs text-gray-500">Supported Languages:</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {model.languages.map((lang) => (
            <Badge 
              key={lang}
              variant="outline" 
              className="text-[10px] py-0"
            >
              {lang}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmbeddingModelCard;