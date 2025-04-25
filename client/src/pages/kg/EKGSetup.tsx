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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Network, 
  BarChart3,
  PieChart,
  LineChart,
  Search, 
  Clock, 
  Zap, 
  List, 
  Settings,
  Eye,
  Lightbulb,
  UserCog,
  Workflow,
  Layers,
  GripVertical,
  PlusSquare,
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
  HelpCircle,
  Users
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dmos' | 'edges' | 'analytics')} className="w-full">
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Advanced Analytics Configuration
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Analytics Configuration</DialogTitle>
                    <DialogDescription>
                      Configure your Enterprise Knowledge Graph analytics workflow with drag and drop components.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Full Analytics Configuration from AnalyticsConfig.tsx */}
                  <AnalyticsConfigModal />
                  
                  <DialogFooter className="mt-4">
                    <Button type="submit">Apply Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

// Analytics Config Modal Component
// This implements the relevant parts of AnalyticsConfig.tsx in a modal dialog
interface AnalyticsComponent {
  id: string;
  type: 'entity' | 'relationship' | 'algorithm' | 'visualization';
  name: string;
  description: string;
  icon: React.ReactNode;
  category?: string;
  compatibleWith?: string[];
  parameters?: Record<string, any>;
}

interface EntityType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface RelationshipType {
  id: string;
  name: string;
  sourceEntityType: string;
  targetEntityType: string;
  properties: {
    id: string;
    name: string;
    type: 'number' | 'string' | 'boolean' | 'date';
  }[];
}

interface VisualizationOption {
  id: string;
  name: string;
  type: 'network' | 'matrix' | 'heatmap' | 'bar' | 'line' | 'pie';
  icon: React.ReactNode;
  description: string;
}

// Define Sortable Item component
const SortableItem = ({ id, children, handle = true }: { id: string, children: React.ReactNode, handle?: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className={`mb-4 ${isDragging ? 'z-50' : ''}`}>
      {handle ? (
        <div className="flex">
          <div 
            className="cursor-grab p-2 flex items-center justify-center text-gray-400 hover:text-gray-600" 
            {...attributes} 
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      ) : (
        <div {...attributes} {...listeners}>
          {children}
        </div>
      )}
    </div>
  );
};

// Component Library Item
const ComponentLibraryItem = ({ 
  component, 
  onAddToPipeline 
}: { 
  component: AnalyticsComponent, 
  onAddToPipeline: (component: AnalyticsComponent) => void 
}) => {
  return (
    <div 
      className="border rounded-md p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onAddToPipeline(component)}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-md">
          {component.icon}
        </div>
        <div>
          <h4 className="text-sm font-medium">{component.name}</h4>
          <p className="text-xs text-gray-500">{component.description}</p>
        </div>
        <div className="ml-auto">
          <PlusSquare className="h-5 w-5 text-gray-400 hover:text-blue-500" />
        </div>
      </div>
    </div>
  );
};

