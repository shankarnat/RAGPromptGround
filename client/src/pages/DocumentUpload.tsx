import { FC, useState, useEffect } from "react";
import { useLocation } from "wouter";
// import Sidebar from "@/components/Sidebar"; // Removed sidebar
import UploadPanel from "@/components/UploadPanel";
import DataModelPanel from "@/components/DataModelPanel";
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
import TemplateSystem from "@/components/TemplateSystem";

const DocumentUpload: FC = () => {
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

  // Enhanced state for unified processing
  const [showUnifiedProcessing, setShowUnifiedProcessing] = useState(true);
  const [selectedProcessingTypes, setSelectedProcessingTypes] = useState({
    rag: true,
    kg: false,
    idp: false
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [detectedDocumentType, setDetectedDocumentType] = useState("generic");

  // Processing presets
  const processingPresets = {
    "custom": {
      name: "Custom Configuration",
      description: "Configure each option manually",
      config: { rag: false, kg: false, idp: false }
    },
    "all": {
      name: "Process with All",
      description: "Use all available processing types",
      config: { rag: true, kg: true, idp: true }
    },
    "search": {
      name: "Search Optimized",
      description: "Optimized for document search",
      config: { rag: true, kg: false, idp: false }
    },
    "insights": {
      name: "Knowledge Insights",
      description: "Extract entities and relationships",
      config: { rag: false, kg: true, idp: true }
    },
    "quick": {
      name: "Quick Extract",
      description: "Fast metadata extraction",
      config: { rag: false, kg: false, idp: true }
    }
  };

  // Document type configurations
  const documentTypes = [
    {
      id: "financial",
      name: "Financial Document",
      icon: FileSpreadsheet,
      extensions: ["xlsx", "xls", "csv"],
      keywords: ["financial", "earnings", "annual", "report"],
      recommended: { rag: true, kg: true, idp: true }
    },
    {
      id: "research",
      name: "Research Paper",
      icon: FileText,
      extensions: ["pdf", "tex"],
      keywords: ["research", "paper", "study", "abstract"],
      recommended: { rag: true, kg: true, idp: false }
    },
    {
      id: "technical",
      name: "Technical Documentation",
      icon: FileCode,
      extensions: ["md", "rst", "mdx"],
      keywords: ["api", "documentation", "manual", "guide"],
      recommended: { rag: true, kg: false, idp: false }
    },
    {
      id: "media",
      name: "Media Content",
      icon: FileImage,
      extensions: ["png", "jpg", "jpeg", "gif", "ppt", "pptx"],
      keywords: ["presentation", "slide", "image"],
      recommended: { rag: false, kg: false, idp: true }
    },
    {
      id: "generic",
      name: "Generic Document",
      icon: File,
      extensions: ["pdf", "doc", "docx", "txt"],
      keywords: [],
      recommended: { rag: true, kg: false, idp: false }
    }
  ];

  // Detect document type based on filename and extension
  useEffect(() => {
    if (state.selectedDocument) {
      const filename = state.selectedDocument.name.toLowerCase();
      const extension = filename.split('.').pop() || '';
      
      // Check by extension first
      let detectedType = documentTypes.find(type => 
        type.extensions.includes(extension)
      );
      
      // If not found by extension, check by keywords
      if (!detectedType || detectedType.id === 'generic') {
        detectedType = documentTypes.find(type =>
          type.keywords.some(keyword => filename.includes(keyword))
        ) || documentTypes.find(t => t.id === 'generic');
      }
      
      if (detectedType) {
        setDetectedDocumentType(detectedType.id);
        // Apply recommendations if no preset is selected
        if (selectedPreset === 'custom') {
          setSelectedProcessingTypes(detectedType.recommended);
        }
      }
    }
  }, [state.selectedDocument]);

  // Apply preset configuration
  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = processingPresets[presetId as keyof typeof processingPresets];
    if (preset.config && Object.keys(preset.config).length > 0) {
      setSelectedProcessingTypes({
        rag: preset.config.rag || false,
        kg: preset.config.kg || false,
        idp: preset.config.idp || false
      });
    }
  };

  // Toggle processing type
  const handleToggleProcessing = (type: 'rag' | 'kg' | 'idp') => {
    const newState = { ...selectedProcessingTypes, [type]: !selectedProcessingTypes[type] };
    setSelectedProcessingTypes(newState);
    setSelectedPreset('custom');
    // Update the actual processing state
    toggleProcessingType(type === 'rag' ? 'standard' : type);
  };

  // Handle unified processing
  const handleProcessWithSelected = async () => {
    if (!state.selectedDocument) {
      toast({
        title: "Document Required",
        description: "Please upload or select a document to process.",
        variant: "destructive"
      });
      return;
    }

    const enabledTypes = [];
    if (selectedProcessingTypes.rag) enabledTypes.push('RAG');
    if (selectedProcessingTypes.kg) enabledTypes.push('KG');
    if (selectedProcessingTypes.idp) enabledTypes.push('IDP');

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

    // Apply selected types to state
    if (selectedProcessingTypes.rag) toggleProcessingType('standard');
    if (selectedProcessingTypes.kg) toggleProcessingType('kg');
    if (selectedProcessingTypes.idp) toggleProcessingType('idp');

    // Run processing
    await runUnifiedProcessing();
    navigate('/unified?step=results');
  };

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

    // Update state and navigate to Parse & Chunk
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
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-gray-800">Document Ingestion</h1>
            <Switch
              checked={showUnifiedProcessing}
              onCheckedChange={setShowUnifiedProcessing}
              aria-label="Toggle unified processing"
            />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Upload Panel */}
            <div className="xl:col-span-2">
              <UploadPanel 
                isUploading={state.isUploading}
                uploadProgress={state.uploadProgress}
                recentDocuments={state.recentDocuments}
                selectedDocument={state.selectedDocument}
                onSelectDocument={selectDocument}
                onUploadDocument={uploadDocument}
              />
              
              {/* Document Type Detection */}
              {state.selectedDocument && showUnifiedProcessing && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Document Type Detection</CardTitle>
                    <CardDescription>Detected type and processing recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Detected as <strong>{documentTypes.find(t => t.id === detectedDocumentType)?.name}</strong>
                        {' '}based on filename analysis.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {documentTypes.map(type => {
                        const Icon = type.icon;
                        const isSelected = detectedDocumentType === type.id;
                        return (
                          <Button
                            key={type.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setDetectedDocumentType(type.id);
                              setSelectedProcessingTypes(type.recommended);
                              setSelectedPreset('custom');
                            }}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {type.name}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Configuration Panel */}
            <div className="space-y-6">
              {showUnifiedProcessing ? (
                <>
                  {/* Template System */}
                  <TemplateSystem 
                    compactMode={true}
                    onTemplateSelect={(templateId) => {
                      // Template selection is handled automatically by the hook
                      console.log('Template selected:', templateId);
                    }}
                  />

                  {/* Processing Types Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Processing Configuration</CardTitle>
                      <CardDescription>Select processing types</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Separator />

                      {/* Processing Type Toggles */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileSearch className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">RAG Search</div>
                              <div className="text-xs text-gray-500">Vector search & retrieval</div>
                            </div>
                          </div>
                          <Switch
                            checked={selectedProcessingTypes.rag}
                            onCheckedChange={() => handleToggleProcessing('rag')}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Network className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Knowledge Graph</div>
                              <div className="text-xs text-gray-500">Entity extraction</div>
                            </div>
                          </div>
                          <Switch
                            checked={selectedProcessingTypes.kg}
                            onCheckedChange={() => handleToggleProcessing('kg')}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BrainCircuit className="h-5 w-5 text-purple-500" />
                            <div>
                              <div className="font-medium">Document Intelligence</div>
                              <div className="text-xs text-gray-500">Metadata & classification</div>
                            </div>
                          </div>
                          <Switch
                            checked={selectedProcessingTypes.idp}
                            onCheckedChange={() => handleToggleProcessing('idp')}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* Legacy Data Model Panel */
                <DataModelPanel 
                  dataModels={state.dataModels}
                  selectedDataModel={state.selectedDataModel}
                  onSelectDataModel={selectDataModel}
                />
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <div className="text-sm text-gray-600">
              {state.selectedDocument && (
                <>
                  Selected: <span className="font-medium">{state.selectedDocument.name}</span>
                  {' '}({(state.selectedDocument.size / 1024 / 1024).toFixed(2)} MB)
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              {showUnifiedProcessing && (
                <Button 
                  size="lg"
                  onClick={handleProcessWithSelected}
                  disabled={!state.selectedDocument || (!selectedProcessingTypes.rag && !selectedProcessingTypes.kg && !selectedProcessingTypes.idp)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Process with Selected
                </Button>
              )}
              
              <Button 
                variant={showUnifiedProcessing ? "outline" : "default"}
                size="lg"
                onClick={handleNext}
                disabled={!state.selectedDocument || !state.selectedDataModel}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {showUnifiedProcessing ? 'Legacy Flow' : 'Next: Parse & Chunk'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentUpload;