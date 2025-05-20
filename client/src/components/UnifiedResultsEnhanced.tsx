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
  Loader2
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
  const [activeTab, setActiveTab] = useState<'all' | 'rag' | 'kg' | 'idp' | 'agentic'>('all');
  
  // Handle tab switching if the current tab is disabled
  useEffect(() => {
    // If Knowledge Graph tab is active but KG is disabled, switch to 'all' tab
    if (activeTab === 'kg' && !processingConfig?.kg?.enabled) {
      setActiveTab('all');
    }
    
    // If Document Intelligence tab is active but IDP is disabled, switch to 'all' tab
    if (activeTab === 'idp' && !processingConfig?.idp?.enabled) {
      setActiveTab('all');
    }
  }, [activeTab, processingConfig?.kg?.enabled, processingConfig?.idp?.enabled]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>({ types: ['rag', 'kg', 'idp'] });
  const [filteredChunks, setFilteredChunks] = useState<any[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<any[]>([]);
  const [agenticQuery, setAgenticQuery] = useState('');
  const [agenticResults, setAgenticResults] = useState<any>(null);
  const [isAgenticLoading, setIsAgenticLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
        {/* Show multimodal processing info if available */}
        {multimodalProcessing.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                <CardTitle>Multimodal Processing Applied</CardTitle>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChunks.map((chunk) => (
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
                  <Badge variant="secondary">Chunk {chunk.chunkIndex + 1}</Badge>
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
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
              Document Metadata
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

        {/* Classification */}
        {idpResults?.classification?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Document Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {idpResults?.classification?.map((cls, idx) => (
                  <Badge key={idx} variant="secondary">
                    {cls}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Tables */}
        {idpResults?.extractedData?.tables?.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                {table.name}
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

  // Mock function to simulate agentic query processing
  const processAgenticQuery = async (query: string) => {
    setIsAgenticLoading(true);
    
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

  const renderAgenticResults = () => {
    return (
      <div className="space-y-6">
        {/* Query Input */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              <CardTitle>Intelligent Query</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything about your document..."
                  value={agenticQuery}
                  onChange={(e) => setAgenticQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && agenticQuery.trim()) {
                      processAgenticQuery(agenticQuery);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => agenticQuery.trim() && processAgenticQuery(agenticQuery)}
                  disabled={!agenticQuery.trim() || isAgenticLoading}
                >
                  {isAgenticLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Auto-suggestions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Suggested queries:</p>
                <div className="flex flex-wrap gap-2">
                  {agenticSuggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAgenticQuery(suggestion);
                        processAgenticQuery(suggestion);
                      }}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        {agenticResults && (
          <div className="space-y-4">
            {/* Main Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <CardTitle>AI Summary</CardTitle>
                  </div>
                  <Badge variant="secondary">Powered by LLM</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{agenticResults.summary}</p>
                
                {/* RAG Insights */}
                {agenticResults.ragInsights && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center">
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

                {/* KG Insights */}
                {agenticResults.kgInsights && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center">
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

                {/* IDP Insights */}
                {agenticResults.idpInsights && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      Document Intelligence Insights
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{agenticResults.idpInsights.tableSummary}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
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
        {!agenticResults && !isAgenticLoading && (
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
    if (multimodal.transcription) activeProcessing.push({ 
      name: 'Audio Transcription', 
      icon: Headphones, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    });
    if (multimodal.ocr) activeProcessing.push({ 
      name: 'OCR (Text Extraction)', 
      icon: ScanLine, 
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    });
    if (multimodal.imageCaption) activeProcessing.push({ 
      name: 'Image Captioning', 
      icon: Camera, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    });
    if (multimodal.visualAnalysis) activeProcessing.push({ 
      name: 'Visual Analysis', 
      icon: Eye, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    });
    
    return activeProcessing;
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
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <CardTitle>Document Chunks</CardTitle>
                </div>
                <Badge variant="secondary">{filteredChunks.length} chunks</Badge>
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
                <div className="flex items-center space-x-2">
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
                        <div className="text-center p-3 bg-gray-50 rounded">
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
                        <div className="text-center p-3 bg-gray-50 rounded">
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
                <div className="flex items-center space-x-2">
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
        <h2 className="text-xl font-semibold">Processing Results</h2>
        {onClearResults && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // Set loading state
              setIsLoading(true);
              
              // Clear results and then restore them after a simulated delay
              onClearResults();
              
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
          <TabsTrigger value="all" onClick={() => {
            // Set loading state
            setIsLoading(true);
            
            // Simulate loading delay
            setTimeout(() => {
              setIsLoading(false);
            }, 1200);
          }}>All Results</TabsTrigger>
          <TabsTrigger value="rag" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            RAG
          </TabsTrigger>
          {/* Only show Knowledge Graph tab when the KG checkbox is enabled */}
          {processingConfig?.kg?.enabled && (
            <TabsTrigger value="kg" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Knowledge Graph
            </TabsTrigger>
          )}
          {/* Only show Document Intelligence tab when the IDP checkbox is enabled */}
          {processingConfig?.idp?.enabled && (
            <TabsTrigger value="idp" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Intelligence
            </TabsTrigger>
          )}
          <TabsTrigger value="agentic" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Agentic Results
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="all">
            {isLoading ? (
              <Card className="h-[400px] flex items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Loading Results</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Preparing your document analysis and rendering all processing results...
                  </p>
                </CardContent>
              </Card>
            ) : renderAllResults()}
          </TabsContent>
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