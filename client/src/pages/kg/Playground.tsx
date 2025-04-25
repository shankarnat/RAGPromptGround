import React, { useState, useRef } from 'react';
import { 
  Network, 
  Search, 
  Clock, 
  Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import KnowledgeGraphLayout from "@/components/KnowledgeGraphLayout";
import { useLocation } from 'wouter';

interface QueryNode {
  id: string;
  label: string;
  type: string;
}

interface QueryEdge {
  source: string;
  target: string;
  label: string;
  type: 'relationship' | 'affinity' | 'analytics';
}

interface QueryResult {
  answer: string;
  nodes: QueryNode[];
  edges: QueryEdge[];
  queryTime: number;
}

const Playground: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const queryInputRef = useRef<string>('');
  
  // Navigation helper function
  const navigate = (path: string) => {
    setLocation(path);
  };
  
  // Navigation handlers
  const handleNextStep = () => {
    // Navigate to Share page (step 4)
    navigate('/kg/share');
  };
  
  const handlePreviousStep = () => {
    // Navigate back to EKG Setup (step 2)
    navigate('/kg/ekg');
  };
  
  // Sample queries for users to try
  const sampleQueries = [
    "Who are the key collaborators of Jane Smith?",
    "What projects are related to Machine Learning?",
    "Show documents created by the Marketing team",
    "What are the most central entities in my knowledge graph?",
    "Find connections between Project X and Department Y"
  ];

  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    queryInputRef.current = e.target.value;
  };
  
  // Function to execute a query
  const executeQuery = (query: string) => {
    console.log(`Executing query: ${query}`);
    
    // If this isn't a duplicate of the most recent query, add to history
    if (queryHistory.length === 0 || queryHistory[0] !== query) {
      setQueryHistory(prev => [query, ...prev.slice(0, 9)]);
    }
    
    // Simulate fetching results
    setTimeout(() => {
      // For demonstration, create a simulated result based on the query
      let simulatedResult: QueryResult;
      
      if (query.toLowerCase().includes('collaborators') || query.toLowerCase().includes('jane smith')) {
        simulatedResult = {
          answer: "Jane Smith's key collaborators are John Davis (Project Manager), Alice Wong (Data Scientist), and Mark Johnson (Engineer). They collaborate primarily on the AI Research project.",
          nodes: [
            { id: '1', label: 'Jane Smith', type: 'Person' },
            { id: '2', label: 'John Davis', type: 'Person' },
            { id: '3', label: 'Alice Wong', type: 'Person' },
            { id: '4', label: 'Mark Johnson', type: 'Person' },
            { id: '5', label: 'AI Research', type: 'Project' }
          ],
          edges: [
            { source: '1', target: '2', label: 'Collaborates', type: 'relationship' },
            { source: '1', target: '3', label: 'Collaborates', type: 'relationship' },
            { source: '1', target: '4', label: 'Collaborates', type: 'relationship' },
            { source: '1', target: '5', label: 'Works On', type: 'relationship' },
            { source: '2', target: '5', label: 'Manages', type: 'relationship' },
            { source: '3', target: '5', label: 'Works On', type: 'relationship' },
            { source: '4', target: '5', label: 'Works On', type: 'relationship' },
            { source: '2', target: '3', label: 'High Affinity', type: 'affinity' }
          ],
          queryTime: 0.24
        };
      } else if (query.toLowerCase().includes('machine learning') || query.toLowerCase().includes('projects')) {
        simulatedResult = {
          answer: "There are 3 projects related to Machine Learning: AI Research, Predictive Analytics, and NLP Framework. The AI Research project has the highest number of active contributors.",
          nodes: [
            { id: '1', label: 'AI Research', type: 'Project' },
            { id: '2', label: 'Predictive Analytics', type: 'Project' },
            { id: '3', label: 'NLP Framework', type: 'Project' },
            { id: '4', label: 'Machine Learning', type: 'Concept' }
          ],
          edges: [
            { source: '1', target: '4', label: 'Related To', type: 'relationship' },
            { source: '2', target: '4', label: 'Related To', type: 'relationship' },
            { source: '3', target: '4', label: 'Related To', type: 'relationship' },
            { source: '1', target: '3', label: 'Depends On', type: 'relationship' },
            { source: '2', target: '1', label: 'Similar', type: 'affinity' }
          ],
          queryTime: 0.18
        };
      } else if (query.toLowerCase().includes('marketing') || query.toLowerCase().includes('documents')) {
        simulatedResult = {
          answer: "The Marketing team has created 12 documents in the last quarter. The most recent document is 'Q2 Campaign Strategy' created by Tom Wilson on April 15, 2025.",
          nodes: [
            { id: '1', label: 'Marketing', type: 'Department' },
            { id: '2', label: 'Q2 Campaign', type: 'Document' },
            { id: '3', label: 'Brand Guide', type: 'Document' },
            { id: '4', label: 'Tom Wilson', type: 'Person' }
          ],
          edges: [
            { source: '4', target: '1', label: 'Member Of', type: 'relationship' },
            { source: '4', target: '2', label: 'Created', type: 'relationship' },
            { source: '4', target: '3', label: 'Created', type: 'relationship' },
            { source: '1', target: '2', label: 'Owns', type: 'relationship' },
            { source: '1', target: '3', label: 'Owns', type: 'relationship' },
            { source: '2', target: '3', label: 'References', type: 'relationship' }
          ],
          queryTime: 0.31
        };
      } else if (query.toLowerCase().includes('central') || query.toLowerCase().includes('entities')) {
        simulatedResult = {
          answer: "The most central entities in your knowledge graph are: 1) Jane Smith (Person), 2) AI Research (Project), and 3) Engineering (Department). Jane Smith has connections to 78% of all projects.",
          nodes: [
            { id: '1', label: 'Jane Smith', type: 'Person' },
            { id: '2', label: 'AI Research', type: 'Project' },
            { id: '3', label: 'Engineering', type: 'Department' },
            { id: '4', label: 'Data Science', type: 'Department' }
          ],
          edges: [
            { source: '1', target: '2', label: 'Works On', type: 'relationship' },
            { source: '1', target: '3', label: 'Member Of', type: 'relationship' },
            { source: '3', target: '2', label: 'Owns', type: 'relationship' },
            { source: '4', target: '2', label: 'Contributes', type: 'relationship' },
            { source: '1', target: '4', label: 'Centralizes', type: 'analytics' }
          ],
          queryTime: 0.42
        };
      } else {
        simulatedResult = {
          answer: "Based on your knowledge graph analysis, I found 5 connections between the entities you mentioned. The most significant connection appears to be through shared team members and document collaborations.",
          nodes: [
            { id: '1', label: 'Entity A', type: 'Project' },
            { id: '2', label: 'Entity B', type: 'Department' },
            { id: '3', label: 'User 1', type: 'Person' },
            { id: '4', label: 'User 2', type: 'Person' }
          ],
          edges: [
            { source: '3', target: '1', label: 'Works On', type: 'relationship' },
            { source: '3', target: '2', label: 'Member Of', type: 'relationship' },
            { source: '4', target: '1', label: 'Manages', type: 'relationship' },
            { source: '4', target: '2', label: 'Leads', type: 'relationship' },
            { source: '1', target: '2', label: 'Connection', type: 'analytics' }
          ],
          queryTime: 0.36
        };
      }
      
      setQueryResults(simulatedResult);
    }, 500);
  };

  // Run query with current ref value
  const runQuery = () => {
    if (queryInputRef.current.trim()) {
      executeQuery(queryInputRef.current);
    }
  };

  // Simple right panel for demonstration
  const rightPanel = (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Query History</h3>
      <p className="text-sm text-gray-500 mb-4">
        Your recent EKG queries
      </p>
      
      {queryHistory.length > 0 ? (
        <ul className="space-y-2">
          {queryHistory.map((query, index) => (
            <li key={index}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left text-sm p-2 h-auto font-normal"
                onClick={() => {
                  queryInputRef.current = query;
                  executeQuery(query);
                }}
              >
                <Clock className="h-3 w-3 mr-2 text-gray-500" />
                <span className="truncate">{query}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No query history yet</p>
        </div>
      )}
    </div>
  );
  
  return (
    <KnowledgeGraphLayout
      title="Query Playground"
      rightPanelContent={rightPanel}
      currentStep={3}
      totalSteps={4}
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
    >
      <div className="border rounded-lg p-4 h-[calc(100vh-250px)] flex flex-col space-y-4 overflow-hidden">
        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-semibold">EKG Query Playground</h3>
          <p className="text-sm text-gray-500">
            Explore your Enterprise Knowledge Graph with natural language queries and visualize entity relationships, affinities, and more.
          </p>
        </div>
        
        {/* Query input section */}
        <div className="relative">
          <Input 
            placeholder="Ask a question about your EKG (e.g., 'Who are the key collaborators of Jane Smith?')"
            className="pr-12"
            defaultValue={queryInputRef.current}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && queryInputRef.current.trim()) {
                runQuery();
              }
            }}
          />
          <Button 
            className="absolute right-1 top-1 h-8 px-3 py-1"
            size="sm"
            onClick={runQuery}
          >
            <Search className="h-4 w-4 mr-1" />
            Query
          </Button>
        </div>
        
        {/* Sample queries */}
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((query, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => {
                queryInputRef.current = query;
                executeQuery(query);
              }}
            >
              {query}
            </Badge>
          ))}
        </div>
        
        {/* Results section */}
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
          {queryResults ? (
            <>
              {/* Answer display */}
              <div className="bg-gray-50 p-3 rounded-md border">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Answer:</h4>
                <p className="text-sm">{queryResults.answer}</p>
                <div className="text-xs text-gray-500 mt-2 text-right">
                  Query processed in {queryResults.queryTime}s
                </div>
              </div>
              
              {/* Visualization of results */}
              <div className="flex-1 border rounded-md overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
                    <h4 className="text-sm font-medium">Graph Visualization</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {/* Graph visualization */}
                  <div className="flex-1 p-4 flex items-center justify-center bg-gray-50">
                    <svg width="100%" height="100%" viewBox="0 0 500 300">
                      {/* Draw nodes */}
                      {queryResults.nodes.map((node, i) => {
                        const x = 100 + (i % 2) * 300;
                        const y = 80 + Math.floor(i / 2) * 140;
                        return (
                          <g key={node.id}>
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={30} 
                              fill={node.type === 'Person' ? '#e2f0ff' : node.type === 'Project' ? '#e2ffe2' : '#ffe2e2'} 
                              stroke={node.type === 'Person' ? '#90b8e0' : node.type === 'Project' ? '#90e090' : '#e09090'} 
                              strokeWidth="2"
                            />
                            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="500">
                              {node.label.length > 12 ? node.label.substring(0, 10) + '...' : node.label}
                            </text>
                            <text x={x} y={y+35} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#666">
                              {node.type}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Draw edges */}
                      {queryResults.edges.map((edge, i) => {
                        const sourceIndex = queryResults.nodes.findIndex(n => n.id === edge.source);
                        const targetIndex = queryResults.nodes.findIndex(n => n.id === edge.target);
                        
                        if (sourceIndex < 0 || targetIndex < 0) return null;
                        
                        const sourceX = 100 + (sourceIndex % 2) * 300;
                        const sourceY = 80 + Math.floor(sourceIndex / 2) * 140;
                        const targetX = 100 + (targetIndex % 2) * 300;
                        const targetY = 80 + Math.floor(targetIndex / 2) * 140;
                        
                        // Calculate midpoint for label
                        const midX = (sourceX + targetX) / 2;
                        const midY = (sourceY + targetY) / 2;
                        
                        // Add a slight curve for visibility
                        const curveOffset = 20 * (i % 2 ? 1 : -1);
                        const controlX = midX;
                        const controlY = midY + curveOffset;
                        
                        // Determine edge styles based on type
                        let strokeColor = '#666';
                        let strokeDash = 'none';
                        
                        if (edge.type === 'analytics') {
                          strokeColor = '#4ade80'; // Green for analytics
                          strokeDash = '5,5';
                        } else if (edge.type === 'affinity') {
                          strokeColor = '#8866dd'; // Purple for affinities
                          strokeDash = '5,5';
                        } else {
                          strokeColor = '#3b82f6'; // Blue for relationships
                        }
                        
                        return (
                          <g key={`edge-${i}`}>
                            <path 
                              d={`M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`}
                              fill="none"
                              stroke={strokeColor}
                              strokeWidth="2"
                              strokeDasharray={strokeDash}
                              markerEnd={`url(#arrowhead-${edge.type})`}
                            />
                            <rect x={midX-30} y={midY-10} width="60" height="20" rx="10" fill="white" opacity="0.8" />
                            <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="500">
                              {edge.label}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Define arrow markers for directed edges */}
                      <defs>
                        <marker 
                          id="arrowhead-relationship" 
                          markerWidth="6" 
                          markerHeight="4" 
                          refX="6" 
                          refY="2"
                          orient="auto"
                        >
                          <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                        </marker>
                        <marker 
                          id="arrowhead-analytics" 
                          markerWidth="6" 
                          markerHeight="4" 
                          refX="6" 
                          refY="2"
                          orient="auto"
                        >
                          <polygon points="0 0, 6 2, 0 4" fill="#4ade80" />
                        </marker>
                        <marker 
                          id="arrowhead-affinity" 
                          markerWidth="6" 
                          markerHeight="4" 
                          refX="6" 
                          refY="2"
                          orient="auto"
                        >
                          <polygon points="0 0, 6 2, 0 4" fill="#8866dd" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 border rounded-md p-4 bg-gray-50 flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <Search className="h-10 w-10 mb-2 text-gray-400" />
                <p className="text-gray-500">Enter a query above or select one of the sample queries to explore your EKG data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default Playground;