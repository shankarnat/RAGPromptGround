import { FC } from "react";
import { Eye, Download } from "lucide-react";

interface DocumentPanelProps {
  documentContent: string;
}

const DocumentPanel: FC<DocumentPanelProps> = ({ documentContent }) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Original Document</h3>
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-500 hover:text-gray-700 rounded">
            <Eye className="h-5 w-5" />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700 rounded">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="h-[calc(100vh-280px)] overflow-auto p-4 bg-white">
        {documentContent.startsWith('<table') ? (
          // Handle HTML content (CSV table)
          <div dangerouslySetInnerHTML={{ __html: documentContent }} />
        ) : (
          // Handle regular text content (Financial report)
          <div className="font-mono text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {documentContent.split("\n").map((line, index) => {
              // Apply styling for headings and important content
              if (line.toUpperCase() === line && line.trim() !== "") {
                return (
                  <p key={index} className="mb-4">
                    <span className="font-semibold">{line}</span>
                  </p>
                );
              } else if (line.startsWith("•")) {
                return <p key={index} className="mb-1">{line}</p>;
              } else if (line.includes(":")) {
                const [label, value] = line.split(":");
                return (
                  <p key={index} className="mb-1">
                    <span className={line.includes("Submitted") ? "text-gray-500" : ""}>{line}</span>
                  </p>
                );
              } else {
                return line.trim() === "" ? <br key={index} /> : <p key={index} className="mb-4">{line}</p>;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPanel;
