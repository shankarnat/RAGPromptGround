import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, 
  User, 
  MessageSquare, 
  Calendar, 
  Tag, 
  Plus,
  Star,
  ArrowRight, 
  ArrowLeftRight, 
  Trash2, 
  Edit, 
  Check, 
  ChevronDown,
  ChevronUp,
  Database,
  ShoppingCart,
  Briefcase,
  Building,
  Truck,
  MapPin,
  HelpCircle
} from 'lucide-react';

// DMO (Data Model Object) Interfaces
interface DMO {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  selected: boolean;
}

// Edge Interfaces
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

// Combined EKG Setup Component (DMO Selection + Edge Configuration)
const EKGSetup: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'dmos' | 'edges' | 'analytics'>('dmos');
  const svgRef = useRef<SVGSVGElement>(null);
  
  // State for DMO Selection
  const [showNewDMO, setShowNewDMO] = useState(false);
  const [newDMOName, setNewDMOName] = useState('');
  
  // Initial EKG DMOs
  const [dmos, setDmos] = useState<DMO[]>([
    {
      id: 'document',
      name: 'Document',
      description: 'Document or content entity in the EKG',
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      required: true,
      selected: true
    },
    {
      id: 'person',
      name: 'Person',
      description: 'Person or user entity in the enterprise',
      icon: <User className="h-6 w-6 text-green-500" />,
      required: true,
      selected: true
    },
    {
      id: 'concept',
      name: 'Concept',
      description: 'Abstract idea or knowledge concept',
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      required: false,
      selected: true
    },
    {
      id: 'project',
      name: 'Project',
      description: 'Enterprise project or initiative',
      icon: <Briefcase className="h-6 w-6 text-orange-500" />,
      required: false,
      selected: true
    },
    {
      id: 'department',
      name: 'Department',
      description: 'Organizational unit or team',
      icon: <Tag className="h-6 w-6 text-red-500" />,
      required: false,
      selected: true
    },
    {
      id: 'process',
      name: 'Process',
      description: 'Business process or workflow',
      icon: <Star className="h-6 w-6 text-amber-500" />,
      required: false,
      selected: false
    }
  ]);

  // Edge Configuration State
  const [edges, setEdges] = useState<Edge[]>([
    {
      id: '1',
      name: 'Created',
      fromNodeType: 'person',
      toNodeType: 'document',
      isBidirectional: false,
      attributes: [
        { id: '1-1', name: 'created_at', type: 'date' },
        { id: '1-2', name: 'platform', type: 'string' },
      ]
    },
    {
      id: '2',
      name: 'WorksIn',
      fromNodeType: 'person',
      toNodeType: 'department',
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
      fromNodeType: 'person',
      toNodeType: 'person',
      isBidirectional: true,
      attributes: [
        { id: '3-1', name: 'project_count', type: 'number' },
        { id: '3-2', name: 'last_collaboration', type: 'date' },
      ]
    },
    {
      id: '4',
      name: 'PartOf',
      fromNodeType: 'document',
      toNodeType: 'project',
      isBidirectional: false,
      attributes: [
        { id: '4-1', name: 'added_date', type: 'date' },
      ]
    },
    {
      id: '5',
      name: 'Manages',
      fromNodeType: 'person',
      toNodeType: 'project',
      isBidirectional: false,
      attributes: [
        { id: '5-1', name: 'start_date', type: 'date' },
        { id: '5-2', name: 'responsibility', type: 'string' },
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

  // DMO Selection handlers
  const handleDMOToggle = (id: string) => {
    setDmos(prev => prev.map(dmo => 
      dmo.id === id && !dmo.required 
        ? { ...dmo, selected: !dmo.selected } 
        : dmo
    ));
  };

  const handleAddNewDMO = () => {
    if (newDMOName.trim()) {
      const newDMO: DMO = {
        id: `custom-${Date.now()}`,
        name: newDMOName,
        description: 'Custom DMO',
        icon: <Star className="h-6 w-6 text-amber-500" />,
        required: false,
        selected: true
      };
      
      setDmos(prev => [...prev, newDMO]);
      setNewDMOName('');
      setShowNewDMO(false);
    }
  };

  // Edge management functions
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
  
  const startEditing = (edge: Edge) => {
    setEditingEdgeId(edge.id);
    setNewEdge({
      ...edge
    });
  };
  
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
  
  const handleUpdateEdge = (edgeId: string) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId 
        ? { ...newEdge, id: edgeId } as Edge
        : edge
    ));
    setEditingEdgeId(null);
    resetNewEdgeForm();
  };
  
  const handleDeleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
  };
  
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

  // Auto-generate edges when DMOs are selected or deselected
  useEffect(() => {
    // This effect will trigger when DMOs change
    // Logic to automatically create edges between selected DMOs
    const selectedDMOs = dmos.filter(dmo => dmo.selected);
    
    // Generate predictive edges based on the selected DMOs
    if (selectedDMOs.length >= 2) {
      // Auto-generate person-to-document edges if both are selected
      const personDMO = selectedDMOs.find(dmo => dmo.id === 'person');
      const documentDMO = selectedDMOs.find(dmo => dmo.id === 'document');
      
      if (personDMO && documentDMO) {
        // Check if we already have a Created edge
        const hasCreatedEdge = edges.some(edge => 
          edge.name === 'Created' && 
          edge.fromNodeType === 'person' && 
          edge.toNodeType === 'document'
        );
        
        if (!hasCreatedEdge) {
          // Add a Created edge
          setEdges(prev => [
            ...prev,
            {
              id: `auto-${Date.now()}`,
              name: 'Created',
              fromNodeType: 'person',
              toNodeType: 'document',
              isBidirectional: false,
              attributes: [
                { id: `auto-attr-${Date.now()}-1`, name: 'created_at', type: 'date' }
              ]
            }
          ]);
        }
      }
      
      // Auto-generate person-to-person collaboration edges
      const personSelected = selectedDMOs.some(dmo => dmo.id === 'person');
      
      if (personSelected) {
        // Check if we already have a Collaborates edge
        const hasCollaboratesEdge = edges.some(edge => 
          edge.name === 'Collaborates' && 
          edge.fromNodeType === 'person' && 
          edge.toNodeType === 'person'
        );
        
        if (!hasCollaboratesEdge) {
          // Add a Collaborates edge
          setEdges(prev => [
            ...prev,
            {
              id: `auto-collab-${Date.now()}`,
              name: 'Collaborates',
              fromNodeType: 'person',
              toNodeType: 'person',
              isBidirectional: true,
              attributes: [
                { id: `auto-attr-collab-${Date.now()}-1`, name: 'frequency', type: 'number' }
              ]
            }
          ]);
        }
      }
      
      // Auto-generate department connections if department and person are selected
      const departmentDMO = selectedDMOs.find(dmo => dmo.id === 'department');
      
      if (personDMO && departmentDMO) {
        // Check if we already have a WorksIn edge
        const hasWorksInEdge = edges.some(edge => 
          edge.name === 'WorksIn' && 
          edge.fromNodeType === 'person' && 
          edge.toNodeType === 'department'
        );
        
        if (!hasWorksInEdge) {
          // Add a WorksIn edge
          setEdges(prev => [
            ...prev,
            {
              id: `auto-worksin-${Date.now()}`,
              name: 'WorksIn',
              fromNodeType: 'person',
              toNodeType: 'department',
              isBidirectional: false,
              attributes: [
                { id: `auto-attr-worksin-${Date.now()}-1`, name: 'position', type: 'string' }
              ]
            }
          ]);
        }
      }
    }
  }, [dmos]); // Only trigger when DMOs change

  // Helper functions
  const getDMOById = (id: string): DMO | undefined => {
    return dmos.find(dmo => dmo.id === id);
  };
  
  const getNodeName = (nodeId: string): string => {
    const dmo = getDMOById(nodeId);
    return dmo ? dmo.name : nodeId;
  };
  
  const getNodeIcon = (nodeId: string): React.ReactNode => {
    const dmo = getDMOById(nodeId);
    return dmo ? dmo.icon : null;
  };
  
  // Interactive Graph Visualization
  const renderGraph = () => {
    const selectedDMOs = dmos.filter(dmo => dmo.selected);
    const validEdges = edges.filter(edge => {
      const fromDMO = getDMOById(edge.fromNodeType);
      const toDMO = getDMOById(edge.toNodeType);
      return fromDMO?.selected && toDMO?.selected;
    });
    
    // Generate node positions in a circular layout
    const nodePositions: Record<string, { x: number, y: number }> = {};
    const centerX = 300;
    const centerY = 200;
    const radius = 150;
    
    selectedDMOs.forEach((dmo, index) => {
      const angle = (index / selectedDMOs.length) * 2 * Math.PI;
      nodePositions[dmo.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    return (
      <svg ref={svgRef} width="100%" height="400" viewBox="0 0 600 400" className="border rounded-lg">
        {/* Edge connections */}
        {validEdges.map(edge => {
          const fromPos = nodePositions[edge.fromNodeType];
          const toPos = nodePositions[edge.toNodeType];
          
          if (!fromPos || !toPos) return null;
          
          return (
            <g key={edge.id}>
              {/* Edge line */}
              <line 
                x1={fromPos.x} 
                y1={fromPos.y} 
                x2={toPos.x} 
                y2={toPos.y} 
                stroke={edge.isBidirectional ? "#8b5cf6" : "#3b82f6"} 
                strokeWidth="2" 
                markerEnd={edge.isBidirectional ? "" : "url(#arrowhead)"} 
                strokeDasharray={edge.isBidirectional ? "" : ""} 
              />
              
              {/* Edge label */}
              <text 
                x={(fromPos.x + toPos.x) / 2} 
                y={(fromPos.y + toPos.y) / 2 - 10} 
                textAnchor="middle" 
                fill="#4b5563" 
                fontSize="12" 
                fontWeight="medium"
                className="select-none"
              >
                {edge.name}
              </text>
              
              {/* Reverse arrow for bidirectional edges */}
              {edge.isBidirectional && (
                <line 
                  x1={toPos.x} 
                  y1={toPos.y} 
                  x2={fromPos.x} 
                  y2={fromPos.y} 
                  stroke="transparent" 
                  strokeWidth="2" 
                  markerEnd="url(#arrowhead)" 
                />
              )}
            </g>
          );
        })}
        
        {/* DMO nodes */}
        {selectedDMOs.map(dmo => {
          const pos = nodePositions[dmo.id];
          if (!pos) return null;
          
          return (
            <g key={dmo.id}>
              {/* Node circle */}
              <circle 
                cx={pos.x} 
                cy={pos.y} 
                r="35" 
                fill={dmo.required ? "#f0fdf4" : "#f9fafb"} 
                stroke={dmo.required ? "#10b981" : "#6b7280"} 
                strokeWidth="2" 
                className="cursor-pointer"
              />
              
              {/* Node icon */}
              <foreignObject x={pos.x - 15} y={pos.y - 15} width="30" height="30">
                <div className="flex items-center justify-center h-full">
                  {React.cloneElement(dmo.icon as React.ReactElement, { className: "h-6 w-6" })}
                </div>
              </foreignObject>
              
              {/* Node name */}
              <text 
                x={pos.x} 
                y={pos.y + 25} 
                textAnchor="middle" 
                fill="#374151" 
                fontSize="12" 
                fontWeight="medium"
                className="select-none"
              >
                {dmo.name}
              </text>
            </g>
          );
        })}
        
        {/* Arrow marker definition */}
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
      </svg>
    );
  };

  // Navigation handlers
  const handleNext = () => {
    navigate('/kg/analytics');
  };

  const handlePrevious = () => {
    navigate('/kg/template');
  };

  // DMO Selection Panel for the right side
  const DMOSelectionPanel = () => (
    <div className="space-y-6">
      <h2 className="text-md font-medium">Select EKG Data Model Objects</h2>
      <p className="text-sm text-gray-600 mb-4">
        Choose which entities to include in your enterprise knowledge graph.
      </p>
      
      <div className="space-y-4">
        {dmos.map(dmo => (
          <div key={dmo.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50">
            <Checkbox 
              id={dmo.id}
              checked={dmo.selected}
              onCheckedChange={() => handleDMOToggle(dmo.id)}
              disabled={dmo.required}
            />
            <div className="min-w-0 flex-1">
              <Label 
                htmlFor={dmo.id}
                className="font-medium flex items-center cursor-pointer"
              >
                <span className="mr-2">{dmo.icon}</span>
                {dmo.name}
                {dmo.required && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </Label>
              <p className="text-sm text-gray-600">{dmo.description}</p>
            </div>
          </div>
        ))}
        
        {showNewDMO ? (
          <div className="p-3 border rounded-md bg-gray-50">
            <div className="flex items-center space-x-2 mb-3">
              <Input
                placeholder="Enter EKG entity name"
                value={newDMOName}
                onChange={e => setNewDMOName(e.target.value)}
                className="flex-1"
              />
              <Button 
                size="sm"
                onClick={handleAddNewDMO}
                disabled={!newDMOName.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNewDMO(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowNewDMO(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom EKG Entity
          </Button>
        )}
      </div>
    </div>
  );

  // Edge Definitions Panel for the right side
  const EdgeDefinitionsPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">Edge Definitions</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setShowNewEdgeForm(true)}
                disabled={showNewEdgeForm || editingEdgeId !== null}
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Edge
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Define relationships between EKG entities</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Edge list */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {edges.map(edge => {
          // Only show edges where both nodes are selected
          const fromDMO = getDMOById(edge.fromNodeType);
          const toDMO = getDMOById(edge.toNodeType);
          
          if (!fromDMO?.selected || !toDMO?.selected) {
            return null;
          }
          
          return (
            <div 
              key={edge.id} 
              className={`p-3 border rounded-md ${
                editingEdgeId === edge.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
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
                          {dmos.filter(dmo => dmo.selected).map(dmo => (
                            <SelectItem key={dmo.id} value={dmo.id}>
                              <div className="flex items-center">
                                {dmo.icon}
                                <span className="ml-2 text-xs">{dmo.name}</span>
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
                          {dmos.filter(dmo => dmo.selected).map(dmo => (
                            <SelectItem key={dmo.id} value={dmo.id}>
                              <div className="flex items-center">
                                {dmo.icon}
                                <span className="ml-2 text-xs">{dmo.name}</span>
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
                  
                  {/* Show attributes if any */}
                  {edge.attributes.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                      <p className="text-gray-500 mb-1">Attributes:</p>
                      <ul className="space-y-1">
                        {edge.attributes.map(attr => (
                          <li key={attr.id} className="flex items-center justify-between">
                            <span>{attr.name} ({attr.type})</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttribute(edge.id, attr.id)}
                              className="h-5 w-5 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-gray-400" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add attribute form */}
                  <div className="mt-2 flex items-center space-x-1">
                    <Input
                      placeholder="Attribute name"
                      value={newAttribute.name}
                      onChange={e => setNewAttribute({...newAttribute, name: e.target.value})}
                      className="h-6 text-xs flex-1"
                    />
                    <Select
                      value={newAttribute.type}
                      onValueChange={value => setNewAttribute({...newAttribute, type: value as 'string' | 'number' | 'date' | 'boolean'})}
                    >
                      <SelectTrigger className="h-6 text-xs w-24">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddAttribute(edge.id)}
                      disabled={!newAttribute.name}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
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
                      {dmos.filter(dmo => dmo.selected).map(dmo => (
                        <SelectItem key={dmo.id} value={dmo.id}>
                          <div className="flex items-center">
                            {dmo.icon}
                            <span className="ml-2 text-xs">{dmo.name}</span>
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
                      {dmos.filter(dmo => dmo.selected).map(dmo => (
                        <SelectItem key={dmo.id} value={dmo.id}>
                          <div className="flex items-center">
                            {dmo.icon}
                            <span className="ml-2 text-xs">{dmo.name}</span>
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
                  onClick={() => { setShowNewEdgeForm(false); resetNewEdgeForm(); }}
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
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Right panel content with tabs for DMOs, Edges, and Analytics
  const rightPanelContent = (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="dmos" className="text-xs">
            EKG Entities
          </TabsTrigger>
          <TabsTrigger value="edges" className="text-xs">
            Relationships
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dmos" className="pt-4">
          <DMOSelectionPanel />
        </TabsContent>
        <TabsContent value="edges" className="pt-4">
          <EdgeDefinitionsPanel />
        </TabsContent>
        <TabsContent value="analytics" className="pt-4">
          <div className="space-y-4">
            <h2 className="text-md font-medium">Analytics Configuration</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure analytics to extract insights from your knowledge graph. 
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-3 w-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-xs font-medium">Who Knows Who</p>
                  <p className="text-xs text-gray-600">Analyzes relationships between people</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch id="wkw-toggle" checked={true} />
                    <Label htmlFor="wkw-toggle" className="text-xs">Enable</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-3 w-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-xs font-medium">Who Does What</p>
                  <p className="text-xs text-gray-600">Identifies expertise and activities</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch id="wdw-toggle" checked={true} />
                    <Label htmlFor="wdw-toggle" className="text-xs">Enable</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-3 w-3 rounded-full bg-purple-500"></div>
                <div>
                  <p className="text-xs font-medium">Centrality Analysis</p>
                  <p className="text-xs text-gray-600">Identifies key influencers and central nodes</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch id="centrality-toggle" />
                    <Label htmlFor="centrality-toggle" className="text-xs">Enable</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 h-3 w-3 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-xs font-medium">Community Detection</p>
                  <p className="text-xs text-gray-600">Discovers clusters of related entities</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch id="community-toggle" />
                    <Label htmlFor="community-toggle" className="text-xs">Enable</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/kg/analytics')}
                className="w-full"
              >
                Advanced Analytics Configuration
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <KnowledgeGraphLayout
      title="EKG Setup"
      rightPanelContent={rightPanelContent}
      currentStep={2}
      totalSteps={5}  // Updated since we're removing the Edge Configuration page
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="w-full">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Enterprise Knowledge Graph Structure</h2>
            <p className="text-gray-600 mb-6">
              This visualization shows your EKG structure with entities and relationships.
              <span className="block mt-1 text-sm text-blue-600">
                <HelpCircle className="h-3 w-3 inline mr-1" />
                Entities are automatically connected based on their relationships.
              </span>
            </p>
            {renderGraph()}
          </CardContent>
        </Card>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default EKGSetup;