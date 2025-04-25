import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRight, 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Tag, 
  Edit, 
  Check, 
  ArrowUpDown 
} from 'lucide-react';

interface Edge {
  id: string;
  name: string;
  fromNodeType: string;
  toNodeType: string;
  isBidirectional: boolean;
  attributes: EdgeAttribute[];
}

interface EdgeAttribute {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

interface NodeType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const EdgeConfiguration: React.FC = () => {
  const [, navigate] = useLocation();
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [showNewEdgeForm, setShowNewEdgeForm] = useState(false);
  
  const nodeTypes: NodeType[] = [
    { id: 'document', name: 'Document', icon: <FileText className="h-5 w-5 text-blue-500" /> },
    { id: 'user', name: 'User', icon: <User className="h-5 w-5 text-green-500" /> },
    { id: 'tag', name: 'Tag', icon: <Tag className="h-5 w-5 text-red-500" /> },
  ];

  // Initial edge configurations
  const [edges, setEdges] = useState<Edge[]>([
    {
      id: 'edge1',
      name: 'Created',
      fromNodeType: 'user',
      toNodeType: 'document',
      isBidirectional: false,
      attributes: [
        { id: 'attr1', name: 'timestamp', type: 'date' },
        { id: 'attr2', name: 'method', type: 'string' },
      ]
    },
    {
      id: 'edge2',
      name: 'Tagged',
      fromNodeType: 'document',
      toNodeType: 'tag',
      isBidirectional: false,
      attributes: [
        { id: 'attr3', name: 'added_at', type: 'date' },
        { id: 'attr4', name: 'relevance_score', type: 'number' },
      ]
    },
    {
      id: 'edge3',
      name: 'Collaborates',
      fromNodeType: 'user',
      toNodeType: 'user',
      isBidirectional: true,
      attributes: [
        { id: 'attr5', name: 'frequency', type: 'number' },
        { id: 'attr6', name: 'last_interaction', type: 'date' },
      ]
    },
  ]);

  // New edge form state
  const [newEdge, setNewEdge] = useState<Omit<Edge, 'id'>>({
    name: '',
    fromNodeType: '',
    toNodeType: '',
    isBidirectional: false,
    attributes: []
  });

  // New attribute form state
  const [newAttribute, setNewAttribute] = useState<Omit<EdgeAttribute, 'id'>>({
    name: '',
    type: 'string'
  });

  const handleAddEdge = () => {
    if (newEdge.name && newEdge.fromNodeType && newEdge.toNodeType) {
      const edge: Edge = {
        ...newEdge,
        id: `edge${Date.now()}`,
      };
      
      setEdges(prev => [...prev, edge]);
      setNewEdge({
        name: '',
        fromNodeType: '',
        toNodeType: '',
        isBidirectional: false,
        attributes: []
      });
      setShowNewEdgeForm(false);
    }
  };

  const handleUpdateEdge = (edgeId: string) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId 
        ? { ...edge, ...newEdge, id: edgeId }
        : edge
    ));
    setEditingEdgeId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
  };

  const handleAddAttribute = (edgeId: string) => {
    if (newAttribute.name) {
      const attribute: EdgeAttribute = {
        ...newAttribute,
        id: `attr${Date.now()}`
      };
      
      setEdges(prev => prev.map(edge => 
        edge.id === edgeId
          ? { ...edge, attributes: [...edge.attributes, attribute] }
          : edge
      ));
      
      setNewAttribute({
        name: '',
        type: 'string'
      });
    }
  };

  const handleDeleteAttribute = (edgeId: string, attributeId: string) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId
        ? { ...edge, attributes: edge.attributes.filter(attr => attr.id !== attributeId) }
        : edge
    ));
  };

  const startEditing = (edge: Edge) => {
    setNewEdge({
      name: edge.name,
      fromNodeType: edge.fromNodeType,
      toNodeType: edge.toNodeType,
      isBidirectional: edge.isBidirectional,
      attributes: edge.attributes
    });
    setEditingEdgeId(edge.id);
  };

  const getNodeName = (nodeId: string) => {
    const node = nodeTypes.find(n => n.id === nodeId);
    return node ? node.name : nodeId;
  };

  const getNodeIcon = (nodeId: string) => {
    const node = nodeTypes.find(n => n.id === nodeId);
    return node ? node.icon : null;
  };

  const handleNext = () => {
    navigate('/kg/analytics');
  };

  const handlePrevious = () => {
    navigate('/kg/dmo');
  };

  // Help panel content
  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Edge Configuration</h3>
        <p className="text-sm text-gray-600">
          Edges define relationships between nodes in your knowledge graph. Configure the relationship types, directionality, and attributes here.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Edge Types</h3>
        <p className="text-sm text-gray-600">
          Common edge types include 'Created', 'Owns', 'Contributes To', 'Reports To', etc. Choose meaningful names that describe the relationship.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Directionality</h3>
        <p className="text-sm text-gray-600">
          One-way relationships flow from one node to another. Bidirectional relationships apply in both directions and are useful for peer relationships.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Edge Attributes</h3>
        <p className="text-sm text-gray-600">
          Attributes store additional information about the relationship, such as creation time, strength, or other metadata that helps characterize the relationship.
        </p>
      </div>
    </div>
  );

  // Simple graph visualization of the configured edges
  const GraphVisualization = () => {
    return (
      <div className="bg-white rounded-lg border p-6 min-h-[400px] flex items-center justify-center">
        <svg width="600" height="400" viewBox="0 0 600 400">
          {/* Node positions */}
          {nodeTypes.map((node, index) => {
            const total = nodeTypes.length;
            const angle = ((index / total) * 2 * Math.PI) + (Math.PI / 2); // Start from top
            const radius = 150;
            const x = 300 + radius * Math.cos(angle);
            const y = 200 + radius * Math.sin(angle);
            
            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="40" 
                  fill="#f9fafb" 
                  stroke="#d1d5db" 
                  strokeWidth="2" 
                />
                
                {/* Node icon in foreign object */}
                <foreignObject x={x-20} y={y-20} width="40" height="40">
                  <div className="flex items-center justify-center h-full">
                    {node.icon}
                  </div>
                </foreignObject>
                
                {/* Node name */}
                <text 
                  x={x} 
                  y={y+50} 
                  textAnchor="middle" 
                  fill="#374151" 
                  fontSize="14" 
                  fontWeight="500"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
          
          {/* Edges */}
          {edges.map((edge, index) => {
            const fromNodeIndex = nodeTypes.findIndex(n => n.id === edge.fromNodeType);
            const toNodeIndex = nodeTypes.findIndex(n => n.id === edge.toNodeType);
            
            if (fromNodeIndex === -1 || toNodeIndex === -1) return null;
            
            const fromAngle = ((fromNodeIndex / nodeTypes.length) * 2 * Math.PI) + (Math.PI / 2);
            const toAngle = ((toNodeIndex / nodeTypes.length) * 2 * Math.PI) + (Math.PI / 2);
            
            const radius = 150;
            const fromX = 300 + radius * Math.cos(fromAngle);
            const fromY = 200 + radius * Math.sin(fromAngle);
            const toX = 300 + radius * Math.cos(toAngle);
            const toY = 200 + radius * Math.sin(toAngle);
            
            // Calculate control point for a curved line
            const dx = toX - fromX;
            const dy = toY - fromY;
            const norm = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / norm * 40; // Perpendicular vector for curve
            const perpY = dx / norm * 40;
            
            // Self-referencing edge (like user to user)
            if (edge.fromNodeType === edge.toNodeType) {
              const nodeX = fromX;
              const nodeY = fromY;
              
              return (
                <g key={edge.id}>
                  <path 
                    d={`M ${nodeX} ${nodeY-40} C ${nodeX-80} ${nodeY-100}, ${nodeX+80} ${nodeY-100}, ${nodeX} ${nodeY-40}`}
                    fill="none"
                    stroke={edge.isBidirectional ? "#8b5cf6" : "#3b82f6"}
                    strokeWidth="2"
                    strokeDasharray={edge.isBidirectional ? "0" : "0"}
                    markerEnd={edge.isBidirectional ? "" : "url(#arrowhead)"}
                  />
                  
                  {edge.isBidirectional && (
                    <>
                      <circle cx={nodeX} cy={nodeY-70} r="3" fill="#8b5cf6" />
                      <circle cx={nodeX-40} cy={nodeY-85} r="3" fill="#8b5cf6" />
                      <circle cx={nodeX+40} cy={nodeY-85} r="3" fill="#8b5cf6" />
                    </>
                  )}
                  
                  <text 
                    x={nodeX} 
                    y={nodeY-110} 
                    textAnchor="middle" 
                    fill="#4b5563" 
                    fontSize="12"
                  >
                    {edge.name}
                  </text>
                </g>
              );
            }
            
            // Normal edge between different nodes
            const controlX = (fromX + toX) / 2 + perpX;
            const controlY = (fromY + toY) / 2 + perpY;
            
            // Calculate a point along the curve for the label
            const t = 0.5; // Parameter for point along the curve (0 to 1)
            const labelX = (1-t)*(1-t)*fromX + 2*(1-t)*t*controlX + t*t*toX;
            const labelY = (1-t)*(1-t)*fromY + 2*(1-t)*t*controlY + t*t*toY;
            
            return (
              <g key={edge.id}>
                <defs>
                  <marker 
                    id="arrowhead" 
                    markerWidth="10" 
                    markerHeight="7" 
                    refX="9" 
                    refY="3.5" 
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
                
                <path 
                  d={`M ${fromX} ${fromY} Q ${controlX} ${controlY}, ${toX} ${toY}`}
                  fill="none"
                  stroke={edge.isBidirectional ? "#8b5cf6" : "#3b82f6"}
                  strokeWidth="2"
                  strokeDasharray={edge.isBidirectional ? "0" : "0"}
                  markerEnd={edge.isBidirectional ? "" : "url(#arrowhead)"}
                />
                
                {edge.isBidirectional && (
                  <>
                    <circle cx={(fromX + controlX) / 2} cy={(fromY + controlY) / 2} r="3" fill="#8b5cf6" />
                    <circle cx={(toX + controlX) / 2} cy={(toY + controlY) / 2} r="3" fill="#8b5cf6" />
                  </>
                )}
                
                <rect
                  x={labelX - 40}
                  y={labelY - 10}
                  width="80"
                  height="20"
                  rx="4"
                  fill="white"
                  stroke="#e5e7eb"
                />
                
                <text 
                  x={labelX} 
                  y={labelY + 5} 
                  textAnchor="middle" 
                  fill="#4b5563" 
                  fontSize="12"
                >
                  {edge.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <KnowledgeGraphLayout
      title="Edge Configuration"
      rightPanelContent={rightPanelContent}
      currentStep={4}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Graph visualization panel */}
        <div className="lg:flex-1">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-4">Edge Visualization</h2>
              <p className="text-gray-600 mb-6">
                This visualization shows the configured relationships between entity types in your knowledge graph.
              </p>
              <GraphVisualization />
            </CardContent>
          </Card>
        </div>
        
        {/* Edge configuration panel */}
        <div className="lg:w-96">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Edge Definitions</h2>
                <Button 
                  onClick={() => setShowNewEdgeForm(true)}
                  disabled={showNewEdgeForm || editingEdgeId !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Edge
                </Button>
              </div>
              
              {/* Edge list */}
              <div className="space-y-4 mb-6">
                {edges.map(edge => (
                  <div 
                    key={edge.id} 
                    className={`p-4 border rounded-md ${
                      editingEdgeId === edge.id ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {editingEdgeId === edge.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edge-name" className="mb-1 block">Relationship Name</Label>
                          <Input 
                            id="edge-name"
                            value={newEdge.name}
                            onChange={e => setNewEdge({...newEdge, name: e.target.value})}
                            placeholder="e.g., Created, Owns, Reports To"
                          />
                        </div>
                        
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <Label htmlFor="from-node" className="mb-1 block">From</Label>
                            <Select
                              value={newEdge.fromNodeType}
                              onValueChange={value => setNewEdge({...newEdge, fromNodeType: value})}
                            >
                              <SelectTrigger id="from-node">
                                <SelectValue placeholder="Select node" />
                              </SelectTrigger>
                              <SelectContent>
                                {nodeTypes.map(node => (
                                  <SelectItem key={node.id} value={node.id}>
                                    <div className="flex items-center">
                                      {node.icon}
                                      <span className="ml-2">{node.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex-1">
                            <Label htmlFor="to-node" className="mb-1 block">To</Label>
                            <Select
                              value={newEdge.toNodeType}
                              onValueChange={value => setNewEdge({...newEdge, toNodeType: value})}
                            >
                              <SelectTrigger id="to-node">
                                <SelectValue placeholder="Select node" />
                              </SelectTrigger>
                              <SelectContent>
                                {nodeTypes.map(node => (
                                  <SelectItem key={node.id} value={node.id}>
                                    <div className="flex items-center">
                                      {node.icon}
                                      <span className="ml-2">{node.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="bidirectional"
                            checked={newEdge.isBidirectional}
                            onCheckedChange={checked => setNewEdge({...newEdge, isBidirectional: checked})}
                          />
                          <Label htmlFor="bidirectional">Bidirectional relationship</Label>
                        </div>
                        
                        <div className="pt-2">
                          <Label className="mb-2 block">Attributes</Label>
                          {newEdge.attributes.map(attr => (
                            <div key={attr.id} className="flex items-center space-x-2 mb-2">
                              <div className="flex-1 text-sm">
                                {attr.name} <span className="text-gray-500">({attr.type})</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteAttribute(edge.id, attr.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="flex items-end space-x-2 mt-3">
                            <div className="flex-1">
                              <Label htmlFor="attr-name" className="text-xs mb-1 block">Name</Label>
                              <Input 
                                id="attr-name"
                                className="h-8 text-sm"
                                value={newAttribute.name}
                                onChange={e => setNewAttribute({...newAttribute, name: e.target.value})}
                                placeholder="e.g., created_at"
                              />
                            </div>
                            <div className="w-24">
                              <Label htmlFor="attr-type" className="text-xs mb-1 block">Type</Label>
                              <Select
                                value={newAttribute.type}
                                onValueChange={value => setNewAttribute({
                                  ...newAttribute, 
                                  type: value as 'string' | 'number' | 'date' | 'boolean'
                                })}
                              >
                                <SelectTrigger id="attr-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleAddAttribute(edge.id)}
                              disabled={!newAttribute.name}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button 
                            variant="outline"
                            onClick={() => setEditingEdgeId(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleUpdateEdge(edge.id)}
                            disabled={!newEdge.name || !newEdge.fromNodeType || !newEdge.toNodeType}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{edge.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => startEditing(edge)}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEdge(edge.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {getNodeIcon(edge.fromNodeType)}
                            <span className="text-sm ml-1">{getNodeName(edge.fromNodeType)}</span>
                          </div>
                          
                          {edge.isBidirectional ? (
                            <ArrowLeftRight className="h-4 w-4 mx-2 text-purple-500" />
                          ) : (
                            <ArrowRight className="h-4 w-4 mx-2 text-blue-500" />
                          )}
                          
                          <div className="flex items-center">
                            {getNodeIcon(edge.toNodeType)}
                            <span className="text-sm ml-1">{getNodeName(edge.toNodeType)}</span>
                          </div>
                        </div>
                        
                        {edge.attributes.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Attributes:</p>
                            <div className="flex flex-wrap gap-2">
                              {edge.attributes.map(attr => (
                                <span 
                                  key={attr.id} 
                                  className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                                >
                                  {attr.name}: {attr.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* New edge form */}
              {showNewEdgeForm && (
                <div className="p-4 border rounded-md border-primary-500 bg-primary-50 space-y-4">
                  <h3 className="font-medium">Add New Edge</h3>
                  
                  <div>
                    <Label htmlFor="new-edge-name" className="mb-1 block">Relationship Name</Label>
                    <Input 
                      id="new-edge-name"
                      value={newEdge.name}
                      onChange={e => setNewEdge({...newEdge, name: e.target.value})}
                      placeholder="e.g., Created, Owns, Reports To"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="new-from-node" className="mb-1 block">From</Label>
                      <Select
                        value={newEdge.fromNodeType}
                        onValueChange={value => setNewEdge({...newEdge, fromNodeType: value})}
                      >
                        <SelectTrigger id="new-from-node">
                          <SelectValue placeholder="Select node" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodeTypes.map(node => (
                            <SelectItem key={node.id} value={node.id}>
                              <div className="flex items-center">
                                {node.icon}
                                <span className="ml-2">{node.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor="new-to-node" className="mb-1 block">To</Label>
                      <Select
                        value={newEdge.toNodeType}
                        onValueChange={value => setNewEdge({...newEdge, toNodeType: value})}
                      >
                        <SelectTrigger id="new-to-node">
                          <SelectValue placeholder="Select node" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodeTypes.map(node => (
                            <SelectItem key={node.id} value={node.id}>
                              <div className="flex items-center">
                                {node.icon}
                                <span className="ml-2">{node.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new-bidirectional"
                      checked={newEdge.isBidirectional}
                      onCheckedChange={checked => setNewEdge({...newEdge, isBidirectional: checked})}
                    />
                    <Label htmlFor="new-bidirectional">Bidirectional relationship</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowNewEdgeForm(false);
                        setNewEdge({
                          name: '',
                          fromNodeType: '',
                          toNodeType: '',
                          isBidirectional: false,
                          attributes: []
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddEdge}
                      disabled={!newEdge.name || !newEdge.fromNodeType || !newEdge.toNodeType}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default EdgeConfiguration;