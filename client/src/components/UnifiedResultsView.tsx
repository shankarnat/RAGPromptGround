import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnifiedSearch } from '@/components/UnifiedSearch';
import { type UnifiedSearchResult } from '@/components/UnifiedSearch';
import { 
  Search, 
  Filter, 
  FileText, 
  Network, 
  Database,
  ChevronRight,
  Package,
  User,
  Calendar,
  Tag,
  AlertCircle,
  Eye,
  Copy,
  Download,
  SortAsc,
  ArrowRight
} from 'lucide-react';

interface RAGResults {
  chunks: Array<{
    id: number;
    title: string;
    content: string;
    tokenCount: number;
    chunkIndex: number;
    tags: string[];
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
    type: string;
    name: string;
    confidence: number;
  }>;
  relations: Array<{
    source: number;
    target: number;
    type: string;
    confidence: number;
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
    tables: number;
    images: number;
    formFields: number;
  };
}

interface UnifiedResultsViewProps {
  ragResults?: RAGResults;
  kgResults?: KGResults;
  idpResults?: IDPResults;
  onChunkSelect?: (chunkId: number) => void;
  onEntitySelect?: (entityId: number) => void;
  selectedChunk?: number | null;
  currentIntent?: any;
}

type ResultType = 'all' | 'rag' | 'kg' | 'idp';
type SortOption = 'relevance' | 'confidence' | 'name' | 'index';

