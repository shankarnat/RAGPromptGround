import { FC, useState } from "react";
import { Cloud, ChevronDown, ChevronRight } from "lucide-react";
import { IndexField } from "@shared/schema";

interface IndexPlaygroundProps {
  fields: IndexField[];
}

const IndexPlayground: FC<IndexPlaygroundProps> = ({ fields }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['retrievable', 'typehead', 'filtering']);

  const retrievableFields = fields.filter(field => field.isRetrievable);
  const typeheadFields = fields.filter(field => field.isTypehead);
  const filterableFields = fields.filter(field => field.isFilterable);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Index Configuration Preview</h3>
      <p className="text-gray-500 mb-6">
        This preview shows how your document chunks will be indexed with the current configuration.
        Drag and drop fields between sections to adjust your indexing strategy.
      </p>

      {/* Sample document representation */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="mb-2 font-medium">Document JSON Preview</div>
        <pre className="text-xs text-gray-700 overflow-auto max-h-40">
{`{
  "id": "doc_123456",
  "fields": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "address": "123 Main St, Anytown, CA 94321"
  },
  "chunks": [
    {
      "id": "chunk_1",
      "content": "John Doe is a customer...",
      "embedding": "[0.1, 0.2, 0.3, ...]"
    }
  ]
}`}
        </pre>
      </div>

      {/* Retrievable Fields */}
      <div className="mb-4 border rounded-md overflow-hidden">
        <div 
          className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('retrievable')}
        >
          <h4 className="font-medium">Retrievable Fields</h4>
          {expandedSections.includes('retrievable') ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.includes('retrievable') && (
          <div className="p-4">
            {retrievableFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {retrievableFields.map(field => (
                  <div 
                    key={field.id} 
                    className="border border-blue-200 bg-blue-50 rounded p-2 text-sm flex items-center"
                  >
                    <span className="font-medium mr-2">{field.name}</span>
                    <span className="text-xs text-gray-500">{field.dataType}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Cloud className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500 mb-1">No fields selected</p>
                <p className="text-xs text-gray-400">Drag fields here to make them retrievable</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Typehead Fields */}
      <div className="mb-4 border rounded-md overflow-hidden">
        <div 
          className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('typehead')}
        >
          <h4 className="font-medium">Typehead Fields</h4>
          {expandedSections.includes('typehead') ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.includes('typehead') && (
          <div className="p-4">
            {typeheadFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {typeheadFields.map(field => (
                  <div 
                    key={field.id} 
                    className="border border-purple-200 bg-purple-50 rounded p-2 text-sm flex items-center"
                  >
                    <span className="font-medium mr-2">{field.name}</span>
                    <span className="text-xs text-gray-500">{field.dataType}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Cloud className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500 mb-1">No fields selected</p>
                <p className="text-xs text-gray-400">Drag fields here to make them typehead searchable</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtering Fields */}
      <div className="border rounded-md overflow-hidden">
        <div 
          className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('filtering')}
        >
          <h4 className="font-medium">Filtering Fields</h4>
          {expandedSections.includes('filtering') ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.includes('filtering') && (
          <div className="p-4">
            {filterableFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filterableFields.map(field => (
                  <div 
                    key={field.id} 
                    className="border border-green-200 bg-green-50 rounded p-2 text-sm flex items-center"
                  >
                    <span className="font-medium mr-2">{field.name}</span>
                    <span className="text-xs text-gray-500">{field.dataType}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Cloud className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500 mb-1">No fields selected</p>
                <p className="text-xs text-gray-400">Drag fields here to make them filterable</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPlayground;