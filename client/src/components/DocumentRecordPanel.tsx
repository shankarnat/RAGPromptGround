import { FC } from "react";
import { MetadataField, RecordStructure } from "@shared/schema";
import { Database, FileText, Search, Filter } from "lucide-react";

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
  // Filter only included fields
  const includedFields = metadataFields.filter(field => field.included);
  
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
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700 text-sm md:text-base">Document Record Preview</h3>
        <div className="flex space-x-1">
          <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
            {includedFields.length} field{includedFields.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
            {recordStructure} structure
          </div>
        </div>
      </div>
      
      <div className="h-full overflow-y-auto bg-gray-50 p-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {includedFields.length > 0 ? (
          <div className="relative">
            <pre className="p-4 bg-slate-900 rounded-md overflow-auto text-xs md:text-sm text-green-400 font-mono">
              <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                JSON
              </div>
              {jsonString}
            </pre>
            
            <div className="mt-4 space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Metadata Field Mapping</h4>
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="grid grid-cols-1 gap-2">
                  {includedFields.map(field => (
                    <div key={field.id} className="flex items-center text-xs">
                      <div className="w-1/3 font-medium text-gray-700">{field.name}:</div>
                      <div className="w-2/3 text-gray-600 overflow-hidden text-ellipsis">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Record Details</h4>
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-gray-500">Structure Type:</span>
                    <span className="ml-1 font-medium">{recordStructure}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Fields:</span>
                    <span className="ml-1 font-medium">{includedFields.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Record Size:</span>
                    <span className="ml-1 font-medium">{jsonString.length} bytes</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Content Type:</span>
                    <span className="ml-1 font-medium">application/json</span>
                  </div>
                </div>
              </div>
            </div>
            
            {fields.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Other Indexing Configuration</h4>
                <div className="bg-white rounded-md border border-gray-200 p-3">
                  <div className="mb-2 border-b pb-2 border-gray-100">
                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium">
                      <div>Field Name</div>
                      <div className="flex items-center">
                        <Search className="h-3 w-3 mr-1" />
                        <span>Retrievable</span>
                      </div>
                      <div className="flex items-center">
                        <Filter className="h-3 w-3 mr-1" />
                        <span>Filterable</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Type Ahead</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {fields.map(field => (
                      <div key={field.id} className="grid grid-cols-4 gap-2 text-xs py-1 border-b border-gray-50">
                        <div className="font-medium">{field.name}</div>
                        <div>{field.retrievable ? 
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px]">Yes</span> : 
                          <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[10px]">No</span>}
                        </div>
                        <div>{field.filterable ? 
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px]">Yes</span> : 
                          <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[10px]">No</span>}
                        </div>
                        <div>{field.typehead ? 
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px]">Yes</span> : 
                          <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[10px]">No</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <div>
                      <Database className="h-3 w-3 inline mr-1" />
                      <span>Indexing fields enabled:</span>
                      <span className="ml-1 font-medium">{fields.length}</span>
                    </div>
                    <div>
                      <span>Retrievable:</span>
                      <span className="ml-1 font-medium">{fields.filter(f => f.retrievable).length}</span>
                      <span className="mx-1">•</span>
                      <span>Filterable:</span>
                      <span className="ml-1 font-medium">{fields.filter(f => f.filterable).length}</span>
                      <span className="mx-1">•</span>
                      <span>Type Ahead:</span>
                      <span className="ml-1 font-medium">{fields.filter(f => f.typehead).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default DocumentRecordPanel;