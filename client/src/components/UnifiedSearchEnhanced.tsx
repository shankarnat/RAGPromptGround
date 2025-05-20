import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, X, ChevronDown, AlertCircle, Database, GitBranch, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface UnifiedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  ragResults?: any;
  kgResults?: any;
  idpResults?: any;
  className?: string;
}

interface SearchFilters {
  types: ('rag' | 'kg' | 'idp')[];
  entities?: string[];
  tags?: string[];
}

interface SearchSuggestion {
  value: string;
  type: 'query' | 'entity' | 'tag' | 'chunk';
  source: 'rag' | 'kg' | 'idp';
  metadata?: any;
}

const UnifiedSearchEnhanced: React.FC<UnifiedSearchProps> = ({
  onSearch,
  ragResults,
  kgResults,
  idpResults,
  className
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({
    types: ['rag', 'kg', 'idp'],
    entities: [],
    tags: []
  });
  
  const debouncedQuery = useDebounce(query, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate suggestions based on query and available data
  const generateSuggestions = useCallback(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchSuggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // RAG suggestions from chunks
    if (ragResults?.chunks && selectedFilters.types.includes('rag')) {
      ragResults.chunks.forEach((chunk: any) => {
        if (chunk.title.toLowerCase().includes(lowerQuery)) {
          searchSuggestions.push({
            value: chunk.title,
            type: 'chunk',
            source: 'rag',
            metadata: { chunkId: chunk.id }
          });
        }
        
        // Add tag suggestions
        chunk.tags?.forEach((tag: string) => {
          if (tag.toLowerCase().includes(lowerQuery) && 
              !searchSuggestions.some(s => s.value === tag && s.type === 'tag')) {
            searchSuggestions.push({
              value: tag,
              type: 'tag',
              source: 'rag'
            });
          }
        });
      });
    }

    // KG suggestions from entities
    if (kgResults?.entities && selectedFilters.types.includes('kg')) {
      kgResults.entities.forEach((entity: any) => {
        if (entity.name.toLowerCase().includes(lowerQuery)) {
          searchSuggestions.push({
            value: entity.name,
            type: 'entity',
            source: 'kg',
            metadata: { entityId: entity.id, entityType: entity.type }
          });
        }
      });
    }

    // Add query history suggestions (mock for now)
    const recentQueries = [
      'customer data',
      'sales report',
      'product analysis',
      'revenue trends'
    ];
    
    recentQueries.forEach(recentQuery => {
      if (recentQuery.toLowerCase().includes(lowerQuery)) {
        searchSuggestions.push({
          value: recentQuery,
          type: 'query',
          source: 'rag'
        });
      }
    });

    // Sort suggestions by relevance
    searchSuggestions.sort((a, b) => {
      const aExact = a.value.toLowerCase() === lowerQuery;
      const bExact = b.value.toLowerCase() === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStarts = a.value.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.value.toLowerCase().startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return a.value.length - b.value.length;
    });

    setSuggestions(searchSuggestions.slice(0, 10));
  }, [query, ragResults, kgResults, selectedFilters.types]);

  // Update suggestions when query changes
  useEffect(() => {
    generateSuggestions();
  }, [debouncedQuery, generateSuggestions]);

  const handleSearch = useCallback(() => {
    onSearch(query, selectedFilters);
    setIsOpen(false);
  }, [query, selectedFilters, onSearch]);

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'tag') {
      setSelectedFilters(prev => ({
        ...prev,
        tags: [...(prev.tags || []), suggestion.value]
      }));
    } else if (suggestion.type === 'entity') {
      setSelectedFilters(prev => ({
        ...prev,
        entities: [...(prev.entities || []), suggestion.value]
      }));
    } else {
      setQuery(suggestion.value);
    }
    setIsOpen(false);
    handleSearch();
  };

  const removeFilter = (type: 'entities' | 'tags', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type]?.filter(item => item !== value)
    }));
  };

  return (
    <div className={cn("relative w-full", className)}>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-auto">
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-center gap-2">
                  {suggestion.type === 'entity' && <GitBranch className="h-4 w-4 text-blue-500" />}
                  {suggestion.type === 'chunk' && <Database className="h-4 w-4 text-green-500" />}
                  {suggestion.type === 'tag' && <Badge variant="outline" className="h-5">{suggestion.value}</Badge>}
                  {suggestion.type === 'query' && <Search className="h-4 w-4 text-gray-500" />}
                  {suggestion.type !== 'tag' && (
                    <span className="text-sm">{suggestion.value}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {suggestion.source.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active filters */}
      {(selectedFilters.entities?.length > 0 || selectedFilters.tags?.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedFilters.entities?.map((entity, index) => (
            <Badge
              key={`entity-${index}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <GitBranch className="h-3 w-3" />
              {entity}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('entities', entity)}
              />
            </Badge>
          ))}
          {selectedFilters.tags?.map((tag, index) => (
            <Badge
              key={`tag-${index}`}
              variant="outline"
              className="flex items-center gap-1"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('tags', tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Type filters removed */}
    </div>
  );
};

export default UnifiedSearchEnhanced;