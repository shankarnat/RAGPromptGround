import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  url: string;
  className?: string;
}

export function PdfViewer({ url, className = '' }: PdfViewerProps) {
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document.pdf';
    link.click();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError('Failed to load PDF. The file might not exist or there might be a loading issue.');
  };

  // Use the URL as-is since it's already properly encoded
  const encodedUrl = url;

  return (
    <div className={`flex flex-col h-full bg-gray-50 rounded-lg ${className}`}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div>
          <h3 className="text-sm font-medium text-gray-700">PDF Document</h3>
          <p className="text-xs text-gray-500 mt-1">URL: {url}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.open(url, '_blank')} 
            variant="outline" 
            size="sm"
          >
            Open in New Tab
          </Button>
          <Button onClick={downloadPdf} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <p className="text-gray-500">Loading PDF...</p>
          </div>
        )}
        
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
            <p className="text-red-500 mb-4">{loadError}</p>
            <div className="space-y-2">
              <Button onClick={() => window.open(url, '_blank')} variant="outline">
                Open PDF in New Tab
              </Button>
              <Button onClick={downloadPdf} variant="outline">
                Download PDF
              </Button>
            </div>
          </div>
        )}

        {/* Try multiple approaches for PDF display */}
        <iframe
          src={`${encodedUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-none"
          title="PDF Viewer"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="fullscreen"
        />
        
        {/* Fallback: If iframe fails, show embed */}
        <embed
          src={encodedUrl}
          type="application/pdf"
          className="w-full h-full hidden"
          style={{ display: loadError ? 'block' : 'none' }}
        />
      </div>
    </div>
  );
}