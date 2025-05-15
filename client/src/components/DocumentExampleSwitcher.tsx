import { FC } from "react";
import { FileText, Table, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DocumentExample = "financialReport" | "financialCsv";

interface DocumentExampleSwitcherProps {
  currentExample: DocumentExample;
  onExampleChange: (example: DocumentExample) => void;
}

const DocumentExampleSwitcher: FC<DocumentExampleSwitcherProps> = ({
  currentExample,
  onExampleChange
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100 mb-4">
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Example Document Type:</span>
        <Tabs
          value={currentExample}
          onValueChange={(value) => onExampleChange(value as DocumentExample)}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="financialReport" className="text-xs h-7 px-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Financial Report</span>
            </TabsTrigger>
            <TabsTrigger value="financialCsv" className="text-xs h-7 px-2 flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5" />
              <span>CSV Data</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="text-xs text-gray-600">
        {currentExample === "financialReport" ? (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Financial Report Example</p>
              <p>A narrative financial report document with sections like Executive Summary, Revenue Breakdown, etc. 
              Each section becomes a chunk based on semantic meaning.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <Table className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">CSV Structured Data Example</p>
              <p>A CSV file with financial transaction data where <strong>each text field in each row becomes a separate chunk</strong>. 
              This field-level chunking shows how structured data can be processed at its most granular level.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentExampleSwitcher;