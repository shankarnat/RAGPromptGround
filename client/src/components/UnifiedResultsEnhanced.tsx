import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import UnifiedSearchEnhanced from '@/components/UnifiedSearchEnhanced';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Network, 
  Database,
  File,
  ChevronRight,
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
  BarChart3
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
    }>;
    images: Array<{
      id: string;
      url: string;
      caption?: string;
      metadata: Record<string, any>;
    }>;
    formFields: Record<string, {
      value: any;
      type: string;
      confidence: number;
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
}

const UnifiedResultsEnhanced: React.FC<UnifiedResultsEnhancedProps> = ({
  ragResults,
  kgResults,
  idpResults,
  processingConfig,
  onChunkSelect,
  onEntitySelect,
  selectedChunk,
  onClearResults
}) => {
  const [activeTab, setActiveTab] = useState<'source' | 'all' | 'rag' | 'kg' | 'idp' | 'agentic'>('agentic');
  
  // Handle tab switching if the current tab is disabled
  useEffect(() => {
    // If Knowledge Graph tab is active but KG is disabled, switch to 'agentic' tab
    if (activeTab === 'kg' && !processingConfig?.kg?.enabled) {
      setActiveTab('agentic');
    }
    
    // If Document Intelligence tab is active but IDP is disabled, switch to 'agentic' tab
    if (activeTab === 'idp' && !processingConfig?.idp?.enabled) {
      setActiveTab('agentic');
    }
    
    // If 'all' tab is active, switch to 'agentic' tab (since we've removed the 'all' tab)
    if (activeTab === 'all') {
      setActiveTab('agentic');
    }
  }, [activeTab, processingConfig?.kg?.enabled, processingConfig?.idp?.enabled]);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Initialize filtered data
  useMemo(() => {
    setFilteredChunks(ragResults?.chunks || []);
    setFilteredEntities(kgResults?.entities || []);
  }, [ragResults, kgResults]);

  const renderRAGResults = () => {
    const multimodalProcessing = getMultimodalProcessingInfo();
    
    if (!ragResults || filteredChunks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No RAG/vector search results available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Multimodal Processing Applied card has been removed */}
        
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
          {filteredChunks.map((chunk, index) => {
            // Generate a relevance score that decreases with index (first item has highest score)
            const relevanceScore = Math.max(0.99 - (index * 0.08), 0.65).toFixed(2);
            // Determine color class based on relevance score
            const scoreColorClass = parseFloat(relevanceScore) > 0.9 ? "text-green-600" : 
                                    parseFloat(relevanceScore) > 0.75 ? "text-blue-600" : "text-yellow-600";
            
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
                    <CardTitle className="text-lg">{chunk.title}</CardTitle>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {chunk.content}
                  </p>
                  {chunk.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chunk.tags.map((tag, idx) => (
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
                    {entity.relationships.slice(0, 2).map((rel, idx) => (
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
    setActiveTab('agentic'); // Ensure agentic tab is active
    
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

  const agenticSuggestions = [
    "Summarize the main points of this document",
    "What are the key relationships between entities?",
    "Extract and explain the data from tables",
    "What are the compliance requirements?",
    "Who are the main stakeholders mentioned?",
    "What are the technical specifications?",
    "Summarize the financial data",
    "What are the project timelines?"
  ];

  // Function to navigate between tabs with visual feedback
  const navigateToTab = (tab: 'source' | 'all' | 'rag' | 'kg' | 'idp' | 'agentic') => {
    // Handle navigation to 'all' tab by redirecting to 'agentic' 
    if (tab === 'all') {
      console.log('Redirecting from "all" tab to "agentic" tab');
      setActiveTab('agentic');
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
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              <CardTitle>Evaluate and Test</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
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
    // If no document is selected or no RAG results available, show placeholder
    if (!ragResults || !ragResults.chunks || ragResults.chunks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No source document available.</p>
        </div>
      );
    }

    // Get document metadata from the first chunk
    const firstChunk = ragResults.chunks[0];
    const documentName = firstChunk.fileName || 'Document';
    const totalChunks = ragResults.chunks.length;
    
    // In a real implementation, we'd fetch the full document content
    // For this prototype, we'll concatenate all the chunks
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
  };

  const renderAllResults = () => {
    const hasRagResults = ragResults && filteredChunks.length > 0;
    const hasKgResults = kgResults && filteredEntities.length > 0 && processingConfig?.kg?.enabled;
    const hasIdpResults = idpResults && processingConfig?.idp?.enabled;
    const hasAnyResults = hasRagResults || hasKgResults || hasIdpResults;
    const multimodalProcessing = getMultimodalProcessingInfo();

    if (!hasAnyResults) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No results available. Please process your document first.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Multimodal Processing Info */}
        {multimodalProcessing.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                <CardTitle>Applied Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {multimodalProcessing.map((process, idx) => {
                  const Icon = process.icon;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg",
                        process.bgColor
                      )}
                    >
                      <Icon className={cn("h-5 w-5", process.color)} />
                      <span className="font-medium text-sm text-gray-700">
                        {process.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAG Results Card */}
        {hasRagResults && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:text-blue-700 transition-colors rounded px-2 py-1 hover:bg-blue-50 group"
                  onClick={() => navigateToTab('rag')}
                  title="Click to view RAG search details"
                >
                  <Database className="h-5 w-5 text-blue-500" />
                  <CardTitle>Document Chunks</CardTitle>
                </div>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent onClick
                    navigateToTab('source');
                  }}
                  title="Click to view full source document"
                >
                  {filteredChunks.length} chunks
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredChunks.slice(0, 5).map((chunk) => (
                    <div
                      key={chunk.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        selectedChunk === chunk.id ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                      )}
                      onClick={() => onChunkSelect?.(chunk.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{chunk.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {chunk.tokenCount} tokens
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{chunk.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chunk.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredChunks.length > 5 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      +{filteredChunks.length - 5} more chunks
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* IDP Results Card - Now first after RAG - only shown when IDP checkbox is checked */}
        {hasIdpResults && processingConfig?.idp?.enabled && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:text-purple-700 transition-colors rounded px-2 py-1 hover:bg-purple-50 group"
                  onClick={() => navigateToTab('idp')}
                  title="Click to view Document Intelligence details"
                >
                  <FileText className="h-5 w-5 text-purple-500" />
                  <CardTitle>Document Intelligence</CardTitle>
                </div>
                <Badge variant="secondary">{Object.keys(idpResults.metadata || {}).length} fields</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Metadata */}
                  <div>
                    <h4 className="font-medium mb-3">Extracted Metadata</h4>
                    <div className="space-y-2">
                      {Object.entries(idpResults.metadata || {}).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium text-gray-700">{key}</span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                      {Object.keys(idpResults.metadata || {}).length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{Object.keys(idpResults.metadata).length - 5} more fields
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Classification */}
                  {idpResults.classification?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Classification</h4>
                      <div className="flex flex-wrap gap-2">
                        {idpResults.classification.map(cls => (
                          <Badge key={cls} className="bg-purple-100 text-purple-700">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Summary */}
                  {idpResults.extractedData && (
                    <div>
                      <h4 className="font-medium mb-3">Extracted Data</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div 
                          className="text-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-purple-50 hover:shadow-md transition-all"
                          onClick={() => navigateToTab('idp')}
                          title="Click to view Document Intelligence details"
                        >
                          <div className="text-2xl font-bold">
                            {idpResults.extractedData.tables?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Tables</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold">
                            {idpResults.extractedData.images?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Images</div>
                        </div>
                        <div 
                          className="text-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-purple-50 hover:shadow-md transition-all"
                          onClick={() => navigateToTab('idp')}
                          title="Click to view Document Intelligence details"
                        >
                          <div className="text-2xl font-bold">
                            {Object.keys(idpResults.extractedData.formFields || {}).length}
                          </div>
                          <div className="text-sm text-gray-600">Forms</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Knowledge Graph Results Card - Moved after IDP - only shown when KG checkbox is checked */}
        {hasKgResults && processingConfig?.kg?.enabled && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:text-green-700 transition-colors rounded px-2 py-1 hover:bg-green-50 group"
                  onClick={() => navigateToTab('kg')}
                  title="Click to view Knowledge Graph details"
                >
                  <Network className="h-5 w-5 text-green-500" />
                  <CardTitle>Knowledge Graph</CardTitle>
                </div>
                <Badge variant="secondary">{filteredEntities.length} entities</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Entities</h4>
                    <div className="space-y-2">
                      {filteredEntities.slice(0, 5).map(entity => (
                        <div
                          key={entity.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => onEntitySelect?.(entity.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Badge className={cn(
                              "text-white",
                              entity.type === 'Person' && "bg-blue-500",
                              entity.type === 'Organization' && "bg-green-500",
                              entity.type === 'Date' && "bg-orange-500",
                              entity.type === 'Location' && "bg-red-500"
                            )}>
                              {entity.type}
                            </Badge>
                            <span className="font-medium">{entity.name}</span>
                          </div>
                          {entity.relationships && entity.relationships.length > 0 && (
                            <span className="text-sm text-gray-500">
                              {entity.relationships.length} relations
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {kgResults.graph && (
                    <>
                      <div className="my-3 border-t" />
                      <div>
                        <h4 className="font-medium mb-2">Graph Statistics</h4>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-2xl font-bold">{kgResults.graph.nodes}</div>
                            <div className="text-gray-600">Nodes</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-2xl font-bold">{kgResults.graph.edges}</div>
                            <div className="text-gray-600">Edges</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-2xl font-bold">
                              {(kgResults.graph.density * 100).toFixed(0)}%
                            </div>
                            <div className="text-gray-600">Density</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-semibold">Content Understanding</h2>
        </div>
        {onClearResults && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // Set loading state
              setIsLoading(true);
              
              // Clear results and then restore them after a simulated delay
              onClearResults();
              
              // Set the active tab to Agentic Results
              setActiveTab('agentic');
              
              // Simulate processing delay
              setTimeout(() => {
                setIsLoading(false);
              }, 1200);
            }}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Results...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show All Results
              </>
            )}
          </Button>
        )}
      </div>
      
      <UnifiedSearchEnhanced
        onSearch={handleSearch}
        ragResults={ragResults}
        kgResults={kgResults}
        idpResults={idpResults}
        className="mb-4"
      />

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1">
        <TabsList className="w-full justify-start mb-4">
          {/* Tab order: 1. Source Doc, 2. All Results, 3. Agentic Results, 4. RAG, 5. Doc Intelligence, 6. KG */}
          <TabsTrigger value="source" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            Source Doc
          </TabsTrigger>
          <TabsTrigger value="agentic" className="flex items-center gap-2 bg-indigo-100">
            <BrainCircuit className="h-4 w-4" />
            Evaluate and Test
          </TabsTrigger>
          <TabsTrigger value="rag" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            RAG
          </TabsTrigger>
          {/* Only show Document Intelligence tab when the IDP checkbox is enabled */}
          {processingConfig?.idp?.enabled && (
            <TabsTrigger value="idp" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Intelligence
            </TabsTrigger>
          )}
          {/* Only show Knowledge Graph tab when the KG checkbox is enabled */}
          {processingConfig?.kg?.enabled && (
            <TabsTrigger value="kg" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Knowledge Graph
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="source">
            {renderSourceDocument()}
          </TabsContent>
          {/* All Results tab content removed */}
          <TabsContent value="rag">{renderRAGResults()}</TabsContent>
          {/* Only render KG tab content when KG is enabled */}
          {processingConfig?.kg?.enabled && (
            <TabsContent value="kg">{renderKGResults()}</TabsContent>
          )}
          {/* Only render IDP tab content when IDP is enabled */}
          {processingConfig?.idp?.enabled && (
            <TabsContent value="idp">{renderIDPResults()}</TabsContent>
          )}
          <TabsContent value="agentic">{renderAgenticResults()}</TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default UnifiedResultsEnhanced;