const UnifiedResultsView: React.FC<UnifiedResultsViewProps> = ({
  ragResults,
  kgResults,
  idpResults,
  onChunkSelect,
  onEntitySelect,
  selectedChunk,
  currentIntent
}) => {
  // Determine initial tab based on intent
  const getInitialTab = () => {
    if (!currentIntent) return 'unified';
    
    switch (currentIntent.intent) {
      case 'find_answers_tables':
        return 'rag';
      case 'extract_form_fields':
        return 'idp';
      case 'understand_relationships':
        return 'kg';
      default:
        return 'unified';
    }
  };
  
  const [selectedTab, setSelectedTab] = useState<'unified' | 'rag' | 'kg' | 'idp'>(getInitialTab());
  const [showGraphVisualization, setShowGraphVisualization] = useState(false);
  const graphRef = useRef<SVGSVGElement>(null);

  // Handle search result click
  const handleSearchResultClick = (result: UnifiedSearchResult) => {
    if (result.type === 'rag') {
      // Extract chunk ID from the result ID (format: "rag-{chunkId}")
      const chunkId = parseInt(result.id.replace('rag-', ''));
      if (!isNaN(chunkId)) {
        onChunkSelect?.(chunkId);
        setSelectedTab('rag');
      }
    } else if (result.type === 'kg' && result.subType === 'entity') {
      // Extract entity ID from the result ID (format: "kg-entity-{entityId}")
      const entityId = parseInt(result.id.replace('kg-entity-', ''));
      if (!isNaN(entityId)) {
        onEntitySelect?.(entityId);
        setSelectedTab('kg');
      }
    } else if (result.type === 'idp') {
      // Switch to IDP tab to show metadata
      setSelectedTab('idp');
    }
  };

  // Render graph visualization
  useEffect(() => {
    if (showGraphVisualization && kgResults && graphRef.current) {
      // Simple D3.js-style visualization placeholder
      const svg = graphRef.current;
      const width = svg.clientWidth;
      const height = svg.clientHeight;
      
      // Clear existing content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      
      // Create nodes and edges
      const nodes = kgResults.entities.map((entity, i) => ({
        ...entity,
        x: Math.random() * width,
        y: Math.random() * height
      }));
      
      // Create SVG elements for nodes
      nodes.forEach(node => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        
        circle.setAttribute('cx', String(node.x));
        circle.setAttribute('cy', String(node.y));
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', getNodeColor(node.type));
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        
        text.setAttribute('x', String(node.x));
        text.setAttribute('y', String(node.y + 5));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#fff');
        text.textContent = node.name.slice(0, 3);
        
        group.appendChild(circle);
        group.appendChild(text);
        svg.appendChild(group);
      });
    }
  }, [showGraphVisualization, kgResults]);

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      'PERSON': '#4A90E2',
      'ORG': '#50E3C2',
      'DATE': '#F5A623',
      'LOCATION': '#D0021B',
      'default': '#9013FE'
    };
    return colors[type] || colors.default;
  };

  const renderUnifiedView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* RAG Results */}
      {ragResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle>Document Chunks</CardTitle>
              </div>
              <Badge variant="secondary">{ragResults.chunks.length} chunks</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {ragResults.chunks.slice(0, 5).map(chunk => (
                  <div
                    key={chunk.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedChunk === chunk.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onChunkSelect?.(chunk.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{chunk.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {chunk.tokenCount} tokens
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{chunk.content}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {chunk.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Graph Results */}
      {kgResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-green-500" />
                <CardTitle>Knowledge Graph</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGraphVisualization(!showGraphVisualization)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showGraphVisualization ? 'List View' : 'Graph View'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showGraphVisualization ? (
              <div className="border rounded-lg bg-gray-50 p-4">
                <svg ref={graphRef} className="w-full h-[360px]" />
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Entities</h4>
                    <div className="space-y-2">
                      {kgResults.entities.map(entity => (
                        <div
                          key={entity.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => onEntitySelect?.(entity.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Badge style={{ backgroundColor: getNodeColor(entity.type) }}>
                              {entity.type}
                            </Badge>
                            <span className="font-medium">{entity.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {(entity.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
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
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* IDP Results */}
      {idpResults && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <CardTitle>Document Processing Results</CardTitle>
              </div>
              <Badge variant="secondary">
                {Object.keys(idpResults.metadata).length} fields
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Metadata */}
              <div>
                <h4 className="font-medium mb-3">Extracted Metadata</h4>
                <div className="space-y-2">
                  {Object.entries(idpResults.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Classification and Data Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Document Classification</h4>
                  <div className="flex flex-wrap gap-2">
                    {idpResults.classification.map(cls => (
                      <Badge key={cls} className="bg-purple-100 text-purple-700">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Extracted Data Summary</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{idpResults.extractedData.tables}</div>
                      <div className="text-sm text-gray-600">Tables</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{idpResults.extractedData.images}</div>
                      <div className="text-sm text-gray-600">Images</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold">{idpResults.extractedData.formFields}</div>
                      <div className="text-sm text-gray-600">Form Fields</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Integrated Unified Search */}
      <UnifiedSearch
        onResultClick={handleSearchResultClick}
        ragResults={ragResults}
        kgResults={kgResults}
        idpResults={idpResults}
        showStats={true}
        searchPlaceholder="Search across all processing results..."
      />

      {/* Results Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="unified">Unified View</TabsTrigger>
          <TabsTrigger value="rag">RAG Results</TabsTrigger>
          <TabsTrigger value="kg">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="idp">Document Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="mt-6">
          {renderUnifiedView()}
        </TabsContent>

        <TabsContent value="rag" className="mt-6">
          {ragResults ? (
            <Card>
              <CardHeader>
                <CardTitle>Document Chunks</CardTitle>
                <CardDescription>All chunks extracted from the document</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {ragResults.chunks.map(chunk => (
                      <div
                        key={chunk.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedChunk === chunk.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => onChunkSelect?.(chunk.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium">{chunk.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Chunk #{chunk.chunkIndex}</Badge>
                            <Badge variant="secondary">{chunk.tokenCount} tokens</Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{chunk.content}</p>
                        <div className="flex items-center space-x-2">
                          {chunk.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No RAG results available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kg" className="mt-6">
          {kgResults ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Knowledge Graph Visualization</CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowGraphVisualization(!showGraphVisualization)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Toggle Visualization
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showGraphVisualization ? (
                    <div className="border rounded-lg bg-gray-50 p-4">
                      <svg ref={graphRef} className="w-full h-[500px]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Entities</h3>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2">
                            {kgResults.entities.map(entity => (
                              <div
                                key={entity.id}
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => onEntitySelect?.(entity.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: getNodeColor(entity.type) }}
                                    />
                                    <div>
                                      <div className="font-medium">{entity.name}</div>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {entity.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {(entity.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Relations</h3>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2">
                            {kgResults.relations.map((relation, idx) => {
                              const sourceEntity = kgResults.entities.find(e => e.id === relation.source);
                              const targetEntity = kgResults.entities.find(e => e.id === relation.target);
                              return (
                                <div key={idx} className="p-3 border rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{sourceEntity?.name}</span>
                                    <ArrowRight className="h-4 w-4" />
                                    <Badge variant="secondary">{relation.type}</Badge>
                                    <ArrowRight className="h-4 w-4" />
                                    <span className="font-medium">{targetEntity?.name}</span>
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Confidence: {(relation.confidence * 100).toFixed(0)}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Graph Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{kgResults.graph.nodes}</div>
                      <div className="text-gray-600">Total Nodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{kgResults.graph.edges}</div>
                      <div className="text-gray-600">Total Edges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {(kgResults.graph.density * 100).toFixed(1)}%
                      </div>
                      <div className="text-gray-600">Graph Density</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Network className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No knowledge graph results available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="idp" className="mt-6">
          {idpResults ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Metadata</CardTitle>
                  <CardDescription>All metadata fields extracted from the document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(idpResults.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium text-gray-700">{key}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{String(value)}</span>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(String(value))}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Classification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {idpResults.classification.map(cls => (
                        <Badge key={cls} className="px-3 py-1 text-sm bg-purple-100 text-purple-700">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Data Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tables Found</span>
                        <span className="font-bold text-xl">{idpResults.extractedData.tables}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Images Detected</span>
                        <span className="font-bold text-xl">{idpResults.extractedData.images}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Form Fields</span>
                        <span className="font-bold text-xl">{idpResults.extractedData.formFields}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No document processing results available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedResultsView;