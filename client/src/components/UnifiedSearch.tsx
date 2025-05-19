import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, X, ChevronDown, AlertCircle, Database, GitBranch, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { useDebounce } from '@/hooks/use-debounce';

export interface UnifiedSearchResult {
  id: string;
  type: 'rag' | 'kg' | 'idp';
  subType?: string;
  title: string;
  content: string;
  relevanceScore: number;
  metadata: {
    documentId?: string;
    documentType?: string;
    entityCount?: number;
    timestamp?: string;
    confidence?: number;
    tags?: string[];
    [key: string]: any;
  };
  highlights?: {
    field: string;
    snippet: string;
    positions: [number, number][];
  }[];
  source?: {
    file?: string;
    line?: number;
    page?: number;
  };
}

export interface SearchFilters {
  types: ('rag' | 'kg' | 'idp')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minScore?: number;
  tags?: string[];
  entityTypes?: string[];
  documentTypes?: string[];
  chunkIndices?: number[];
}

export type SortBy = 'relevance' | 'date' | 'type' | 'confidence';
export type SortOrder = 'asc' | 'desc';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  includeHighlights?: boolean;
  fuzzyMatch?: boolean;
  boostFactors?: {
    title?: number;
    content?: number;
    metadata?: number;
    tags?: number;
  };
}

interface UnifiedSearchProps {
  compact?: boolean;
  onResultClick?: (result: UnifiedSearchResult) => void;
  className?: string;
  defaultFilters?: Partial<SearchFilters>;
  ragResults?: any;
  kgResults?: any;
  idpResults?: any;
  customIcons?: {
    rag?: React.ReactNode;
    kg?: React.ReactNode;
    idp?: React.ReactNode;
  };
  searchOptions?: SearchOptions;
  showStats?: boolean;
  enableVoiceSearch?: boolean;
  searchPlaceholder?: string;
}

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
}

interface SearchResultsProps {
  results: UnifiedSearchResult[];
  onResultClick?: (result: UnifiedSearchResult) => void;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  customIcons?: UnifiedSearchProps['customIcons'];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  facets: {
    types: Record<string, number>;
    tags: Record<string, number>;
    entityTypes: Record<string, number>;
    documentTypes: Record<string, number>;
  };
  onFiltersChange: (filters: SearchFilters) => void;
  compact?: boolean;
}

// Search suggestions component
const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  className
}) => {
  if (suggestions.length === 0) return null;

  return (
    <Card className={cn("absolute top-full left-0 right-0 mt-1 p-1 z-50 shadow-lg", className)}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm transition-colors"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </Card>
  );
};

