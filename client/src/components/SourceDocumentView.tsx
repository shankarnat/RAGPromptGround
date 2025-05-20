import React, { FC } from 'react';
import { FileText } from 'lucide-react';
import { UploadedDocument } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';

interface SourceDocumentViewProps {
  document: UploadedDocument | null;
}

const SourceDocumentView: FC<SourceDocumentViewProps> = ({ document }) => {
  if (!document) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No document selected</p>
        </CardContent>
      </Card>
    );
  }

  // In a real implementation, this would fetch and render the actual document content
  // For this example, we'll just show placeholder content
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold">Source Document</h2>
      </div>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">{document.name}</h3>
          
          <div className="prose max-w-none">
            <p>This is the content of the document "{document.name}". In a real implementation, this would display the actual document content.</p>
            
            <p>The document was uploaded on {new Date(document.uploadDate).toLocaleDateString()} and is {(document.size / 1024).toFixed(2)} KB in size.</p>
            
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h4 className="font-medium mb-2">Sample Content:</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maecenas vehicula, felis at feugiat faucibus, sem neque fermentum urna, nec faucibus nulla nisi vel tortor.</p>
              <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceDocumentView;