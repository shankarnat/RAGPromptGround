import { FC, useState } from "react";
import { MetadataField, RecordStructure } from "@shared/schema";
import { Database, FileText, Search, Filter, Info, Share2, ArrowRight, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface DocumentRecordPanelProps {
  metadataFields: MetadataField[];
  recordStructure: RecordStructure;
  fields?: {
    id: number;
    name: string;
    retrievable: boolean;
    filterable: boolean;
    typehead?: boolean;
  }[];
}

const DocumentRecordPanel: FC<DocumentRecordPanelProps> = ({
  metadataFields,
  recordStructure,
  fields = []
}) => {
  const [activeTab, setActiveTab] = useState<string>("json");

  // Filter only included fields
  const includedFields = metadataFields.filter(field => field.included);
  
  // Get the field confidence scores (average and per field)
  const averageConfidence = includedFields.length > 0 ?
    includedFields.reduce((sum, field) => sum + field.confidence, 0) / includedFields.length : 0;
  
  // Format the JSON based on the selected structure
  const formatJsonRecord = () => {
    const includedFieldsObj: Record<string, any> = {};
    
    if (recordStructure === "flat") {
      // Flat structure: all fields at the root level
      includedFields.forEach(field => {
        includedFieldsObj[field.name] = field.value;
      });
      
      return includedFieldsObj;
    } 
    else if (recordStructure === "nested") {
      // Nested structure: group by field types
      const standardFields: Record<string, any> = {};
      const documentFields: Record<string, any> = {};
      const customFields: Record<string, any> = {};
      
      includedFields.forEach(field => {
        // Categorize fields based on name pattern
        if (["author", "creationDate", "lastModified", "title"].includes(field.name)) {
          standardFields[field.name] = field.value;
        } 
        else if (["fileSize", "fileType", "sourceLocation"].includes(field.name)) {
          documentFields[field.name] = field.value;
        } 
        else {
          customFields[field.name] = field.value;
        }
      });
      
      return {
        standardMetadata: standardFields,
        documentMetadata: documentFields,
        customMetadata: customFields
      };
    } 
    else {
      // Custom structure (simplified example)
      const metadata: Record<string, any> = {};
      const content: Record<string, any> = {};
      
      includedFields.forEach(field => {
        if (["fileSize", "fileType", "sourceLocation"].includes(field.name)) {
          metadata[field.name] = field.value;
        } else {
          content[field.name] = field.value;
        }
      });
      
      return {
        metadata: metadata,
        content: content,
        indexTimestamp: new Date().toISOString()
      };
    }
  };
  
  const jsonRecord = formatJsonRecord();
  const jsonString = JSON.stringify(jsonRecord, null, 2);

  // Get counts for field categories
  const getFieldCategoryCounts = () => {
    const counts = {
      metadata: 0,
      content: 0,
      system: 0,
    };

    includedFields.forEach(field => {
      if (["author", "title", "creationDate", "lastModified"].includes(field.name)) {
        counts.metadata++;
      } else if (["fileSize", "fileType", "sourceLocation"].includes(field.name)) {
        counts.system++;
      } else {
        counts.content++;
      }
    });

    return counts;
  };

  const fieldCategoryCounts = getFieldCategoryCounts();
  
  // Determine if we have potential field mapping issues
  const hasLowConfidenceFields = includedFields.some(field => field.confidence < 0.7);
  const hasMissingCoreFields = !includedFields.some(field => field.name === "title") || 
                              !includedFields.some(field => field.name === "author");
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-700 text-sm md:text-base">Document Record</h3>
          <Badge variant="outline" className="bg-blue-50 text-xs text-blue-700">
            {recordStructure} structure
          </Badge>
        </div>
        <div className="flex space-x-1">
          <Badge variant="secondary" className="text-xs">
            {includedFields.length} field{includedFields.length !== 1 ? 's' : ''}
          </Badge>
          {hasLowConfidenceFields && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Low confidence
            </Badge>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="json" className="w-full h-full flex flex-col" onValueChange={setActiveTab}>
        <div className="border-b border-gray-200">
          <TabsList className="bg-gray-50 p-0 h-10">
            <TabsTrigger 
              value="json" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:shadow-none px-4 text-xs">
              Record Format
            </TabsTrigger>
            <TabsTrigger 
              value="mapping" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:shadow-none px-4 text-xs">
              Field Mapping
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:shadow-none px-4 text-xs">
              Search Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="visualization" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:shadow-none px-4 text-xs">
              Visualization
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 230px)' }}>
          {includedFields.length > 0 ? (
            <>
              <TabsContent value="json" className="p-4 m-0 h-full">
                <div className="relative mb-4">
                  <pre className="p-4 bg-slate-900 rounded-md overflow-auto text-xs text-green-400 font-mono">
                    <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                      JSON
                    </div>
                    {jsonString}
                  </pre>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800 flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Record-Level Index</p>
                    <p>This JSON represents how the document will be indexed as a single record, separate from its chunked content. 
                    Record-level indexing enables document filtering and retrieval based on metadata properties.</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Record Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Structure Format</div>
                      <div className="text-sm font-medium flex items-center justify-between">
                        {recordStructure.charAt(0).toUpperCase() + recordStructure.slice(1)}
                        <Badge variant="outline" className={`
                          ${recordStructure === "flat" ? "bg-green-50 text-green-700" : 
                            recordStructure === "nested" ? "bg-blue-50 text-blue-700" : 
                            "bg-purple-50 text-purple-700"}
                        `}>
                          {recordStructure === "flat" ? "Simple" : 
                           recordStructure === "nested" ? "Grouped" : 
                           "Custom"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Record Size</div>
                      <div className="text-sm font-medium flex items-center justify-between">
                        {jsonString.length.toLocaleString()} bytes
                        <Badge variant="outline" className={`
                          ${jsonString.length < 1000 ? "bg-green-50 text-green-700" : 
                            jsonString.length < 5000 ? "bg-blue-50 text-blue-700" : 
                            "bg-amber-50 text-amber-700"}
                        `}>
                          {jsonString.length < 1000 ? "Small" : 
                           jsonString.length < 5000 ? "Medium" : 
                           "Large"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Field Confidence</div>
                      <div className="text-sm font-medium flex items-center justify-between">
                        {(averageConfidence * 100).toFixed(0)}%
                        <Badge variant="outline" className={`
                          ${averageConfidence > 0.9 ? "bg-green-50 text-green-700" : 
                            averageConfidence > 0.7 ? "bg-blue-50 text-blue-700" : 
                            "bg-amber-50 text-amber-700"}
                        `}>
                          {averageConfidence > 0.9 ? "High" : 
                           averageConfidence > 0.7 ? "Medium" : 
                           "Low"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="mapping" className="p-4 m-0 h-full">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>Field Mapping</span>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Metadata: {fieldCategoryCounts.metadata}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Content: {fieldCategoryCounts.content}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        System: {fieldCategoryCounts.system}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="overflow-hidden border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Field Name</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Value</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Confidence</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {includedFields.map(field => (
                          <tr key={field.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs font-medium text-gray-700">{field.name}</td>
                            <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-[180px]">{field.value}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2" style={{maxWidth: "60px"}}>
                                  <div 
                                    className={`h-full ${field.confidence > 0.9 ? "bg-green-500" : field.confidence > 0.7 ? "bg-blue-500" : "bg-amber-500"}`} 
                                    style={{ width: `${field.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{(field.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className={`text-xs ${(() => {
                                if (["author", "title", "creationDate", "lastModified"].includes(field.name)) {
                                  return "bg-purple-50 text-purple-700";
                                } else if (["fileSize", "fileType", "sourceLocation"].includes(field.name)) {
                                  return "bg-gray-50 text-gray-700";
                                } else {
                                  return "bg-blue-50 text-blue-700";
                                }
                              })()}`}>
                                {["author", "title", "creationDate", "lastModified"].includes(field.name) ? "Metadata" : 
                                 ["fileSize", "fileType", "sourceLocation"].includes(field.name) ? "System" : 
                                 "Content"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {hasLowConfidenceFields && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-xs text-amber-800 flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Low Confidence Fields Detected</p>
                      <p>Some of the field mappings have low confidence scores. Review the values to ensure they are correctly identified before indexing.</p>
                    </div>
                  </div>
                )}
                
                {hasMissingCoreFields && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-xs text-amber-800 flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Missing Core Fields</p>
                      <p>This document is missing one or more core metadata fields (title or author). Adding these fields will improve searchability.</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Structure Visualization</h4>
                  <div className="bg-white p-4 border border-gray-200 rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center text-sm font-medium text-gray-700 mb-3">
                          {recordStructure === "flat" ? (
                            <div className="flex items-center">
                              <span className="mr-2">Flat Structure</span>
                              <div className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                Simple
                              </div>
                            </div>
                          ) : recordStructure === "nested" ? (
                            <div className="flex items-center">
                              <span className="mr-2">Nested Structure</span>
                              <div className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Grouped
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="mr-2">Custom Structure</span>
                              <div className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Advanced
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          {recordStructure === "flat" ? 
                            "All fields are stored at the root level for simple access." :
                           recordStructure === "nested" ?
                            "Fields are organized into logical groups by field type." :
                            "Custom organization with dedicated metadata and content sections plus timestamp."}
                        </div>
                        
                        {/* Structure diagram */}
                        <div className="mt-3 border border-gray-200 rounded-md p-3 text-xs">
                          {recordStructure === "flat" && (
                            <div className="flex flex-col">
                              <div className="font-mono mb-1 text-gray-700">Document Record</div>
                              <div className="grid grid-cols-2 gap-2 px-4 py-2">
                                {includedFields.map((field, index) => (
                                  <div key={index} className="flex items-center">
                                    <span className="text-gray-900">"{field.name}":</span> 
                                    <span className="ml-1 text-green-600">"{field.value}"</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {recordStructure === "nested" && (
                            <div className="flex flex-col">
                              <div className="font-mono mb-1 text-gray-700">Document Record</div>
                              <div className="ml-4">
                                <div className="font-mono text-gray-800">"standardMetadata": {`{`}</div>
                                <div className="grid grid-cols-1 gap-1 ml-6">
                                  {includedFields.filter(f => ["author", "title", "creationDate", "lastModified"].includes(f.name))
                                    .map((field, index) => (
                                      <div key={index} className="flex items-center">
                                        <span className="text-gray-900">"{field.name}":</span> 
                                        <span className="ml-1 text-green-600">"{field.value}"</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="font-mono text-gray-800">{`}`},</div>
                                
                                <div className="font-mono text-gray-800">"documentMetadata": {`{`}</div>
                                <div className="grid grid-cols-1 gap-1 ml-6">
                                  {includedFields.filter(f => ["fileSize", "fileType", "sourceLocation"].includes(f.name))
                                    .map((field, index) => (
                                      <div key={index} className="flex items-center">
                                        <span className="text-gray-900">"{field.name}":</span> 
                                        <span className="ml-1 text-green-600">"{field.value}"</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="font-mono text-gray-800">{`}`},</div>
                                
                                <div className="font-mono text-gray-800">"customMetadata": {`{`}</div>
                                <div className="grid grid-cols-1 gap-1 ml-6">
                                  {includedFields.filter(f => 
                                    !["author", "title", "creationDate", "lastModified", "fileSize", "fileType", "sourceLocation"].includes(f.name))
                                    .map((field, index) => (
                                      <div key={index} className="flex items-center">
                                        <span className="text-gray-900">"{field.name}":</span> 
                                        <span className="ml-1 text-green-600">"{field.value}"</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="font-mono text-gray-800">{`}`}</div>
                              </div>
                            </div>
                          )}
                          
                          {recordStructure === "custom" && (
                            <div className="flex flex-col">
                              <div className="font-mono mb-1 text-gray-700">Document Record</div>
                              <div className="ml-4">
                                <div className="font-mono text-gray-800">"metadata": {`{`}</div>
                                <div className="grid grid-cols-1 gap-1 ml-6">
                                  {includedFields.filter(f => ["fileSize", "fileType", "sourceLocation"].includes(f.name))
                                    .map((field, index) => (
                                      <div key={index} className="flex items-center">
                                        <span className="text-gray-900">"{field.name}":</span> 
                                        <span className="ml-1 text-green-600">"{field.value}"</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="font-mono text-gray-800">{`}`},</div>
                                
                                <div className="font-mono text-gray-800">"content": {`{`}</div>
                                <div className="grid grid-cols-1 gap-1 ml-6">
                                  {includedFields.filter(f => 
                                    !["fileSize", "fileType", "sourceLocation"].includes(f.name))
                                    .map((field, index) => (
                                      <div key={index} className="flex items-center">
                                        <span className="text-gray-900">"{field.name}":</span> 
                                        <span className="ml-1 text-green-600">"{field.value}"</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="font-mono text-gray-800">{`}`},</div>
                                
                                <div className="flex items-center">
                                  <span className="text-gray-900">"indexTimestamp":</span> 
                                  <span className="ml-1 text-blue-600">"{new Date().toISOString()}"</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="p-4 m-0 h-full">
                {fields.length > 0 ? (
                  <div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                        <span>Field Search Configuration</span>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Search className="h-3 w-3 mr-1" />
                            {fields.filter(f => f.retrievable).length} Retrievable
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Filter className="h-3 w-3 mr-1" />
                            {fields.filter(f => f.filterable).length} Filterable
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden border border-gray-200 rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Field Name</th>
                              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500">
                                <div className="flex items-center justify-center">
                                  <Search className="h-3 w-3 mr-1" />
                                  <span>Retrievable</span>
                                </div>
                              </th>
                              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500">
                                <div className="flex items-center justify-center">
                                  <Filter className="h-3 w-3 mr-1" />
                                  <span>Filterable</span>
                                </div>
                              </th>
                              <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500">
                                <div className="flex items-center justify-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  <span>Type Ahead</span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {fields.map(field => (
                              <tr key={field.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs font-medium text-gray-700">{field.name}</td>
                                <td className="px-3 py-2 text-center">
                                  <div className="flex justify-center">
                                    {field.retrievable ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <div className="flex justify-center">
                                    {field.filterable ? (
                                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <div className="flex justify-center">
                                    {field.typehead ? (
                                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white border border-gray-200 rounded-md p-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                          <Search className="h-3 w-3 mr-1" />
                          <span>Retrievable Fields</span>
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          Fields marked as retrievable will be returned in search results. Use these for displaying information to users.  
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {fields.filter(f => f.retrievable).map(field => (
                            <Badge key={field.id} variant="outline" className="bg-green-50 text-green-700">
                              {field.name}
                            </Badge>
                          ))}
                          {fields.filter(f => f.retrievable).length === 0 && (
                            <span className="text-xs text-gray-500 italic">No retrievable fields configured</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-md p-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                          <Filter className="h-3 w-3 mr-1" />
                          <span>Filterable Fields</span>
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          Fields marked as filterable can be used to narrow search results. Use these for creating faceted navigation.  
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {fields.filter(f => f.filterable).map(field => (
                            <Badge key={field.id} variant="outline" className="bg-blue-50 text-blue-700">
                              {field.name}
                            </Badge>
                          ))}
                          {fields.filter(f => f.filterable).length === 0 && (
                            <span className="text-xs text-gray-500 italic">No filterable fields configured</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-md p-3 mb-4">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Example Search Queries</h5>
                      <div className="space-y-2">
                        {fields.filter(f => f.filterable).slice(0, 2).map((field, idx) => (
                          <div key={idx} className="rounded-md border border-gray-200 p-2 text-xs">
                            <div className="font-medium mb-1 text-gray-800">Filter by {field.name}:</div>
                            <div className="font-mono bg-gray-50 p-2 rounded">
                              {`GET /search?filter=${field.name}:"${includedFields.find(f => f.name === field.name)?.value || "example value"}"`}
                            </div>
                          </div>
                        ))}
                        {fields.filter(f => f.retrievable).length > 0 && (
                          <div className="rounded-md border border-gray-200 p-2 text-xs">
                            <div className="font-medium mb-1 text-gray-800">Full text search with specific fields:</div>
                            <div className="font-mono bg-gray-50 p-2 rounded">
                              {`GET /search?q=query&fields=${fields.filter(f => f.retrievable).map(f => f.name).join(",")}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">No search configuration found</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Configure fields in the Field-Level Indexing panel to enable search capabilities.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="visualization" className="p-4 m-0 h-full">
                <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>Document Structure Visualization</span>
                  </h4>
                  
                  <div className="aspect-video bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center p-4 mb-4">
                    <div className="w-full max-w-lg">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg font-medium text-sm">Document Record</div>
                        <div className="h-10 w-px bg-gray-300 my-2"></div>
                        <div className="grid grid-cols-3 gap-4 w-full">
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium text-xs text-center">
                              Metadata
                              <div className="text-xs font-normal mt-1 text-purple-700">{fieldCategoryCounts.metadata} fields</div>
                            </div>
                            {fieldCategoryCounts.metadata > 0 && (
                              <>
                                <div className="h-6 w-px bg-gray-300 my-1"></div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {includedFields.filter(f => ["author", "title", "creationDate", "lastModified"].includes(f.name))
                                    .slice(0, 3).map((field, idx) => (
                                      <div key={idx} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px]">
                                        {field.name}
                                      </div>
                                    ))}
                                  {includedFields.filter(f => ["author", "title", "creationDate", "lastModified"].includes(f.name)).length > 3 && (
                                    <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px]">
                                      +{includedFields.filter(f => ["author", "title", "creationDate", "lastModified"].includes(f.name)).length - 3} more
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-xs text-center">
                              Content
                              <div className="text-xs font-normal mt-1 text-blue-700">{fieldCategoryCounts.content} fields</div>
                            </div>
                            {fieldCategoryCounts.content > 0 && (
                              <>
                                <div className="h-6 w-px bg-gray-300 my-1"></div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {includedFields.filter(f => ![
                                      "author", "title", "creationDate", "lastModified", 
                                      "fileSize", "fileType", "sourceLocation"
                                    ].includes(f.name))
                                    .slice(0, 3).map((field, idx) => (
                                      <div key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px]">
                                        {field.name}
                                      </div>
                                    ))}
                                  {includedFields.filter(f => ![
                                      "author", "title", "creationDate", "lastModified", 
                                      "fileSize", "fileType", "sourceLocation"
                                    ].includes(f.name)).length > 3 && (
                                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px]">
                                      +{includedFields.filter(f => ![
                                        "author", "title", "creationDate", "lastModified", 
                                        "fileSize", "fileType", "sourceLocation"
                                      ].includes(f.name)).length - 3} more
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium text-xs text-center">
                              System
                              <div className="text-xs font-normal mt-1 text-gray-700">{fieldCategoryCounts.system} fields</div>
                            </div>
                            {fieldCategoryCounts.system > 0 && (
                              <>
                                <div className="h-6 w-px bg-gray-300 my-1"></div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {includedFields.filter(f => ["fileSize", "fileType", "sourceLocation"].includes(f.name))
                                    .map((field, idx) => (
                                      <div key={idx} className="bg-gray-50 text-gray-700 px-2 py-1 rounded text-[10px]">
                                        {field.name}
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {fields.filter(f => f.retrievable || f.filterable).length > 0 && (
                          <>
                            <div className="h-10 w-px bg-gray-300 my-2"></div>
                            <div className="grid grid-cols-2 gap-6 w-full">
                              <div className="flex flex-col items-center">
                                <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-xs text-center">
                                  <div className="flex items-center justify-center">
                                    <Search className="h-3 w-3 mr-1" />
                                    <span>Retrievable</span>
                                  </div>
                                  <div className="text-xs font-normal mt-1 text-green-700">{fields.filter(f => f.retrievable).length} fields</div>
                                </div>
                                {fields.filter(f => f.retrievable).length > 0 && (
                                  <>
                                    <div className="h-6 w-px bg-gray-300 my-1"></div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                      {fields.filter(f => f.retrievable)
                                        .slice(0, 3).map((field, idx) => (
                                          <div key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px]">
                                            {field.name}
                                          </div>
                                        ))}
                                      {fields.filter(f => f.retrievable).length > 3 && (
                                        <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px]">
                                          +{fields.filter(f => f.retrievable).length - 3} more
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <div className="w-full bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-xs text-center">
                                  <div className="flex items-center justify-center">
                                    <Filter className="h-3 w-3 mr-1" />
                                    <span>Filterable</span>
                                  </div>
                                  <div className="text-xs font-normal mt-1 text-blue-700">{fields.filter(f => f.filterable).length} fields</div>
                                </div>
                                {fields.filter(f => f.filterable).length > 0 && (
                                  <>
                                    <div className="h-6 w-px bg-gray-300 my-1"></div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                      {fields.filter(f => f.filterable)
                                        .slice(0, 3).map((field, idx) => (
                                          <div key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px]">
                                            {field.name}
                                          </div>
                                        ))}
                                      {fields.filter(f => f.filterable).length > 3 && (
                                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px]">
                                          +{fields.filter(f => f.filterable).length - 3} more
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Document Chunks & Vector Database */}
                        <div className="h-10 w-px bg-gray-300 my-3"></div>
                        <div className="flex items-center gap-3">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-medium text-xs">
                            Document Chunks
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-medium text-xs">
                            Vector Database
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <Share2 className="h-3 w-3 mr-1" />
                      <span>Integration Points</span>
                    </h5>
                    <p className="text-xs text-gray-600">
                      The document record adds structure to your search functionality, enhancing retrieval quality through metadata filtering and faceting. Use the record index alongside the chunked content for comprehensive search results.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">No metadata fields selected</h3>
              <p className="text-xs text-gray-500">
                Enable record-level indexing and select metadata fields to generate a document record.
              </p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default DocumentRecordPanel;