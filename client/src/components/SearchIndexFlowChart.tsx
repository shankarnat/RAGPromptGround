import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Upload, FileText, Database, Braces, Search, BarChart4 } from 'lucide-react';

const SearchIndexFlowChart: React.FC = () => {
  return (
    <Card className="w-full p-6 shadow-lg">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold mb-6 text-center">Search Index Setup Flow</h2>
        
        <div className="flex flex-col items-center justify-center">
          {/* Flow chart using CSS grid for better control */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
            
            {/* Step 1: Document Upload */}
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center text-center border-2 border-blue-200">
              <div className="bg-blue-100 p-3 rounded-full mb-2">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold">Document Upload</h3>
              <p className="text-sm mt-1">Upload and preview documents</p>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>
            
            {/* Step 2: Parse, Chunk & Index */}
            <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center text-center border-2 border-indigo-200">
              <div className="bg-indigo-100 p-3 rounded-full mb-2">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-bold">Parse, Chunk & Index</h3>
              <p className="text-sm mt-1">Configure document processing</p>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>
            
            {/* Step 3: Configure Index */}
            <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center text-center border-2 border-purple-200">
              <div className="bg-purple-100 p-3 rounded-full mb-2">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold">Configure Index</h3>
              <p className="text-sm mt-1">Define field-level properties</p>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          
          {/* Second row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            {/* Step 6: Test & Results */}
            <div className="bg-emerald-50 rounded-lg p-4 flex flex-col items-center text-center border-2 border-emerald-200">
              <div className="bg-emerald-100 p-3 rounded-full mb-2">
                <BarChart4 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold">Test & Results</h3>
              <p className="text-sm mt-1">Evaluate search performance</p>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-180" />
            </div>
            
            {/* Step 5: Vectorization */}
            <div className="bg-teal-50 rounded-lg p-4 flex flex-col items-center text-center border-2 border-teal-200">
              <div className="bg-teal-100 p-3 rounded-full mb-2">
                <Braces className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="font-bold">Vectorization</h3>
              <p className="text-sm mt-1">Configure embedding models</p>
            </div>
          </div>
          
          {/* Details section */}
          <div className="mt-8 w-full grid grid-cols-1 gap-4">
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold flex items-center">
                <div className="bg-blue-100 p-1 rounded-full mr-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                Document Upload
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                <li>Drag-and-drop file upload</li>
                <li>Document preview with page count</li>
                <li>Document type detection</li>
                <li>Basic metadata extraction</li>
                <li>Processing mode selection</li>
              </ul>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold flex items-center">
                <div className="bg-indigo-100 p-1 rounded-full mr-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
                Parse, Chunk & Index
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                <li>Chunking method selection</li>
                <li>Chunk size and overlap configuration</li>
                <li>Real-time chunk visualization</li>
                <li>Document record structure setup</li>
                <li>Field mapping and metadata configuration</li>
              </ul>
              
              <div className="mt-4 pl-4 border-l-2 border-indigo-200">
                <h4 className="font-semibold text-sm">Document Record Tab</h4>
                <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
                  <li>Document metadata management</li>
                  <li>Record-level indexing configuration</li>
                  <li>Structure definition (flat, nested, custom)</li>
                  <li>Field mapping visualization</li>
                </ul>
              </div>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold flex items-center">
                <div className="bg-purple-100 p-1 rounded-full mr-2">
                  <Database className="h-4 w-4 text-purple-600" />
                </div>
                Configure Index
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                <li>Field configuration table</li>
                <li>Retrievable/filterable/typehead settings</li>
                <li>Index playground for query testing</li>
                <li>FAQ panel for indexing best practices</li>
                <li>Index statistics visualization</li>
              </ul>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold flex items-center">
                <div className="bg-teal-100 p-1 rounded-full mr-2">
                  <Braces className="h-4 w-4 text-teal-600" />
                </div>
                Vectorization
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                <li>Embedding model selection</li>
                <li>Model comparison (dimensions, languages, token limits)</li>
                <li>Advanced embedding options configuration</li>
                <li>Dimension visualization</li>
                <li>Performance metrics (speed, quality)</li>
              </ul>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold flex items-center">
                <div className="bg-emerald-100 p-1 rounded-full mr-2">
                  <BarChart4 className="h-4 w-4 text-emerald-600" />
                </div>
                Test & Results
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                <li>Test interface for query input</li>
                <li>Results visualization with highlighting</li>
                <li>Performance metrics (latency, relevance)</li>
                <li>Filter configuration</li>
                <li>Console output for debugging</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Note: Users can navigate between steps using the sidebar navigation or the next/previous buttons in each screen.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchIndexFlowChart;