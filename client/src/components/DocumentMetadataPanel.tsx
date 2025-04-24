import { FC, useState } from "react";
import { MetadataField, RecordStructure } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, PlusCircle, Edit2, Save } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface DocumentMetadataPanelProps {
  metadataFields: MetadataField[];
  onMetadataFieldChange: (fieldId: number, property: "included" | "value", value: boolean | string) => void;
  recordLevelIndexingEnabled: boolean;
  onRecordLevelIndexingToggle: (enabled: boolean) => void;
  recordStructure: RecordStructure;
  onRecordStructureChange: (structure: RecordStructure) => void;
  onAddCustomField: (name: string, value: string) => void;
}

const DocumentMetadataPanel: FC<DocumentMetadataPanelProps> = ({
  metadataFields,
  onMetadataFieldChange,
  recordLevelIndexingEnabled,
  onRecordLevelIndexingToggle,
  recordStructure,
  onRecordStructureChange,
  onAddCustomField
}) => {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [isEditingField, setIsEditingField] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmitNewField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      onAddCustomField(newFieldName, newFieldValue);
      setNewFieldName("");
      setNewFieldValue("");
    }
  };

  const handleStartEditing = (field: MetadataField) => {
    setIsEditingField(field.id);
    setEditValue(field.value);
  };

  const handleSaveEdit = (fieldId: number) => {
    onMetadataFieldChange(fieldId, "value", editValue);
    setIsEditingField(null);
    setEditValue("");
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.95) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High</Badge>;
    } else if (confidence >= 0.85) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Low</Badge>;
    }
  };

  const sortedFields = [...metadataFields].sort((a, b) => {
    // First sort by included status (included first)
    if (a.included && !b.included) return -1;
    if (!a.included && b.included) return 1;
    
    // Then sort by confidence (higher first)
    return b.confidence - a.confidence;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700 text-sm md:text-base">Document Metadata</h3>
      </div>
      
      <div className="p-3 md:p-4 overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {/* Record-Level Indexing Toggle */}
        <div className="mb-5 flex items-center space-x-2">
          <Checkbox 
            id="record-level-indexing"
            checked={recordLevelIndexingEnabled}
            onCheckedChange={(checked) => onRecordLevelIndexingToggle(checked as boolean)}
          />
          <label 
            htmlFor="record-level-indexing" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Enable Record-Level Indexing
          </label>
        </div>
        
        {recordLevelIndexingEnabled && (
          <>
            <div className="mb-5">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Record Structure</label>
              <Select
                value={recordStructure}
                onValueChange={(value) => onRecordStructureChange(value as RecordStructure)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat (all fields at root level)</SelectItem>
                  <SelectItem value="nested">Nested (grouped by categories)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Determines how metadata fields are structured in the JSON record.
              </p>
            </div>
            
            <div className="mb-3 flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Metadata Fields</h4>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                setNewFieldName("");
                setNewFieldValue("");
              }}>
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add Field
              </Button>
            </div>

            {/* New Field Form */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex flex-col space-y-2 mb-2">
                <Input 
                  placeholder="Field name" 
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="text-xs h-8"
                />
                <Input 
                  placeholder="Field value" 
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={handleSubmitNewField}
                  disabled={!newFieldName.trim() || !newFieldValue.trim()}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            {/* Metadata Fields List */}
            <div className="space-y-2 mt-3">
              {sortedFields.map((field) => (
                <div 
                  key={field.id} 
                  className={`p-2 rounded border ${field.included ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'} flex items-center space-x-2`}
                >
                  <Checkbox 
                    id={`field-${field.id}`}
                    checked={field.included}
                    onCheckedChange={(checked) => onMetadataFieldChange(field.id, "included", checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <label htmlFor={`field-${field.id}`} className="text-xs font-medium text-gray-700 truncate mr-2">
                        {field.name}
                      </label>
                      {getConfidenceBadge(field.confidence)}
                    </div>
                    
                    {isEditingField === field.id ? (
                      <div className="flex items-center mt-1">
                        <Input 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-xs h-6 mr-1"
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleSaveEdit(field.id)}
                          className="h-6 w-6 p-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate mr-2">{field.value}</p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleStartEditing(field)}
                          className="h-6 w-6 p-1"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Template Presets */}
            <div className="mt-5 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Template Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start">
                  Report Template
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start">
                  Email Template
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start">
                  Article Template
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start">
                  Contract Template
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Templates provide preset metadata fields for common document types.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentMetadataPanel;