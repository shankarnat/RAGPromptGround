import { FC, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  InfoIcon, 
  RefreshCw, 
  Database, 
  FileText, 
  List, 
  Search, 
  Type,
  Undo2
} from "lucide-react";

interface Field {
  id: number;
  name: string;
  retrievable: boolean;
  filterable: boolean;
  typehead: boolean;
}

interface EnhancedIndexingPanelProps {
  fields: Field[];
  onFieldPropertyChange: (fieldId: number, property: "retrievable" | "filterable" | "typehead", value: boolean) => void;
}

const EnhancedIndexingPanel: FC<EnhancedIndexingPanelProps> = ({
  fields,
  onFieldPropertyChange
}) => {
  const [activeTab, setActiveTab] = useState("field");
  const [recordLevelEnabled, setRecordLevelEnabled] = useState(true);
  const [createVectorEmbedding, setCreateVectorEmbedding] = useState(true);
  const [recordChunkSize, setRecordChunkSize] = useState(512);
  const [jsonPath, setJsonPath] = useState("$.fields.*");
  const [isLoading, setIsLoading] = useState(false);

  const handleSliderChange = (value: number[]) => {
    setRecordChunkSize(value[0]);
  };

  const handleApplyChanges = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleResetDefaults = () => {
    setRecordLevelEnabled(true);
    setCreateVectorEmbedding(true);
    setRecordChunkSize(512);
    setJsonPath("$.fields.*");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700 text-sm md:text-base">Indexing Configuration</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="flex px-3 pt-3 mb-0">
          <TabsTrigger value="field" className="flex-1 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span>Field Level</span>
          </TabsTrigger>
          <TabsTrigger value="record" className="flex-1 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            <span>Record Level</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1 flex items-center">
            <List className="h-4 w-4 mr-2" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <TabsContent value="field" className="p-3 md:p-4 h-full">
            <p className="text-xs text-gray-600 mb-4">
              Configure how each field is indexed to optimize search performance and accuracy.
            </p>

            <Accordion type="multiple" defaultValue={["field-selection", "retrievable", "filterable", "typehead"]} className="space-y-4">
              {/* Field Selection Section */}
              <AccordionItem value="field-selection" className="border rounded-md">
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium text-sm">Field Selection</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 bg-gray-50 mb-3 rounded-md">
                    <div className="flex space-x-2">
                      <InfoIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Select specific fields to include in your index. This allows you to focus on only the most relevant fields for your search application.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 px-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Field Name</span>
                      <span className="text-xs font-medium">Include in Index</span>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {fields.map((field) => (
                        <div 
                          key={`select-${field.id}`}
                          className="flex items-center justify-between py-1.5 border-b border-gray-100"
                        >
                          <div className="flex items-center">
                            <span className="text-xs md:text-sm text-gray-700">{field.name}</span>
                            <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              {field.retrievable ? "Retrievable" : ""}
                              {field.filterable ? (field.retrievable ? ", Filterable" : "Filterable") : ""}
                            </span>
                          </div>
                          <Switch
                            checked={field.retrievable || field.filterable || field.typehead}
                            onCheckedChange={(checked) => {
                              onFieldPropertyChange(field.id, "retrievable", checked);
                              onFieldPropertyChange(field.id, "filterable", checked);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          fields.forEach(field => {
                            onFieldPropertyChange(field.id, "retrievable", true);
                            onFieldPropertyChange(field.id, "filterable", true);
                          });
                        }}
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          fields.forEach(field => {
                            onFieldPropertyChange(field.id, "retrievable", false);
                            onFieldPropertyChange(field.id, "filterable", false);
                          });
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            
              {/* Retrievable Fields Section */}
              <AccordionItem value="retrievable" className="border rounded-md">
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Search className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium text-sm">Retrievable Fields</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 bg-gray-50 mb-3 rounded-md">
                    <div className="flex space-x-2">
                      <InfoIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Retrievable fields are returned in search results. Mark fields as retrievable if they contain information you want to display to users.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div 
                        key={`retrievable-${field.id}`}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100"
                      >
                        <span className="text-xs md:text-sm text-gray-700">{field.name}</span>
                        <Checkbox
                          checked={field.retrievable}
                          onCheckedChange={(checked) => 
                            onFieldPropertyChange(field.id, "retrievable", !!checked)
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Filterable Fields Section */}
              <AccordionItem value="filterable" className="border rounded-md">
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <List className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-medium text-sm">Filterable Fields</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 bg-gray-50 mb-3 rounded-md">
                    <div className="flex space-x-2">
                      <InfoIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Filterable fields allow users to narrow down search results based on specific criteria. Mark fields as filterable if they contain values you want to filter by.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div 
                        key={`filterable-${field.id}`}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100"
                      >
                        <span className="text-xs md:text-sm text-gray-700">{field.name}</span>
                        <Checkbox
                          checked={field.filterable}
                          onCheckedChange={(checked) => 
                            onFieldPropertyChange(field.id, "filterable", !!checked)
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Typehead Fields Section */}
              <AccordionItem value="typehead" className="border rounded-md">
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Type className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="font-medium text-sm">Typehead Fields</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 bg-gray-50 mb-3 rounded-md">
                    <div className="flex space-x-2">
                      <InfoIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Typehead fields are used for autocomplete and suggestion features. Enable this for fields where users may benefit from real-time suggestions while typing.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div 
                        key={`typehead-${field.id}`}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100"
                      >
                        <span className="text-xs md:text-sm text-gray-700">{field.name}</span>
                        <Checkbox
                          checked={field.typehead}
                          onCheckedChange={(checked) => 
                            onFieldPropertyChange(field.id, "typehead", !!checked)
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Field Indexing Summary</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Selected Fields:</span>
                  <span className="text-xs font-medium">{fields.filter(f => f.retrievable || f.filterable || f.typehead).length} / {fields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Retrievable Fields:</span>
                  <span className="text-xs font-medium">{fields.filter(f => f.retrievable).length} / {fields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Filterable Fields:</span>
                  <span className="text-xs font-medium">{fields.filter(f => f.filterable).length} / {fields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Typehead Fields:</span>
                  <span className="text-xs font-medium">{fields.filter(f => f.typehead).length} / {fields.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="record" className="p-3 md:p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-medium">Record Level Indexing</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Configure indexing settings at the record level across all fields.
                </p>
              </div>
              <div className="flex items-center">
                <Switch 
                  checked={recordLevelEnabled}
                  onCheckedChange={setRecordLevelEnabled}
                  className="mr-1.5"
                />
                <span className="text-xs text-gray-700">
                  {recordLevelEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
            <div className={`space-y-5 ${!recordLevelEnabled && "opacity-50 pointer-events-none"}`}>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-medium">Vector Embedding</h5>
                  <Switch 
                    checked={createVectorEmbedding}
                    onCheckedChange={setCreateVectorEmbedding}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Create vector embedding from record level chunks for semantic search capabilities.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Record Chunk Size (tokens)
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="w-full">
                      <Slider
                        value={[recordChunkSize]}
                        max={1024}
                        min={128}
                        step={8}
                        onValueChange={handleSliderChange}
                        className="w-full"
                        disabled={!recordLevelEnabled}
                      />
                    </div>
                    <span className="text-xs text-gray-700 w-12 text-right">{recordChunkSize}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    JSON Path for Record Fields
                  </label>
                  <Input
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    className="text-xs"
                    placeholder="$.fields.*"
                    disabled={!recordLevelEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Specify JSON path pattern to identify record fields (e.g., $.fields.*)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Record Indexing Summary</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Status:</span>
                  <span className={`text-xs font-medium ${recordLevelEnabled ? "text-green-600" : "text-red-600"}`}>
                    {recordLevelEnabled ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Vector Embedding:</span>
                  <span className={`text-xs font-medium ${createVectorEmbedding ? "text-green-600" : "text-gray-600"}`}>
                    {createVectorEmbedding ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Record Chunk Size:</span>
                  <span className="text-xs font-medium">{recordChunkSize} tokens</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="p-3 md:p-4 h-full">
            <div className="space-y-5">
              <div className="border rounded-md p-4">
                <h4 className="text-xs font-medium mb-2">JSON Structure Options</h4>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox id="flatten-json" />
                  <label htmlFor="flatten-json" className="text-xs cursor-pointer">
                    Flatten nested JSON structures
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="array-indexing" />
                  <label htmlFor="array-indexing" className="text-xs cursor-pointer">
                    Create separate indices for array elements
                  </label>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="text-xs font-medium mb-2">Optimization Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">
                      Index Refresh Interval
                    </label>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        className="text-xs" 
                        value="30" 
                        min="1"
                      />
                      <select className="text-xs rounded-md border border-gray-300 px-2">
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="text-xs font-medium mb-2">Update Behavior</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reindex-changes" checked={true} />
                    <label htmlFor="reindex-changes" className="text-xs cursor-pointer">
                      Automatically reindex on document changes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="preserve-settings" checked={true} />
                    <label htmlFor="preserve-settings" className="text-xs cursor-pointer">
                      Preserve field settings on reindex
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
        
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs flex items-center"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button 
            size="sm"
            onClick={handleApplyChanges}
            disabled={isLoading}
            className="flex-1 text-xs flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Changes'
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  );
};

export default EnhancedIndexingPanel;