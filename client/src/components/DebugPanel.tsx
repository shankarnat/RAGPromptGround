import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DebugPanelProps {
  processingConfig: any;
  conversationState?: any;
  className?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  processingConfig,
  conversationState,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Processing Configuration</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(processingConfig, null, 2)}
              </pre>
            </div>
            
            {processingConfig.rag?.multimodal && (
              <div>
                <h3 className="font-semibold mb-2">Multimodal Settings</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={processingConfig.rag.multimodal.transcription ? "default" : "secondary"}>
                      Transcription: {processingConfig.rag.multimodal.transcription ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={processingConfig.rag.multimodal.ocr ? "default" : "secondary"}>
                      OCR: {processingConfig.rag.multimodal.ocr ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={processingConfig.rag.multimodal.imageCaption ? "default" : "secondary"}>
                      Image Caption: {processingConfig.rag.multimodal.imageCaption ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={processingConfig.rag.multimodal.visualAnalysis ? "default" : "secondary"}>
                      Visual Analysis: {processingConfig.rag.multimodal.visualAnalysis ? "ON" : "OFF"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {conversationState && (
              <div>
                <h3 className="font-semibold mb-2">Conversation State</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify({
                    step: conversationState.conversationStep,
                    multimodalPreferences: conversationState.multimodalPreferences,
                    isComplete: conversationState.isComplete
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};