import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  ChevronDown,
  ChevronUp,
  Database,
  Calendar,
  ShoppingCart,
  Briefcase,
  Building,
  Truck,
  MapPin,
  HelpCircle
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
  
  // Node types that can be connected by edges
  const [nodeTypes] = useState<NodeType[]>([
    { id: 'user', name: 'User', icon: <User className="h-4 w-4 text-blue-500" /> },
    { id: 'document', name: 'Document', icon: <FileText className="h-4 w-4 text-gray-500" /> },
    { id: 'product', name: 'Product', icon: <ShoppingCart className="h-4 w-4 text-green-500" /> },
    { id: 'organization', name: 'Organization', icon: <Building className="h-4 w-4 text-purple-500" /> },
    { id: 'event', name: 'Event', icon: <Calendar className="h-4 w-4 text-red-500" /> },
    { id: 'project', name: 'Project', icon: <Briefcase className="h-4 w-4 text-amber-500" /> },
    { id: 'location', name: 'Location', icon: <MapPin className="h-4 w-4 text-indigo-500" /> },
    { id: 'category', name: 'Category', icon: <Tag className="h-4 w-4 text-teal-500" /> },
    { id: 'supplier', name: 'Supplier', icon: <Truck className="h-4 w-4 text-orange-500" /> },
  ]);
  
  // Edges connecting node types
  const [edges, setEdges] = useState<Edge[]>([
    {
      id: '1',
      name: 'Created',
      fromNodeType: 'user',
      toNodeType: 'document',
      isBidirectional: false,
      attributes: [
        { id: '1-1', name: 'created_at', type: 'date' },
        { id: '1-2', name: 'platform', type: 'string' },
      ]
    },
    {
      id: '2',
      name: 'WorksAt',
      fromNodeType: 'user',
      toNodeType: 'organization',
      isBidirectional: false,
      attributes: [
        { id: '2-1', name: 'start_date', type: 'date' },
        { id: '2-2', name: 'role', type: 'string' },
        { id: '2-3', name: 'is_active', type: 'boolean' },
      ]
    },
    {
      id: '3',
      name: 'Collaborates',
      fromNodeType: 'user',
      toNodeType: 'user',
      isBidirectional: true,
      attributes: [
        { id: '3-1', name: 'project_count', type: 'number' },
        { id: '3-2', name: 'last_collaboration', type: 'date' },
      ]
    }
  ]);
  
  // State for adding/editing edges
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [showNewEdgeForm, setShowNewEdgeForm] = useState<boolean>(false);
  const [newEdge, setNewEdge] = useState<Omit<Edge, 'id'> & { id?: string }>({
    name: '',
    fromNodeType: '',
    toNodeType: '',
    isBidirectional: false,
    attributes: []
  });
  
  // State for adding attributes
  const [newAttribute, setNewAttribute] = useState<Omit<EdgeAttribute, 'id'>>({
    name: '',
    type: 'string'
  });
  
  // Reset the new edge form
  const resetNewEdgeForm = () => {
    setNewEdge({
      name: '',
      fromNodeType: '',
      toNodeType: '',
      isBidirectional: false,
      attributes: []
    });
    setNewAttribute({
      name: '',
      type: 'string'
    });
  };
  
  // Start editing an existing edge
  const startEditing = (edge: Edge) => {
    setEditingEdgeId(edge.id);
    setNewEdge({
      ...edge
    });
  };
  
  // Add a new edge
  const handleAddEdge = () => {
    const edgeId = Date.now().toString();
    const newEdgeWithId: Edge = {
      id: edgeId,
      name: newEdge.name,
      fromNodeType: newEdge.fromNodeType,
      toNodeType: newEdge.toNodeType,
      isBidirectional: newEdge.isBidirectional,
      attributes: newEdge.attributes
    };
    
    setEdges(prev => [...prev, newEdgeWithId]);
    setShowNewEdgeForm(false);
    resetNewEdgeForm();
  };
  
  // Update an existing edge
  const handleUpdateEdge = (edgeId: string) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId 
        ? { ...newEdge, id: edgeId } as Edge
        : edge
    ));
    setEditingEdgeId(null);
    resetNewEdgeForm();
  };
  
  // Delete an edge
  const handleDeleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
  };
  
  // Add an attribute to an edge
  const handleAddAttribute = (edgeId: string) => {
    const attributeId = `${edgeId}-${Date.now()}`;
    const attribute: EdgeAttribute = {
      id: attributeId,
      name: newAttribute.name,
      type: newAttribute.type
    };
    
    if (editingEdgeId) {
      setNewEdge(prev => ({
        ...prev,
        attributes: [...prev.attributes, attribute]
      }));
    } else {
      setEdges(prev => prev.map(edge => 
        edge.id === edgeId
          ? { ...edge, attributes: [...edge.attributes, attribute] }
          : edge
      ));
    }
    
    setNewAttribute({
      name: '',
      type: 'string'
    });
  };
  
  // Delete an attribute from an edge
  const handleDeleteAttribute = (edgeId: string, attributeId: string) => {
    if (editingEdgeId) {
      setNewEdge(prev => ({
        ...prev,
        attributes: prev.attributes.filter(attr => attr.id !== attributeId)
      }));
    } else {
      setEdges(prev => prev.map(edge => 
        edge.id === edgeId
          ? { ...edge, attributes: edge.attributes.filter(attr => attr.id !== attributeId) }
          : edge
      ));
    }
  };
  
  // Helper functions
  const getNodeName = (nodeId: string): string => {
    const node = nodeTypes.find(n => n.id === nodeId);
    return node ? node.name : nodeId;
  };
  
  const getNodeIcon = (nodeId: string): React.ReactNode => {
    const node = nodeTypes.find(n => n.id === nodeId);
    return node ? node.icon : null;
  };

  const handleNext = () => {
    // Navigate to the Analytics Configuration page
    navigate('/kg/analytics');
  };

  const handlePrevious = () => {
    // Navigate back to DMO Selection
    navigate('/kg/dmo');
  };

  // Edge definitions UI to be shown in the right panel
  const EdgeDefinitionsPanel = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Edge Definitions</h2>
          <Button 
            onClick={() => setShowNewEdgeForm(true)}
            disabled={showNewEdgeForm || editingEdgeId !== null}
            size="sm"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Edge
          </Button>
        </div>
        
        {/* Edge list */}
        <div className="space-y-4">
          {edges.map(edge => (
            <div 
              key={edge.id} 
              className={`p-3 border rounded-md ${
                editingEdgeId === edge.id ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
              }`}
            >
              {editingEdgeId === edge.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edge-name" className="text-xs mb-1 block">Name</Label>
                    <Input 
                      id="edge-name"
                      value={newEdge.name}
                      onChange={e => setNewEdge({...newEdge, name: e.target.value})}
                      placeholder="e.g., Created, Owns"
                      className="h-7 text-xs"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="from-node" className="text-xs mb-1 block">From</Label>
                      <Select
                        value={newEdge.fromNodeType}
                        onValueChange={value => setNewEdge({...newEdge, fromNodeType: value})}
                      >
                        <SelectTrigger id="from-node" className="h-7 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodeTypes.map(node => (
                            <SelectItem key={node.id} value={node.id}>
                              <div className="flex items-center">
                                {node.icon}
                                <span className="ml-2 text-xs">{node.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor="to-node" className="text-xs mb-1 block">To</Label>
                      <Select
                        value={newEdge.toNodeType}
                        onValueChange={value => setNewEdge({...newEdge, toNodeType: value})}
                      >
                        <SelectTrigger id="to-node" className="h-7 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodeTypes.map(node => (
                            <SelectItem key={node.id} value={node.id}>
                              <div className="flex items-center">
                                {node.icon}
                                <span className="ml-2 text-xs">{node.name}</span>
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
                    <Label htmlFor="bidirectional" className="text-xs">Bidirectional</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingEdgeId(null)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleUpdateEdge(edge.id)}
                      disabled={!newEdge.name || !newEdge.fromNodeType || !newEdge.toNodeType}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-xs">{edge.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => startEditing(edge)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3 text-gray-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEdge(edge.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2 text-xs">
                    <div className="flex items-center">
                      {getNodeIcon(edge.fromNodeType)}
                      <span className="ml-1">{getNodeName(edge.fromNodeType)}</span>
                    </div>
                    
                    {edge.isBidirectional ? (
                      <ArrowLeftRight className="h-3 w-3 mx-1 text-purple-500" />
                    ) : (
                      <ArrowRight className="h-3 w-3 mx-1 text-blue-500" />
                    )}
                    
                    <div className="flex items-center">
                      {getNodeIcon(edge.toNodeType)}
                      <span className="ml-1">{getNodeName(edge.toNodeType)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* New edge form */}
          {showNewEdgeForm && (
            <div className="p-3 border rounded-md border-blue-200 bg-blue-50">
              <h3 className="font-medium text-xs mb-2">New Edge</h3>
              <div className="space-y-3">
                {/* Same form fields as in the edit mode */}
                <div>
                  <Label htmlFor="new-edge-name" className="text-xs mb-1 block">Name</Label>
                  <Input 
                    id="new-edge-name"
                    value={newEdge.name}
                    onChange={e => setNewEdge({...newEdge, name: e.target.value})}
                    placeholder="e.g., Created, Owns"
                    className="h-7 text-xs"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="new-from-node" className="text-xs mb-1 block">From</Label>
                    <Select
                      value={newEdge.fromNodeType}
                      onValueChange={value => setNewEdge({...newEdge, fromNodeType: value})}
                    >
                      <SelectTrigger id="new-from-node" className="h-7 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodeTypes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            <div className="flex items-center">
                              {node.icon}
                              <span className="ml-2 text-xs">{node.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="new-to-node" className="text-xs mb-1 block">To</Label>
                    <Select
                      value={newEdge.toNodeType}
                      onValueChange={value => setNewEdge({...newEdge, toNodeType: value})}
                    >
                      <SelectTrigger id="new-to-node" className="h-7 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodeTypes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            <div className="flex items-center">
                              {node.icon}
                              <span className="ml-2 text-xs">{node.name}</span>
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
                  <Label htmlFor="new-bidirectional" className="text-xs">Bidirectional</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewEdgeForm(false);
                      resetNewEdgeForm();
                    }}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddEdge}
                    disabled={!newEdge.name || !newEdge.fromNodeType || !newEdge.toNodeType}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Help panel content with information tooltip
  const rightPanelContent = (
    <div className="space-y-6">
      <EdgeDefinitionsPanel />
      
      <div className="mt-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-start mt-4 cursor-pointer">
                <div className="mr-2 mt-1">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium mb-2 text-gray-500">Configuration Help</h3>
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-72 p-4">
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-medium mb-1">Edge Types</h4>
                  <p className="text-gray-600">
                    Common edge types include 'Created', 'Owns', 'Contributes To', 'Reports To', etc. Choose meaningful names that describe the relationship.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Directionality</h4>
                  <p className="text-gray-600">
                    One-way relationships flow from one node to another. Bidirectional relationships apply in both directions and are useful for peer relationships.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Edge Attributes</h4>
                  <p className="text-gray-600">
                    Attributes store additional information about the relationship, such as creation time, strength, or other metadata that helps characterize the relationship.
                  </p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
      currentStep={3}
      totalSteps={4}  // 4 steps: Template, Setup, Playground, Share
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div>
        {/* Graph visualization panel */}
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
    </KnowledgeGraphLayout>
  );
};

export default EdgeConfiguration;