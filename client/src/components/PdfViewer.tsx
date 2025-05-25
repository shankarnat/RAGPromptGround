import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  url: string;
  className?: string;
}

export function PdfViewer({ url, className = '' }: PdfViewerProps) {
  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document.pdf';
    link.click();
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 rounded-lg ${className}`}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h3 className="text-sm font-medium text-gray-700">PDF Document</h3>
        <Button onClick={downloadPdf} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* PDF Document - Using iframe for simple PDF display */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full border-none"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}