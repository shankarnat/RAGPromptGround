import { FC, useState, useEffect } from "react";
import { useLocation } from "wouter";
// import Sidebar from "@/components/Sidebar"; // Removed sidebar
import UploadPanel from "@/components/UploadPanel";
import DataModelPanel from "@/components/DataModelPanel";
import ProcessingPipelineVisualization from "@/components/ProcessingPipelineVisualization";
import ConversationPanel from "@/components/ConversationPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { 
  FileText, 
  Network, 
  Database,
  FileSearch,
  BrainCircuit,
  Zap,
  Info,
  CheckCircle,
  Settings,
  ArrowRight,
  Sparkles,
  FileImage,
  FileSpreadsheet,
  FileCode,
  File,
  AlertCircle
} from "lucide-react";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useToast } from "@/hooks/use-toast";

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

interface DocumentTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  recommendedProcessing: {
    rag: boolean;
    kg: boolean;
    idp: boolean;
  };
  examples: string[];
}

const DocumentUploadEnhanced: FC = () => {
  const { 
    state, 
    selectDocument, 
    selectDataModel, 
    uploadDocument, 
    navigateToParseChunk,
    toggleProcessingType,
    runUnifiedProcessing 
  } = useDocumentProcessing();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [processingConfig, setProcessingConfig] = useState<ProcessingConfig>({
    rag: {
      enabled: true,
      chunking: true,
      vectorization: true,
      indexing: true
    },
    kg: {
      enabled: false,
      entityExtraction: true,
      relationMapping: true,
      graphBuilding: true
    },
    idp: {
      enabled: false,
      textExtraction: true,
      classification: false,
      metadata: true
    }
  });

  const [detectedDocumentType, setDetectedDocumentType] = useState<string>("generic");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");

  // Document type configurations
  const documentTypes: DocumentTypeConfig[] = [
    {
      id: "financial",
      name: "Financial Report",
      description: "Annual reports, earnings statements, financial disclosures",
      icon: FileSpreadsheet,
      recommendedProcessing: { rag: true, kg: true, idp: true },
      examples: ["annual_report_2023.pdf", "earnings_statement_q4.pdf", "financial_disclosure.pdf"]
    },
    {
      id: "research",
      name: "Research Paper",
      description: "Academic papers, scientific articles, white papers",
      icon: FileText,
      recommendedProcessing: { rag: true, kg: true, idp: false },
      examples: ["research_paper.pdf", "scientific_article.pdf", "whitepaper_ai.pdf"]
    },
    {
      id: "legal",
      name: "Legal Document",
      description: "Contracts, agreements, legal briefs",
      icon: FileText,
      recommendedProcessing: { rag: true, kg: false, idp: true },
      examples: ["contract_agreement.pdf", "legal_brief.pdf", "terms_of_service.pdf"]
    },
    {
      id: "technical",
      name: "Technical Documentation",
      description: "API docs, user manuals, technical specs",
      icon: FileCode,
      recommendedProcessing: { rag: true, kg: false, idp: false },
      examples: ["api_documentation.pdf", "user_manual.pdf", "technical_specs.pdf"]
    },
    {
      id: "media",
      name: "Media Content",
      description: "Images, presentations, infographics",
      icon: FileImage,
      recommendedProcessing: { rag: false, kg: false, idp: true },
      examples: ["presentation.pptx", "infographic.png", "diagram.jpg"]
    },
    {
      id: "generic",
      name: "Generic Document",
      description: "Any other document type",
      icon: File,
      recommendedProcessing: { rag: true, kg: false, idp: false },
      examples: ["document.pdf", "file.docx", "text.txt"]
    }
  ];

  // Processing presets
  const processingPresets = {
    "custom": {
      name: "Custom",
      description: "Configure each option manually",
      config: {}
    },
    "comprehensive": {
      name: "Comprehensive Analysis",
      description: "All processing methods for complete document understanding",
      config: {
        rag: { enabled: true, chunking: true, vectorization: true, indexing: true },
        kg: { enabled: true, entityExtraction: true, relationMapping: true, graphBuilding: true },
        idp: { enabled: true, textExtraction: true, classification: true, metadata: true }
      }
    },
    "search-only": {
      name: "Search Optimized",
      description: "Optimized for document search and retrieval",
      config: {
        rag: { enabled: true, chunking: true, vectorization: true, indexing: true },
        kg: { enabled: false, entityExtraction: false, relationMapping: false, graphBuilding: false },
        idp: { enabled: false, textExtraction: false, classification: false, metadata: false }
      }
    },
    "insights": {
      name: "Knowledge Insights",
      description: "Entity and relationship extraction for knowledge discovery",
      config: {
        rag: { enabled: false, chunking: false, vectorization: false, indexing: false },
        kg: { enabled: true, entityExtraction: true, relationMapping: true, graphBuilding: true },
        idp: { enabled: true, textExtraction: true, classification: false, metadata: true }
      }
    },
    "quick-extract": {
      name: "Quick Extract",
      description: "Fast text and metadata extraction",
      config: {
        rag: { enabled: false, chunking: false, vectorization: false, indexing: false },
        kg: { enabled: false, entityExtraction: false, relationMapping: false, graphBuilding: false },
        idp: { enabled: true, textExtraction: true, classification: false, metadata: true }
      }
    }
  };

  // Detect document type based on file extension and name
  useEffect(() => {
    if (state.selectedDocument) {
      const fileName = state.selectedDocument.name.toLowerCase();
      const extension = fileName.split('.').pop();
      
      if (fileName.includes('financial') || fileName.includes('earnings') || fileName.includes('annual')) {
        setDetectedDocumentType('financial');
      } else if (fileName.includes('research') || fileName.includes('paper') || fileName.includes('study')) {
        setDetectedDocumentType('research');
      } else if (fileName.includes('contract') || fileName.includes('agreement') || fileName.includes('legal')) {
        setDetectedDocumentType('legal');
      } else if (fileName.includes('api') || fileName.includes('manual') || fileName.includes('documentation')) {
        setDetectedDocumentType('technical');
      } else if (['png', 'jpg', 'jpeg', 'gif', 'pptx', 'ppt'].includes(extension || '')) {
        setDetectedDocumentType('media');
      } else {
        setDetectedDocumentType('generic');
      }
    }
  }, [state.selectedDocument]);

  // Apply document type recommendations
  const applyDocumentTypeRecommendations = (typeId: string) => {
    const docType = documentTypes.find(t => t.id === typeId);
    if (docType) {
      setProcessingConfig({
        rag: {
          ...processingConfig.rag,
          enabled: docType.recommendedProcessing.rag
        },
        kg: {
          ...processingConfig.kg,
          enabled: docType.recommendedProcessing.kg
        },
        idp: {
          ...processingConfig.idp,
          enabled: docType.recommendedProcessing.idp
        }
      });
    }
  };

  // Apply preset configuration
  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = processingPresets[presetId as keyof typeof processingPresets];
    if (preset.config && Object.keys(preset.config).length > 0) {
      setProcessingConfig(preset.config as ProcessingConfig);
    }
  };

  // Update processing configuration
  const updateProcessingConfig = (type: 'rag' | 'kg' | 'idp', config: any) => {
    setProcessingConfig(prev => ({
      ...prev,
      [type]: { ...prev[type], ...config }
    }));
    setSelectedPreset('custom');
  };

  // Toggle processing type
  const handleToggleProcessing = (type: 'rag' | 'kg' | 'idp', enabled: boolean) => {
    updateProcessingConfig(type, { enabled });
    toggleProcessingType(type === 'rag' ? 'standard' : type);
  };

  // Process with all selected types
  const handleProcessWithAll = async () => {
    if (!state.selectedDocument) {
      toast({
        title: "Document Required",
        description: "Please upload or select a document to process.",
        variant: "destructive"
      });
      return;
    }

    const enabledTypes = [];
    if (processingConfig.rag.enabled) enabledTypes.push('RAG');
    if (processingConfig.kg.enabled) enabledTypes.push('KG');
    if (processingConfig.idp.enabled) enabledTypes.push('IDP');

    if (enabledTypes.length === 0) {
      toast({
        title: "No Processing Selected",
        description: "Please select at least one processing type.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Processing Started",
      description: `Processing document with: ${enabledTypes.join(', ')}`,
    });

    await runUnifiedProcessing();
    navigate('/unified?step=process');
  };

  // Handle standard next button (legacy flow)
  const handleNext = () => {
    if (!state.selectedDocument) {
      toast({
        title: "Document Required",
        description: "Please upload or select a document to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!state.selectedDataModel) {
      toast({
        title: "Data Model Required",
        description: "Please select a data model to continue.",
        variant: "destructive"
      });
      return;
    }

    navigateToParseChunk();
    navigate('/parse-chunk');
    
    toast({
      title: "Document Ready",
      description: "Now you can parse and chunk your document.",
    });
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar removed - full width layout */}
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">Enhanced Document Upload</h1>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Upload Panel - Takes up more space when no document selected */}
            <div className={state.selectedDocument ? "xl:col-span-1" : "xl:col-span-2"}>
              <UploadPanel 
                isUploading={state.isUploading}
                uploadProgress={state.uploadProgress}
                recentDocuments={state.recentDocuments}
                selectedDocument={state.selectedDocument}
                onSelectDocument={selectDocument}
                onUploadDocument={uploadDocument}
              />
              
              {/* Document Type Detection */}
              {state.selectedDocument && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Document Analysis</CardTitle>
                    <CardDescription>Detected document type and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Detected as <strong>{documentTypes.find(t => t.id === detectedDocumentType)?.name}</strong>
                        {' '}based on filename and extension.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {documentTypes.slice(0, 4).map(docType => {
                        const Icon = docType.icon;
                        const isSelected = detectedDocumentType === docType.id;
                        return (
                          <button
                            key={docType.id}
                            onClick={() => {
                              setDetectedDocumentType(docType.id);
                              applyDocumentTypeRecommendations(docType.id);
                            }}
                            className={`p-3 rounded-lg border transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                              <div className="text-left">
                                <div className="font-medium text-sm">{docType.name}</div>
                                <div className="text-xs text-gray-500">{docType.description}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Configuration Panel */}
            <div className={state.selectedDocument ? "xl:col-span-1 space-y-6" : "space-y-6"}>
              {/* Processing Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Configuration</CardTitle>
                  <CardDescription>Select processing types and presets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Presets */}
                  <div>
                    <Label>Quick Presets</Label>
                    <Select value={selectedPreset} onValueChange={applyPreset}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(processingPresets).map(([id, preset]) => (
                          <SelectItem key={id} value={id}>
                            <div>
                              <div className="font-medium">{preset.name}</div>
                              <div className="text-xs text-gray-500">{preset.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Processing Types */}
                  <div className="space-y-3">
                    {/* RAG */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileSearch className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">RAG Search</div>
                          <div className="text-xs text-gray-500">Vector search & retrieval</div>
                        </div>
                      </div>
                      <Switch
                        checked={processingConfig.rag.enabled}
                        onCheckedChange={(checked) => handleToggleProcessing('rag', checked)}
                      />
                    </div>

                    {/* Knowledge Graph */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Network className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Knowledge Graph</div>
                          <div className="text-xs text-gray-500">Entity & relationship extraction</div>
                        </div>
                      </div>
                      <Switch
                        checked={processingConfig.kg.enabled}
                        onCheckedChange={(checked) => handleToggleProcessing('kg', checked)}
                      />
                    </div>

                    {/* IDP */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BrainCircuit className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Document Intelligence</div>
                          <div className="text-xs text-gray-500">Metadata & classification</div>
                        </div>
                      </div>
                      <Switch
                        checked={processingConfig.idp.enabled}
                        onCheckedChange={(checked) => handleToggleProcessing('idp', checked)}
                      />
                    </div>
                  </div>

                  {/* Advanced Configuration Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvancedConfig ? 'Hide' : 'Show'} Advanced Options
                  </Button>
                </CardContent>
              </Card>

              {/* Data Model Selection (Legacy) */}
              {showAdvancedConfig && (
                <DataModelPanel 
                  dataModels={state.dataModels}
                  selectedDataModel={state.selectedDataModel}
                  onSelectDataModel={selectDataModel}
                />
              )}
            </div>
            
            {/* Conversation Panel - Shows only when document is selected */}
            {state.selectedDocument && (
              <div className="xl:col-span-1">
                <ConversationPanel 
                  documentName={state.selectedDocument.name}
                  onProcessingRequest={(type) => {
                    // Enable the requested processing type
                    if (type === 'rag') {
                      updateProcessingConfig('rag', { enabled: true });
                    } else if (type === 'kg') {
                      updateProcessingConfig('kg', { enabled: true });
                    } else if (type === 'idp') {
                      updateProcessingConfig('idp', { enabled: true });
                    }
                    
                    toast({
                      title: "Processing Enabled",
                      description: `${type.toUpperCase()} processing has been enabled based on your request.`
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Advanced Configuration */}
          {showAdvancedConfig && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>Fine-tune processing options for each type</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="rag">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rag" disabled={!processingConfig.rag.enabled}>
                      <FileSearch className="h-4 w-4 mr-2" />
                      RAG
                    </TabsTrigger>
                    <TabsTrigger value="kg" disabled={!processingConfig.kg.enabled}>
                      <Network className="h-4 w-4 mr-2" />
                      Knowledge Graph
                    </TabsTrigger>
                    <TabsTrigger value="idp" disabled={!processingConfig.idp.enabled}>
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      IDP
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="rag" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.rag.chunking}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('rag', { chunking: checked })
                          }
                        />
                        <Label>Enable Chunking</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.rag.vectorization}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('rag', { vectorization: checked })
                          }
                        />
                        <Label>Enable Vectorization</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.rag.indexing}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('rag', { indexing: checked })
                          }
                        />
                        <Label>Enable Indexing</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="kg" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.kg.entityExtraction}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('kg', { entityExtraction: checked })
                          }
                        />
                        <Label>Entity Extraction</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.kg.relationMapping}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('kg', { relationMapping: checked })
                          }
                        />
                        <Label>Relation Mapping</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.kg.graphBuilding}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('kg', { graphBuilding: checked })
                          }
                        />
                        <Label>Graph Building</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="idp" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.idp.textExtraction}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('idp', { textExtraction: checked })
                          }
                        />
                        <Label>Text Extraction</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.idp.classification}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('idp', { classification: checked })
                          }
                        />
                        <Label>Document Classification</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={processingConfig.idp.metadata}
                          onCheckedChange={(checked) => 
                            updateProcessingConfig('idp', { metadata: checked })
                          }
                        />
                        <Label>Metadata Extraction</Label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <div>
              {state.selectedDocument && (
                <div className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{state.selectedDocument.name}</span>
                  {' '}({(state.selectedDocument.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                size="lg"
                onClick={handleNext}
                disabled={!state.selectedDocument || !state.selectedDataModel}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Standard Flow
              </Button>
              
              <Button 
                size="lg"
                onClick={handleProcessWithAll}
                disabled={!state.selectedDocument || (!processingConfig.rag.enabled && !processingConfig.kg.enabled && !processingConfig.idp.enabled)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Process with Selected Types
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentUploadEnhanced;