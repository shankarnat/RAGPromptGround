import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import UnifiedSearchEnhanced from '@/components/UnifiedSearchEnhanced';
import { TestingInterface } from '@/components/TestingInterface';
import { ExtractedTablesDisplay } from '@/components/ExtractedTablesDisplay';
import { ExtractedTableData } from '@/services/TableExtractor';
import { PdfViewer } from '@/components/PdfViewer';
import { cn } from '@/lib/utils';
import { automotiveTestQuestions } from '@/data/automotiveTestQuestions';
import { 
  FileText, 
  Network, 
  Database,
  File,
  ChevronRight,
  ChevronDown,
  Package,
  User,
  Calendar,
  Tag,
  Eye,
  Copy,
  Download,
  Table as TableIcon,
  Trash2,
  Camera,
  Headphones,
  Film,
  Image,
  Mic,
  FileImage,
  ScanLine,
  Layers,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  TableOfContents,
  Search,
  Bot,
  Loader2,
  Info,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Wand2,
  Settings,
  Car,
  Wrench,
  FileJson,
  ZoomIn,
  Grid,
  List,
  FileSearch,
  TestTube,
  CheckCircle
} from 'lucide-react';

interface RAGResults {
  chunks: Array<{
    id: number;
    title: string;
    content: string;
    tokenCount: number;
    chunkIndex: number;
    tags: string[];
    documentId?: string;
    timestamp?: string;
    fileName?: string;
    page?: number;
    relevanceScore?: number; // Added relevance score property
    isMarkdownFormatted?: boolean; // Added for Markdown formatted chunks
  }>;
  vectors: Array<{
    id: number;
    vector: number[];
    metadata: any;
  }>;
  indexStatus: string;
}

interface KGResults {
  entities: Array<{
    id: number;
    name: string;
    type: string;
    properties: Record<string, any>;
    relationships: Array<{
      type: string;
      target: string;
      direction: 'inbound' | 'outbound';
    }>;
  }>;
  relationships: Array<{
    id: number;
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
  }>;
  graph: {
    nodes: number;
    edges: number;
    density: number;
  };
}

interface IDPResults {
  metadata: Record<string, any>;
  classification: string[];
  extractedData: {
    tables: Array<{
      id: string;
      name: string;
      headers: string[];
      rows: string[][];
      confidence: number;
      category?: 'specifications' | 'parts' | 'procedures' | 'general';
    }>;
    images: Array<{
      id: string;
      url: string;
      caption?: string;
      metadata: Record<string, any>;
      category?: 'diagram' | 'part' | 'procedure' | 'general';
      annotations?: Array<{
        x: number;
        y: number;
        label: string;
      }>;
    }>;
    formFields: Record<string, {
      value: any;
      type: string;
      confidence: number;
    }>;
    specifications?: {
      vehicle: {
        make: string;
        model: string;
        year: string;
        trim?: string;
      };
      engine?: Record<string, any>;
      dimensions?: Record<string, any>;
      features?: string[];
    };
    partsData?: Array<{
      partNumber: string;
      description: string;
      category: string;
      price?: number;
      availability?: string;
    }>;
    procedures?: Array<{
      id: string;
      title: string;
      category: string;
      steps: string[];
      duration?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }>;
  };
}

interface ProcessingConfig {
  rag?: {
    enabled: boolean;
    multimodal?: {
      transcription: boolean;
      ocr: boolean;
      imageCaption: boolean;
      visualAnalysis: boolean;
    };
  };
  kg?: {
    enabled: boolean;
  };
  idp?: {
    enabled: boolean;
  };
}

interface UnifiedResultsEnhancedProps {
  ragResults?: RAGResults;
  kgResults?: KGResults;
  idpResults?: IDPResults;
  processingConfig?: ProcessingConfig;
  onChunkSelect?: (chunkId: number) => void;
  onEntitySelect?: (entityId: number) => void;
  selectedChunk?: number | null;
  onClearResults?: () => void;
  extractedTables?: ExtractedTableData;
  selectedDocument?: { name: string; } | null;
  promptParsing?: {
    isApplied: boolean;
    customPrompt: string;
  };
  onApplyPromptParsing?: (customPrompt: string) => void;
  onClearPromptParsing?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  activeAccordion?: string;
  onAccordionChange?: (value: string) => void;
}

// Simple Markdown renderer for RAG chunks
const renderMarkdownContent = (content: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  
  lines.forEach((line, index) => {
    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold mb-2 mt-3 text-gray-800">
          {line.substring(3)}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-base font-semibold mb-1 mt-2 text-gray-700">
          {line.substring(4)}
        </h4>
      );
    }
    // Table handling
    else if (line.includes('|') && line.trim() !== '') {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else if (line.includes('---')) {
        // Separator line, skip
      } else {
        tableRows.push(cells);
      }
    }
    // End of table
    else if (inTable && !line.includes('|')) {
      // Render the table
      if (tableHeaders.length > 0 && tableRows.length > 0) {
        elements.push(
          <div key={`table-${index}`} className="overflow-x-auto my-3">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {tableHeaders.map((header, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold border border-gray-300 text-gray-800">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 border border-gray-300 text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      // Reset table state
      inTable = false;
      tableRows = [];
      tableHeaders = [];
      
      // Process the current line if it's not empty
      if (line.trim()) {
        elements.push(<p key={index} className="mb-1 text-gray-600">{line}</p>);
      }
    }
    // Bold text
    else if (line.includes('**')) {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p key={index} className="mb-1 text-gray-600" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }
    // List items
    else if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-4 mb-1 list-disc text-gray-600">
          {line.substring(2)}
        </li>
      );
    }
    // Regular text
    else if (line.trim()) {
      elements.push(<p key={index} className="mb-1 text-gray-600">{line}</p>);
    }
  });
  
  // Handle any remaining table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="final-table" className="overflow-x-auto my-3">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {tableHeaders.map((header, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold border border-gray-300 text-gray-800">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 border border-gray-300 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return <>{elements}</>;
};

const UnifiedResultsEnhanced: React.FC<UnifiedResultsEnhancedProps> = ({
  ragResults,
  kgResults,
  idpResults,
  processingConfig,
  onChunkSelect,
  onEntitySelect,
  selectedChunk,
  onClearResults,
  extractedTables,
  selectedDocument,
  promptParsing,
  onApplyPromptParsing,
  onClearPromptParsing,
  activeTab: externalActiveTab,
  onTabChange,
  activeAccordion,
  onAccordionChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'source' | 'all' | 'rag' | 'kg' | 'idp' | 'test' | 'images'>('test');
  const [internalActiveAccordion, setInternalActiveAccordion] = useState<string>('rag');
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;
  
  // Use external activeAccordion if provided, otherwise use internal state
  const currentActiveAccordion = activeAccordion || internalActiveAccordion;
  const setActiveAccordion = onAccordionChange || setInternalActiveAccordion;
  const [showTestingInterface, setShowTestingInterface] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageViewMode, setImageViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedJson, setExpandedJson] = useState<string[]>([]);
  const [jsonSearchQuery, setJsonSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Handle tab switching if the current tab is disabled
  useEffect(() => {
    // If Knowledge Graph tab is active but KG is disabled, switch to 'test' tab
    if (activeTab === 'kg' && !processingConfig?.kg?.enabled) {
      setActiveTab('test');
    }
    
    // If Document Intelligence tab is active but IDP is disabled, switch to 'test' tab
    if (activeTab === 'idp' && !processingConfig?.idp?.enabled) {
      setActiveTab('test');
    }
    
    // If 'all' tab is active, switch to 'test' tab (since we've removed the 'all' tab)
    if (activeTab === 'all') {
      setActiveTab('test');
    }
  }, [activeTab, processingConfig?.kg?.enabled, processingConfig?.idp?.enabled]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showIdpPromptBox, setShowIdpPromptBox] = useState(false);
  const [customIdpPrompt, setCustomIdpPrompt] = useState('');
  const [isIdpReprocessing, setIsIdpReprocessing] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>({ types: ['rag', 'kg', 'idp'] });
  const [filteredChunks, setFilteredChunks] = useState<any[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<any[]>([]);
  const [agenticQuery, setAgenticQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [agenticResults, setAgenticResults] = useState<any>(null);
  const [isAgenticLoading, setIsAgenticLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isEvaluationLoading, setIsEvaluationLoading] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTestTab, setActiveTestTab] = useState<'query' | 'results'>('query');
  // Use prompt parsing state from props instead of local state
  const [showPromptFix, setShowPromptFix] = useState(false);
  const [localCustomPrompt, setLocalCustomPrompt] = useState('');
  const customExtractionPrompt = promptParsing?.customPrompt || localCustomPrompt;
  const isPromptApplied = promptParsing?.isApplied || false;
  
  // Debug log
  console.log('UnifiedResultsEnhanced props:', { ragResults, kgResults, idpResults });

  // Handle search
  const handleSearch = useCallback((query: string, filters: any) => {
    setSearchQuery(query);
    setSearchFilters(filters);

    // Filter RAG chunks
    if (ragResults?.chunks) {
      const filtered = ragResults.chunks.filter(chunk => {
        if (!filters.types.includes('rag')) return false;
        
        const matchesQuery = !query || 
          chunk.title.toLowerCase().includes(query.toLowerCase()) ||
          chunk.content.toLowerCase().includes(query.toLowerCase());
        
        const matchesTags = !filters.tags?.length || 
          filters.tags.some((tag: string) => chunk.tags.includes(tag));
        
        return matchesQuery && matchesTags;
      });
      setFilteredChunks(filtered);
    }

    // Filter KG entities
    if (kgResults?.entities) {
      const filtered = kgResults.entities.filter(entity => {
        if (!filters.types.includes('kg')) return false;
        
        const matchesQuery = !query || 
          entity.name.toLowerCase().includes(query.toLowerCase()) ||
          entity.type.toLowerCase().includes(query.toLowerCase());
        
        const matchesEntities = !filters.entities?.length || 
          filters.entities.includes(entity.name);
        
        return matchesQuery && matchesEntities;
      });
      setFilteredEntities(filtered);
    }
  }, [ragResults, kgResults]);

  // Initialize filtered data and handle prompt parsing updates
  useEffect(() => {
    console.log('Updating filtered chunks from ragResults:', ragResults?.chunks?.length);
    console.log('Prompt parsing state:', { isPromptApplied, customExtractionPrompt });
    
    // Always update filtered chunks when ragResults changes
    let chunks = ragResults?.chunks || [];
    console.log('First chunk isMarkdownFormatted:', chunks[0]?.isMarkdownFormatted);
    
    // Apply transformation here if prompt is applied
    if (isPromptApplied && customExtractionPrompt && chunks.length > 0) {
      console.log('Applying prompt-based transformation to chunks');
      chunks = chunks.map(chunk => {
        // Check if this chunk contains table data that needs conversion
        if (chunk.content.includes('Drivetrain') || chunk.content.includes('Engine') || 
            chunk.content.includes('towing') || chunk.content.includes('specifications')) {
          
          // Convert to Markdown table format
          let markdownContent = chunk.content;
          
          // Example conversion for drivetrain specifications
          if (chunk.content.includes('Drivetrain Type')) {
            markdownContent = `## Drivetrain Specifications\n\n| Component | Specification | Details |\n|-----------|--------------|---------|\n| Drivetrain Type | SH-AWD® | Super Handling All-Wheel Drive™ |\n| Transmission | 10-Speed Automatic | 10AT with paddle shifters |\n| Towing Capacity | 1,500 lbs | When properly equipped |`;
          }
          // Example conversion for engine specifications
          else if (chunk.content.includes('Engine Type')) {
            markdownContent = `## Engine Specifications\n\n| Specification | Value |\n|--------------|-------|\n| Engine Type | 2.0L VTEC® Turbo |\n| Horsepower | 272 hp @ 6,500 rpm |\n| Torque | 280 lb-ft @ 1,600-4,500 rpm |\n| Fuel System | Direct Injection |`;
          }
          
          console.log('Transformed chunk:', chunk.title);
          return {
            ...chunk,
            content: markdownContent,
            isMarkdownFormatted: true
          };
        }
        
        return chunk;
      });
    }
    
    setFilteredChunks(chunks);
    setFilteredEntities(kgResults?.entities || []);
  }, [ragResults, kgResults, ragResults?.chunks, isPromptApplied, customExtractionPrompt]);

  // Handle feedback for evaluation results
  const handleFeedback = useCallback((feedbackType: 'positive' | 'negative') => {
    setFeedback(feedbackType);
    console.log(`User feedback for evaluation: ${feedbackType}`);
    // Here you could send feedback to an analytics service or API
    // For now, we'll just log it and update the local state
  }, []);

  // Handle prompt-based document re-processing
  const handlePromptApplication = useCallback(async (prompt: string) => {
    setIsReprocessing(true);
    setShowPromptBox(false);
    console.log(`Applying prompt for document re-processing: ${prompt}`);
    
    try {
      // Here you would integrate with your document processing API
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Send the prompt and document to your processing API
      // 2. Wait for the updated extraction results
      // 3. Update the evaluation results with the new data
      
      console.log('Document re-processing completed');
    } catch (error) {
      console.error('Error during document re-processing:', error);
    } finally {
      setIsReprocessing(false);
      setCustomPrompt('');
    }
  }, []);

  const handleQuickPrompt = useCallback((template: string) => {
    handlePromptApplication(template);
  }, [handlePromptApplication]);

  const handleCustomPrompt = useCallback(() => {
    if (customPrompt.trim()) {
      handlePromptApplication(customPrompt);
    }
  }, [customPrompt, handlePromptApplication]);

  // Handle IDP-specific prompt application
  const handleIdpPromptApplication = useCallback(async (prompt: string) => {
    setIsIdpReprocessing(true);
    setShowIdpPromptBox(false);
    console.log(`Applying IDP-specific prompt for document re-processing: ${prompt}`);
    
    try {
      // Here you would integrate with your document processing API for IDP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Send the prompt and document to your IDP processing API
      // 2. Wait for the updated extraction results
      // 3. Update the IDP results with the new data
      
      console.log('IDP document re-processing completed');
    } catch (error) {
      console.error('Error during IDP document re-processing:', error);
    } finally {
      setIsIdpReprocessing(false);
      setCustomIdpPrompt('');
    }
  }, []);

  const handleIdpQuickPrompt = useCallback((template: string) => {
    handleIdpPromptApplication(template);
  }, [handleIdpPromptApplication]);

  const handleIdpCustomPrompt = useCallback(() => {
    if (customIdpPrompt.trim()) {
      handleIdpPromptApplication(customIdpPrompt);
    }
  }, [customIdpPrompt, handleIdpPromptApplication]);

  // Predefined prompt templates for evaluation results
  const promptTemplates = [
    "Extract all tables with better accuracy and preserve formatting",
    "Re-analyze this document focusing on financial data and numbers",
    "Focus on contract terms, dates, and key legal clauses",
    "Improve form field detection and data validation",
    "Extract signatures, stamps, and document authenticity markers",
    "Re-process with enhanced OCR settings for better text recognition"
  ];

  // Predefined prompt templates specifically for IDP
  const idpPromptTemplates = [
    "Improve table extraction accuracy and preserve cell relationships",
    "Focus on form field detection and improve label matching",
    "Extract all signatures, stamps, and handwritten annotations",
    "Enhance OCR accuracy for challenging text regions"
  ];

  const renderRAGResults = () => {
    const multimodalProcessing = getMultimodalProcessingInfo();
    
    
    if (!ragResults || filteredChunks.length === 0) {
      return (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-500">No RAG/vector search results available.</p>
          {isPromptApplied && (
            <div className="max-w-md mx-auto">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    Prompt parsing is ready!
                  </p>
                  <p className="text-xs text-amber-700">
                    Click "Process Document" in the left panel to see your chunks transformed to Markdown format.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      );
    }
    
    // Use chunks directly - they should already be transformed by the hook when prompt is applied
    const displayChunks = filteredChunks;

    return (
      <div className="space-y-4">
        {/* Prompt-based Parsing Configuration */}
        {isPromptApplied && customExtractionPrompt && (
          <Card className="mb-4 border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wand2 className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-base">Prompt-based Parsing Active</CardTitle>
                </div>
                <Badge variant="default" className="text-[10px] h-5">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-xs font-medium text-gray-700">Custom Extraction Prompt:</span>
                </div>
                <div className="text-xs text-gray-600 italic">
                  "{customExtractionPrompt}"
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-500">Applied to: RAG chunks</span>
                  <Badge variant="secondary" className="text-[10px]">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Improving extraction
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-2 border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">Results ordered by relevance</p>
                <p className="text-sm text-blue-700 mt-1">Documents are sorted based on semantic similarity to the query. Higher scores (0.99-0.90) indicate strong relevance, while lower scores show decreasing relevance to your search.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayChunks.map((chunk, index) => {
            // Generate a relevance score that decreases with index (first item has highest score)
            const relevanceScore = Math.max(0.99 - (index * 0.08), 0.65).toFixed(2);
            // Determine color class based on relevance score (not currently used)
            // const scoreColorClass = parseFloat(relevanceScore) > 0.9 ? "text-green-600" : 
            //                         parseFloat(relevanceScore) > 0.75 ? "text-blue-600" : "text-yellow-600";
            
            return (
              <Card
                key={chunk.id}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedChunk === chunk.id && "ring-2 ring-blue-500"
                )}
                onClick={() => onChunkSelect?.(chunk.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {chunk.title}
                      {(chunk as any).isMarkdownFormatted && (
                        <span className="ml-2 text-sm font-normal text-purple-600">(Markdown)</span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("font-medium flex items-center gap-1 text-white", 
                        parseFloat(relevanceScore) > 0.9 ? "bg-green-600" : 
                        parseFloat(relevanceScore) > 0.75 ? "bg-blue-600" : "bg-amber-600")}>
                        <BarChart3 className="h-3 w-3" />
                        Score: {relevanceScore}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-800">Chunk {chunk.chunkIndex + 1}</Badge>
                    </div>
                  </div>
                  <CardDescription className="mt-1 text-xs">
                    {chunk.tokenCount} tokens • {chunk.fileName || 'Document'} • Page {chunk.page || 1}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chunk.isMarkdownFormatted ? (
                    <div className="markdown-rendered">
                      {renderMarkdownContent(chunk.content)}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {chunk.content}
                    </p>
                  )}
                  {chunk.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chunk.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white text-gray-700 border-gray-300">
                          <Tag className="h-3 w-3 mr-1 text-blue-600" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderKGResults = () => {
    // Check if Knowledge Graph processing is enabled through the checkbox
    if (!processingConfig?.kg?.enabled) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Knowledge Graph is disabled. Enable it in the left panel to view results.
          </p>
        </div>
      );
    }
    
    // Now check if we have actual results to display
    if (!kgResults || filteredEntities.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No Knowledge Graph entities found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEntities.map((entity) => (
            <Card
              key={entity.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => onEntitySelect?.(entity.id)}
            >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {entity.type === 'Person' && <User className="h-4 w-4" />}
                  {entity.type === 'Organization' && <Package className="h-4 w-4" />}
                  {entity.name}
                </CardTitle>
                <Badge>{entity.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Entity properties */}
              <div className="space-y-2">
                {Object.entries(entity.properties || {}).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {key}:
                    </span>{' '}
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>

              {/* Relationships */}
              {entity.relationships && entity.relationships.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Relationships:</p>
                  <div className="space-y-1">
                    {entity.relationships.slice(0, 2).map((rel: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        <ChevronRight className="inline h-3 w-3" />
                        {rel.type} {rel.direction === 'outbound' ? 'to' : 'from'} {rel.target}
                      </div>
                    ))}
                    {entity.relationships.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{entity.relationships.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  };

  const renderJsonNode = (data: any, path: string = '', depth: number = 0): JSX.Element => {
    if (data === null || data === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof data !== 'object') {
      return <span className="text-green-600">{JSON.stringify(data)}</span>;
    }

    if (Array.isArray(data)) {
      return (
        <div className="ml-4">
          {data.map((item, index) => {
            const itemPath = `${path}[${index}]`;
            const isExpanded = expandedJson.includes(itemPath);
            
            return (
              <div key={index} className="my-1">
                <div className="flex items-start">
                  <button
                    onClick={() => {
                      setExpandedJson(prev => 
                        isExpanded 
                          ? prev.filter(p => p !== itemPath)
                          : [...prev, itemPath]
                      );
                    }}
                    className="mr-1 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <span className="text-blue-600">[{index}]</span>
                </div>
                {isExpanded && (
                  <div className="ml-6">
                    {renderJsonNode(item, itemPath, depth + 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="ml-4">
        {Object.entries(data).map(([key, value]) => {
          const itemPath = `${path}.${key}`;
          const isExpanded = expandedJson.includes(itemPath);
          const isObject = typeof value === 'object' && value !== null;
          
          return (
            <div key={key} className="my-1">
              <div className="flex items-start">
                {isObject && (
                  <button
                    onClick={() => {
                      setExpandedJson(prev => 
                        isExpanded 
                          ? prev.filter(p => p !== itemPath)
                          : [...prev, itemPath]
                      );
                    }}
                    className="mr-1 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
                <span className="text-purple-600 font-medium">{key}:</span>
                {!isObject && <span className="ml-2">{renderJsonNode(value, itemPath, depth + 1)}</span>}
              </div>
              {isObject && isExpanded && (
                <div className="ml-6">
                  {renderJsonNode(value, itemPath, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderImagesTab = () => {
    if (!idpResults?.extractedData?.images || idpResults.extractedData.images.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found in the document.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-indigo-500" />
                <CardTitle>Image Gallery</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="diagram" className="text-xs">Diagrams</TabsTrigger>
                    <TabsTrigger value="part" className="text-xs">Parts</TabsTrigger>
                    <TabsTrigger value="procedure" className="text-xs">Procedures</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant={imageViewMode === 'grid' ? 'default' : 'outline'}
                    className="h-8 w-8"
                    onClick={() => setImageViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={imageViewMode === 'list' ? 'default' : 'outline'}
                    className="h-8 w-8"
                    onClick={() => setImageViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {imageViewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {idpResults.extractedData.images
                  .filter(img => selectedCategory === 'all' || img.category === selectedCategory)
                  .map((image) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={image.url}
                          alt={image.caption || 'Document image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {image.category && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-xs"
                        >
                          {image.category}
                        </Badge>
                      )}
                      {image.caption && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {idpResults.extractedData.images
                  .filter(img => selectedCategory === 'all' || img.category === selectedCategory)
                  .map((image) => (
                    <div
                      key={image.id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt={image.caption || 'Document image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{image.caption || 'Untitled Image'}</h4>
                            {image.category && (
                              <Badge variant="outline" className="mt-1">
                                {image.category}
                              </Badge>
                            )}
                            <p className="text-sm text-gray-600 mt-2">
                              Page {(image as any).pageNumber || 'Unknown'}
                            </p>
                          </div>
                          <Eye className="h-5 w-5 text-gray-400" />
                        </div>
                        {image.annotations && image.annotations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Annotations:</p>
                            <div className="flex flex-wrap gap-1">
                              {image.annotations.map((annotation, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {annotation.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderIDPResults = () => {
    // Check if Document Intelligence processing is enabled through the checkbox
    if (!processingConfig?.idp?.enabled) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Document Intelligence is disabled. Enable it in the left panel to view results.</p>
        </div>
      );
    }

    // Now check if we have actual results to display
    if (!idpResults) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No Document Intelligence results found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Automotive Data Display */}
        {idpResults?.extractedData?.specifications && (
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-blue-500" />
                  <CardTitle>Vehicle Specifications</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const data = JSON.stringify(idpResults.extractedData.specifications, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'vehicle-specifications.json';
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {idpResults.extractedData.specifications.vehicle && (
                  <div>
                    <h4 className="font-semibold mb-2">Vehicle Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Make</p>
                        <p className="font-medium">{idpResults.extractedData.specifications.vehicle.make}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Model</p>
                        <p className="font-medium">{idpResults.extractedData.specifications.vehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Year</p>
                        <p className="font-medium">{idpResults.extractedData.specifications.vehicle.year}</p>
                      </div>
                      {idpResults.extractedData.specifications.vehicle.trim && (
                        <div>
                          <p className="text-sm text-gray-600">Trim</p>
                          <p className="font-medium">{idpResults.extractedData.specifications.vehicle.trim}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {idpResults.extractedData.specifications.features && (
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {idpResults.extractedData.specifications.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parts Catalog */}
        {idpResults?.extractedData?.partsData && idpResults.extractedData.partsData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  <CardTitle>Parts Catalog</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search parts..."
                    className="w-64"
                    onChange={(e) => setJsonSearchQuery(e.target.value)}
                  />
                  <Badge variant="secondary">
                    {idpResults.extractedData.partsData.length} parts
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {idpResults.extractedData.partsData
                      .filter(part => 
                        !jsonSearchQuery || 
                        part.partNumber.toLowerCase().includes(jsonSearchQuery.toLowerCase()) ||
                        part.description.toLowerCase().includes(jsonSearchQuery.toLowerCase())
                      )
                      .map((part, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{part.partNumber}</TableCell>
                          <TableCell>{part.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{part.category}</Badge>
                          </TableCell>
                          <TableCell>{part.price ? `$${part.price}` : '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={part.availability === 'In Stock' ? 'default' : 'secondary'}
                              className={part.availability === 'In Stock' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {part.availability || 'Check'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Procedures */}
        {idpResults?.extractedData?.procedures && idpResults.extractedData.procedures.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSearch className="h-5 w-5 text-green-500" />
                  <CardTitle>Service Procedures</CardTitle>
                </div>
                <Badge variant="secondary">
                  {idpResults.extractedData.procedures.length} procedures
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {idpResults.extractedData.procedures.map((procedure) => (
                  <Card key={procedure.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{procedure.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{procedure.category}</Badge>
                            {procedure.duration && (
                              <span className="text-sm text-gray-600">⏱ {procedure.duration}</span>
                            )}
                            {procedure.difficulty && (
                              <Badge 
                                variant="secondary"
                                className={cn(
                                  procedure.difficulty === 'easy' && 'bg-green-100 text-green-800',
                                  procedure.difficulty === 'medium' && 'bg-yellow-100 text-yellow-800',
                                  procedure.difficulty === 'hard' && 'bg-red-100 text-red-800'
                                )}
                              >
                                {procedure.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-1">
                        {procedure.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* JSON Data Viewer - Removed */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileJson className="h-5 w-5 text-purple-500" />
                <CardTitle>Extracted JSON Data</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search JSON..."
                  value={jsonSearchQuery}
                  onChange={(e) => setJsonSearchQuery(e.target.value)}
                  className="w-48"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const data = JSON.stringify(idpResults, null, 2);
                    navigator.clipboard.writeText(data);
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[500px]">
              {renderJsonNode(idpResults)}
            </div>
          </CardContent>
        </Card> */}

        {/* Document Intelligence Header with Enhancement */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle>Document Intelligence Results</CardTitle>
                <div className="flex items-center space-x-1 ml-3">
                  <Popover open={showIdpPromptBox} onOpenChange={setShowIdpPromptBox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-3 transition-colors border border-transparent",
                          isIdpReprocessing
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                        )}
                        disabled={isIdpReprocessing}
                        title="Use AI to improve document intelligence extraction"
                      >
                        {isIdpReprocessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            <span className="text-xs">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">Enhance</span>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[420px] p-0" align="start">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">Document Intelligence Enhancement</h3>
                        </div>
                        <p className="text-sm text-blue-700">Improve table, form, and text extraction accuracy</p>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Specialized IDP Enhancements
                          </h4>
                          <div className="grid gap-2">
                            {idpPromptTemplates.map((template, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="justify-start text-left h-auto p-3 text-xs hover:bg-blue-50 hover:border-blue-200 min-h-[44px]"
                                onClick={() => handleIdpQuickPrompt(template)}
                              >
                                <div className="flex items-start gap-2 w-full">
                                  <Settings className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                  <span className="text-xs leading-relaxed break-words whitespace-normal">{template}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            Custom IDP Instructions
                          </h4>
                          <Textarea
                            placeholder="Describe how to improve table extraction, form fields, or document structure analysis..."
                            value={customIdpPrompt}
                            onChange={(e) => setCustomIdpPrompt(e.target.value)}
                            className="min-h-[90px] text-sm border-blue-200 focus:border-blue-400"
                          />
                          <div className="flex justify-between mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowIdpPromptBox(false);
                                setCustomIdpPrompt('');
                              }}
                              className="text-gray-600"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleIdpCustomPrompt}
                              disabled={!customIdpPrompt.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Wand2 className="h-4 w-4 mr-1" />
                              Enhance IDP
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Document AI</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">Extracted {Object.keys(idpResults?.metadata || {}).length} metadata fields, {idpResults?.extractedData?.tables?.length || 0} tables, and {Object.keys(idpResults?.extractedData?.formFields || {}).length} form fields from the document.</p>
          </CardContent>
        </Card>

        {/* Metadata Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(idpResults?.metadata || {}).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {key}
                  </p>
                  <p className="text-sm mt-1">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Classification section removed */}

        {/* Extracted Tables */}
        {idpResults?.extractedData?.tables?.map((table, tableIndex) => (
          <Card key={table.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Table {tableIndex + 1}: {table.name}
                {table.category && (
                  <Badge variant="outline" className="ml-2">
                    {table.category}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Confidence: {(table.confidence * 100).toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.headers.map((header, idx) => (
                        <TableHead key={idx}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Extracted Automotive Tables */}
        {extractedTables && extractedTables.tables.length > 0 && (
          <ExtractedTablesDisplay 
            extractedData={extractedTables}
            className="mt-4"
          />
        )}

        {/* Images moved to separate Images tab */}
        {/* <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image className="h-5 w-5 text-indigo-500" />
                  <CardTitle>Image Gallery</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="h-8">
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                      <TabsTrigger value="diagram" className="text-xs">Diagrams</TabsTrigger>
                      <TabsTrigger value="part" className="text-xs">Parts</TabsTrigger>
                      <TabsTrigger value="procedure" className="text-xs">Procedures</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant={imageViewMode === 'grid' ? 'default' : 'outline'}
                      className="h-8 w-8"
                      onClick={() => setImageViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={imageViewMode === 'list' ? 'default' : 'outline'}
                      className="h-8 w-8"
                      onClick={() => setImageViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {imageViewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {idpResults.extractedData.images
                    .filter(img => selectedCategory === 'all' || img.category === selectedCategory)
                    .map((image) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={image.url}
                            alt={image.caption || 'Document image'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {image.category && (
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 text-xs"
                          >
                            {image.category}
                          </Badge>
                        )}
                        {image.caption && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{image.caption}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {idpResults.extractedData.images
                    .filter(img => selectedCategory === 'all' || img.category === selectedCategory)
                    .map((image) => (
                      <div
                        key={image.id}
                        className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={image.url}
                            alt={image.caption || 'Document image'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{image.caption || 'Untitled Image'}</h4>
                              {image.category && (
                                <Badge variant="outline" className="mt-1">
                                  {image.category}
                                </Badge>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                          {image.metadata && Object.keys(image.metadata).length > 0 && (
                            <div className="mt-2 space-y-1">
                              {Object.entries(image.metadata).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="text-gray-600">{key}:</span>
                                  <span className="ml-2">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )} */}

        {/* Q&A Integration removed */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-green-500" />
                <CardTitle>Q&A Testing</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() => setShowTestingInterface(true)}
              >
                Open Testing Interface
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Test document understanding with automotive-specific questions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setAgenticQuery('What is the engine displacement?');
                    setActiveTab('test');
                  }}
                >
                  What is the engine displacement?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setAgenticQuery('List all available safety features');
                    setActiveTab('test');
                  }}
                >
                  List all available safety features
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setAgenticQuery('What are the maintenance intervals?');
                    setActiveTab('test');
                  }}
                >
                  What are the maintenance intervals?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setAgenticQuery('Find part numbers for brake pads');
                    setActiveTab('test');
                  }}
                >
                  Find part numbers for brake pads
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Form Fields */}
        {Object.keys(idpResults?.extractedData?.formFields || {}).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(idpResults?.extractedData?.formFields || {}).map(([field, data]) => (
                  <div key={field} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{field}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {String(data.value)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {data.type}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {(data.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Function to handle the agentic query button click
  const handleAgenticQueryClick = async (query: string) => {
    // First, trigger onClearResults to show all results
    if (onClearResults) {
      // Set loading state
      setIsLoading(true);
      
      // Call onClearResults function
      onClearResults();
      
      // Set a timeout to allow UI to update and show all results
      setTimeout(() => {
        // After a delay, process the agentic query
        setIsLoading(false);
        processAgenticQuery(query);
      }, 1500); // 1.5 second delay
    } else {
      // If onClearResults not available, just process the query
      processAgenticQuery(query);
    }
  };
  
  // Mock function to simulate agentic query processing
  const processAgenticQuery = async (query: string) => {
    setIsAgenticLoading(true);
    setActiveTab('test'); // Ensure test tab is active
    
    // Check if this is one of the automotive test questions
    const matchingQuestion = automotiveTestQuestions.find(q => q.question === query);
    
    if (matchingQuestion) {
      // Run the test for this specific question
      setIsRunningTests(true);
      
      // Simulate retrieving answer from RAG chunks
      setTimeout(() => {
        const testResult = {
          id: matchingQuestion.id,
          question: matchingQuestion.question,
          actualAnswer: getAnswerFromChunks(query),
          confidence: isPromptApplied ? 0.95 : Math.random() * 0.3 + 0.7, // Higher confidence when prompt applied
          sources: getRelevantChunks(query),
          documentReference: matchingQuestion.documentReference || 'Acura_2025_RDX_Fact Sheet.pdf',
          timestamp: new Date().toISOString()
        };
        
        // Add to test results
        setTestResults(prev => [...prev.filter(r => r.id !== testResult.id), testResult]);
        setIsRunningTests(false);
        // Stay on query tab - don't switch
      }, 1500);
    }
    
    // Get chunks and entities to use (use filtered if available, otherwise use all)
    const chunksToUse = filteredChunks.length > 0 ? filteredChunks : (ragResults?.chunks || []);
    const entitiesToUse = filteredEntities.length > 0 ? filteredEntities : (kgResults?.entities || []);
    
    // Simulate API call - in real implementation, this would call an LLM API
    setTimeout(() => {
      const mockResults = {
        summary: `Based on the analyzed document, here's what I found regarding "${query}":`,
        ragInsights: ragResults ? {
          relevantChunks: chunksToUse.slice(0, 3),
          summary: "The document contains detailed information about technical specifications and implementation guidelines."
        } : null,
        kgInsights: kgResults ? {
          relevantEntities: entitiesToUse.filter(e => e.type === 'Person' || e.type === 'Organization').slice(0, 3),
          relationships: "The document mentions key stakeholders and organizations involved in the project.",
          summary: "Multiple entities are connected through various business relationships."
        } : null,
        idpInsights: idpResults ? {
          tables: idpResults.extractedData?.tables?.length || 0,
          tableSummary: "The document contains structured data that provides key metrics and comparisons.",
          formData: "Several forms were identified with important compliance information."
        } : null,
        recommendations: [
          "Review the technical specifications in sections 2.3 and 4.1",
          "Pay attention to the compliance requirements mentioned in the forms",
          "Consider the relationships between the identified entities"
        ]
      };
      
      setAgenticResults(mockResults);
      setIsAgenticLoading(false);
    }, 2000);
  };

  // Helper function to get answer from chunks (simulates RAG retrieval)
  const getAnswerFromChunks = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // If prompt is applied, return correct answer
    if (isPromptApplied && lowerQuery.includes('towing capacity')) {
      return '1,500 lbs';
    }
    
    // Otherwise return not found
    return 'Answer not able to find';
  };
  
  // Helper function to get relevant chunks
  const getRelevantChunks = (query: string): any[] => {
    if (!ragResults?.chunks) return [];
    
    // If prompt is applied, return properly formatted Markdown chunks
    if (isPromptApplied && query.toLowerCase().includes('towing capacity')) {
      return [{
        content: `## Drivetrain Specifications

| Component | Specification | Details |
|-----------|--------------|---------|
| Drivetrain Type | SH-AWD® | Super Handling All-Wheel Drive™ |
| Transmission | 10-Speed Automatic | 10AT with paddle shifters |
| Towing Capacity | 1,500 lbs | When properly equipped |`,
        confidence: 0.95
      }];
    }
    
    // Find chunks that might contain the answer
    const relevantChunks = ragResults.chunks.filter((chunk: any) => 
      chunk.content.toLowerCase().includes(query.toLowerCase().split(' ').slice(-2).join(' '))
    ).slice(0, 3);
    
    return relevantChunks.map((chunk: any) => ({
      content: chunk.content.substring(0, 150) + '...',
      confidence: Math.random() * 0.2 + 0.8 // 80-100% confidence
    }));
  };

  const agenticSuggestions = [
    "What is the towing capacity of the 2025 Acura RDX?",
    "What type of drivetrain does the 2025 Acura RDX have?",
    "What is the engine displacement of the 2025 Acura RDX?",
    "What is the ground clearance of the 2025 Acura RDX?",
    "How many speakers are in the ELS Studio 3D Audio system?",
    "What is the maximum horsepower of the 2025 Acura RDX?",
    "What transmission does the 2025 Acura RDX use?",
    "What safety features are included in AcuraWatch®?"
  ];

  // Function to navigate between tabs with visual feedback
  const navigateToTab = (tab: 'source' | 'all' | 'rag' | 'kg' | 'idp' | 'test' | 'images') => {
    // Handle navigation to 'all' tab by redirecting to 'test' 
    if (tab === 'all') {
      console.log('Redirecting from "all" tab to "test" tab');
      setActiveTab('test');
      return;
    }
    
    // Only allow navigation to tabs that are enabled
    if (tab === 'kg' && !processingConfig?.kg?.enabled) {
      console.log('Cannot navigate to KG tab - KG processing is disabled');
      return;
    }
    
    if (tab === 'idp' && !processingConfig?.idp?.enabled) {
      console.log('Cannot navigate to IDP tab - IDP processing is disabled');
      return;
    }
    
    console.log(`Navigating to tab: ${tab}`);
    setActiveTab(tab);
  };

  // Function to perform evaluation of RAG, KG, and IDP results
  const performEvaluation = () => {
    setIsEvaluationLoading(true);
    setShowEvaluation(true);
    
    // Simulate LLM evaluation process
    setTimeout(() => {
      // Mock evaluation results
      const evaluation = {
        executiveSummary: "Overall, the RAG system provides the most reliable information retrieval capabilities for this document type, scoring highest in factual accuracy and relevance. The Knowledge Graph excels at relationship identification but lacks some contextual understanding. The Document Intelligence system effectively extracts structured data but misses some deeper semantic connections.",
        scores: {
          rag: {
            factualAccuracy: 8.5,
            completeness: 7.9,
            relevance: 9.2,
            reasoningQuality: 7.6,
            overallUtility: 8.4
          },
          kg: {
            factualAccuracy: 7.8,
            completeness: 6.9,
            relevance: 8.1,
            reasoningQuality: 8.4,
            overallUtility: 7.6
          },
          idp: {
            factualAccuracy: 9.1,
            completeness: 7.4,
            relevance: 7.2,
            reasoningQuality: 6.8,
            overallUtility: 7.7
          }
        },
        componentAnalysis: {
          rag: {
            analysis: "The RAG system effectively retrieves relevant document chunks and provides good contextual information. It excels at identifying key information from the text and maintaining contextual relevance.",
            strengths: [
              "High accuracy in retrieving factual information",
              "Excellent contextual relevance for the query",
              "Good coverage of the document's key points"
            ],
            weaknesses: [
              "Occasionally misses nuanced relationships between concepts",
              "Less effective with implicit or inferential questions"
            ],
            supportedClaims: [
              "The document contains detailed technical specifications",
              "Implementation guidelines are clearly articulated"
            ],
            unsupportedClaims: [
              "The project timeline extends to Q4 2023"
            ],
            incompleteInfo: [
              "Budget considerations are mentioned but not fully detailed"
            ]
          },
          kg: {
            analysis: "The Knowledge Graph effectively identifies entities and relationships but sometimes lacks broader context. It's particularly strong at mapping organizational structures and stakeholder relationships.",
            strengths: [
              "Excellent at identifying entity relationships",
              "Clear visualization of information hierarchy",
              "Good extraction of structured entity properties"
            ],
            weaknesses: [
              "Sometimes misclassifies entity types",
              "Misses some contextual relationships that aren't explicitly stated"
            ],
            supportedClaims: [
              "Multiple stakeholders are involved in the project",
              "Organizations have clearly defined relationships"
            ],
            unsupportedClaims: [
              "All entities are equally important to the project scope"
            ],
            incompleteInfo: [
              "Temporal relationships between entities aren't fully captured"
            ]
          },
          idp: {
            analysis: "The Document Intelligence system excels at extracting structured data and metadata. It provides high confidence in form field extraction and table data but may miss some conceptual connections.",
            strengths: [
              "Highly accurate extraction of form fields and tables",
              "Excellent document metadata identification",
              "Good classification of document type and purpose"
            ],
            weaknesses: [
              "Limited reasoning about the broader implications of the data",
              "Sometimes misses contextual relationships between data points"
            ],
            supportedClaims: [
              "The document contains structured data with key metrics",
              "Form fields contain compliance-related information"
            ],
            unsupportedClaims: [
              "All tabular data is of equal importance"
            ],
            incompleteInfo: [
              "Relationships between tables aren't fully analyzed"
            ]
          }
        },
        recommendation: "For this document type and query, the RAG system provides the most balanced approach with high factual accuracy and relevance. For relationship-focused queries, the Knowledge Graph would be more appropriate, while for pure data extraction, the Document Intelligence system would be optimal. A hybrid approach leveraging RAG for contextual information and IDP for structured data extraction would provide the most comprehensive analysis."
      };
      
      setEvaluationResults(evaluation);
      setIsEvaluationLoading(false);
    }, 3000);
  };

  // Helper function to render colored text based on type
  const renderColoredText = (text: string, type: 'supported' | 'unsupported' | 'incomplete') => {
    const colorClass = 
      type === 'supported' ? 'bg-green-100 text-green-800 px-1 rounded' : 
      type === 'unsupported' ? 'bg-red-100 text-red-800 px-1 rounded' : 
      'bg-yellow-100 text-yellow-800 px-1 rounded';
    
    return <span className={colorClass}>{text}</span>;
  };

  const renderAgenticResults = () => {
    return (
      <div className="space-y-6">
        {/* Query Input */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-purple-500" />
                <CardTitle>Evaluate and Test</CardTitle>
              </div>
              {isPromptApplied && (
                <Badge variant="default" className="text-xs">
                  <Wand2 className="h-3 w-3 mr-1" />
                  Prompt-based Parsing Active
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Button
                            onClick={() => agenticQuery.trim() && handleAgenticQueryClick(agenticQuery)}
                            disabled={!agenticQuery.trim() || isAgenticLoading}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            {isAgenticLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-purple-500" />
                            )}
                          </Button>
                        </div>
                        <Input
                          placeholder="Enter your agentic prompt about the document..."
                          value={agenticQuery}
                          onChange={(e) => setAgenticQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && agenticQuery.trim()) {
                              handleAgenticQueryClick(agenticQuery);
                            }
                          }}
                          className="pl-10 pr-12 flex-1 w-full"
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                      </div>
                    </div>
                    
                    {showSuggestions && agenticQuery === '' && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border overflow-hidden">
                        <div className="p-2">
                          <p className="text-sm font-medium text-gray-500 px-2 py-1">Suggested prompts</p>
                          <div className="space-y-1 mt-1">
                            {agenticSuggestions.map((suggestion, idx) => (
                              <div
                                key={idx}
                                className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                  setAgenticQuery(suggestion);
                                  handleAgenticQueryClick(suggestion);
                                }}
                              >
                                <Sparkles className="h-3.5 w-3.5 mr-2 text-purple-500" />
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Display latest result if available */}
                  {testResults.length > 0 && (
                    <div className="mt-4">
                      {(() => {
                        const latestResult = testResults[testResults.length - 1];
                        return (
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">Answer</CardTitle>
                                <Badge 
                                  variant={latestResult.confidence > 0.9 ? "default" : latestResult.confidence > 0.8 ? "secondary" : "outline"}
                                >
                                  {Math.round(latestResult.confidence * 100)}% Confidence
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="text-sm">{latestResult.actualAnswer}</div>
                              
                              {/* Markdown Preview for transformed chunks */}
                              {isPromptApplied && latestResult.actualAnswer !== 'Answer not able to find' && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-2">Transformed Output:</div>
                                  <div className="text-xs text-gray-600 pl-2">
                                    • ## Drivetrain Specifications
                                    <br /><br />
                                    | Component | Specification | Details |<br />
                                    |-----------|--------------|---------|<br />
                                    | Drivetrain Type | SH-AWD® | Super Handling All-Wheel Drive™ |<br />
                                    | Transmission | 10-Speed Automatic | 10AT with paddle shifters |<br />
                                    | Towing Capacity | 1,500 lbs | When properly equipped |
                                  </div>
                                </div>
                              )}
                              
                              {/* Citation */}
                              <div className="flex items-center text-xs text-gray-500">
                                <FileText className="h-3 w-3 mr-1" />
                                <span>Source: {latestResult.documentReference}</span>
                              </div>
                              
                              {/* Voting buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setFeedback('positive')}
                                  className={feedback === 'positive' ? 'bg-green-50 border-green-500' : ''}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Helpful
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setFeedback('negative')}
                                  className={feedback === 'negative' ? 'bg-red-50 border-red-500' : ''}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  Not Helpful
                                </Button>
                              </div>
                              
                              {/* Fix with prompt button */}
                              {latestResult.actualAnswer === 'Answer not able to find' && (
                                <div className="pt-3 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowPromptFix(true);
                                      setLocalCustomPrompt('');
                                    }}
                                  >
                                    <Wand2 className="h-4 w-4 mr-1" />
                                    Fix with prompt
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </div>
                  )}
                </div>
                {/* Results tab removed
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No test results yet. Run a query to see results.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {testResults.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{result.question}</h4>
                            <Badge 
                              variant={result.confidence > 0.9 ? "default" : result.confidence > 0.8 ? "secondary" : "outline"}
                              className="ml-2"
                            >
                              {Math.round(result.confidence * 100)}% Confidence
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <span className="text-sm font-medium text-gray-500 min-w-[80px]">Answer:</span>
                              <span className="text-sm">{result.actualAnswer}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500 min-w-[80px]">Document:</span>
                              <span className="text-sm text-gray-600">{result.documentReference}</span>
                            </div>
                          </div>
                          
                          {result.sources && result.sources.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-gray-500 mb-1">Sources:</p>
                              <div className="space-y-1">
                                {result.sources.map((source: any, idx: number) => (
                                  <div key={idx} className="text-xs text-gray-600 pl-2">
                                    • {source.content}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )} */}
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Button */}
        {agenticResults && !showEvaluation && (
          <Card>
            <CardContent className="py-4">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={performEvaluation}
                  disabled={isEvaluationLoading}
                >
                  {isEvaluationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating Results...
                    </>
                  ) : (
                    <>
                      <TableOfContents className="h-4 w-4" />
                      Evaluate Processing Components
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evaluation Results */}
        {showEvaluation && evaluationResults && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TableOfContents className="h-5 w-5 text-indigo-600" />
                  <CardTitle>LLM Evaluation of Processing Components</CardTitle>
                </div>
                <CardDescription>
                  Comparing RAG, Knowledge Graph, and Document Intelligence performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                  <p className="text-gray-700">{evaluationResults.executiveSummary}</p>
                </div>

                {/* Scores Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Component Scores (1-10)</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Criteria</TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Database className="h-4 w-4 text-blue-500" />
                              <span>RAG</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Network className="h-4 w-4 text-green-500" />
                              <span>Knowledge Graph</span>
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <span>Document Intelligence</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Factual Accuracy</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.rag.factualAccuracy >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.rag.factualAccuracy >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.rag.factualAccuracy.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.kg.factualAccuracy >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.kg.factualAccuracy >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.kg.factualAccuracy.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.idp.factualAccuracy >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.idp.factualAccuracy >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.idp.factualAccuracy.toFixed(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Completeness</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.rag.completeness >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.rag.completeness >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.rag.completeness.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.kg.completeness >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.kg.completeness >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.kg.completeness.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.idp.completeness >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.idp.completeness >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.idp.completeness.toFixed(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Relevance</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.rag.relevance >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.rag.relevance >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.rag.relevance.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.kg.relevance >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.kg.relevance >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.kg.relevance.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.idp.relevance >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.idp.relevance >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.idp.relevance.toFixed(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Reasoning Quality</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.rag.reasoningQuality >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.rag.reasoningQuality >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.rag.reasoningQuality.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.kg.reasoningQuality >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.kg.reasoningQuality >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.kg.reasoningQuality.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${evaluationResults.scores.idp.reasoningQuality >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.idp.reasoningQuality >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.idp.reasoningQuality.toFixed(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium font-bold">Overall Utility</TableCell>
                          <TableCell className="text-center font-bold">
                            <Badge className={`${evaluationResults.scores.rag.overallUtility >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.rag.overallUtility >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.rag.overallUtility.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <Badge className={`${evaluationResults.scores.kg.overallUtility >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.kg.overallUtility >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.kg.overallUtility.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <Badge className={`${evaluationResults.scores.idp.overallUtility >= 8 ? 'bg-green-100 text-green-800' : evaluationResults.scores.idp.overallUtility >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {evaluationResults.scores.idp.overallUtility.toFixed(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Component Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Component-Specific Analysis</h3>
                  
                  {/* RAG Analysis */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-blue-700">RAG Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p>{evaluationResults.componentAnalysis.rag.analysis}</p>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Strengths:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.rag.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Weaknesses:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.rag.weaknesses.map((weakness: string, idx: number) => (
                            <li key={idx} className="text-sm">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Claim Analysis:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.rag.supportedClaims.map((claim: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(claim, 'supported')}
                            </li>
                          ))}
                          {evaluationResults.componentAnalysis.rag.unsupportedClaims.map((claim: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(claim, 'unsupported')}
                            </li>
                          ))}
                          {evaluationResults.componentAnalysis.rag.incompleteInfo.map((info: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(info, 'incomplete')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* KG Analysis */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <Network className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-green-700">Knowledge Graph Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p>{evaluationResults.componentAnalysis.kg.analysis}</p>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Strengths:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.kg.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Weaknesses:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.kg.weaknesses.map((weakness: string, idx: number) => (
                            <li key={idx} className="text-sm">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Claim Analysis:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.kg.supportedClaims.map((claim: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(claim, 'supported')}
                            </li>
                          ))}
                          {evaluationResults.componentAnalysis.kg.unsupportedClaims.map((claim: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(claim, 'unsupported')}
                            </li>
                          ))}
                          {evaluationResults.componentAnalysis.kg.incompleteInfo.map((info: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(info, 'incomplete')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* IDP Analysis */}
                  <Card className="border-purple-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-purple-700">Document Intelligence Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p>{evaluationResults.componentAnalysis.idp.analysis}</p>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Strengths:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.idp.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Weaknesses:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.idp.weaknesses.map((weakness: string, idx: number) => (
                            <li key={idx} className="text-sm">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Claim Analysis:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {evaluationResults.componentAnalysis.idp.supportedClaims.map((claim: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(claim, 'supported')}
                            </li>
                          ))}
                          {evaluationResults.componentAnalysis.idp.unsupportedClaims.map((claim: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(claim, 'unsupported')}
                            </li>
                          ))}
                          {evaluationResults.componentAnalysis.idp.incompleteInfo.map((info: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {renderColoredText(info, 'incomplete')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recommendation */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Recommendation
                  </h3>
                  <p className="text-gray-800">{evaluationResults.recommendation}</p>
                </div>
                
                {/* Reset Button */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowEvaluation(false);
                      setEvaluationResults(null);
                    }}
                  >
                    Back to Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Evaluation Loading State */}
        {isEvaluationLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <div className="text-center">
                  <p className="text-lg font-medium">Evaluating Processing Components</p>
                  <p className="text-gray-600 mt-1">The LLM is comparing RAG, Knowledge Graph, and Document Intelligence results...</p>
                </div>
                <div className="w-full max-w-sm bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {agenticResults && !showEvaluation && (
          <div className="space-y-4">
            {/* Main Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <CardTitle>Evaluation Results</CardTitle>
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors",
                          feedback === 'positive'
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "hover:bg-green-50 hover:text-green-600"
                        )}
                        onClick={() => handleFeedback('positive')}
                        title="This evaluation was helpful"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors",
                          feedback === 'negative'
                            ? "bg-red-100 text-red-700 hover:bg-red-100"
                            : "hover:bg-red-50 hover:text-red-600"
                        )}
                        onClick={() => handleFeedback('negative')}
                        title="This evaluation needs improvement"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary">Powered by LLM</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{agenticResults.summary}</p>
                
                {/* RAG Insights */}
                {agenticResults.ragInsights && (
                  <div className="mb-6">
                    <h4 
                      className="font-medium mb-3 flex items-center cursor-pointer hover:text-blue-700 transition-colors rounded px-2 py-1 hover:bg-blue-50 inline-flex"
                      onClick={() => navigateToTab('rag')}
                      title="Click to view RAG search details"
                    >
                      <Database className="h-4 w-4 mr-2 text-blue-500" />
                      Document Search Insights
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{agenticResults.ragInsights.summary}</p>
                    <div className="space-y-2">
                      {agenticResults.ragInsights.relevantChunks.map((chunk: any) => (
                        <div key={chunk.id} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium">{chunk.title}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{chunk.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KG Insights - only show if KG tab is enabled */}
                {agenticResults.kgInsights && processingConfig?.kg?.enabled && (
                  <div className="mb-6">
                    <h4 
                      className="font-medium mb-3 flex items-center cursor-pointer hover:text-green-700 transition-colors rounded px-2 py-1 hover:bg-green-50 inline-flex"
                      onClick={() => navigateToTab('kg')}
                      title="Click to view Knowledge Graph details"
                    >
                      <Network className="h-4 w-4 mr-2 text-green-500" />
                      Knowledge Graph Insights
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{agenticResults.kgInsights.summary}</p>
                    <div className="space-y-2">
                      {agenticResults.kgInsights.relevantEntities.map((entity: any) => (
                        <div key={entity.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                          <Badge className={cn(
                            "text-white",
                            entity.type === 'Person' && "bg-blue-500",
                            entity.type === 'Organization' && "bg-green-500"
                          )}>
                            {entity.type}
                          </Badge>
                          <span className="text-sm font-medium">{entity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* IDP Insights - only show if IDP tab is enabled */}
                {agenticResults.idpInsights && processingConfig?.idp?.enabled && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      Document Intelligence Insights
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{agenticResults.idpInsights.tableSummary}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div 
                        className="text-center p-3 bg-purple-50 rounded-lg cursor-pointer hover:shadow-md transition-all"
                        onClick={() => navigateToTab('idp')}
                        title="Click to view Document Intelligence details"
                      >
                        <div className="text-2xl font-bold text-purple-700">
                          {agenticResults.idpInsights.tables}
                        </div>
                        <div className="text-xs text-gray-600">Tables Analyzed</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{agenticResults.idpInsights.formData}</p>
                  </div>
                )}

                {/* Recommendations */}
                {agenticResults.recommendations && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <TableOfContents className="h-4 w-4 mr-2 text-orange-500" />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {agenticResults.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <Sparkles className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isAgenticLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-gray-600">Analyzing your document with AI...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!agenticResults && !isAgenticLoading && !showEvaluation && (
          <Card>
            <CardContent className="py-8 text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Ask questions to get AI-powered insights</p>
              <p className="text-sm text-gray-500">
                The AI will analyze all your processing results (RAG, KG, IDP) to provide comprehensive answers
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Helper function to get multimodal processing info
  const getMultimodalProcessingInfo = () => {
    const multimodal = processingConfig?.rag?.multimodal;
    if (!multimodal) return [];
    
    const activeProcessing = [];
    // Only show Audio Transcription label if transcription toggle is enabled
    if (multimodal.transcription) activeProcessing.push({ 
      name: 'Audio Transcription', 
      icon: Headphones, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      id: 'audio-transcription' // ID matching the toggle in the multimodal panel
    });
    
    // Only show OCR label if OCR toggle is enabled
    if (multimodal.ocr) activeProcessing.push({ 
      name: 'OCR (Text Extraction)', 
      icon: ScanLine, 
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      id: 'ocr-processing' // ID matching the toggle in the multimodal panel
    });
    
    // Only show Image Captioning label if image caption toggle is enabled
    if (multimodal.imageCaption) activeProcessing.push({ 
      name: 'Image Captioning', 
      icon: Camera, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      id: 'image-captioning' // ID matching the toggle in the multimodal panel
    });
    
    // Only show Visual Analysis label if visual analysis toggle is enabled
    if (multimodal.visualAnalysis) activeProcessing.push({ 
      name: 'Visual Analysis', 
      icon: Eye, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      id: 'visual-analysis' // ID matching the toggle in the multimodal panel
    });
    
    return activeProcessing;
  };

  // Render the source document content
  const renderSourceDocument = () => {
    // Check if we have a selected document
    if (!selectedDocument) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No source document available.</p>
        </div>
      );
    }

    const documentName = selectedDocument.name;
    
    // For Acura PDF, show the PDF viewer
    if (documentName === "Acura_2025_RDX_Fact Sheet.pdf") {
      return (
        <div className="space-y-4">
          <Card className="h-[800px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-5 w-5 text-gray-600" />
                  <CardTitle>Source Document</CardTitle>
                </div>
                <Badge variant="outline">{documentName}</Badge>
              </div>
              <CardDescription>
                Original PDF document - 18 pages
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full pb-20">
              <PdfViewer 
                url="/api/assets/Acura_2025_RDX_Fact%20Sheet.pdf"
                className="h-full"
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    // For other documents, show text content if available
    if (ragResults && ragResults.chunks && ragResults.chunks.length > 0) {
      const totalChunks = ragResults.chunks.length;
      const combinedContent = ragResults.chunks
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .map(chunk => chunk.content)
        .join('\n\n');

      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-5 w-5 text-gray-600" />
                  <CardTitle>Source Document</CardTitle>
                </div>
                <Badge variant="outline">{documentName}</Badge>
              </div>
              <CardDescription>
                {totalChunks} chunks • Approximately {ragResults.chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)} tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-white overflow-auto max-h-[600px] whitespace-pre-wrap font-mono text-sm">
                {combinedContent}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No document content available.</p>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Content Understanding</h2>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="source" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Source Data
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2 bg-indigo-100">
              <BrainCircuit className="h-4 w-4" />
              Evaluate and Test
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="source">{renderSourceDocument()}</TabsContent>
          <TabsContent value="test">
            <div className="space-y-4">
              {/* Main collapsible sections */}
              <Accordion 
                type="single" 
                collapsible 
                value={currentActiveAccordion}
                onValueChange={setActiveAccordion}
                className="w-full space-y-4"
              >
                {/* RAG Accordion Item - Enhanced styling */}
                <AccordionItem value="rag" className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm overflow-hidden">
                  <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-blue-100/50 transition-colors [&[data-state=open]]:bg-blue-100">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-blue-900 text-base">🔍 RAG Results</div>
                        <div className="text-xs text-blue-600 mt-0.5">
                          Parse • Chunk • Index • Search
                          {ragResults?.chunks?.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-[10px] font-medium">
                              {ragResults.chunks.length} chunks
                            </span>
                          )}
                        </div>
                      </div>
                      {ragResults?.chunks?.length > 0 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 bg-white/50">
                    {renderRAGResults()}
                  </AccordionContent>
                </AccordionItem>

                {/* Document Understanding (IDP) Accordion Item */}
                {processingConfig?.idp?.enabled && (
                  <AccordionItem value="idp" className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm overflow-hidden">
                    <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-orange-100/50 transition-colors [&[data-state=open]]:bg-orange-100">
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-orange-900 text-base">📄 Document Understanding</div>
                          <div className="text-xs text-orange-600 mt-0.5">
                            Extract • Classify • Structure
                            {idpResults?.tables?.length > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-[10px] font-medium">
                                {idpResults.tables.length} tables
                              </span>
                            )}
                          </div>
                        </div>
                        {idpResults?.tables?.length > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 bg-white/50">
                      {renderIDPResults()}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Knowledge Graph Accordion Item */}
                {processingConfig?.kg?.enabled && (
                  <AccordionItem value="kg" className="border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg shadow-sm overflow-hidden">
                    <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-emerald-100/50 transition-colors [&[data-state=open]]:bg-emerald-100">
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <Network className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-emerald-900 text-base">🕸️ Knowledge Graph</div>
                          <div className="text-xs text-emerald-600 mt-0.5">
                            Entities • Relations • Graph
                            {kgResults?.entities?.length > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full text-[10px] font-medium">
                                {kgResults.entities.length} entities
                              </span>
                            )}
                          </div>
                        </div>
                        {kgResults?.entities?.length > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 bg-white/50">
                      {renderKGResults()}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Multimodal Content Accordion Item - Always visible for now */}
                <AccordionItem value="multimodal" className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm overflow-hidden">
                  <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-green-100/50 transition-colors [&[data-state=open]]:bg-green-100">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Image className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-green-900 text-base">🖼️ Multimodal Content</div>
                        <div className="text-xs text-green-600 mt-0.5">
                          Images • Audio • Video • Charts
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 bg-white/50">
                    {renderImagesTab()}
                  </AccordionContent>
                </AccordionItem>

                {/* Query Testing Interface Accordion Item */}
                <AccordionItem value="testing" className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm overflow-hidden">
                  <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-indigo-100/50 transition-colors [&[data-state=open]]:bg-indigo-100">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <TestTube className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-indigo-900 text-base">🧪 Query Testing Interface</div>
                        <div className="text-xs text-indigo-600 mt-0.5">
                          Test • Evaluate • Iterate • Optimize
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 bg-white/50">
                    {renderAgenticResults()}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default UnifiedResultsEnhanced;
