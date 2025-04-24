import { FC, useState } from "react";
import { MetadataField, RecordStructure } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, CheckCircle, Circle } from "lucide-react";

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
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  const handleStartEditing = (field: MetadataField) => {
    setEditingFieldId(field.id);
    setEditFieldValue(field.value);
  };

  const handleSaveEdit = (fieldId: number) => {
    onMetadataFieldChange(fieldId, "value", editFieldValue);
    setEditingFieldId(null);
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      onAddCustomField(newFieldName.trim(), newFieldValue.trim());
      setNewFieldName("");
      setNewFieldValue("");
    }
  };

  const handleSelectAll = () => {
    metadataFields.forEach(field => {
      if (!field.included) {
        onMetadataFieldChange(field.id, "included", true);
      }
    });
  };

  const handleClearAll = () => {
    metadataFields.forEach(field => {
      if (field.included) {
        onMetadataFieldChange(field.id, "included", false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Record-Level Indexing</CardTitle>
            <Switch 
              id="record-indexing-toggle"
              checked={recordLevelIndexingEnabled}
              onCheckedChange={onRecordLevelIndexingToggle}
            />
          </div>
          <CardDescription>
            Create a JSON record with document metadata for enhanced search capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`space-y-3 ${!recordLevelIndexingEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <Label className="text-sm font-medium mb-2 block">Record Structure</Label>
                <RadioGroup 
                  value={recordStructure} 
                  onValueChange={(value) => onRecordStructureChange(value as RecordStructure)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flat" id="structure-flat" />
                    <Label htmlFor="structure-flat" className="cursor-pointer">Flat</Label>
                    <span className="text-xs text-gray-500 ml-2">(All fields at root level)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nested" id="structure-nested" />
                    <Label htmlFor="structure-nested" className="cursor-pointer">Nested</Label>
                    <span className="text-xs text-gray-500 ml-2">(Group by field types)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="structure-custom" />
                    <Label htmlFor="structure-custom" className="cursor-pointer">Custom</Label>
                    <span className="text-xs text-gray-500 ml-2">(Content & metadata separation)</span>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={!recordLevelIndexingEnabled ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Metadata Fields</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                className="text-xs py-1 h-7"
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
                className="text-xs py-1 h-7"
              >
                Clear All
              </Button>
            </div>
          </div>
          <CardDescription>
            Select which metadata fields to include in the document record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {metadataFields.map(field => (
              <div 
                key={field.id} 
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Switch 
                    id={`field-${field.id}`}
                    checked={field.included}
                    onCheckedChange={(checked) => onMetadataFieldChange(field.id, "included", checked)}
                  />
                  <div>
                    <Label 
                      htmlFor={`field-${field.id}`} 
                      className="font-medium cursor-pointer block"
                    >
                      {field.name}
                    </Label>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs mr-2 font-normal">
                        {field.confidence >= 0.9 ? 'High' : field.confidence >= 0.7 ? 'Medium' : 'Low'} confidence
                      </Badge>
                      {editingFieldId === field.id ? (
                        <div className="flex items-center space-x-2">
                          <Input 
                            value={editFieldValue}
                            onChange={(e) => setEditFieldValue(e.target.value)}
                            className="h-7 text-xs w-40"
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleSaveEdit(field.id)}
                            className="h-6 w-6"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleCancelEdit}
                            className="h-6 w-6"
                          >
                            <Circle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 truncate max-w-[160px]">{field.value}</span>
                      )}
                    </div>
                  </div>
                </div>
                {editingFieldId !== field.id && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleStartEditing(field)}
                    className="h-7 w-7 text-gray-400 hover:text-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <CardTitle className="text-sm mb-2">Add Custom Field</CardTitle>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input 
                placeholder="Field name" 
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="text-sm"
              />
              <Input 
                placeholder="Field value" 
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="text-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddCustomField}
                disabled={!newFieldName.trim() || !newFieldValue.trim()}
                className="h-10"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={!recordLevelIndexingEnabled ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">JSON Record Preview</CardTitle>
          <CardDescription>
            Selected fields will be included in the document record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-md p-2 text-xs">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {metadataFields.filter(f => f.included).length} fields selected
              </Badge>
              <Badge variant="outline">
                {recordStructure} structure
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm">
              {metadataFields.filter(f => f.included).length > 0 ? (
                metadataFields
                  .filter(f => f.included)
                  .map(field => (
                    <div key={field.id} className="flex">
                      <span className="font-mono text-blue-600 mr-1">"</span>
                      <span className="font-mono text-blue-600">{field.name}</span>
                      <span className="font-mono text-blue-600 mr-1">"</span>
                      <span className="font-mono mx-1">:</span>
                      <span className="font-mono text-green-600 mr-1">"</span>
                      <span className="font-mono text-green-600">{field.value}</span>
                      <span className="font-mono text-green-600">"</span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No fields selected
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentMetadataPanel;