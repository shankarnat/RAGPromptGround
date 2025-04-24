import { FC } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoIcon } from "lucide-react";

interface Field {
  id: number;
  name: string;
  retrievable: boolean;
  filterable: boolean;
  typehead: boolean;
}

interface FieldIndexingPanelProps {
  fields: Field[];
  onFieldPropertyChange: (fieldId: number, property: "retrievable" | "filterable" | "typehead", value: boolean) => void;
}

const FieldIndexingPanel: FC<FieldIndexingPanelProps> = ({
  fields,
  onFieldPropertyChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700 text-sm md:text-base">Field Indexing Configuration</h3>
      </div>
      <div className="p-3 md:p-4 overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <p className="text-xs text-gray-600 mb-4">
          Configure how each field is indexed to optimize search performance and accuracy.
        </p>

        <Accordion type="multiple" defaultValue={["retrievable", "filterable", "typehead"]} className="space-y-4">
          {/* Retrievable Fields Section */}
          <AccordionItem value="retrievable" className="border rounded-md">
            <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
              <div className="flex items-center">
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
      </div>
    </div>
  );
};

export default FieldIndexingPanel;