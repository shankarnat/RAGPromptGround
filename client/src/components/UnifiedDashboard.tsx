import React, { FC, useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, FileSearch, Network, FileText, ChevronRight, CheckCircle2, Circle, LayoutDashboard, Layers, User, HelpCircle, Phone, LogOut, Brain, Sparkles, PlayCircle, PanelLeft, PanelRightOpen } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import Sidebar from "@/components/Sidebar"; // Removed sidebar
import UploadPanel from "@/components/UploadPanel";
import DocumentPanel from "@/components/DocumentPanel";
import ChunksPanel from "@/components/ChunksPanel";
import DocumentHeader from "@/components/DocumentHeader";
import CombinedConfigurationPanel from "@/components/CombinedConfigurationPanel";
import UnifiedResultsEnhanced from "@/components/UnifiedResultsEnhanced";
import ProcessingPipelineVisualization from "@/components/ProcessingPipelineVisualization";
import TemplateSystem from "@/components/TemplateSystem";
import ConversationalUI from "@/components/ConversationalUI";
import ProgressiveDocumentLoader from "@/components/ProgressiveDocumentLoader";
import ManualConfigurationPanel from "@/components/ManualConfigurationPanel";
import IntentBasedProcessingTrigger from "@/services/IntentBasedProcessingTrigger";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { useToast } from "@/hooks/use-toast";
import { useDocumentAnalysisContext } from "@/context/DocumentAnalysisContext";
import { useMultimodalConfig } from "@/hooks/useMultimodalConfig";
import { useProcessingConfig } from "@/hooks/useProcessingConfig";

type ProcessingType = "rag" | "kg" | "idp";
type ProcessingStep = "upload" | "process" | "results";

interface ProcessingConfig {
  rag: {
    enabled: boolean;
    chunking: boolean;
    vectorization: boolean;
    indexing: boolean;
    multimodal?: {
      transcription: boolean;
      ocr: boolean;
      imageCaption: boolean;
      visualAnalysis: boolean;
    };
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

// The ManualConfigurationPanel component is already imported above

const UnifiedDashboard: FC = () => {
  console.log('UnifiedDashboard: Component initializing');
  const [, navigate] = useLocation();
  const { state, selectDocument, uploadDocument, updateChunkingMethod, updateChunkSize, 
    updateChunkOverlap, updateActiveTab, selectChunk, toggleUnifiedProcessing,
    updateProcessingStatus, processDocument, toggleProcessingType, processWithIntent,
    clearAllResults } = useDocumentProcessing();
  const { toast } = useToast();
  const { state: analysisState, analyzeDocument } = useDocumentAnalysisContext();
  console.log('UnifiedDashboard: analysisState =', analysisState);
  
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("upload");
  console.log('UnifiedDashboard: currentStep =', currentStep);
  const [isUpdatingFromAI, setIsUpdatingFromAI] = useState(false);
  const [activeTab, setActiveTab] = useState<ProcessingType>("rag");
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [documentReady, setDocumentReady] = useState(false);
  const [basicAnalysis, setBasicAnalysis] = useState<any>(null);
  const multimodalUpdateRef = useRef<boolean>(false);
  const [lastProcessedConfig, setLastProcessedConfig] = useState<any>(null);
  const [configChanged, setConfigChanged] = useState(false);
  const [highlightProcessButton, setHighlightProcessButton] = useState(false);
  const [pulseProcessButton, setPulseProcessButton] = useState(false);
  
  // Use multimodal config hook for better state management
  const {
    config: multimodalConfig,
    updateConfig: updateMultimodalConfig,
    toggleOption: toggleMultimodalOption,
    canUpdate: canUpdateMultimodal
  } = useMultimodalConfig({
    transcription: false,
    ocr: false,
    imageCaption: false,
    visualAnalysis: false
  });
  
  // Use reducer for more efficient state updates
  // Use the processing config hook for granular state management
  const { 
    config: processingConfig, 
    updateOption,
    updateMultimodal,
    updateProcessingType,
    batchUpdate: setProcessingConfig
  } = useProcessingConfig({
    rag: {
      enabled: false,  // Start disabled, wait for AI assistant input
      chunking: true,
      vectorization: true,
      indexing: true,
      multimodal: multimodalConfig
    },
    kg: {
      enabled: false,  // Start disabled, wait for AI assistant input
      entityExtraction: true,
      relationMapping: true,
      graphBuilding: true,
    },
    idp: {
      enabled: false,  // Start disabled, wait for AI assistant input
      textExtraction: true,
      classification: false,
      metadata: true,
    },
  });

  // Monitor processingConfig changes and chunking configuration
  useEffect(() => {
    console.log('Checking for configuration changes...');
    
    // If we have a last processed config, check if current config is different
    if (lastProcessedConfig) {
      // Create a current config object with the same structure as lastProcessedConfig
      const currentFullConfig = {
        ...processingConfig,
        chunking: {
          method: state.chunkingMethod,
          size: state.chunkSize,
          overlap: state.chunkOverlap
        }
      };
      
      // Compare the JSON strings of both configs to detect any changes
      const isChanged = (
        JSON.stringify(processingConfig) !== JSON.stringify(lastProcessedConfig) ||
        currentFullConfig.chunking.method !== lastProcessedConfig.chunking?.method ||
        currentFullConfig.chunking.size !== lastProcessedConfig.chunking?.size ||
        currentFullConfig.chunking.overlap !== lastProcessedConfig.chunking?.overlap
      );
      
      setConfigChanged(isChanged);
      console.log(`Configuration ${isChanged ? 'changed' : 'unchanged'} from last processed config`);
      
      // Log detailed comparison when changes are detected
      if (isChanged) {
        console.log('Current configuration:', currentFullConfig);
        console.log('Last processed configuration:', lastProcessedConfig);
        console.log('Chunking configuration comparison:', {
          lastChunkingMethod: lastProcessedConfig.chunking?.method,
          currentChunkingMethod: state.chunkingMethod,
          chunkingMethodChanged: lastProcessedConfig.chunking?.method !== state.chunkingMethod,
          
          lastChunkSize: lastProcessedConfig.chunking?.size,
          currentChunkSize: state.chunkSize,
          chunkSizeChanged: lastProcessedConfig.chunking?.size !== state.chunkSize,
          
          lastChunkOverlap: lastProcessedConfig.chunking?.overlap,
          currentChunkOverlap: state.chunkOverlap,
          chunkOverlapChanged: lastProcessedConfig.chunking?.overlap !== state.chunkOverlap
        });
      }
    }
  }, [processingConfig, lastProcessedConfig, state.chunkingMethod, state.chunkSize, state.chunkOverlap]);
  
  // Track AI-driven RAG enablement
  const [pendingRagEnable, setPendingRagEnable] = useState(false);
  
  // Watch for pending RAG enablement
  useEffect(() => {
    if (pendingRagEnable && processingConfig.rag.enabled) {
      console.log('RAG enabled via AI, ensuring manual config sync');
      setPendingRagEnable(false);
      
      // Force a re-render of the manual configuration panel
      // by updating another piece of state if needed
      updateActiveTab(state.activeTab); // Trigger a re-render
    }
  }, [pendingRagEnable, processingConfig.rag.enabled, state.activeTab, updateActiveTab]);
  
  // Sync multimodal config with processing config
  useEffect(() => {
    if (!isUpdatingFromAI && !multimodalUpdateRef.current) {
      setProcessingConfig(prev => ({
        ...prev,
        rag: {
          ...prev.rag,
          multimodal: multimodalConfig
        }
      }));
    }
  }, [multimodalConfig, isUpdatingFromAI]);

  const processingTypes = [
    { id: "rag", label: "RAG Search", icon: FileSearch, description: "Vector-based search with retrieval" },
    { id: "idp", label: "Document Processing", icon: FileText, description: "Advanced document analysis" },
    { id: "kg", label: "Knowledge Graph", icon: Network, description: "Entity and relation extraction" },
  ];

  const presets = {
    "custom": {
      name: "Custom",
      description: "Configure each option manually",
      config: {}
    },
    "rag-only": {
      name: "RAG Search Only",
      description: "Optimized for document search and retrieval",
      config: {
        rag: { enabled: true, chunking: true, vectorization: true, indexing: true },
        kg: { enabled: false, entityExtraction: false, relationMapping: false, graphBuilding: false },
        idp: { enabled: false, textExtraction: false, classification: false, metadata: false }
      }
    },
    "kg-focus": {
      name: "Knowledge Graph Focus",
      description: "Entity and relationship extraction for graph building",
      config: {
        rag: { enabled: false, chunking: false, vectorization: false, indexing: false },
        kg: { enabled: true, entityExtraction: true, relationMapping: true, graphBuilding: true },
        idp: { enabled: true, textExtraction: true, classification: false, metadata: true }
      }
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
    "quick-extract": {
      name: "Quick Extract",
      description: "Fast text extraction and basic metadata",
      config: {
        rag: { enabled: false, chunking: false, vectorization: false, indexing: false },
        kg: { enabled: false, entityExtraction: false, relationMapping: false, graphBuilding: false },
        idp: { enabled: true, textExtraction: true, classification: false, metadata: true }
      }
    }
  };

  const steps: { id: ProcessingStep; label: string; icon: typeof Circle }[] = [
    { id: "upload", label: "Upload & Configure", icon: Upload },
    { id: "process", label: "Processing", icon: Brain },
    { id: "results", label: "View Results", icon: FileSearch },
  ];

  // Use callback to prevent re-render of child components
  const handleProcessingToggle = useCallback((type: ProcessingType, enabled: boolean, forceUpdate: boolean = false) => {
    console.log(`handleProcessingToggle called: type=${type}, enabled=${enabled}, isUpdatingFromAI=${isUpdatingFromAI}, forceUpdate=${forceUpdate}`);
    
    // Skip if we're currently updating from AI, unless force update is specified
    if (isUpdatingFromAI && !forceUpdate) {
      console.log('Skipping handleProcessingToggle due to isUpdatingFromAI flag');
      return;
    }
    
    setProcessingConfig(prev => {
      const updated = {
        ...prev,
        [type]: { ...prev[type], enabled }
      };
      console.log(`Updated processingConfig for ${type}:`, updated[type]);
      return updated;
    });
    // Use the new toggleProcessingType method for unified processing
    const mappedType = type === "rag" ? "standard" : type;
    if (enabled !== state.unifiedProcessing.selectedProcessingTypes.includes(mappedType)) {
      toggleProcessingType(mappedType);
    }
    
    // Show toast notification for manual configuration changes
    if (enabled) {
      let message = '';
      let description = '';
      
      switch(type) {
        case 'rag':
          message = 'RAG Enabled in Manual Configuration';
          description = 'Document search and retrieval processing has been activated via manual configuration';
          break;
        case 'kg':
          message = 'Knowledge Graph Enabled in Manual Configuration';
          description = 'Entity extraction and relationship mapping has been activated via manual configuration';
          break;
        case 'idp':
          message = 'Document Processing Enabled in Manual Configuration';
          description = 'Advanced document analysis has been activated via manual configuration';
          break;
      }
      
      toast({
        title: message,
        description: description,
      });
    } else {
      // Optionally show toast when disabled
      let message = '';
      
      switch(type) {
        case 'rag':
          message = 'RAG Disabled in Manual Configuration';
          break;
        case 'kg':
          message = 'Knowledge Graph Disabled in Manual Configuration';
          break;
        case 'idp':
          message = 'Document Processing Disabled in Manual Configuration';
          break;
      }
      
      toast({
        title: message,
        variant: "default",
      });
    }
  }, [isUpdatingFromAI, state.unifiedProcessing.selectedProcessingTypes, toggleProcessingType, toast]);

  // Use callback to prevent re-render of child components
  const handleOptionToggle = useCallback((type: ProcessingType, option: string, enabled: boolean, skipToast?: boolean) => {
    // Skip if we're currently updating from AI
    if (isUpdatingFromAI || multimodalUpdateRef.current) {
      console.log('handleOptionToggle skipped - AI is updating');
      return;
    }
    
    if (type === 'rag' && ['transcription', 'ocr', 'imageCaption', 'visualAnalysis'].includes(option)) {
      // Handle multimodal options using the multimodal config hook
      toggleMultimodalOption(option as keyof typeof multimodalConfig, enabled, 'user');
      
      // Use granular update for multimodal options to prevent full re-render
      updateMultimodal(option as any, enabled);
      
      // Only show toast if not called from AI assistant
      if (!skipToast) {
        let message = '';
        let description = '';
        
        switch(option) {
          case 'transcription':
            message = enabled ? 'Audio Transcription Enabled' : 'Audio Transcription Disabled';
            description = enabled ? 
              'Audio files will be transcribed for search and retrieval' : 
              'Audio transcription has been disabled';
            break;
          case 'ocr':
            message = enabled ? 'OCR Enabled' : 'OCR Disabled';
            description = enabled ? 
              'Text will be extracted from images and scanned documents' : 
              'OCR processing has been disabled';
            break;
          case 'imageCaption':
            message = enabled ? 'Image Captioning Enabled' : 'Image Captioning Disabled';
            description = enabled ? 
              'Images will be analyzed and captioned for better search' : 
              'Image captioning has been disabled';
            break;
          case 'visualAnalysis':
            message = enabled ? 'Visual Analysis Enabled' : 'Visual Analysis Disabled';
            description = enabled ? 
              'Charts and diagrams will be analyzed for content understanding' : 
              'Visual analysis has been disabled';
            break;
        }
        
        toast({
          title: message + ' in Manual Configuration',
          description: description,
        });
      }
    } else {
      // Use granular update for other configuration options
      updateOption(type, option, enabled);
    }
  }, [isUpdatingFromAI, updateMultimodal, updateOption, toggleMultimodalOption, toast]);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId !== "custom" && presetId in presets) {
      const preset = presets[presetId as keyof typeof presets];
      if (preset.config && Object.keys(preset.config).length > 0) {
        setProcessingConfig(preset.config as ProcessingConfig);
        
        // Update unified processing state
        Object.entries(preset.config).forEach(([type, config]: [string, any]) => {
          if (config && 'enabled' in config) {
            toggleUnifiedProcessing(type as ProcessingType, config.enabled);
          }
        });
      }
    }
  };


  const goToStep = (step: ProcessingStep) => {
    setCurrentStep(step);
  };
  
  // Handle document analysis completion
  const handleDocumentReady = (preview: any, analysis: any) => {
    setDocumentReady(true);
    setBasicAnalysis(analysis);
    
    // Auto-show results view once document analysis is ready
    console.log('Document ready, showing analysis:', analysis);
  };
  
  // Handle on-demand processing requests
  const handleOnDemandProcessing = (type: 'idp' | 'rag' | 'kg' | 'combined', config?: any) => {
    // Trigger processing via the service
    const result = IntentBasedProcessingTrigger.triggerFromUI(type, {
      ...config,
      document: state.selectedDocument || state.document
    });
    
    if (result.success) {
      toast({
        title: "Processing Started",
        description: `Starting ${type.toUpperCase()} processing...`
      });
      
      // Move to process step
      setCurrentStep("process");
      
      // Start processing based on type
      if (type === 'rag') {
        handleProcessingToggle('rag', true);
      } else if (type === 'kg') {
        handleProcessingToggle('kg', true);
      } else if (type === 'idp') {
        handleProcessingToggle('idp', true);
      } else if (type === 'combined' && config?.types) {
        config.types.forEach((t: string) => {
          if (t === 'rag' || t === 'kg' || t === 'idp') {
            handleProcessingToggle(t as ProcessingType, true);
          }
        });
      }
      
      handleProcessDocument();
    } else {
      toast({
        title: "Processing Failed",
        description: result.error || "Failed to start processing",
        variant: "destructive"
      });
    }
  };

  const handleConversationalConfig = async (config: any) => {
    console.log('handleConversationalConfig called with:', config);
    
    // Special handling for process_directly action first - this MUST be handled first
    // to ensure the checkbox gets enabled before other UI indicators
    // Special handling for direct KG enablement from conversation
    if (config.kgEnabled !== undefined && config.kgUpdate) {
      console.log('DIRECT KG UPDATE: Handling KG enablement', { 
        kgEnabled: config.kgEnabled, 
        entityTypes: config.entityTypes 
      });
      
      // Update KG configuration
      updateOption('kg', 'enabled', true);
      
      // Also update the unified processing state
      if (!state.unifiedProcessing.selectedProcessingTypes.includes('kg')) {
        console.log('DIRECT KG UPDATE: Adding kg to unified processing types');
        toggleProcessingType('kg');
      }
      
      // Show toast notification
      toast({
        title: 'Knowledge Graph Enabled',
        description: 'Entity extraction and relationship mapping has been activated',
      });
      
      return; // Skip further processing
    }
    
    if (config.idpEnabled !== undefined) {
      console.log('DIRECT IDP UPDATE: Handling process_directly data', { 
        idpEnabled: config.idpEnabled, 
        extractType: config.extractType 
      });
      
      // Create IDP configuration based on the extractType
      let idpConfig: any = {
        enabled: true,
        textExtraction: true,
        classification: false,
        metadata: false,
        tables: false,
        formFields: false
      };
      
      // Additional properties based on extractType
      if (config.extractType === 'structured') {
        idpConfig.tables = true;
        idpConfig.formFields = true;
      } else if (config.extractType === 'metadata') {
        idpConfig.metadata = true;
        idpConfig.classification = true;
      } else if (config.extractType === 'full') {
        idpConfig.tables = true;
        idpConfig.formFields = true;
        idpConfig.metadata = true;
        idpConfig.classification = true;
      }
      
      console.log('DIRECT IDP UPDATE: Setting IDP config to:', idpConfig);
      
      // Force update the processing config with the new IDP settings IMMEDIATELY
      // This must happen first to ensure the checkbox is checked
      updateOption('idp', 'enabled', true);
      
      // Update specific IDP options with a slight delay to ensure the enabled state change happens first
      setTimeout(() => {
        if (config.extractType === 'structured') {
          updateOption('idp', 'tables', true);
          updateOption('idp', 'formFields', true);
        } else if (config.extractType === 'metadata') {
          updateOption('idp', 'metadata', true);
          updateOption('idp', 'classification', true);
        } else if (config.extractType === 'full') {
          updateOption('idp', 'tables', true);
          updateOption('idp', 'formFields', true);
          updateOption('idp', 'metadata', true);
          updateOption('idp', 'classification', true);
        }
      }, 50);
      
      // Also update the unified processing state
      if (!state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
        console.log('DIRECT IDP UPDATE: Adding idp to unified processing types');
        toggleProcessingType('idp');
      }
      
      // Show toast notification
      let toastDescription = 'Document processing has been configured';
      if (config.extractType === 'structured') {
        toastDescription = 'Structured data extraction for tables and forms is now available';
      }
      
      toast({
        title: 'IDP Processing Enabled',
        description: toastDescription,
      });
    }
    
    // Apply configuration from conversational UI
    if (config.configuration) {
      // Set flag to indicate we're updating from AI
      setIsUpdatingFromAI(true);
      multimodalUpdateRef.current = true;
      
      // Special handling for basic RAG search configuration
      if (config.configuration?.rag?.enabled && config.source === 'ai_basic_rag') {
        // This is from the AI assistant recommendation
        console.log('Enabling RAG search from AI assistant recommendation');
        console.log('Current processingConfig.rag.enabled:', processingConfig.rag.enabled);
        
        // Try using updateOption for just the enabled flag
        updateOption('rag', 'enabled', true);
        console.log('Called updateOption to enable RAG');
        
        // Force a complete config update to ensure all properties are set
        setTimeout(() => {
          updateProcessingType('rag', {
            enabled: true,
            chunking: config.configuration.rag.chunking ?? true,
            vectorization: config.configuration.rag.vectorization ?? true,
            indexing: config.configuration.rag.indexing ?? true,
            multimodal: config.configuration.rag.multimodal || {
              transcription: false,
              ocr: false,
              imageCaption: false,
              visualAnalysis: false
            }
          });
          console.log('Called updateProcessingType with full config');
        }, 100);
        
        // Also update the unified processing state to include RAG
        const mappedType = "standard"; // RAG maps to "standard" in unified processing
        if (!state.unifiedProcessing.selectedProcessingTypes.includes(mappedType)) {
          toggleProcessingType(mappedType);
        }
        
        // Clear all flags after update completes
        setTimeout(() => {
          setIsUpdatingFromAI(false);
          multimodalUpdateRef.current = false;
        }, 100);
        
        // Show success toast
        toast({
          title: 'RAG Search Enabled',
          description: 'Document search and retrieval processing has been activated based on AI recommendation',
        });
        
        return;
      }
      
      // Handle specific IDP updates from AI assistant
      if (config.configuration?.idp?.enabled && config.source === 'ai_basic_idp') {
        console.log('UnifiedDashboard: Enabling IDP from AI assistant recommendation');
        console.log('UnifiedDashboard: Current processingConfig.idp.enabled:', processingConfig.idp.enabled);
        
        // Update IDP configuration
        updateOption('idp', 'enabled', true);
        console.log('Called updateOption to enable IDP');
        
        // Force a complete config update to ensure all properties are set
        setTimeout(() => {
          updateProcessingType('idp', {
            enabled: true,
            textExtraction: config.configuration.idp.textExtraction ?? true,
            classification: config.configuration.idp.classification ?? true,
            metadata: config.configuration.idp.metadata ?? true,
            tables: config.configuration.idp.tables ?? true,
            formFields: config.configuration.idp.formFields ?? true
          });
          console.log('Called updateProcessingType with full IDP config');
        }, 100);
        
        // Also update the unified processing state to include IDP
        if (!state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
          toggleProcessingType('idp');
        }
        
        // Clear all flags after update completes
        setTimeout(() => {
          setIsUpdatingFromAI(false);
          multimodalUpdateRef.current = false;
        }, 100);
        
        // Show success toast
        toast({
          title: 'Document Processing Enabled',
          description: 'Document intelligence and data extraction has been activated based on AI recommendation',
        });
        
        return;
      }
      
      // Handle specific KG updates from AI assistant  
      if (config.source === 'ai_assistant' && config.kgUpdate) {
        console.log('UnifiedDashboard: Handling KG update from AI assistant');
        console.log('UnifiedDashboard: Current processingConfig.kg:', processingConfig.kg);
        console.log('UnifiedDashboard: Incoming config.configuration.kg:', config.configuration.kg);
        
        // Update KG configuration
        const kgConfig = {
          ...config.configuration.kg,
          enabled: true
        };
        
        console.log('UnifiedDashboard: Updating KG config to:', kgConfig);
        
        // Use batchUpdate with partial config
        setProcessingConfig({
          kg: kgConfig
        });
        
        console.log('UnifiedDashboard: Called setProcessingConfig with kg config');
        
        // Update the unified processing state if needed
        if (!state.unifiedProcessing.selectedProcessingTypes.includes('kg')) {
          console.log('UnifiedDashboard: Adding kg to unified processing types');
          toggleProcessingType('kg');
        }
        
        // Show success toast
        toast({
          title: 'Knowledge Graph Enabled',
          description: 'AI assistant has enabled entity extraction and relationship mapping',
        });
        
        // Clear flags
        setTimeout(() => {
          setIsUpdatingFromAI(false);
        }, 100);
        
        return; // Exit early for KG updates
      }
      
      // Handle specific IDP updates from AI assistant  
      if (config.source === 'ai_assistant' && config.idpUpdate) {
        console.log('UnifiedDashboard: Handling IDP update from AI assistant');
        console.log('UnifiedDashboard: Current processingConfig.idp:', processingConfig.idp);
        console.log('UnifiedDashboard: Incoming config.configuration.idp:', config.configuration.idp);
        
        // Update IDP configuration
        const idpConfig = {
          ...config.configuration.idp,
          enabled: true
        };
        
        console.log('UnifiedDashboard: Updating IDP config to:', idpConfig);
        
        // Use batchUpdate with partial config
        setProcessingConfig({
          idp: idpConfig
        });
        
        console.log('UnifiedDashboard: Called setProcessingConfig with IDP config');
        
        // Update the unified processing state if needed
        if (!state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
          console.log('UnifiedDashboard: Adding idp to unified processing types');
          toggleProcessingType('idp');
        }
        
        // Show success toast based on extract type
        let toastDescription = 'AI assistant has enabled document processing';
        if (config.configuration.idp.tables && config.configuration.idp.formFields) {
          toastDescription = 'AI assistant has enabled structured data extraction for tables and forms';
        } else if (config.configuration.idp.metadata && config.configuration.idp.classification) {
          toastDescription = 'AI assistant has enabled metadata and classification extraction';
        }
        
        toast({
          title: 'Document Processing Enabled',
          description: toastDescription,
        });
        
        // Clear flags
        setTimeout(() => {
          setIsUpdatingFromAI(false);
        }, 100);
        
        return; // Exit early for IDP updates
      }
      
      // Handle specific IDP updates from process_directly action
      if (config.idpEnabled !== undefined) {
        console.log('UnifiedDashboard: Handling IDP update from process_directly action');
        console.log('UnifiedDashboard: idpEnabled:', config.idpEnabled);
        console.log('UnifiedDashboard: extractType:', config.extractType);
        
        // Create an appropriate IDP configuration based on the extractType
        let idpConfig = {
          enabled: config.idpEnabled,
          textExtraction: true,
          classification: false,
          metadata: false,
          tables: false,
          formFields: false
        };
        
        // Set specific options based on extractType
        if (config.extractType === 'structured') {
          idpConfig.tables = true;
          idpConfig.formFields = true;
        } else if (config.extractType === 'metadata') {
          idpConfig.metadata = true;
          idpConfig.classification = true;
        } else if (config.extractType === 'full') {
          idpConfig.tables = true;
          idpConfig.formFields = true;
          idpConfig.metadata = true;
          idpConfig.classification = true;
        }
        
        console.log('UnifiedDashboard: Setting IDP config to:', idpConfig);
        
        // Update the processing configuration
        setProcessingConfig(prev => ({
          ...prev,
          idp: idpConfig
        }));
        
        // Update the unified processing state if needed
        if (config.idpEnabled && !state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
          console.log('UnifiedDashboard: Adding idp to unified processing types');
          toggleProcessingType('idp');
        }
        
        // Show appropriate toast notification
        let toastDescription = 'Document processing has been updated';
        if (config.extractType === 'structured') {
          toastDescription = 'Structured data extraction for tables and forms has been enabled';
        } else if (config.extractType === 'metadata') {
          toastDescription = 'Metadata and classification extraction has been enabled';
        } else if (config.extractType === 'full') {
          toastDescription = 'Full document processing has been enabled';
        }
        
        toast({
          title: 'Document Processing Updated',
          description: toastDescription,
        });
        
        // We don't return early here because the process_directly action also sets highlightProcessButton
      }
      
      // Handle specific multimodal updates from AI assistant
      if (config.source === 'ai_assistant' && config.configuration.multimodalUpdate) {
        const multimodal = config.configuration.rag.multimodal;
        
        // Update multimodal configuration
        console.log('AI Assistant multimodal update:');
        console.log('  Current multimodal config:', multimodalConfig);
        console.log('  Incoming multimodal update:', multimodal);
        console.log('  Current processingConfig.rag.multimodal:', processingConfig.rag.multimodal);
        
        // Temporarily clear the updating flag to allow the toggle
        setIsUpdatingFromAI(false);
        multimodalUpdateRef.current = false;
        
        // Update processing config to enable RAG and sync multimodal
        // This is the critical part - we need to merge the multimodal states properly
        setProcessingConfig(prev => {
          // Ensure we preserve the existing multimodal state and only update what's provided
          const existingMultimodal = prev.rag.multimodal || {
            transcription: false,
            ocr: false,
            imageCaption: false,
            visualAnalysis: false
          };
          
          // Merge incoming changes with existing state
          const mergedMultimodal = {
            ...existingMultimodal,
            ...multimodal
          };
          
          const updatedConfig = {
            ...prev,
            rag: {
              ...prev.rag,
              enabled: true,
              multimodal: mergedMultimodal
            }
          };
          
          console.log('Multimodal state merge:');
          console.log('  Previous state:', existingMultimodal);
          console.log('  Incoming changes:', multimodal);
          console.log('  Merged result:', mergedMultimodal);
          
          return updatedConfig;
        });
        
        // Update the multimodal config hook as well
        updateMultimodalConfig(multimodal, 'ai_assistant');
        
        // Use the updateMultimodal function to ensure proper state sync
        Object.entries(multimodal).forEach(([key, value]) => {
          if (value === true) {
            console.log(`  Enabling ${key} via updateMultimodal`);
            updateMultimodal(key as any, true);
          }
        });
        
        // Show specific toast for image captioning
        if (multimodal.imageCaption) {
          toast({
            title: 'Image Captioning Enabled',
            description: 'AI assistant has enabled image processing based on your selection',
          });
        }
        
        // Show specific toast for OCR if enabled
        if (multimodal.ocr) {
          toast({
            title: 'OCR Enabled',
            description: 'AI assistant has enabled text extraction from images',
          });
        }
        
        // Show specific toast for audio transcription
        if (multimodal.transcription) {
          toast({
            title: 'Audio Transcription Enabled',
            description: 'AI assistant has enabled audio processing based on your selection',
          });
        }
        
        // Clear the flag after update with much longer delay to prevent race conditions
        setTimeout(() => {
          setIsUpdatingFromAI(false);
          multimodalUpdateRef.current = false;
        }, 2000);
        
        return; // Exit early for specific multimodal updates
      }
      
      // Show a general toast for other AI assistant updates
      let enabledFeatures = [];
      let multimodalFeatures = [];
      
      if (config.configuration.rag?.enabled) {
        enabledFeatures.push('RAG');
        
        // Check for multimodal features
        if (config.configuration.rag.multimodal) {
          if (config.configuration.rag.multimodal.imageCaption) multimodalFeatures.push('Image Processing');
          if (config.configuration.rag.multimodal.transcription) multimodalFeatures.push('Audio Transcription');
          if (config.configuration.rag.multimodal.ocr) multimodalFeatures.push('OCR');
          if (config.configuration.rag.multimodal.visualAnalysis) multimodalFeatures.push('Visual Analysis');
        }
      }
      
      if (config.configuration.kg?.enabled) enabledFeatures.push('Knowledge Graph');
      if (config.configuration.idp?.enabled) enabledFeatures.push('Document Processing');
      
      if (enabledFeatures.length > 0 || multimodalFeatures.length > 0) {
        let description = '';
        if (enabledFeatures.length > 0) {
          description = `${enabledFeatures.join(', ')} has been configured`;
        }
        if (multimodalFeatures.length > 0) {
          description += (description ? ' with ' : '') + multimodalFeatures.join(', ');
        }
        description += ' based on your conversation';
        
        toast({
          title: 'Configuration Updated by AI Assistant',
          description: description,
        });
      }
      
      // Update RAG configuration
      if (config.configuration.rag) {
        console.log('Updating RAG configuration with multimodal:', config.configuration.rag.multimodal);
        // Only update the processing config once
        setProcessingConfig(prev => ({
          ...prev,
          rag: { ...prev.rag, enabled: config.configuration.rag.enabled }
        }));
        
        // Update unified processing without triggering the manual configuration toast
        const mappedType = "standard";
        if (config.configuration.rag.enabled !== state.unifiedProcessing.selectedProcessingTypes.includes(mappedType)) {
          toggleProcessingType(mappedType);
        }
        
        // Update the detailed configuration
        setProcessingConfig(prev => {
          const updated = {
            ...prev,
            rag: { 
              ...prev.rag, 
              ...config.configuration.rag,
              multimodal: config.configuration.rag.multimodal ? {
                transcription: config.configuration.rag.multimodal.transcription || false,
                ocr: config.configuration.rag.multimodal.ocr || false,
                imageCaption: config.configuration.rag.multimodal.imageCaption || false,
                visualAnalysis: config.configuration.rag.multimodal.visualAnalysis || false
              } : prev.rag.multimodal
            }
          };
          console.log('New processing config RAG:', updated.rag);
          return updated;
        });
      }
      
      // Update KG configuration
      if (config.configuration.kg) {
        // Only update the processing config without triggering toast
        setProcessingConfig(prev => ({
          ...prev,
          kg: { ...prev.kg, enabled: config.configuration.kg.enabled }
        }));
        
        if (config.configuration.kg.enabled !== state.unifiedProcessing.selectedProcessingTypes.includes('kg')) {
          toggleProcessingType('kg');
        }
        
        // Update the detailed configuration
        setProcessingConfig(prev => ({
          ...prev,
          kg: { 
            ...prev.kg, 
            ...config.configuration.kg,
            entityExtraction: config.configuration.kg.entityExtraction ?? prev.kg.entityExtraction,
            relationMapping: config.configuration.kg.relationMapping ?? prev.kg.relationMapping,
            graphBuilding: config.configuration.kg.graphBuilding ?? prev.kg.graphBuilding
          }
        }));
      }
      
      // Update IDP configuration
      if (config.configuration.idp) {
        // Only update the processing config without triggering toast
        setProcessingConfig(prev => ({
          ...prev,
          idp: { ...prev.idp, enabled: config.configuration.idp.enabled }
        }));
        
        if (config.configuration.idp.enabled !== state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
          toggleProcessingType('idp');
        }
        
        // Update the detailed configuration
        setProcessingConfig(prev => ({
          ...prev,
          idp: { 
            ...prev.idp, 
            ...config.configuration.idp,
            textExtraction: config.configuration.idp.textExtraction ?? prev.idp.textExtraction,
            classification: config.configuration.idp.classification ?? prev.idp.classification,
            metadata: config.configuration.idp.metadata ?? prev.idp.metadata,
            tables: config.configuration.idp.tables ?? prev.idp.tables,
            formFields: config.configuration.idp.formFields ?? prev.idp.formFields
          }
        }));
      }
    }
    
    // Check for the highlightProcessButton flag from the conversation
    if (config.highlightProcessButton) {
      console.log('Process button highlight requested from conversation UI');
      
      // Check if this is a standard highlight or an enhanced pulse effect
      if (config.pulseEffect) {
        console.log('Enhanced pulse effect requested for Process Document button');
        setPulseProcessButton(true);
        setHighlightProcessButton(true);
        
        // Create a blinking effect
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
          setPulseProcessButton(prev => !prev);
          blinkCount++;
          
          // Stop blinking after 5 cycles but keep highlighted
          if (blinkCount >= 5) {
            clearInterval(blinkInterval);
            setPulseProcessButton(true);
            
            // Keep highlighted for a longer period
            setTimeout(() => {
              setPulseProcessButton(false);
              setHighlightProcessButton(false);
            }, 10000);
          }
        }, 500);
      } else {
        // Standard highlight
        setHighlightProcessButton(true);
        
        // Auto-disable the highlight after 10 seconds to avoid confusion
        setTimeout(() => {
          setHighlightProcessButton(false);
        }, 10000);
      }
      
      // Show a toast notification pointing to the process button
      toast({
        title: "Configuration Complete!",
        description: "Click the highlighted 'Process Document' button on the left to continue.",
      });
      
      return;
    }
    
    // Check for immediate processing flag
    if (config.processImmediately) {
      console.log('Immediate processing requested from conversation UI');
      
      // Show toast notification
      toast({
        title: "Processing Started",
        description: "Starting document processing based on selected configuration...",
      });
      
      // Process the document immediately
      setCurrentStep("process");
      await processDocument();
      
      // Auto-advance to results when processing is complete
      setTimeout(() => {
        if (Object.values(state.unifiedProcessing.processingStatus).every(status => status !== "processing")) {
          setCurrentStep("results");
        }
      }, 2000);
      
      return;
    }
    
    // Use intent-based processing trigger for conversation
    if (config.intent) {
      const result = IntentBasedProcessingTrigger.triggerFromConversation(config.intent);
      
      if (result.success) {
        setCurrentStep("process");
        await processWithIntent(config.intent);
        
        // Auto-advance to results when processing is complete
        setTimeout(() => {
          setCurrentStep("results");
        }, 100);
      } else {
        toast({
          title: "Processing Failed",
          description: result.error || "Failed to start processing",
          variant: "destructive"
        });
      }
    } else if (config.triggerType === 'conversation') {
      // Handle on-demand processing from conversation without intent
      handleProcessDocument();
    }
  };

  const handleProcessDocument = useCallback(async () => {
    if (!state.selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please upload a document first.",
        variant: "destructive"
      });
      return;
    }

    // Save the current configuration for comparison after processing
    // Include the chunking configuration in the saved state
    const configToSave = {
      ...JSON.parse(JSON.stringify(processingConfig)),
      chunking: {
        method: state.chunkingMethod,
        size: state.chunkSize,
        overlap: state.chunkOverlap
      }
    };
    console.log('Saving last processed config:', configToSave);
    setLastProcessedConfig(configToSave);
    
    // Reset the configChanged flag since we're processing with current config
    setConfigChanged(false);

    // Enable Document Processing (IDP) when process document is clicked
    if (!processingConfig.idp.enabled) {
      setProcessingConfig(prev => ({
        ...prev,
        idp: {
          ...prev.idp,
          enabled: true
        }
      }));
      
      // Also enable IDP in unified processing
      if (!state.unifiedProcessing.selectedProcessingTypes.includes('idp')) {
        toggleProcessingType('idp');
      }
    }

    const enabledProcessing = Object.entries(processingConfig)
      .filter(([_, config]) => config.enabled)
      .map(([type]) => type);

    // Add IDP if not already in the list
    if (!enabledProcessing.includes('idp')) {
      enabledProcessing.push('idp');
    }

    if (enabledProcessing.length === 0) {
      toast({
        title: "No Processing Selected",
        description: "Please enable at least one processing type.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this is a re-processing action
    const isReprocessing = currentStep === "results" && lastProcessedConfig;
    
    toast({
      title: isReprocessing ? "Re-processing Started" : "Processing Started",
      description: isReprocessing 
        ? `Re-processing document with updated configuration` 
        : `Processing document with: ${enabledProcessing.join(", ").toUpperCase()}`,
    });

    setCurrentStep("process");
    await processDocument();
    
    // Auto-advance to results when processing is complete
    setTimeout(() => {
      if (Object.values(state.unifiedProcessing.processingStatus).every(status => status !== "processing")) {
        setCurrentStep("results");
      }
    }, 2000);
    
    // Clear the updating flag after all updates are complete
    setTimeout(() => {
      setIsUpdatingFromAI(false);
      multimodalUpdateRef.current = false;
    }, 2000);
  }, [state.selectedDocument, processingConfig, state.unifiedProcessing, toast, toggleProcessingType, processDocument, setLastProcessedConfig, currentStep]);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-evenly px-8 py-5 bg-gray-700 border-b border-gray-600 shadow-sm">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
        const Icon = isCompleted ? CheckCircle2 : step.icon;
        
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isCompleted && goToStep(step.id)}
              className={`flex items-center space-x-3 font-medium transition-all duration-200 transform hover:scale-105
                ${isActive ? "text-blue-300" : isCompleted ? "text-green-300" : "text-gray-400"}
                ${isCompleted ? "cursor-pointer hover:text-green-200" : "cursor-default"}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "drop-shadow-lg" : ""}`} />
              <span className="text-sm tracking-wide">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Create wrapper functions for chunking configuration updates to trigger config changes
  const wrappedUpdateChunkingMethod = useCallback((method) => {
    console.log('Chunking method changed to:', method);
    updateChunkingMethod(method);
    setConfigChanged(true);
  }, [updateChunkingMethod]);

  const wrappedUpdateChunkSize = useCallback((size) => {
    console.log('Chunk size changed to:', size);
    updateChunkSize(size);
    setConfigChanged(true);
  }, [updateChunkSize]);

  const wrappedUpdateChunkOverlap = useCallback((overlap) => {
    console.log('Chunk overlap changed to:', overlap);
    updateChunkOverlap(overlap);
    setConfigChanged(true);
  }, [updateChunkOverlap]);
  
  // Memoize the manual configuration panel props to prevent re-renders
  const manualConfigPanelProps = useMemo(() => ({
    processingTypes,
    processingConfig,
    handleProcessingToggle,
    handleOptionToggle,
    onProcessDocument: handleProcessDocument,
    state,
    // Use the wrapped functions instead of direct update functions
    updateChunkingMethod: wrappedUpdateChunkingMethod,
    updateChunkSize: wrappedUpdateChunkSize,
    updateChunkOverlap: wrappedUpdateChunkOverlap,
    selectedDocument: state.selectedDocument,
    multimodalConfig: multimodalConfig.config,
    // Always allow editing of options, even in results view
    disabled: false,
    // Pass the highlighting and pulse flags to draw attention to the Process button when needed
    highlightProcessButton: highlightProcessButton,
    pulseEffect: pulseProcessButton
  }), [
    processingTypes,
    processingConfig,
    handleProcessingToggle,
    handleOptionToggle,
    handleProcessDocument,
    state,
    wrappedUpdateChunkingMethod,
    wrappedUpdateChunkSize,
    wrappedUpdateChunkOverlap,
    multimodalConfig.config,
    highlightProcessButton,
    pulseProcessButton
  ]);

  const renderContent = () => {
    console.log('UnifiedDashboard: renderContent called with currentStep =', currentStep);
    switch (currentStep) {
      case "upload":
        return (
          <div className="h-full flex">
            {/* Left Panel - Manual Configuration */}
            <div 
              className={`h-full bg-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
                leftPanelVisible ? 'w-[20%] min-w-[240px] opacity-100' : 'w-0 opacity-0'
              }`}
            >
              {leftPanelVisible && (
                <div className="h-full overflow-auto">
                  <ManualConfigurationPanel {...manualConfigPanelProps} />
                </div>
              )}
            </div>
            
            {/* Center Panel - Document & Results - Expands when left panel is hidden */}
            <div className={`h-full transition-all duration-300 ease-in-out bg-gray-50 overflow-y-auto ${
              leftPanelVisible ? 'w-[60%]' : 'w-[80%]'
            }`}>
              {!state.selectedDocument ? (
                // Show upload panel when no document is selected
                <div className="h-full p-6">
                  <UploadPanel
                    isUploading={state.isUploading}
                    uploadProgress={state.uploadProgress}
                    recentDocuments={state.recentDocuments}
                    selectedDocument={state.selectedDocument}
                    onSelectDocument={selectDocument}
                    onUploadDocument={uploadDocument}
                    onDocumentClick={(doc) => {
                      // Trigger document analysis if needed
                      if (!analysisState.analysis) {
                        // Create a file object from the document
                        const file = new File([new Blob()], doc.name, { 
                          type: doc.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream' 
                        });
                        
                        // Analyze the document
                        analyzeDocument(file);
                      }
                      
                      toast({
                        title: "Document Selected",
                        description: `${doc.name} has been loaded. Ask the AI assistant about processing options.`
                      });
                    }}
                  />
                </div>
              ) : (
                // Show results view when document is selected
                <div className="h-full p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Document Analysis & Results</h2>
                    <p className="text-gray-600">
                      {state.unifiedProcessing.processingStatus.rag === "completed" || 
                       state.unifiedProcessing.processingStatus.kg === "completed" || 
                       state.unifiedProcessing.processingStatus.idp === "completed" 
                        ? "View and explore the results from processing"
                        : "Document loaded. Configure processing options in the left panel or with AI assistant."}
                    </p>
                  </div>
                  
                  {/* Progressive Document Loader for initial analysis */}
                  {documentReady ? (
                    <>
                      {console.log('UnifiedDashboard passing data:', {
                        ragResults: state.unifiedProcessing.unifiedResults.standard,
                        kgResults: state.unifiedProcessing.unifiedResults.kg,
                        idpResults: state.unifiedProcessing.unifiedResults.idp
                      })}
                      <UnifiedResultsEnhanced
                        ragResults={state.unifiedProcessing.unifiedResults.standard || undefined}
                        kgResults={state.unifiedProcessing.unifiedResults.kg || undefined}
                        idpResults={state.unifiedProcessing.unifiedResults.idp || undefined}
                        processingConfig={processingConfig}
                        onChunkSelect={selectChunk}
                        onEntitySelect={(entityId) => {
                          console.log('Entity selected:', entityId);
                        }}
                        selectedChunk={state.selectedChunk}
                        onClearResults={clearAllResults}
                      />
                    </>
                  ) : (
                    <ProgressiveDocumentLoader
                      document={state.selectedDocument}
                      onProcessingRequest={handleOnDemandProcessing}
                      onDocumentReady={handleDocumentReady}
                      autoAnalyze={true}
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Right Panel - Intelligent Content Agent */}
            <div className="h-full w-[20%]">
              <Card className="h-full border-0 rounded-none shadow-md bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader className="pb-4 border-b bg-white/80 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        Intelligent Content Agent
                        <Sparkles className="h-4 w-4 text-purple-500 ml-2" />
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">AI-powered document configuration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-5rem)] overflow-hidden">
                  <div className="h-full">
                    <ConversationalUI
                      documentAnalysis={analysisState.analysis}
                      onProcessingConfigured={handleConversationalConfig}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );


      case "process":
        return (
          <div className="h-full flex">
            {/* Left Panel - Manual Configuration */}
            <div 
              className={`h-full bg-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
                leftPanelVisible ? 'w-[20%] min-w-[240px] opacity-100' : 'w-0 opacity-0'
              }`}
            >
              {leftPanelVisible && (
                <div className="h-full overflow-auto">
                  <ManualConfigurationPanel {...manualConfigPanelProps} />
                </div>
              )}
            </div>
            
            {/* Center Panel - Processing Status - Expands when left panel is hidden */}
            <div className={`h-full transition-all duration-300 ease-in-out bg-gray-50 overflow-y-auto ${
              leftPanelVisible ? 'w-[60%]' : 'w-[80%]'
            }`}>
              <div className="h-full p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Processing Document</h2>
                  <p className="text-gray-600">Your document is being processed with the selected methods</p>
                </div>

                {/* Pipeline Visualization */}
                <ProcessingPipelineVisualization
                  onStepClick={(stepType) => {
                    console.log('Step clicked:', stepType);
                  }}
                  showDependencies={true}
                  pipelineSteps={state.unifiedProcessing.pipeline.steps}
                  pipelineStatus={state.unifiedProcessing.pipeline.status}
                />

                <div className="mt-6 flex justify-center">
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
              </div>
            </div>
            
            {/* Right Panel - Intelligent Content Agent */}
            <div className="h-full w-[20%]">
              <Card className="h-full border-0 rounded-none shadow-md bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader className="pb-4 border-b bg-white/80 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        Intelligent Content Agent
                        <Sparkles className="h-4 w-4 text-purple-500 ml-2" />
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">Monitor processing progress</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-5rem)] overflow-hidden">
                  <div className="h-full">
                    <ConversationalUI
                      documentAnalysis={analysisState.analysis}
                      onProcessingConfigured={handleConversationalConfig}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "results":
        return (
          <div className="h-full flex">
            {/* Left Panel - Manual Configuration */}
            <div 
              className={`h-full bg-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
                leftPanelVisible ? 'w-[20%] min-w-[240px] opacity-100' : 'w-0 opacity-0'
              }`}
            >
              {leftPanelVisible && (
                <div className="h-full overflow-auto">
                  <ManualConfigurationPanel {...manualConfigPanelProps} />
                </div>
              )}
            </div>
            
            {/* Center Panel - Results View - Expands when left panel is hidden */}
            <div className={`h-full transition-all duration-300 ease-in-out bg-gray-50 ${
              leftPanelVisible ? 'w-[60%]' : 'w-[80%]'
            }`}>
              <div className="h-full flex flex-col">
                {/* Add a Re-process button for updated configuration */}
                <div className="flex items-center justify-between bg-gray-100 border-b border-gray-200 px-6 py-3">
                  <div>
                    {configChanged && (
                      <div className="text-sm text-blue-600 font-medium animate-pulse flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                        Configuration changed - click Re-process to update results
                      </div>
                    )}
                  </div>
                  <Button
                    variant={configChanged ? "default" : "outline"}
                    onClick={handleProcessDocument}
                    className={`flex items-center gap-2 ${configChanged ? 'bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md transform hover:scale-[1.02]' : ''}`}
                    disabled={!configChanged}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Re-process with Current Configuration
                    {configChanged && <span className="ml-1 text-xs animate-pulse">•</span>}
                  </Button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <UnifiedResultsEnhanced
                    ragResults={state.unifiedProcessing.unifiedResults.standard || undefined}
                    kgResults={state.unifiedProcessing.unifiedResults.kg || undefined}
                    idpResults={state.unifiedProcessing.unifiedResults.idp || undefined}
                    processingConfig={processingConfig}
                    onChunkSelect={selectChunk}
                    onEntitySelect={(entityId) => {
                      console.log('Entity selected:', entityId);
                    }}
                    selectedChunk={state.selectedChunk}
                    onClearResults={clearAllResults}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Panel - Intelligent Content Agent */}
            <div className="h-full w-[20%]">
              <Card className="h-full border-0 rounded-none shadow-md bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader className="pb-4 border-b bg-white/80 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        Intelligent Content Agent
                        <Sparkles className="h-4 w-4 text-purple-500 ml-2" />
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">Explore results with AI assistance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100%-5rem)] overflow-hidden">
                  <div className="h-full">
                    <ConversationalUI
                      documentAnalysis={analysisState.analysis}
                      onProcessingConfigured={handleConversationalConfig}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        console.error('UnifiedDashboard: Unknown currentStep:', currentStep);
        return <div>Unknown step: {currentStep}</div>;
    }
  };

  console.log('UnifiedDashboard: Main render');
  
  // State for controlling the left panel visibility
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  
  // Toggle function for the left panel
  const toggleLeftPanel = () => {
    setLeftPanelVisible(!leftPanelVisible);
  };
  
  try {
    return (
      <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Collapsible sidebar layout */}
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={toggleLeftPanel} 
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 relative transition-all"
                title={leftPanelVisible ? "Hide configuration panel" : "Show configuration panel"}
              >
                {leftPanelVisible ? (
                  <PanelLeft className="h-5 w-5 transition-all" />
                ) : (
                  <PanelRightOpen className="h-5 w-5 transition-all" />
                )}
                <span className={`text-sm font-medium transition-opacity duration-200 ${leftPanelVisible ? 'opacity-100' : 'opacity-0 hidden md:inline'}`}>
                  {leftPanelVisible ? "Hide Panel" : "Show Panel"}
                </span>
                <span className="sr-only">
                  {leftPanelVisible ? "Hide configuration panel" : "Show configuration panel"}
                </span>
              </Button>
            </div>
            <Layers className="h-7 w-7 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">Unified Content Processing</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <HelpCircle className="h-5 w-5 mr-2" />
              Help
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <User className="h-5 w-5 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {renderStepIndicator()}
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
  } catch (error) {
    console.error('UnifiedDashboard: Render error:', error);
    return <div>Error rendering dashboard: {error.message}</div>;
  }
};

export default UnifiedDashboard;