// Pipeline Component Item
const PipelineComponentItem = ({ 
  component, 
  onRemove, 
  isActive, 
  onToggleActive 
}: { 
  component: AnalyticsComponent & { active: boolean }, 
  onRemove: () => void, 
  isActive: boolean, 
  onToggleActive: () => void 
}) => {
  return (
    <div className={`border rounded-md p-3 ${isActive ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-md ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {component.icon}
          </div>
          <div>
            <h4 className="text-sm font-medium">{component.name}</h4>
            <p className="text-xs text-gray-500">{component.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActive}
            onCheckedChange={onToggleActive}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AnalyticsConfigModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('builder');
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  // Entity types
  const [entityTypes] = useState<EntityType[]>([
    { id: 'person', name: 'Person', icon: <Users className="h-4 w-4 text-blue-500" /> },
    { id: 'document', name: 'Document', icon: <FileText className="h-4 w-4 text-gray-500" /> },
    { id: 'project', name: 'Project', icon: <Briefcase className="h-4 w-4 text-amber-500" /> },
  ]);
  
  // Relationship types
  const [relationships] = useState<RelationshipType[]>([
    { 
      id: 'collaborates', 
      name: 'Collaborates With', 
      sourceEntityType: 'person',
      targetEntityType: 'person',
      properties: [
        { id: 'frequency', name: 'Frequency', type: 'number' },
        { id: 'last_interaction', name: 'Last Interaction', type: 'date' },
        { id: 'strength', name: 'Relationship Strength', type: 'number' }
      ]
    },
    { 
      id: 'knows', 
      name: 'Knows', 
      sourceEntityType: 'person',
      targetEntityType: 'person',
      properties: [
        { id: 'duration', name: 'Duration (years)', type: 'number' },
        { id: 'context', name: 'Context', type: 'string' }
      ]
    },
    { 
      id: 'created', 
      name: 'Created', 
      sourceEntityType: 'person',
      targetEntityType: 'document',
      properties: [
        { id: 'date', name: 'Creation Date', type: 'date' },
        { id: 'role', name: 'Creation Role', type: 'string' }
      ]
    },
    { 
      id: 'works_on', 
      name: 'Works On', 
      sourceEntityType: 'person',
      targetEntityType: 'project',
      properties: [
        { id: 'role', name: 'Role', type: 'string' },
        { id: 'contribution', name: 'Contribution Level', type: 'number' },
        { id: 'start_date', name: 'Start Date', type: 'date' }
      ]
    }
  ]);
  
  // Visualization options
  const [visualizationOptions] = useState<VisualizationOption[]>([
    { 
      id: 'network', 
      name: 'Network Diagram', 
      type: 'network', 
      icon: <Network className="h-4 w-4" />,
      description: 'Shows entities as nodes and relationships as connections'
    },
    { 
      id: 'heatmap', 
      name: 'Heatmap', 
      type: 'heatmap', 
      icon: <PieChart className="h-4 w-4" />,
      description: 'Visualizes relationship intensity using color gradients'
    },
    { 
      id: 'matrix', 
      name: 'Relationship Matrix', 
      type: 'matrix', 
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Displays relationships between entities in a grid format'
    }
  ]);
  
  // Component library
  const [componentLibrary] = useState<AnalyticsComponent[]>([
    // Entity types
    {
      id: 'entity-person',
      type: 'entity',
      name: 'Person Entity',
      description: 'Users, employees, and individuals',
      icon: <Users className="h-4 w-4 text-blue-500" />,
      category: 'entity'
    },
    {
      id: 'entity-document',
      type: 'entity',
      name: 'Document Entity',
      description: 'Files, articles, and documents',
      icon: <FileText className="h-4 w-4 text-gray-500" />,
      category: 'entity'
    },
    {
      id: 'entity-project',
      type: 'entity',
      name: 'Project Entity',
      description: 'Work items and projects',
      icon: <Briefcase className="h-4 w-4 text-amber-500" />,
      category: 'entity'
    },
    
    // Relationships
    {
      id: 'rel-collaborates',
      type: 'relationship',
      name: 'Collaborates With',
      description: 'Person-to-person collaboration',
      icon: <Network className="h-4 w-4 text-purple-500" />,
      category: 'relationship',
      compatibleWith: ['entity-person'],
      parameters: {
        weight: 0.8,
        timeDecay: true
      }
    },
    {
      id: 'rel-knows',
      type: 'relationship',
      name: 'Knows',
      description: 'Person-to-person knowledge relationship',
      icon: <Network className="h-4 w-4 text-indigo-500" />,
      category: 'relationship',
      compatibleWith: ['entity-person'],
      parameters: {
        weight: 0.6,
        timeDecay: false
      }
    },
    {
      id: 'rel-created',
      type: 'relationship',
      name: 'Created',
      description: 'Person-to-document creation action',
      icon: <ArrowRight className="h-4 w-4 text-green-500" />,
      category: 'relationship',
      compatibleWith: ['entity-person', 'entity-document'],
      parameters: {
        weight: 0.9,
        timeDecay: true
      }
    },
    
    // Algorithms
    {
      id: 'algo-betweenness',
      type: 'algorithm',
      name: 'Betweenness Centrality',
      description: 'Identifies bridge nodes in the network',
      icon: <Network className="h-4 w-4 text-blue-500" />,
      category: 'algorithm',
      parameters: {
        normalization: true,
        directed: false
      }
    },
    {
      id: 'algo-pagerank',
      type: 'algorithm',
      name: 'PageRank',
      description: 'Identifies influential nodes',
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      category: 'algorithm',
      parameters: {
        dampingFactor: 0.85,
        iterations: 100
      }
    },
    
    // Visualizations
    {
      id: 'vis-network',
      type: 'visualization',
      name: 'Network Diagram',
      description: 'Visualize entities and relationships as a graph',
      icon: <Network className="h-4 w-4 text-gray-500" />,
      category: 'visualization',
      parameters: {
        layout: 'force-directed',
        nodeSize: 'degree'
      }
    },
    {
      id: 'vis-heatmap',
      type: 'visualization',
      name: 'Heatmap',
      description: 'Color intensity represents relationship strength',
      icon: <PieChart className="h-4 w-4 text-red-500" />,
      category: 'visualization',
      parameters: {
        colorScheme: 'blue-to-red',
        normalize: true
      }
    }
  ]);
  
  // Analytics pipeline - using type assertion to handle the issues
  const [analyticsPipeline, setAnalyticsPipeline] = useState<(AnalyticsComponent & { active: boolean, id: string })[]>([
    // Pre-configured "Who Knows Who" analytics components
    {
      ...(componentLibrary.find(c => c.id === 'entity-person') as AnalyticsComponent),
      id: 'pipeline-person-1',
      active: true
    },
    {
      ...(componentLibrary.find(c => c.id === 'rel-collaborates') as AnalyticsComponent),
      id: 'pipeline-collaborates',
      active: true
    },
    {
      ...(componentLibrary.find(c => c.id === 'rel-knows') as AnalyticsComponent),
      id: 'pipeline-knows',
      active: true
    },
    {
      ...(componentLibrary.find(c => c.id === 'algo-pagerank') as AnalyticsComponent),
      id: 'pipeline-pagerank',
      active: true
    },
    {
      ...(componentLibrary.find(c => c.id === 'vis-network') as AnalyticsComponent),
      id: 'pipeline-network-1',
      active: true
    }
  ]);
  
  // State for active componentId
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [componentFilter, setComponentFilter] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    entity: true,
    relationship: true,
    algorithm: true,
    visualization: true
  });
  
  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveComponentId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setAnalyticsPipeline((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveComponentId(null);
  };
  
  const handleAddComponent = (component: AnalyticsComponent) => {
    const newId = `pipeline-${component.id}-${Date.now()}`;
    
    setAnalyticsPipeline(prev => [
      ...prev,
      {
        ...component,
        id: newId,
        active: true
      }
    ]);
  };
  
  const handleRemoveComponent = (id: string) => {
    setAnalyticsPipeline(prev => prev.filter(item => item.id !== id));
  };
  
  const handleToggleComponentActive = (id: string) => {
    setAnalyticsPipeline(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, active: !item.active } 
          : item
      )
    );
  };
  
  const handleToggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render analytics preview
  const renderAnalyticsPreview = () => {
    // Check if we have at least one visualization component
    const hasVisualization = analyticsPipeline.some(
      item => item.type === 'visualization' && item.active
    );
    
    if (!hasVisualization) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Eye className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium mb-2">No Visualization Selected</p>
          <p className="text-gray-400 text-sm">
            Add a visualization component to your pipeline to see a preview
          </p>
        </div>
      );
    }
    
    // Default visualization - Force-directed graph for "Who Knows Who" analytics
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-4xl">
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Settings className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Settings</span>
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Eye className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">View</span>
            </Button>
          </div>
          
          <svg width="100%" height="360" viewBox="0 0 800 360">
            {/* Network sample visualization */}
            <g transform="translate(400, 180)">
              {/* Nodes */}
              <circle cx="0" cy="0" r="20" fill="#3b82f6" opacity="0.8" />
              <circle cx="-100" cy="-80" r="15" fill="#3b82f6" opacity="0.8" />
              <circle cx="120" cy="-60" r="15" fill="#3b82f6" opacity="0.8" />
              <circle cx="80" cy="100" r="15" fill="#3b82f6" opacity="0.8" />
              <circle cx="-90" cy="90" r="15" fill="#3b82f6" opacity="0.8" />
              <circle cx="-150" cy="0" r="15" fill="#3b82f6" opacity="0.8" />
              <circle cx="200" cy="20" r="15" fill="#3b82f6" opacity="0.8" />
              
              {/* Labels */}
              <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10">Person 1</text>
              <text x="-100" y="-80" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">Person 2</text>
              <text x="120" y="-60" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">Person 3</text>
              <text x="80" y="100" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">Person 4</text>
              <text x="-90" y="90" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">Person 5</text>
              <text x="-150" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">Person 6</text>
              <text x="200" y="20" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">Person 7</text>
              
              {/* Edges */}
              <line x1="0" y1="0" x2="-100" y2="-80" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="0" x2="120" y2="-60" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="0" x2="80" y2="100" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="0" x2="-90" y2="90" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="0" x2="-150" y2="0" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="0" x2="200" y2="20" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="-100" y1="-80" x2="120" y2="-60" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="120" y1="-60" x2="200" y2="20" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="80" y1="100" x2="-90" y2="90" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
              <line x1="-90" y1="90" x2="-150" y2="0" stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
            </g>
          </svg>
        </div>
      </div>
    );
  };
  
  // Filtered component library
  const filteredComponents = componentFilter
    ? componentLibrary.filter(component => 
        component.name.toLowerCase().includes(componentFilter.toLowerCase()) ||
        component.description.toLowerCase().includes(componentFilter.toLowerCase()) ||
        component.type.toLowerCase().includes(componentFilter.toLowerCase())
      )
    : componentLibrary;

  // Main render function
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder" className="pt-4">
          <div className="space-y-6">
            {/* Analytics Preview Playground - Center Stage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analytics Visualization Playground</CardTitle>
                <CardDescription>
                  Interactive preview of your analytics configuration
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-gray-50 rounded-md p-6 min-h-[400px]">
                  {renderAnalyticsPreview()}
                </div>
              </CardContent>
            </Card>
            
            {/* Builder Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Component Library */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Component Library</CardTitle>
                    <CardDescription>
                      Drag components to build your pipeline
                    </CardDescription>
                    <div className="relative mt-2">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search components..."
                        className="pl-8"
                        value={componentFilter || ''}
                        onChange={(e) => setComponentFilter(e.target.value || null)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                    <div className="space-y-4">
                      {/* Entity Components */}
                      <div>
                        <div 
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={() => handleToggleSection('entity')}
                        >
                          <h3 className="text-sm font-medium">Entity Components</h3>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {expandedSections.entity ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {expandedSections.entity && (
                          <div className="space-y-2">
                            {filteredComponents
                              .filter(component => component.type === 'entity')
                              .map(component => (
                                <ComponentLibraryItem
                                  key={component.id}
                                  component={component}
                                  onAddToPipeline={handleAddComponent}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Relationship Components */}
                      <div>
                        <div 
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={() => handleToggleSection('relationship')}
                        >
                          <h3 className="text-sm font-medium">Relationship Components</h3>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {expandedSections.relationship ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {expandedSections.relationship && (
                          <div className="space-y-2">
                            {filteredComponents
                              .filter(component => component.type === 'relationship')
                              .map(component => (
                                <ComponentLibraryItem
                                  key={component.id}
                                  component={component}
                                  onAddToPipeline={handleAddComponent}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Algorithm Components */}
                      <div>
                        <div 
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={() => handleToggleSection('algorithm')}
                        >
                          <h3 className="text-sm font-medium">Algorithm Components</h3>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {expandedSections.algorithm ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {expandedSections.algorithm && (
                          <div className="space-y-2">
                            {filteredComponents
                              .filter(component => component.type === 'algorithm')
                              .map(component => (
                                <ComponentLibraryItem
                                  key={component.id}
                                  component={component}
                                  onAddToPipeline={handleAddComponent}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Visualization Components */}
                      <div>
                        <div 
                          className="flex items-center justify-between cursor-pointer mb-2"
                          onClick={() => handleToggleSection('visualization')}
                        >
                          <h3 className="text-sm font-medium">Visualization Components</h3>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {expandedSections.visualization ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {expandedSections.visualization && (
                          <div className="space-y-2">
                            {filteredComponents
                              .filter(component => component.type === 'visualization')
                              .map(component => (
                                <ComponentLibraryItem
                                  key={component.id}
                                  component={component}
                                  onAddToPipeline={handleAddComponent}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Analytics Pipeline */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Analytics Pipeline</CardTitle>
                    <CardDescription>
                      Configure your analytics workflow
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={analyticsPipeline.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {analyticsPipeline.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center">
                              <Layers className="h-16 w-16 text-gray-200 mb-4" />
                              <p className="text-gray-400 mb-2">Drag and drop components here</p>
                              <p className="text-gray-300 text-sm">Build your analytics pipeline by adding components from the library</p>
                            </div>
                          ) : (
                            <div>
                              {/* "Who Knows Who" section */}
                              <div className="mb-4">
                                <div className="flex items-center mb-2">
                                  <Badge className="mr-2">Default</Badge>
                                  <h3 className="font-medium">Who Knows Who</h3>
                                </div>
                                {analyticsPipeline
                                  .slice(0, 5)
                                  .map(component => (
                                    <SortableItem key={component.id} id={component.id}>
                                      <PipelineComponentItem
                                        component={component}
                                        onRemove={() => handleRemoveComponent(component.id)}
                                        isActive={component.active}
                                        onToggleActive={() => handleToggleComponentActive(component.id)}
                                      />
                                    </SortableItem>
                                  ))}
                              </div>
                              
                              {/* Custom components */}
                              {analyticsPipeline.length > 5 && (
                                <div>
                                  <div className="flex items-center mb-2">
                                    <Badge variant="outline" className="mr-2">Custom</Badge>
                                    <h3 className="font-medium">Custom Analytics</h3>
                                  </div>
                                  {analyticsPipeline
                                    .slice(5)
                                    .map(component => (
                                      <SortableItem key={component.id} id={component.id}>
                                        <PipelineComponentItem
                                          component={component}
                                          onRemove={() => handleRemoveComponent(component.id)}
                                          isActive={component.active}
                                          onToggleActive={() => handleToggleComponentActive(component.id)}
                                        />
                                      </SortableItem>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Drag overlay */}
                          <DragOverlay>
                            {activeComponentId ? (
                              <div className="border rounded-md p-3 bg-blue-50 border-blue-200 shadow-md">
                                {analyticsPipeline.find(item => item.id === activeComponentId)?.name}
                              </div>
                            ) : null}
                          </DragOverlay>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="ml-auto">
                      Save Configuration
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Advanced Configuration</CardTitle>
                <CardDescription>
                  Fine-tune analytics parameters and settings
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Advanced settings options */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Who Knows Who Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency-weight">Interaction Frequency Weight</Label>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>0.6</span>
                          <span>1.0</span>
                        </div>
                        <Slider
                          id="frequency-weight"
                          defaultValue={[0.6]}
                          max={1}
                          step={0.1}
                          className="py-1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="time-decay">Time Decay Factor</Label>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>0.3</span>
                          <span>1.0</span>
                        </div>
                        <Slider
                          id="time-decay"
                          defaultValue={[0.3]}
                          max={1}
                          step={0.1}
                          className="py-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="relationship-threshold">Minimum Relationship Strength</Label>
                        <Select defaultValue="0.3">
                          <SelectTrigger id="relationship-threshold">
                            <SelectValue placeholder="Select threshold" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.1">0.1 (Very Low)</SelectItem>
                            <SelectItem value="0.2">0.2 (Low)</SelectItem>
                            <SelectItem value="0.3">0.3 (Medium)</SelectItem>
                            <SelectItem value="0.5">0.5 (High)</SelectItem>
                            <SelectItem value="0.7">0.7 (Very High)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="normalize-weight" defaultChecked />
                        <Label htmlFor="normalize-weight">Normalize Relationship Weights</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-outliers" />
                        <Label htmlFor="filter-outliers">Filter Outlier Connections</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="pt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analytics Settings</CardTitle>
                <CardDescription>
                  Configure general analytics settings
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="analytics-name">Analytics Configuration Name</Label>
                    <Input id="analytics-name" defaultValue="EKG Analytics" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-refresh">Auto-Refresh Interval</Label>
                    <Select defaultValue="3600">
                      <SelectTrigger id="auto-refresh">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Manual refresh only</SelectItem>
                        <SelectItem value="300">Every 5 minutes</SelectItem>
                        <SelectItem value="900">Every 15 minutes</SelectItem>
                        <SelectItem value="1800">Every 30 minutes</SelectItem>
                        <SelectItem value="3600">Every hour</SelectItem>
                        <SelectItem value="86400">Every day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="block mb-1">Data Scope</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="scope-documents" defaultChecked />
                        <Label htmlFor="scope-documents">Include Documents</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="scope-people" defaultChecked />
                        <Label htmlFor="scope-people">Include People</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="scope-projects" defaultChecked />
                        <Label htmlFor="scope-projects">Include Projects</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="scope-departments" />
                        <Label htmlFor="scope-departments">Include Departments</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EKGSetup;