// Search result item component
const SearchResultItem: React.FC<{
  result: UnifiedSearchResult;
  onClick?: () => void;
  searchQuery: string;
  customIcons?: UnifiedSearchProps['customIcons'];
}> = ({ result, onClick, searchQuery, customIcons }) => {
  const getIcon = () => {
    if (customIcons?.[result.type]) return customIcons[result.type];
    switch (result.type) {
      case 'rag': return <Database className="h-4 w-4" />;
      case 'kg': return <GitBranch className="h-4 w-4" />;
      case 'idp': return <FileText className="h-4 w-4" />;
      default: return null;
    }
  };

  const getVariant = () => {
    switch (result.type) {
      case 'rag': return 'default';
      case 'kg': return 'secondary';
      case 'idp': return 'outline';
      default: return 'default';
    }
  };

  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-all duration-200",
        "border hover:border-blue-400 dark:hover:border-blue-600"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Badge variant={getVariant() as any} className="flex items-center gap-1">
              {getIcon()}
              {result.type.toUpperCase()}
            </Badge>
            {result.subType && (
              <Badge variant="outline" className="text-xs">
                {result.subType}
              </Badge>
            )}
            <h3 className="font-semibold flex-1">{highlightText(result.title)}</h3>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {(result.relevanceScore * 100).toFixed(0)}%
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {highlightText(result.content)}
        </p>

        {result.highlights && result.highlights.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
            {result.highlights.slice(0, 2).map((highlight, index) => (
              <div key={index} className="text-sm">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {highlight.field}:
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  {highlight.snippet}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {result.source?.file && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {result.source.file}
              {result.source.line && `:${result.source.line}`}
            </span>
          )}
          {result.metadata.confidence && (
            <span>Confidence: {(result.metadata.confidence * 100).toFixed(0)}%</span>
          )}
          {result.metadata.timestamp && (
            <span>{new Date(result.metadata.timestamp).toLocaleDateString()}</span>
          )}
          {result.metadata.tags && result.metadata.tags.length > 0 && (
            <div className="flex gap-1">
              {result.metadata.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {result.metadata.tags.length > 3 && (
                <span>+{result.metadata.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Search results component
const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onResultClick,
  isLoading,
  error,
  searchQuery,
  customIcons
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-2 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No results found for "{searchQuery}"</p>
        <p className="text-sm mt-2">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3 p-4">
        {results.map((result) => (
          <SearchResultItem
            key={result.id}
            result={result}
            onClick={() => onResultClick?.(result)}
            searchQuery={searchQuery}
            customIcons={customIcons}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

// Search filters component
const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  facets,
  onFiltersChange,
  compact
}) => {
  const [isOpen, setIsOpen] = useState(!compact);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="space-y-4">
          {/* Type filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Processing Types
            </label>
            <div className="space-y-2">
              {(['rag', 'kg', 'idp'] as const).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filters.types.includes(type)}
                    onCheckedChange={(checked) => {
                      const newTypes = checked
                        ? [...filters.types, type]
                        : filters.types.filter(t => t !== type);
                      onFiltersChange({ ...filters, types: newTypes });
                    }}
                  />
                  <label
                    htmlFor={type}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.toUpperCase()} ({facets.types[type] || 0})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Min score filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Minimum Score: {((filters.minScore || 0) * 100).toFixed(0)}%
            </label>
            <Slider
              value={[filters.minScore || 0]}
              onValueChange={([value]) => {
                onFiltersChange({ ...filters, minScore: value });
              }}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Entity type filter (for KG results) */}
          {Object.keys(facets.entityTypes).length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Entity Types
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(facets.entityTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`entity-${type}`}
                      checked={filters.entityTypes?.includes(type) || false}
                      onCheckedChange={(checked) => {
                        const currentTypes = filters.entityTypes || [];
                        const newTypes = checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        onFiltersChange({ ...filters, entityTypes: newTypes });
                      }}
                    />
                    <label
                      htmlFor={`entity-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type} ({count})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document type filter (for IDP results) */}
          {Object.keys(facets.documentTypes).length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Document Types
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(facets.documentTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`doc-${type}`}
                      checked={filters.documentTypes?.includes(type) || false}
                      onCheckedChange={(checked) => {
                        const currentTypes = filters.documentTypes || [];
                        const newTypes = checked
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        onFiltersChange({ ...filters, documentTypes: newTypes });
                      }}
                    />
                    <label
                      htmlFor={`doc-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type} ({count})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tag filter */}
          {Object.keys(facets.tags).length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tags
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(facets.tags).map(([tag, count]) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags?.includes(tag) || false}
                      onCheckedChange={(checked) => {
                        const currentTags = filters.tags || [];
                        const newTags = checked
                          ? [...currentTags, tag]
                          : currentTags.filter(t => t !== tag);
                        onFiltersChange({ ...filters, tags: newTags });
                      }}
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag} ({count})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Main UnifiedSearch component
const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
  compact = false,
  onResultClick,
  className = '',
  defaultFilters,
  ragResults,
  kgResults,
  idpResults,
  customIcons,
  searchOptions: customSearchOptions,
  showStats = false,
  enableVoiceSearch = false,
  searchPlaceholder = "Search across all processing types..."
}) => {
  const { state } = useDocumentProcessing();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['rag', 'kg', 'idp'],
    ...(defaultFilters || {})
  });
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    limit: 20,
    offset: 0,
    sortBy: 'relevance',
    sortOrder: 'desc',
    includeHighlights: true,
    fuzzyMatch: true,
    ...customSearchOptions
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use provided results or fall back to state
  const effectiveRagResults = ragResults || state.unifiedProcessing.unifiedResults.standard;
  const effectiveKgResults = kgResults || state.unifiedProcessing.unifiedResults.kg;
  const effectiveIdpResults = idpResults || state.unifiedProcessing.unifiedResults.idp;

  // Query intent analysis
  const analyzeQueryIntent = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    const keywords = query.split(/\s+/).filter(Boolean);
    let intent: 'search' | 'entity' | 'relationship' | 'metadata' = 'search';
    let searchTypes = filters.types;

    if (/\b(who|what|where|entity|person|company|organization)\b/.test(lowerQuery)) {
      intent = 'entity';
      searchTypes = ['kg'];
    } else if (/\b(how|why|relationship|between|connected)\b/.test(lowerQuery)) {
      intent = 'relationship';
      searchTypes = ['kg', 'rag'];
    } else if (/\b(metadata|property|attribute|field)\b/.test(lowerQuery)) {
      intent = 'metadata';
      searchTypes = ['idp'];
    }

    return { intent, searchTypes, keywords };
  }, [filters.types]);

  // Search functionality
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const { intent, searchTypes, keywords } = analyzeQueryIntent(query);
      const results: UnifiedSearchResult[] = [];

      // Search RAG results
      if (searchTypes.includes('rag') && effectiveRagResults) {
        const ragSearchResults = searchRagResults(effectiveRagResults, keywords, query);
        results.push(...ragSearchResults);
      }

      // Search KG results
      if (searchTypes.includes('kg') && effectiveKgResults) {
        const kgSearchResults = searchKgResults(effectiveKgResults, keywords, query);
        results.push(...kgSearchResults);
      }

      // Search IDP results
      if (searchTypes.includes('idp') && effectiveIdpResults) {
        const idpSearchResults = searchIdpResults(effectiveIdpResults, keywords, query);
        results.push(...idpSearchResults);
      }

      // Apply filters
      const filteredResults = applyFilters(results, filters);

      // Sort results
      const sortedResults = sortResults(filteredResults, searchOptions);

      // Apply pagination
      const paginatedResults = sortedResults.slice(
        searchOptions.offset || 0,
        (searchOptions.offset || 0) + (searchOptions.limit || 20)
      );

      setSearchResults(paginatedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [effectiveRagResults, effectiveKgResults, effectiveIdpResults, filters, searchOptions, analyzeQueryIntent]);

  // Search functions for each processing type
  const searchRagResults = (data: any, keywords: string[], query: string): UnifiedSearchResult[] => {
    if (!data || !data.chunks) return [];
    
    return data.chunks
      .map((chunk: any) => {
        let score = 0;
        const highlights: UnifiedSearchResult['highlights'] = [];

        keywords.forEach(keyword => {
          const titleMatch = chunk.title.toLowerCase().includes(keyword.toLowerCase());
          const contentMatch = chunk.content.toLowerCase().includes(keyword.toLowerCase());
          const tagMatch = chunk.tags.some((tag: string) => 
            tag.toLowerCase().includes(keyword.toLowerCase())
          );

          if (titleMatch) score += 3;
          if (contentMatch) score += 2;
          if (tagMatch) score += 1;

          if (contentMatch) {
            const index = chunk.content.toLowerCase().indexOf(keyword.toLowerCase());
            const start = Math.max(0, index - 50);
            const end = Math.min(chunk.content.length, index + keyword.length + 50);
            highlights.push({
              field: 'content',
              snippet: chunk.content.substring(start, end),
              positions: [[index - start, index - start + keyword.length]]
            });
          }
        });

        return {
          id: `rag-${chunk.id}`,
          type: 'rag' as const,
          subType: 'chunk',
          title: chunk.title,
          content: chunk.content.substring(0, 200) + '...',
          relevanceScore: score / (keywords.length * 6), // Normalize
          metadata: {
            documentId: chunk.documentId,
            tags: chunk.tags,
            timestamp: chunk.timestamp
          },
          highlights,
          source: {
            file: chunk.fileName,
            page: chunk.page
          }
        };
      })
      .filter((result: UnifiedSearchResult) => result.relevanceScore > 0);
  };

  const searchKgResults = (data: any, keywords: string[], query: string): UnifiedSearchResult[] => {
    if (!data) return [];
    const results: UnifiedSearchResult[] = [];

    // Search entities
    if (data.entities) {
      data.entities.forEach((entity: any) => {
        let score = 0;
        const highlights: UnifiedSearchResult['highlights'] = [];

        keywords.forEach(keyword => {
          const nameMatch = entity.name.toLowerCase().includes(keyword.toLowerCase());
          const typeMatch = entity.type.toLowerCase().includes(keyword.toLowerCase());
          const propertyMatch = entity.properties && Object.values(entity.properties).some(
            (value: any) => String(value).toLowerCase().includes(keyword.toLowerCase())
          );

          if (nameMatch) {
            score += 3;
            highlights.push({
              field: 'name',
              snippet: entity.name,
              positions: [[
                entity.name.toLowerCase().indexOf(keyword.toLowerCase()),
                entity.name.toLowerCase().indexOf(keyword.toLowerCase()) + keyword.length
              ]]
            });
          }
          if (typeMatch) score += 2;
          if (propertyMatch) score += 1;
        });

        if (score > 0) {
          results.push({
            id: `kg-entity-${entity.id}`,
            type: 'kg' as const,
            subType: 'entity',
            title: entity.name,
            content: `${entity.type} entity with ${Object.keys(entity.properties || {}).length} properties`,
            relevanceScore: score / (keywords.length * 6),
            metadata: {
              entityType: entity.type,
              properties: entity.properties,
              confidence: entity.confidence
            },
            highlights
          });
        }
      });
    }

    // Search relationships
    if (data.relations) {
      data.relations.forEach((relation: any, index: number) => {
        let score = 0;
        const highlights: UnifiedSearchResult['highlights'] = [];
        
        keywords.forEach(keyword => {
          const typeMatch = relation.type.toLowerCase().includes(keyword.toLowerCase());
          const sourceMatch = relation.source.toLowerCase().includes(keyword.toLowerCase());
          const targetMatch = relation.target.toLowerCase().includes(keyword.toLowerCase());

          if (typeMatch) score += 2;
          if (sourceMatch || targetMatch) score += 1;
        });

        if (score > 0) {
          results.push({
            id: `kg-relation-${index}`,
            type: 'kg' as const,
            subType: 'relationship',
            title: `${relation.source} → ${relation.target}`,
            content: `Relationship: ${relation.type}`,
            relevanceScore: score / (keywords.length * 4),
            metadata: {
              relationType: relation.type,
              confidence: relation.confidence
            },
            highlights
          });
        }
      });
    }

    return results;
  };

  const searchIdpResults = (data: any, keywords: string[], query: string): UnifiedSearchResult[] => {
    if (!data) return [];
    const results: UnifiedSearchResult[] = [];

    // Search through processed documents
    if (data.processedDocuments) {
      data.processedDocuments.forEach((doc: any) => {
        let score = 0;
        const highlights: UnifiedSearchResult['highlights'] = [];

        keywords.forEach(keyword => {
          const nameMatch = doc.file_name && doc.file_name.toLowerCase().includes(keyword.toLowerCase());
          const typeMatch = doc.document_type && doc.document_type.toLowerCase().includes(keyword.toLowerCase());
          const metadataMatch = doc.metadata && Object.entries(doc.metadata).some(
            ([key, value]) => key.toLowerCase().includes(keyword.toLowerCase()) ||
              String(value).toLowerCase().includes(keyword.toLowerCase())
          );

          if (nameMatch) score += 3;
          if (typeMatch) score += 2;
          if (metadataMatch) score += 1;
        });

        if (score > 0) {
          results.push({
            id: `idp-doc-${doc.document_id}`,
            type: 'idp' as const,
            subType: doc.document_type || 'document',
            title: doc.file_name || 'Unknown Document',
            content: `Document type: ${doc.document_type || 'Unknown'}, Entities: ${doc.entities?.length || 0}`,
            relevanceScore: score / (keywords.length * 6),
            metadata: {
              documentId: doc.document_id,
              documentType: doc.document_type,
              entityCount: doc.entities?.length || 0,
              ...doc.metadata
            },
            highlights
          });
        }
      });
    }

    return results;
  };

  // Apply filters to results
  const applyFilters = (results: UnifiedSearchResult[], filters: SearchFilters): UnifiedSearchResult[] => {
    return results.filter(result => {
      if (!filters.types.includes(result.type)) return false;
      if (filters.minScore && result.relevanceScore < filters.minScore) return false;
      if (filters.tags && filters.tags.length > 0) {
        const resultTags = result.metadata.tags || [];
        if (!filters.tags.some(tag => resultTags.includes(tag))) return false;
      }
      if (filters.entityTypes && result.type === 'kg' && result.subType === 'entity') {
        if (!filters.entityTypes.includes(result.metadata.entityType)) return false;
      }
      if (filters.documentTypes && result.type === 'idp' && result.metadata?.documentType) {
        if (!filters.documentTypes.includes(result.metadata.documentType)) return false;
      }
      return true;
    });
  };

  // Sort results
  const sortResults = (results: UnifiedSearchResult[], options: SearchOptions): UnifiedSearchResult[] => {
    const sorted = [...results].sort((a, b) => {
      switch (options.sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'confidence':
          return (b.metadata.confidence || 0) - (a.metadata.confidence || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
          const aTime = new Date(a.metadata.timestamp || 0).getTime();
          const bTime = new Date(b.metadata.timestamp || 0).getTime();
          return bTime - aTime;
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });

    return options.sortOrder === 'asc' ? sorted.reverse() : sorted;
  };

  // Calculate facets
  const facets = React.useMemo(() => {
    const typeCounts: Record<string, number> = { rag: 0, kg: 0, idp: 0 };
    const tagCounts: Record<string, number> = {};
    const entityTypeCounts: Record<string, number> = {};
    const documentTypeCounts: Record<string, number> = {};

    searchResults.forEach(result => {
      typeCounts[result.type]++;
      
      (result.metadata.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      if (result.type === 'kg' && result.subType === 'entity' && result.metadata.entityType) {
        entityTypeCounts[result.metadata.entityType] = 
          (entityTypeCounts[result.metadata.entityType] || 0) + 1;
      }
      
      if (result.type === 'idp' && result.metadata.documentType) {
        documentTypeCounts[result.metadata.documentType] = 
          (documentTypeCounts[result.metadata.documentType] || 0) + 1;
      }
    });

    return { types: typeCounts, tags: tagCounts, entityTypes: entityTypeCounts, documentTypes: documentTypeCounts };
  }, [searchResults]);

  // Generate search suggestions
  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      const newSuggestions = [
        `${debouncedSearchQuery} in documents`,
        `entity: ${debouncedSearchQuery}`,
        `relationship: ${debouncedSearchQuery}`,
        `metadata: ${debouncedSearchQuery}`,
        `"${debouncedSearchQuery}" (exact match)`
      ];
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchQuery]);

  // Handle search suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle search
  const handleSearch = () => {
    setShowSuggestions(false);
    performSearch(searchQuery);
  };

  // Compact view
  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            size="sm"
          >
            Search
          </Button>
        </div>
        {showSuggestions && (
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
          />
        )}
      </div>
    );
  }

  // Full view
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Unified Search</h2>
          {showStats && searchResults.length > 0 && (
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Results: {searchResults.length}</span>
              <span>RAG: {facets.types.rag || 0}</span>
              <span>KG: {facets.types.kg || 0}</span>
              <span>IDP: {facets.types.idp || 0}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
            />
          )}
        </div>

        <div className="flex gap-4">
          <Select
            value={searchOptions.sortBy || 'relevance'}
            onValueChange={(value) => {
              setSearchOptions({
                ...searchOptions,
                sortBy: value as SortBy
              });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={searchOptions.sortOrder || 'desc'}
            onValueChange={(value) => {
              setSearchOptions({
                ...searchOptions,
                sortOrder: value as SortOrder
              });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">
              Results {searchResults.length > 0 && `(${searchResults.length})`}
            </TabsTrigger>
            <TabsTrigger value="filters">
              Filters
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <SearchResults
              results={searchResults}
              onResultClick={onResultClick}
              isLoading={isSearching}
              error={searchError}
              searchQuery={searchQuery}
              customIcons={customIcons}
            />
          </TabsContent>
          
          <TabsContent value="filters">
            <SearchFilters
              filters={filters}
              facets={facets}
              onFiltersChange={setFilters}
              compact={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default UnifiedSearch;
export { UnifiedSearch };