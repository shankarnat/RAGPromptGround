import { FC, useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Upload, FileSearch, Network, FileText, ChevronRight, CheckCircle2, Circle, LayoutDashboard } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UploadPanel from "@/components/UploadPanel";
import DocumentPanel from "@/components/DocumentPanel";
import ChunksPanel from "@/components/ChunksPanel";
import DocumentHeader from "@/components/DocumentHeader";
import CombinedConfigurationPanel from "@/components/CombinedConfigurationPanel";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useToast } from "@/hooks/use-toast";

type ProcessingType = "rag" | "kg" | "idp";
type ProcessingStep = "upload" | "configure" | "process" | "results";

interface ProcessingConfig {
  rag: {
    enabled: boolean;
    chunking: boolean;
    vectorization: boolean;
    indexing: boolean;
  };
  kg: {
    enabled: boolean;
    entityExtraction: boolean;
    relationMapping: boolean;
    graphBuilding: boolean;
  };
  idp: {
    enabled: boolean;
    textExtraction: boolean;
    classification: boolean;
    metadata: boolean;
  };
}

const UnifiedDashboard: FC = () => {
  const [, navigate] = useLocation();
  const { state, selectDocument, uploadDocument, updateChunkingMethod, updateChunkSize, 
    updateChunkOverlap, updateActiveTab, selectChunk, toggleUnifiedProcessing,
    updateProcessingStatus, processDocument } = useDocumentProcessing();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("upload");
  const [activeTab, setActiveTab] = useState<ProcessingType>("rag");
  const [processingConfig, setProcessingConfig] = useState<ProcessingConfig>({
    rag: {
      enabled: state.unifiedProcessing.ragEnabled,
      chunking: true,
      vectorization: true,
      indexing: true,
    },
    kg: {
      enabled: state.unifiedProcessing.kgEnabled,
      entityExtraction: true,
      relationMapping: true,
      graphBuilding: true,
    },
    idp: {
      enabled: state.unifiedProcessing.idpEnabled,
      textExtraction: true,
      classification: false,
      metadata: true,
    },
  });

  const processingTypes = [
    { id: "rag", label: "RAG Search", icon: FileSearch, description: "Vector-based search with retrieval" },
    { id: "kg", label: "Knowledge Graph", icon: Network, description: "Entity and relation extraction" },
    { id: "idp", label: "Document Processing", icon: FileText, description: "Advanced document analysis" },
  ];

  const steps: { id: ProcessingStep; label: string; icon: typeof Circle }[] = [
    { id: "upload", label: "Upload Document", icon: Circle },
    { id: "configure", label: "Configure Processing", icon: Circle },
    { id: "process", label: "Process Document", icon: Circle },
    { id: "results", label: "View Results", icon: Circle },
  ];

  const handleProcessingToggle = (type: ProcessingType, enabled: boolean) => {
    setProcessingConfig(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled }
    }));
    toggleUnifiedProcessing(type, enabled);
  };

  const handleOptionToggle = (type: ProcessingType, option: string, enabled: boolean) => {
    setProcessingConfig(prev => ({
      ...prev,
      [type]: { ...prev[type], [option]: enabled }
    }));
  };

  const goToStep = (step: ProcessingStep) => {
    setCurrentStep(step);
  };

  const handleProcessDocument = async () => {
    if (!state.selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please upload a document first.",
        variant: "destructive"
      });
      return;
    }

    const enabledProcessing = Object.entries(processingConfig)
      .filter(([_, config]) => config.enabled)
      .map(([type]) => type);

    if (enabledProcessing.length === 0) {
      toast({
        title: "No Processing Selected",
        description: "Please enable at least one processing type.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Processing Started",
      description: `Processing document with: ${enabledProcessing.join(", ").toUpperCase()}`,
    });

    setCurrentStep("process");
    await processDocument();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
        const Icon = isCompleted ? CheckCircle2 : Circle;
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => isCompleted && goToStep(step.id)}
              className={`flex items-center space-x-2 font-medium transition-colors
                ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}
                ${isCompleted ? "cursor-pointer hover:text-green-700" : "cursor-default"}`}
            >
              <Icon className="w-5 h-5" />
              <span>{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 mx-4 text-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Upload Document</h2>
              <p className="text-gray-600">Upload a document to process across multiple analysis methods</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UploadPanel
                  isUploading={state.isUploading}
                  uploadProgress={state.uploadProgress}
                  recentDocuments={state.recentDocuments}
                  selectedDocument={state.selectedDocument}
                  onSelectDocument={selectDocument}
                  onUploadDocument={uploadDocument}
                />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Types</CardTitle>
                    <CardDescription>Select which processing methods to apply</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {processingTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <div key={type.id} className="flex items-start space-x-3">
                          <Checkbox
                            checked={processingConfig[type.id as ProcessingType].enabled}
                            onCheckedChange={(checked) => 
                              handleProcessingToggle(type.id as ProcessingType, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{type.label}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!state.selectedDocument}
                  onClick={() => goToStep("configure")}
                >
                  Next: Configure Processing
                </Button>
              </div>
            </div>
          </div>
        );

      case "configure":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Configure Processing</h2>
              <p className="text-gray-600">Configure options for each selected processing type</p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProcessingType)}>
              <TabsList className="grid w-full grid-cols-3">
                {processingTypes.map(type => (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    disabled={!processingConfig[type.id as ProcessingType].enabled}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="rag" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>RAG Configuration</CardTitle>
                    <CardDescription>Configure retrieval-augmented generation settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.rag.chunking}
                          onCheckedChange={(checked) => 
                            handleOptionToggle("rag", "chunking", checked as boolean)
                          }
                        />
                        <label>Enable Document Chunking</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.rag.vectorization}
                          onCheckedChange={(checked) => 
                            handleOptionToggle("rag", "vectorization", checked as boolean)
                          }
                        />
                        <label>Enable Vectorization</label>
                      </div>
                    </div>

                    {processingConfig.rag.chunking && (
                      <CombinedConfigurationPanel
                        processingMode={state.processingMode}
                        chunkingMethod={state.chunkingMethod}
                        chunkSize={state.chunkSize}
                        chunkOverlap={state.chunkOverlap}
                        metadataFields={state.metadataFields}
                        recordLevelIndexingEnabled={state.recordLevelIndexingEnabled}
                        recordStructure={state.recordStructure}
                        onProcessingModeChange={() => {}}
                        onChunkingMethodChange={updateChunkingMethod}
                        onChunkSizeChange={updateChunkSize}
                        onChunkOverlapChange={updateChunkOverlap}
                        onMetadataFieldChange={() => {}}
                        onRecordLevelIndexingToggle={() => {}}
                        onRecordStructureChange={() => {}}
                        onAddCustomField={() => {}}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="kg" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Graph Configuration</CardTitle>
                    <CardDescription>Configure knowledge graph construction settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.kg.entityExtraction}
                          onCheckedChange={(checked) => 
                            handleOptionToggle("kg", "entityExtraction", checked as boolean)
                          }
                        />
                        <label>Entity Extraction</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.kg.relationMapping}
                          onCheckedChange={(checked) => 
                            handleOptionToggle("kg", "relationMapping", checked as boolean)
                          }
                        />
                        <label>Relation Mapping</label>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Knowledge graph settings will be configured here. 
                        This will include entity types, relation types, and extraction models.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="idp" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Processing Configuration</CardTitle>
                    <CardDescription>Configure intelligent document processing settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.idp.textExtraction}
                          onCheckedChange={(checked) => 
                            handleOptionToggle("idp", "textExtraction", checked as boolean)
                          }
                        />
                        <label>Text Extraction</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.idp.classification}
                          onCheckedChange={(checked) => 
                            handleOptionToggle("idp", "classification", checked as boolean)
                          }
                        />
                        <label>Document Classification</label>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Document processing settings will be configured here. 
                        This will include OCR settings, classification models, and extraction rules.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => goToStep("upload")}
              >
                Back: Upload Document
              </Button>
              <Button 
                size="lg"
                onClick={handleProcessDocument}
              >
                Process Document
              </Button>
            </div>
          </div>
        );

      case "process":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Processing Document</h2>
              <p className="text-gray-600">Your document is being processed with the selected methods</p>
            </div>

            <Card>
              <CardContent className="py-8">
                <div className="space-y-6">
                  {state.unifiedProcessing.ragEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">RAG Processing</span>
                        <Badge variant={
                          state.unifiedProcessing.processingStatus.rag === "completed" ? "default" :
                          state.unifiedProcessing.processingStatus.rag === "processing" ? "secondary" :
                          state.unifiedProcessing.processingStatus.rag === "error" ? "destructive" :
                          "outline"
                        }>
                          {state.unifiedProcessing.processingStatus.rag}
                        </Badge>
                      </div>
                      <Progress 
                        value={
                          state.unifiedProcessing.processingStatus.rag === "completed" ? 100 :
                          state.unifiedProcessing.processingStatus.rag === "processing" ? 50 :
                          0
                        } 
                        className="h-2" 
                      />
                      <p className="text-sm text-gray-500">
                        {state.unifiedProcessing.processingStatus.rag === "completed" ? "Chunking and vectorization complete" :
                         state.unifiedProcessing.processingStatus.rag === "processing" ? "Chunking and vectorizing document..." :
                         "Waiting to start..."}
                      </p>
                    </div>
                  )}

                  {state.unifiedProcessing.kgEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Knowledge Graph</span>
                        <Badge variant={
                          state.unifiedProcessing.processingStatus.kg === "completed" ? "default" :
                          state.unifiedProcessing.processingStatus.kg === "processing" ? "secondary" :
                          state.unifiedProcessing.processingStatus.kg === "error" ? "destructive" :
                          "outline"
                        }>
                          {state.unifiedProcessing.processingStatus.kg}
                        </Badge>
                      </div>
                      <Progress 
                        value={
                          state.unifiedProcessing.processingStatus.kg === "completed" ? 100 :
                          state.unifiedProcessing.processingStatus.kg === "processing" ? 50 :
                          0
                        } 
                        className="h-2" 
                      />
                      <p className="text-sm text-gray-500">
                        {state.unifiedProcessing.processingStatus.kg === "completed" ? "Entity extraction complete" :
                         state.unifiedProcessing.processingStatus.kg === "processing" ? "Extracting entities and relations..." :
                         "Waiting to start..."}
                      </p>
                    </div>
                  )}

                  {state.unifiedProcessing.idpEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Document Processing</span>
                        <Badge variant={
                          state.unifiedProcessing.processingStatus.idp === "completed" ? "default" :
                          state.unifiedProcessing.processingStatus.idp === "processing" ? "secondary" :
                          state.unifiedProcessing.processingStatus.idp === "error" ? "destructive" :
                          "outline"
                        }>
                          {state.unifiedProcessing.processingStatus.idp}
                        </Badge>
                      </div>
                      <Progress 
                        value={
                          state.unifiedProcessing.processingStatus.idp === "completed" ? 100 :
                          state.unifiedProcessing.processingStatus.idp === "processing" ? 50 :
                          0
                        } 
                        className="h-2" 
                      />
                      <p className="text-sm text-gray-500">
                        {state.unifiedProcessing.processingStatus.idp === "completed" ? "Document analysis complete" :
                         state.unifiedProcessing.processingStatus.idp === "processing" ? "Analyzing document..." :
                         "Waiting to start..."}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-center">
                  <Button 
                    size="lg"
                    onClick={() => goToStep("results")}
                    disabled={
                      Object.values(state.unifiedProcessing.processingStatus).some(status => status === "processing")
                    }
                  >
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "results":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Processing Results</h2>
              <p className="text-gray-600">View and explore the results from all processing methods</p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProcessingType)}>
              <TabsList className="grid w-full grid-cols-3">
                {processingTypes.map(type => (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    disabled={!processingConfig[type.id as ProcessingType].enabled}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="rag" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ChunksPanel
                      chunks={state.chunks}
                      selectedChunk={state.selectedChunk}
                      onSelectChunk={selectChunk}
                    />
                  </div>
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>RAG Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Chunks</p>
                          <p className="text-2xl font-semibold">{state.chunks.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Average Chunk Size</p>
                          <p className="text-2xl font-semibold">150 tokens</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Vector Dimensions</p>
                          <p className="text-2xl font-semibold">768</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="kg" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Graph Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Knowledge graph visualization will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="idp" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Processing Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Extracted Metadata</h4>
                        <p className="text-sm text-gray-600">Document metadata will be displayed here</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Classification Results</h4>
                        <p className="text-sm text-gray-600">Document classification results will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar activePage="unified" />
      
      <div className="flex-1 flex flex-col ml-64">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">Unified Document Processing</h1>
        </header>
        
        {renderStepIndicator()}
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UnifiedDashboard;