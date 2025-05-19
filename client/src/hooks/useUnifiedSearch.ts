import { useState, useCallback, useMemo } from 'react';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';

// Search result types
export interface UnifiedSearchResult {
  id: string;
  type: 'rag' | 'kg' | 'idp';
  score: number;
  highlighted: boolean;
  metadata: {
    title: string;
    description: string;
    source: string;
    timestamp?: string;
    confidence?: number;
    tags?: string[];
  };
  data: any; // Original data from the processing type
  matchedFields: string[];
  excerpts: SearchExcerpt[];
}

export interface SearchExcerpt {
  field: string;
  text: string;
  highlights: Array<{
    start: number;
    end: number;
  }>;
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
  chunkIndices?: number[];
}

export interface QueryIntent {
  primary: 'search' | 'entity' | 'relationship' | 'metadata';
  searchTypes: ('rag' | 'kg' | 'idp')[];
  keywords: string[];
  filters: Partial<SearchFilters>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'type' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  includeMetadata?: boolean;
  highlightMatches?: boolean;
}

const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  limit: 20,
  offset: 0,
  sortBy: 'relevance',
  sortOrder: 'desc',
  includeMetadata: true,
  highlightMatches: true
};

export interface UseUnifiedSearchProps {
  ragResults?: any;
  kgResults?: any;
  idpResults?: any;
}

