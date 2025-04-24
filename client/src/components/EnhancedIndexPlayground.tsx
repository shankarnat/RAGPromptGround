import { FC, useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Database, FileText } from "lucide-react";
import { IndexField } from "@shared/schema";

interface EnhancedIndexPlaygroundProps {
  fields: IndexField[];
}

const EnhancedIndexPlayground: FC<EnhancedIndexPlaygroundProps> = ({ fields }) => {
  const [activeTab, setActiveTab] = useState("field");

  const renderFieldContent = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Field Level Index</h3>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Financial Report Data Fields</h4>
            <span className="text-xs text-gray-500">{fields.length} fields indexed</span>
          </div>
        </div>
        
        <div className="p-4">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-xs text-gray-600 text-left">
                <th className="pb-2 font-medium">Field Name</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Properties</th>
                <th className="pb-2 font-medium text-center">Vector</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fields.map((field) => (
                <tr key={field.id} className="text-sm">
                  <td className="py-2 font-medium">{field.name}</td>
                  <td className="py-2 text-xs text-gray-600">{field.dataType}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {field.isRetrievable && (
                        <Badge variant="outline" className="text-[10px] py-0">Retrievable</Badge>
                      )}
                      {field.isFilterable && (
                        <Badge variant="outline" className="text-[10px] py-0">Filterable</Badge>
                      )}
                      {field.isTypehead && (
                        <Badge variant="outline" className="text-[10px] py-0">Typehead</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-center">
                    <Checkbox 
                      checked={field.vectorEmbedding} 
                      className="opacity-60 pointer-events-none" 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-start">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium">Field Level Indexing Summary</h5>
            <p className="text-xs text-gray-600 mt-1">
              Each field is indexed separately with its own vector embedding. This enables precise
              searching and filtering on specific field content.
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-gray-600">Total Fields:</span>
                <span className="font-medium">{fields.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Retrievable Fields:</span>
                <span className="font-medium">{fields.filter(f => f.isRetrievable).length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Filterable Fields:</span>
                <span className="font-medium">{fields.filter(f => f.isFilterable).length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Vector Embeddings:</span>
                <span className="font-medium">{fields.filter(f => f.vectorEmbedding).length}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderRecordContent = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Record Level Index</h3>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Financial Report Records</h4>
            <span className="text-xs text-gray-500">1 record indexed</span>
          </div>
        </div>
        
        <div className="p-4">
          <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded border overflow-auto">
{`{
  "id": "fin_report_q1_2023",
  "title": "Financial Report Q1 2023",
  "date": "2023-04-15",
  "fields": {
    "quarter": "Q1",
    "year": "2023",
    "revenue": "$45.7 million",
    "growth": "12.4%",
    "operating_income": "$5.3 million",
    "operating_margin": "11.6%"
  },
  "vector_embedding": true,
  "vector_dimensions": 1536
}`}
          </pre>
          
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3">
            <h5 className="text-xs font-medium text-amber-800 mb-1">Record Level Search Capabilities</h5>
            <p className="text-xs text-amber-700">
              This record can be searched semantically as a whole unit, enabling natural language queries across all contained fields.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-start">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
            <Database className="h-4 w-4 text-purple-600" />
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium">Record Level Indexing Summary</h5>
            <p className="text-xs text-gray-600 mt-1">
              The entire document is treated as a single record, with vector embeddings generated for the complete content. This enables semantic search across the document.
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              <li className="flex justify-between">
                <span className="text-gray-600">Total Records:</span>
                <span className="font-medium">1</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Record Size:</span>
                <span className="font-medium">512 tokens</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Vector Dimensions:</span>
                <span className="font-medium">1536</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">JSON Path:</span>
                <span className="font-medium">$.fields.*</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b px-4 py-3">
          <TabsList className="w-full bg-gray-100 p-1 rounded-md">
            <TabsTrigger 
              value="field" 
              className="flex-1 py-1.5 text-xs"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Field Level Index
            </TabsTrigger>
            <TabsTrigger 
              value="record"
              className="flex-1 py-1.5 text-xs"
            >
              <Database className="h-3.5 w-3.5 mr-1.5" />
              Record Level Index
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="field" className="h-full m-0">
            {renderFieldContent()}
          </TabsContent>
          
          <TabsContent value="record" className="h-full m-0">
            {renderRecordContent()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EnhancedIndexPlayground;