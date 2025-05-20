import { FC, useCallback, useState, useEffect, useRef } from "react";
import { UploadCloud, File, FileText, FileSpreadsheet, FileCode, Clock, Calendar, CloudUpload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UploadedDocument } from "@shared/schema";
import { formatFileSize, formatDate } from "@/data/sampleUploadData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadPanelProps {
  isUploading: boolean;
  uploadProgress: number;
  recentDocuments: UploadedDocument[];
  selectedDocument: UploadedDocument | null;
  onSelectDocument: (doc: UploadedDocument) => void;
  onUploadDocument: (file: File) => void;
  onDocumentClick?: (doc: UploadedDocument) => void;
}

const UploadPanel: FC<UploadPanelProps> = ({
  isUploading,
  uploadProgress,
  recentDocuments,
  selectedDocument,
  onSelectDocument,
  onUploadDocument,
  onDocumentClick
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [attentionEffect, setAttentionEffect] = useState(true);
  const recentDocumentsRef = useRef<HTMLDivElement>(null);
  
  // Set up attention-grabbing effect when component mounts
  useEffect(() => {
    // Scroll to the recent documents section
    if (recentDocumentsRef.current) {
      setTimeout(() => {
        recentDocumentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 700);
    }
    
    // Pulse effect for 5 seconds, then fade out
    const pulseTimer = setTimeout(() => {
      setAttentionEffect(false);
    }, 5000);
    
    return () => {
      clearTimeout(pulseTimer);
    };
  }, []);

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

  // Helper function to get the appropriate file icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return FileText;
      case 'csv':
      case 'xlsx':
      case 'xls':
        return FileSpreadsheet;
      case 'txt':
      case 'md':
        return FileCode;
      default:
        return File;
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <CloudUpload className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Document Ingestion Center</h2>
            <p className="text-sm text-gray-600 mt-1">Upload and manage your documents for processing</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
      
        {/* Upload area */}
        <div
          className={`relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed rounded-xl p-10 mb-8 transition-all duration-300 text-center ${
            dragActive ? "border-blue-500 bg-blue-100 shadow-lg scale-[1.02]" : "border-gray-300 hover:border-blue-400"
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
          
          <div className="flex flex-col items-center justify-center z-10">
            <div className="bg-white rounded-full p-4 shadow-md mb-4">
              <UploadCloud className={`w-12 h-12 ${dragActive ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {dragActive ? "Release to upload" : "Drag & Drop Your Document"}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              or click to browse • Supported: PDF, DOCX, TXT, MD, CSV
            </p>
            <Button
              asChild
              size="lg"
              className="shadow-sm"
            >
              <label htmlFor="file-upload">
                <FileText className="w-5 h-5 mr-2" />
                Select Files
              </label>
            </Button>
          </div>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <Card className="mb-8 border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="animate-pulse bg-blue-100 p-3 rounded-lg mr-4">
                  <CloudUpload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Uploading Document</p>
                  <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                </div>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </CardContent>
          </Card>
        )}
      
        {/* Recently uploaded files */}
        <div id="recent-documents-section" ref={recentDocumentsRef}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className={`h-5 w-5 ${attentionEffect ? 'text-blue-600 animate-pulse' : 'text-gray-600'}`} />
              <h3 className={`font-semibold ${attentionEffect ? 'text-blue-700 relative' : 'text-gray-800'}`}>
                Recent Documents
                {attentionEffect && (
                  <span className="absolute -top-1 -right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
              </h3>
            </div>
            <span className="text-sm text-gray-500">{recentDocuments.length} documents</span>
          </div>
          
          <div className={`space-y-3 ${attentionEffect ? 'relative' : ''}`}>
            {attentionEffect && (
              <div className="absolute -inset-4 bg-blue-100/50 rounded-lg border-2 border-blue-200 -z-10 animate-pulse"></div>
            )}
            {recentDocuments.map((doc) => {
              const FileIcon = getFileIcon(doc.name);
              const isSelected = selectedDocument?.id === doc.id;
              
              return (
                <Card 
                  key={doc.id}
                  className={`cursor-pointer transition-all duration-200 z-10 ${
                    isSelected 
                    ? "ring-2 ring-blue-500 shadow-lg bg-blue-50/50" 
                    : "hover:shadow-md hover:bg-gray-50/50"
                  }`}
                  onClick={() => {
                    onSelectDocument(doc);
                    if (onDocumentClick) {
                      onDocumentClick(doc);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <FileIcon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                            {doc.name}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              {formatFileSize(doc.size)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(doc.uploadDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadPanel;