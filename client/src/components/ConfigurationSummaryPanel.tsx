import { FC } from "react";
import { Check, ExternalLink, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const ConfigurationSummaryPanel: FC = () => {
  const [, navigate] = useLocation();
  
  return (
    <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">Configuration Summary</h3>
      </div>
      <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {/* Source Document Section */}
        <div className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-sm font-semibold">Source Document</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-gray-500"
              onClick={() => navigate('/upload')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              <span className="text-xs">Edit</span>
            </Button>
          </div>
          <div className="pl-6 space-y-1">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Document:</span> Financial Report Q1 2023
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Source DMO:</span> Financial Report
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Pages:</span> 12
            </p>
          </div>
        </div>
        
        {/* Parse & Chunk Section */}
        <div className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-sm font-semibold">Parse & Chunk</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-gray-500"
              onClick={() => navigate('/parse-chunk')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              <span className="text-xs">Edit</span>
            </Button>
          </div>
          <div className="pl-6 space-y-1">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Chunking Method:</span> Semantic
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Chunk Size:</span> 150 tokens
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Chunk Overlap:</span> 20 tokens
            </p>
          </div>
        </div>
        
        {/* Vectorization Section */}
        <div className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-sm font-semibold">Vectorization</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-gray-500"
              onClick={() => navigate('/vectorization')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              <span className="text-xs">Edit</span>
            </Button>
          </div>
          <div className="pl-6 space-y-1">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Embedding Model:</span> E5 Large V2 Embedding Model
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Vector Dimensions:</span> 1536
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Context Window:</span> 8192 tokens
            </p>
          </div>
        </div>
        
        {/* Configure Index Section */}
        <div className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-sm font-semibold">Configure Index</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-gray-500"
              onClick={() => navigate('/configure-index')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              <span className="text-xs">Edit</span>
            </Button>
          </div>
          <div className="pl-6 space-y-1">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Fields:</span> Field Level Indexing: 4, Record Level Indexing: 4
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Other Configurations:</span> Retrievable Fields: 4, Filtering Fields: 4
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Strategy:</span> Full Vector Indexing
            </p>
          </div>
        </div>
        
        {/* What Happens Next Section */}
        <div className="mb-6 border rounded-md p-4 bg-gray-50">
          <h4 className="text-sm font-semibold mb-2">What happens next?</h4>
          <p className="text-xs text-gray-600 mb-2">
            After testing your configuration, click "Build & Deploy" to create a production-ready search pipeline:
          </p>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1 mb-3">
            <li>Your index configuration will be built into a deployable package</li>
            <li>Vector indexes will be optimized for production performance</li>
            <li>API endpoints will be generated for your application to access</li>
            <li>Documentation for integration will be provided</li>
          </ol>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about deployment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSummaryPanel;