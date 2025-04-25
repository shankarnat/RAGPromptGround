import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, AlertCircle, Database, Key, Calendar, Hash, Text, Type } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Field {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'id';
  description: string;
  isPrimaryKey?: boolean;
  isRequired?: boolean;
  isMapped?: boolean;
  mappedTo?: string;
}

interface DataModelObject {
  id: string;
  name: string;
  fields: Field[];
}

const Mapping: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchSourceTerm, setSearchSourceTerm] = useState('');
  const [searchEKGTerm, setSearchEKGTerm] = useState('');
  const [collapsedSourceSections, setCollapsedSourceSections] = useState<string[]>([]);
  const [collapsedEKGSections, setCollapsedEKGSections] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState<[string, string] | null>(null);
  
  // Source DMOs - these would come from previous step in real app
  const [sourceDMOs, setSourceDMOs] = useState<DataModelObject[]>([
    {
      id: 'file',
      name: 'File',
      fields: [
        { id: 'file_id', name: 'file_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'file_name', name: 'file_name', type: 'string', description: 'Name of the file', isRequired: true },
        { id: 'file_path', name: 'file_path', type: 'string', description: 'File path' },
        { id: 'created_at', name: 'created_at', type: 'date', description: 'Creation timestamp' },
        { id: 'modified_at', name: 'modified_at', type: 'date', description: 'Last modified timestamp' },
        { id: 'size', name: 'size', type: 'number', description: 'File size in bytes' },
        { id: 'mime_type', name: 'mime_type', type: 'string', description: 'MIME type' },
        { id: 'creator_id', name: 'creator_id', type: 'id', description: 'Creator reference' },
      ]
    },
    {
      id: 'user',
      name: 'User',
      fields: [
        { id: 'user_id', name: 'user_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'email', name: 'email', type: 'string', description: 'Email address', isRequired: true },
        { id: 'name', name: 'name', type: 'string', description: 'User name', isRequired: true },
        { id: 'department', name: 'department', type: 'string', description: 'Department' },
        { id: 'role', name: 'role', type: 'string', description: 'User role' },
        { id: 'joined_at', name: 'joined_at', type: 'date', description: 'Join date' },
      ]
    },
  ]);

  // EKG DMOs - these are the target Knowledge Graph models
  const [ekgDMOs, setEkgDMOs] = useState<DataModelObject[]>([
    {
      id: 'kg_content',
      name: 'KG Content',
      fields: [
        { id: 'content_id', name: 'content_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'title', name: 'title', type: 'string', description: 'Content title', isRequired: true },
        { id: 'path', name: 'path', type: 'string', description: 'Content location' },
        { id: 'created_date', name: 'created_date', type: 'date', description: 'Creation date' },
        { id: 'modified_date', name: 'modified_date', type: 'date', description: 'Modification date' },
        { id: 'size_bytes', name: 'size_bytes', type: 'number', description: 'Content size' },
        { id: 'type', name: 'type', type: 'string', description: 'Content type' },
        { id: 'creator', name: 'creator', type: 'id', description: 'Creator reference' },
      ]
    },
    {
      id: 'kg_user',
      name: 'KG User',
      fields: [
        { id: 'user_id', name: 'user_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'email_address', name: 'email_address', type: 'string', description: 'Email', isRequired: true },
        { id: 'display_name', name: 'display_name', type: 'string', description: 'Display name', isRequired: true },
        { id: 'org_unit', name: 'org_unit', type: 'string', description: 'Organizational unit' },
        { id: 'user_type', name: 'user_type', type: 'string', description: 'User type or role' },
        { id: 'start_date', name: 'start_date', type: 'date', description: 'Start date' },
      ]
    },
  ]);

  // Initial mappings
  const [mappings, setMappings] = useState<Record<string, string>>({
    'file_id': 'content_id',
    'file_name': 'title',
    'file_path': 'path',
    'created_at': 'created_date',
    'modified_at': 'modified_date',
    'size': 'size_bytes',
    'mime_type': 'type',
    'creator_id': 'creator',
    'user_id': 'user_id',
    'email': 'email_address',
    'name': 'display_name',
    'department': 'org_unit',
    'role': 'user_type',
    'joined_at': 'start_date',
  });

  const toggleSourceSection = (dmoId: string) => {
    setCollapsedSourceSections(prev => 
      prev.includes(dmoId) 
        ? prev.filter(id => id !== dmoId) 
        : [...prev, dmoId]
    );
  };

  const toggleEKGSection = (dmoId: string) => {
    setCollapsedEKGSections(prev => 
      prev.includes(dmoId) 
        ? prev.filter(id => id !== dmoId) 
        : [...prev, dmoId]
    );
  };

  const createMapping = (sourceFieldId: string, ekgFieldId: string) => {
    setMappings(prev => ({
      ...prev,
      [sourceFieldId]: ekgFieldId
    }));
  };

  const removeMapping = (sourceFieldId: string) => {
    const newMappings = { ...mappings };
    delete newMappings[sourceFieldId];
    setMappings(newMappings);
  };

  const getMappedFieldCount = (dmoId: string, fields: Field[]) => {
    if (dmoId.startsWith('kg_')) {
      // For EKG DMOs, count how many fields are targets of mappings
      const mappedValues = Object.values(mappings);
      return fields.filter(field => mappedValues.includes(field.id)).length;
    } else {
      // For source DMOs, count how many fields are keys in mappings
      return fields.filter(field => field.id in mappings).length;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'id':
        return <Key className="h-4 w-4 text-purple-500" />;
      case 'string':
        return <Text className="h-4 w-4 text-blue-500" />;
      case 'number':
        return <Hash className="h-4 w-4 text-red-500" />;
      case 'date':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Type className="h-4 w-4 text-gray-500" />;
    }
  };

  const filterFields = (fields: Field[], searchTerm: string) => {
    if (!searchTerm) return fields;
    return fields.filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleNext = () => {
    // Navigate to the next step (after mapping - visualization)
    navigate('/kg/visualization');
  };

  const handlePrevious = () => {
    // Navigate back to Analytics Configuration
    navigate('/kg/analytics');
  };

  // Help panel content
  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Field Mapping</h3>
        <p className="text-sm text-gray-600">
          Map fields from your source data models to the Knowledge Graph data models. Click on a source field and then click on a corresponding EKG field to create a mapping.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Required Fields</h3>
        <p className="text-sm text-gray-600">
          Fields marked with an asterisk (*) are required and must be mapped. Primary keys are used to uniquely identify entities.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Best Practices</h3>
        <p className="text-sm text-gray-600">
          Match fields with compatible data types. Map primary keys to primary keys. Ensure all required fields are mapped to ensure data integrity.
        </p>
      </div>
    </div>
  );

  return (
    <KnowledgeGraphLayout
      title="Source-to-EKG Mapping"
      rightPanelContent={rightPanelContent}
      currentStep={5}
      totalSteps={4}  // 4 steps: Template, Setup, Playground, Share
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="flex flex-col space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Field Mapping</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Map fields from source data models to knowledge graph models</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Source DMOs */}
              <div className="md:w-1/2">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search source fields..."
                      className="pl-9"
                      value={searchSourceTerm}
                      onChange={e => setSearchSourceTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {sourceDMOs.map(dmo => {
                    const isCollapsed = collapsedSourceSections.includes(dmo.id);
                    const filteredFields = filterFields(dmo.fields, searchSourceTerm);
                    const mappedCount = getMappedFieldCount(dmo.id, dmo.fields);
                    
                    return (
                      <div key={dmo.id} className="border rounded-md overflow-hidden">
                        <div 
                          className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleSourceSection(dmo.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <Database className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">{dmo.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Is Mapped ({mappedCount})
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Unmapped ({dmo.fields.length - mappedCount})
                              </Badge>
                            </div>
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="divide-y">
                            {filteredFields.map(field => (
                              <div 
                                key={field.id} 
                                className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                                  activeLine && activeLine[0] === field.id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  if (activeLine && activeLine[0] === field.id) {
                                    setActiveLine(null);
                                  } else {
                                    setActiveLine([field.id, mappings[field.id] || '']);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  {getTypeIcon(field.type)}
                                  <span>
                                    {field.name}
                                    {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                    {field.isPrimaryKey && (
                                      <Badge variant="outline" className="ml-2 py-0 px-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                                        PK
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                                <div>
                                  {field.id in mappings ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800">
                                      Mapped
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-gray-500">
                                      Not Mapped
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connection Illustration */}
              <div className="hidden md:flex flex-col items-center justify-center w-16">
                <div className="h-full flex items-center">
                  <Separator orientation="vertical" className="h-full" />
                </div>
              </div>

              {/* EKG DMOs */}
              <div className="md:w-1/2">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search EKG fields..."
                      className="pl-9"
                      value={searchEKGTerm}
                      onChange={e => setSearchEKGTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {ekgDMOs.map(dmo => {
                    const isCollapsed = collapsedEKGSections.includes(dmo.id);
                    const filteredFields = filterFields(dmo.fields, searchEKGTerm);
                    const mappedCount = getMappedFieldCount(dmo.id, dmo.fields);
                    
                    return (
                      <div key={dmo.id} className="border rounded-md overflow-hidden">
                        <div 
                          className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleEKGSection(dmo.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <Database className="h-5 w-5 text-indigo-500" />
                            <span className="font-medium">{dmo.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Is Mapped ({mappedCount})
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Unmapped ({dmo.fields.length - mappedCount})
                              </Badge>
                            </div>
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="divide-y">
                            {filteredFields.map(field => {
                              const isTargetOfMapping = Object.values(mappings).includes(field.id);
                              const isActiveTarget = activeLine && activeLine[1] === field.id;
                              
                              return (
                                <div 
                                  key={field.id} 
                                  className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                                    isActiveTarget ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => {
                                    if (activeLine && activeLine[0]) {
                                      // If we have a source field selected
                                      createMapping(activeLine[0], field.id);
                                      setActiveLine(null);
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    {getTypeIcon(field.type)}
                                    <span>
                                      {field.name}
                                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                      {field.isPrimaryKey && (
                                        <Badge variant="outline" className="ml-2 py-0 px-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                                          PK
                                        </Badge>
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    {isTargetOfMapping ? (
                                      <Badge className="bg-green-100 text-green-800">
                                        Mapped
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-500">
                                        Not Mapped
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mapping Instructions */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-md font-medium mb-2">How to Map Fields</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
              <li>Click on a source field from the left panel</li>
              <li>Then click on a target EKG field from the right panel</li>
              <li>The mapping will be created automatically</li>
              <li>To remove a mapping, click on a mapped source field and then click "Remove Mapping"</li>
            </ol>
            
            {activeLine && activeLine[0] && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Selected: </span>
                  <span>{activeLine[0]}</span>
                  {activeLine[1] && (
                    <>
                      <span>→</span>
                      <span>{activeLine[1]}</span>
                    </>
                  )}
                </div>
                {activeLine[1] && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      removeMapping(activeLine[0]);
                      setActiveLine(null);
                    }}
                  >
                    Remove Mapping
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default Mapping;