export function useUnifiedSearch(props?: UseUnifiedSearchProps) {
  const { state } = useDocumentProcessing();
  
  // Use provided results or fall back to state
  const ragData = props?.ragResults || state.unifiedProcessing.unifiedResults.standard;
  const kgData = props?.kgResults || state.unifiedProcessing.unifiedResults.kg;
  const idpData = props?.idpResults || state.unifiedProcessing.unifiedResults.idp;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['rag', 'kg', 'idp']
  });
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);

  // Analyze query intent
  const analyzeQueryIntent = useCallback((query: string): QueryIntent => {
    const lowerQuery = query.toLowerCase();
    const keywords = query.split(/\s+/).filter(Boolean);

    // Determine primary intent
    let primary: QueryIntent['primary'] = 'search';
    let searchTypes: ('rag' | 'kg' | 'idp')[] = [...filters.types];

    // Entity search patterns
    if (lowerQuery.match(/\b(who|what|where|entity|person|company|organization)\b/)) {
      primary = 'entity';
      searchTypes = ['kg'];
    }
    // Relationship search patterns
    else if (lowerQuery.match(/\b(how|why|relationship|between|connected)\b/)) {
      primary = 'relationship';
      searchTypes = ['kg', 'rag'];
    }
    // Metadata search patterns
    else if (lowerQuery.match(/\b(metadata|property|attribute|field)\b/)) {
      primary = 'metadata';
      searchTypes = ['idp'];
    }

    // Extract filters from query
    const extractedFilters: Partial<SearchFilters> = {};
    
    // Date filters
    const dateMatch = query.match(/\b(after|before|since|until)\s+(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const [, operator, dateStr] = dateMatch;
      const date = new Date(dateStr);
      extractedFilters.dateRange = {
        start: operator === 'after' || operator === 'since' ? date : new Date(0),
        end: operator === 'before' || operator === 'until' ? date : new Date()
      };
    }

    // Entity type filters
    const entityTypeMatch = query.match(/\btype:(\w+)/);
    if (entityTypeMatch) {
      extractedFilters.entityTypes = [entityTypeMatch[1].toUpperCase()];
    }

    return {
      primary,
      searchTypes,
      keywords,
      filters: extractedFilters
    };
  }, [filters.types]);

  // Search RAG results
  const searchRAGResults = useCallback((query: string, intent: QueryIntent): UnifiedSearchResult[] => {
    const results: UnifiedSearchResult[] = [];
    
    if (!ragData?.chunks) return results;

    ragData.chunks.forEach((chunk: any) => {
      const lowerContent = chunk.content.toLowerCase();
      const lowerQuery = query.toLowerCase();
      
      // Simple scoring based on keyword matches
      let score = 0;
      const matchedFields: string[] = [];
      const excerpts: SearchExcerpt[] = [];
      
      intent.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (lowerContent.includes(keywordLower)) {
          score += 1;
          matchedFields.push('content');
          
          // Find excerpt
          const index = lowerContent.indexOf(keywordLower);
          if (index !== -1) {
            const start = Math.max(0, index - 50);
            const end = Math.min(chunk.content.length, index + keywordLower.length + 50);
            excerpts.push({
              field: 'content',
              text: chunk.content.substring(start, end),
              highlights: [{
                start: index - start,
                end: index - start + keywordLower.length
              }]
            });
          }
        }
        
        if (chunk.title.toLowerCase().includes(keywordLower)) {
          score += 2; // Title matches are worth more
          matchedFields.push('title');
        }
        
        chunk.tags.forEach((tag: any) => {
          if (tag.toLowerCase().includes(keywordLower)) {
            score += 1.5;
            matchedFields.push('tags');
          }
        });
      });
      
      if (score > 0) {
        results.push({
          id: `rag-${chunk.id}`,
          type: 'rag',
          score: score / intent.keywords.length, // Normalize score
          highlighted: false,
          metadata: {
            title: chunk.title,
            description: `Chunk ${chunk.chunkIndex} - ${chunk.tokenCount} tokens`,
            source: 'Document Chunks',
            tags: chunk.tags
          },
          data: chunk,
          matchedFields,
          excerpts
        });
      }
    });
    
    return results;
  }, [ragData]);

  // Search KG results
  const searchKGResults = useCallback((query: string, intent: QueryIntent): UnifiedSearchResult[] => {
    const results: UnifiedSearchResult[] = [];
    
    if (!kgData) return results;

    // Search entities
    kgData.entities?.forEach((entity: any) => {
      let score = 0;
      const matchedFields: string[] = [];
      const excerpts: SearchExcerpt[] = [];
      
      intent.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (entity.name.toLowerCase().includes(keywordLower)) {
          score += 2;
          matchedFields.push('name');
          excerpts.push({
            field: 'name',
            text: entity.name,
            highlights: [{
              start: entity.name.toLowerCase().indexOf(keywordLower),
              end: entity.name.toLowerCase().indexOf(keywordLower) + keywordLower.length
            }]
          });
        }
        
        if (entity.type.toLowerCase().includes(keywordLower)) {
          score += 1;
          matchedFields.push('type');
        }
      });
      
      // Filter by entity type if specified
      if (intent.filters.entityTypes && 
          !intent.filters.entityTypes.includes(entity.type)) {
        score = 0;
      }
      
      if (score > 0) {
        results.push({
          id: `kg-entity-${entity.id}`,
          type: 'kg',
          score: score / intent.keywords.length,
          highlighted: false,
          metadata: {
            title: entity.name,
            description: `${entity.type} entity`,
            source: 'Knowledge Graph',
            confidence: entity.confidence
          },
          data: entity,
          matchedFields,
          excerpts
        });
      }
    });

    // Search relationships
    kgData.relations?.forEach((relation: any, index: number) => {
      const sourceEntity = kgData.entities?.find((e: any) => e.id === relation.source);
      const targetEntity = kgData.entities?.find((e: any) => e.id === relation.target);
      
      if (!sourceEntity || !targetEntity) return;
      
      let score = 0;
      const matchedFields: string[] = [];
      const excerpts: SearchExcerpt[] = [];
      
      intent.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        const relationText = `${sourceEntity.name} ${relation.type} ${targetEntity.name}`;
        
        if (relationText.toLowerCase().includes(keywordLower)) {
          score += 1.5;
          matchedFields.push('relationship');
          excerpts.push({
            field: 'relationship',
            text: relationText,
            highlights: [{
              start: relationText.toLowerCase().indexOf(keywordLower),
              end: relationText.toLowerCase().indexOf(keywordLower) + keywordLower.length
            }]
          });
        }
      });
      
      if (score > 0) {
        results.push({
          id: `kg-relation-${index}`,
          type: 'kg',
          score: score / intent.keywords.length,
          highlighted: false,
          metadata: {
            title: `${sourceEntity.name} → ${targetEntity.name}`,
            description: `Relationship: ${relation.type}`,
            source: 'Knowledge Graph',
            confidence: relation.confidence
          },
          data: relation,
          matchedFields,
          excerpts
        });
      }
    });
    
    return results;
  }, [kgData]);

  // Search IDP results
  const searchIDPResults = useCallback((query: string, intent: QueryIntent): UnifiedSearchResult[] => {
    const results: UnifiedSearchResult[] = [];
    
    if (!idpData) return results;

    // Search metadata
    if (idpData.metadata) {
      Object.entries(idpData.metadata).forEach(([key, value]) => {
        let score = 0;
        const matchedFields: string[] = [];
        const excerpts: SearchExcerpt[] = [];
        
        intent.keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          if (key.toLowerCase().includes(keywordLower) || 
              String(value).toLowerCase().includes(keywordLower)) {
            score += 1;
            matchedFields.push('metadata');
            
            const text = `${key}: ${value}`;
            excerpts.push({
              field: 'metadata',
              text,
              highlights: [{
                start: text.toLowerCase().indexOf(keywordLower),
                end: text.toLowerCase().indexOf(keywordLower) + keywordLower.length
              }]
            });
          }
        });
        
        if (score > 0) {
          results.push({
            id: `idp-metadata-${key}`,
            type: 'idp',
            score: score / intent.keywords.length,
            highlighted: false,
            metadata: {
              title: key,
              description: String(value),
              source: 'Document Metadata'
            },
            data: { key, value },
            matchedFields,
            excerpts
          });
        }
      });
    }

    // Search classifications
    idpData.classification?.forEach((classification: any, index: number) => {
      let score = 0;
      const matchedFields: string[] = [];
      const excerpts: SearchExcerpt[] = [];
      
      intent.keywords.forEach(keyword => {
        if (classification.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
          matchedFields.push('classification');
          excerpts.push({
            field: 'classification',
            text: classification,
            highlights: [{
              start: 0,
              end: classification.length
            }]
          });
        }
      });
      
      if (score > 0) {
        results.push({
          id: `idp-classification-${index}`,
          type: 'idp',
          score: score / intent.keywords.length,
          highlighted: false,
          metadata: {
            title: 'Document Classification',
            description: classification,
            source: 'Document Processing'
          },
          data: { classification },
          matchedFields,
          excerpts
        });
      }
    });
    
    return results;
  }, [idpData]);

  // Main search function
  const search = useCallback(async (query: string, options?: Partial<SearchOptions>) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const intent = analyzeQueryIntent(query);
      const mergedOptions = { ...searchOptions, ...options };
      
      // Search each enabled processing type
      const allResults: UnifiedSearchResult[] = [];
      
      if (intent.searchTypes.includes('rag') && filters.types.includes('rag')) {
        allResults.push(...searchRAGResults(query, intent));
      }
      
      if (intent.searchTypes.includes('kg') && filters.types.includes('kg')) {
        allResults.push(...searchKGResults(query, intent));
      }
      
      if (intent.searchTypes.includes('idp') && filters.types.includes('idp')) {
        allResults.push(...searchIDPResults(query, intent));
      }
      
      // Combine and rank results
      let rankedResults = rankResults(allResults, mergedOptions);
      
      // Apply filters
      rankedResults = applyFilters(rankedResults, filters);
      
      // Apply pagination
      const start = mergedOptions.offset || 0;
      const end = start + (mergedOptions.limit || 20);
      rankedResults = rankedResults.slice(start, end);
      
      setSearchResults(rankedResults);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchOptions, filters, analyzeQueryIntent, searchRAGResults, searchKGResults, searchIDPResults]);

  // Rank results based on score and other factors
  const rankResults = useCallback((results: UnifiedSearchResult[], options: SearchOptions): UnifiedSearchResult[] => {
    const sorted = [...results].sort((a, b) => {
      switch (options.sortBy) {
        case 'relevance':
          return b.score - a.score;
        case 'confidence':
          return (b.metadata.confidence || 0) - (a.metadata.confidence || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
          const aDate = new Date(a.metadata.timestamp || 0);
          const bDate = new Date(b.metadata.timestamp || 0);
          return bDate.getTime() - aDate.getTime();
        default:
          return b.score - a.score;
      }
    });
    
    return options.sortOrder === 'asc' ? sorted.reverse() : sorted;
  }, []);

  // Apply filters to results
  const applyFilters = useCallback((results: UnifiedSearchResult[], filters: SearchFilters): UnifiedSearchResult[] => {
    return results.filter(result => {
      // Type filter
      if (!filters.types.includes(result.type)) {
        return false;
      }
      
      // Score filter
      if (filters.minScore && result.score < filters.minScore) {
        return false;
      }
      
      // Date filter
      if (filters.dateRange && result.metadata.timestamp) {
        const resultDate = new Date(result.metadata.timestamp);
        if (resultDate < filters.dateRange.start || resultDate > filters.dateRange.end) {
          return false;
        }
      }
      
      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        const resultTags = result.metadata.tags || [];
        if (!filters.tags.some(tag => resultTags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }, []);

  // Highlight search result
  const highlightResult = useCallback((resultId: string) => {
    setSearchResults(prev => prev.map(result => ({
      ...result,
      highlighted: result.id === resultId
    })));
  }, []);

  // Clear highlights
  const clearHighlights = useCallback(() => {
    setSearchResults(prev => prev.map(result => ({
      ...result,
      highlighted: false
    })));
  }, []);

  // Get facets for filtering
  const facets = useMemo(() => {
    const typeCounts: Record<string, number> = { rag: 0, kg: 0, idp: 0 };
    const tagCounts: Record<string, number> = {};
    const entityTypeCounts: Record<string, number> = {};
    
    searchResults.forEach(result => {
      typeCounts[result.type]++;
      
      result.metadata.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      if (result.type === 'kg' && result.data.type) {
        entityTypeCounts[result.data.type] = (entityTypeCounts[result.data.type] || 0) + 1;
      }
    });
    
    return {
      types: typeCounts,
      tags: tagCounts,
      entityTypes: entityTypeCounts
    };
  }, [searchResults]);

  return {
    // State
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    filters,
    searchOptions,
    facets,
    
    // Actions
    setSearchQuery,
    search,
    setFilters,
    setSearchOptions,
    highlightResult,
    clearHighlights,
    
    // Utilities
    analyzeQueryIntent
  };
}