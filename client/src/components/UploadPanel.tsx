import { FC, useCallback, useState } from "react";
import { UploadCloud, File, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UploadedDocument } from "@shared/schema";
import { formatFileSize, formatDate } from "@/data/sampleUploadData";

interface UploadPanelProps {
  isUploading: boolean;
  uploadProgress: number;
  recentDocuments: UploadedDocument[];
  selectedDocument: UploadedDocument | null;
  onSelectDocument: (doc: UploadedDocument) => void;
  onUploadDocument: (file: File) => void;
}

const UploadPanel: FC<UploadPanelProps> = ({
  isUploading,
  uploadProgress,
  recentDocuments,
  selectedDocument,
  onSelectDocument,
  onUploadDocument
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadDocument(e.dataTransfer.files[0]);
    }
  }, [onUploadDocument]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadDocument(e.target.files[0]);
    }
  }, [onUploadDocument]);

  return (
    <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-6">Document Ingestion</h2>
      
      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 mb-8 transition-colors text-center ${
          dragActive ? "border-primary-400 bg-primary-50" : "border-gray-300 hover:border-primary-300"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx,.doc,.txt,.md,.csv"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop your document here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported files: PDF, DOCX, TXT, MD, CSV
          </p>
          <label
            htmlFor="file-upload"
            className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md cursor-pointer transition-colors"
          >
            Browse files
          </label>
        </div>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="border rounded-lg p-6 mb-8 bg-gray-50">
          <div className="flex items-center mb-4">
            <div className="animate-pulse bg-primary-100 p-2 rounded-md mr-4">
              <File className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Uploading document...</p>
              <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
            </div>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {/* Recently uploaded files */}
      <div className="mb-2">
        <h3 className="font-medium text-gray-700 mb-4">Recent Documents</h3>
        <div className="space-y-3">
          {recentDocuments.map((doc) => (
            <div 
              key={doc.id}
              className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                selectedDocument?.id === doc.id 
                ? "bg-primary-50 border-primary-200" 
                : "hover:bg-gray-50"
              }`}
              onClick={() => onSelectDocument(doc)}
            >
              <div className="flex items-center">
                <File className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.size)} • {formatDate(doc.uploadDate)}
                  </p>
                </div>
              </div>
              {selectedDocument?.id === doc.id && (
                <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;