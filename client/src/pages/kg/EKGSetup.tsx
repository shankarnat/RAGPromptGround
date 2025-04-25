import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Download,
  ChevronUp,
  Database,
  ShoppingCart,
  Briefcase,
  Building,
  Truck,
  MapPin,
  HelpCircle,
  Users,
  AlertCircle,
  Key,
  Text,
  Hash,
  Type,
  Trash
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

// Field interface for Source-to-EKG mapping
interface Field {
  id: string;
  name: string;
  type: 'id' | 'string' | 'number' | 'date' | 'boolean';
  description: string;
  isPrimaryKey?: boolean;
  isRequired?: boolean;
}

// Data Model Object interface for Source-to-EKG mapping
interface DataModelObject {
  id: string;
  name: string;
  fields: Field[];
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

// No duplicates needed

// Combined EKG Setup Component (DMO Selection + Edge Configuration)
const EKGSetup: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'dmos' | 'edges' | 'analytics' | 'mapping'>('dmos');
  const [visualizationView, setVisualizationView] = useState<'visualization' | 'playground'>('visualization');
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Modal state for Source-to-EKG mapping
  const [showMappingModal, setShowMappingModal] = useState(false);
  
  // Source-to-EKG mapping state
  const [searchSourceTerm, setSearchSourceTerm] = useState('');
  const [searchEkgTerm, setSearchEkgTerm] = useState(''); 
  const [collapsedSourceSections, setCollapsedSourceSections] = useState<string[]>([]);
  const [collapsedEkgSections, setCollapsedEkgSections] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState<[string, string] | null>(null);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  
  // Helper function to remove a mapping
  const removeMapping = (sourceId: string) => {
    const newMappedFields = { ...mappedFields };
    delete newMappedFields[sourceId];
    setMappedFields(newMappedFields);
  };
  
  // Helper function to add a new mapping
  const addMapping = (sourceId: string, targetId: string) => {
    setMappedFields(prev => ({
      ...prev,
      [sourceId]: targetId
    }));
  };
  
  // Helper function to get icon for data type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'id':
        return <Tag className="h-3 w-3 text-blue-500" />;
      case 'string':
        return <MessageSquare className="h-3 w-3 text-green-500" />;
      case 'number':
        return <BarChart3 className="h-3 w-3 text-amber-500" />;
      case 'date':
        return <Calendar className="h-3 w-3 text-purple-500" />;
      case 'boolean':
        return <Check className="h-3 w-3 text-red-500" />;
      default:
        return <FileText className="h-3 w-3 text-gray-500" />;
    }
  };
  
  // Check if a DMO has any fields mapped to it
  const isDMOMapped = (dmoId: string) => {
    return Object.values(mappedFields).some(targetId => {
      for (const dmo of ekgDMOs) {
        const field = dmo.fields.find(f => f.id === targetId);
        if (field && dmo.id === dmoId) {
          return true;
        }
      }
      return false;
    });
  };
  
  // Source DMOs for mapping
  const [sourceDMOs, setSourceDMOs] = useState<DataModelObject[]>([
    {
      id: 'file',
      name: 'File',
      fields: [
        { id: 'file_id', name: 'file_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'file_name', name: 'file_name', type: 'string', description: 'Name of the file', isRequired: true },
        { id: 'file_path', name: 'file_path', type: 'string', description: 'File path' },
        { id: 'created_at', name: 'created_at', type: 'date', description: 'Creation timestamp' },
        { id: 'modified_at', name: 'modified_at', type: 'date', description: 'Last modified timestamp' },
        { id: 'size', name: 'size', type: 'number', description: 'File size in bytes' },
        { id: 'mime_type', name: 'mime_type', type: 'string', description: 'MIME type' },
        { id: 'creator_id', name: 'creator_id', type: 'id', description: 'Creator reference' },
      ]
    },
    {
      id: 'user',
      name: 'User',
      fields: [
        { id: 'user_id', name: 'user_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'email', name: 'email', type: 'string', description: 'Email address', isRequired: true },
        { id: 'name', name: 'name', type: 'string', description: 'Full name', isRequired: true },
        { id: 'department', name: 'department', type: 'string', description: 'Department name' },
        { id: 'role', name: 'role', type: 'string', description: 'Job role or title' },
        { id: 'joined_at', name: 'joined_at', type: 'date', description: 'Join date' }
      ]
    }
  ]);
  
  // EKG DMOs for mapping
  const [ekgDMOs, setEkgDMOs] = useState<DataModelObject[]>([
    {
      id: 'document',
      name: 'Document',
      fields: [
        { id: 'content_id', name: 'content_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'title', name: 'title', type: 'string', description: 'Content title', isRequired: true },
        { id: 'path', name: 'path', type: 'string', description: 'Content location' },
        { id: 'created_date', name: 'created_date', type: 'date', description: 'Creation date' },
        { id: 'modified_date', name: 'modified_date', type: 'date', description: 'Modification date' },
        { id: 'size_bytes', name: 'size_bytes', type: 'number', description: 'Content size' },
        { id: 'type', name: 'type', type: 'string', description: 'Content type' },
        { id: 'creator', name: 'creator', type: 'id', description: 'Creator reference' },
      ]
    },
    {
      id: 'person',
      name: 'Person',
      fields: [
        { id: 'user_id', name: 'user_id', type: 'id', description: 'Unique identifier', isPrimaryKey: true, isRequired: true },
        { id: 'email_address', name: 'email_address', type: 'string', description: 'Email', isRequired: true },
        { id: 'display_name', name: 'display_name', type: 'string', description: 'Display name', isRequired: true },
        { id: 'org_unit', name: 'org_unit', type: 'string', description: 'Organizational unit' },
        { id: 'user_type', name: 'user_type', type: 'string', description: 'Type of user' },
        { id: 'start_date', name: 'start_date', type: 'date', description: 'Start date' }
      ]
    }
  ]);
  
  // State for DMO Selection
  const [showNewDMO, setShowNewDMO] = useState(false);
  const [newDMOName, setNewDMOName] = useState('');
  
  // Analytics enabled state
  const [enabledAnalytics, setEnabledAnalytics] = useState({
    whoKnowsWho: true,
    whoDoesWhat: true,
    centralityAnalysis: false,
    communityDetection: false
  });
  
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
  
  // Helper function to determine if an edge is part of an analytics view
  const isAnalyticsEdge = (edge: Edge): boolean => {
    // Person-to-person relationships are part of Who Knows Who
    if (edge.fromNodeType === 'person' && edge.toNodeType === 'person') {
      return true;
    }
    
    // Person-to-project or Person-to-document relationships are part of Who Does What
    if ((edge.fromNodeType === 'person' && edge.toNodeType === 'project') || 
        (edge.fromNodeType === 'person' && edge.toNodeType === 'document')) {
      return true;
    }
    
    return false;
  };
  
  // Helper function to get the appropriate stroke color for an edge
  const getStrokeColor = (edge: any): string => {
    // Check if this is a mapping edge between source DMO and EKG entity
    if (edge.isMappingEdge) {
      return "#06b6d4"; // Teal/cyan color for mapping connections
    }
    
    // All analytics edges get green color
    if (isAnalyticsEdge(edge)) {
      return "#4caf50"; // Green for all analytics edges
    }
    
    // Regular relationship edges
    return edge.isBidirectional ? "#8b5cf6" : "#3b82f6";
  };
  
  // Helper function to get the appropriate marker end for an edge
  const getMarkerEnd = (edge: any): string => {
    if (edge.isBidirectional) {
      return ""; // No arrowhead for bidirectional edges (we use a separate line)
    }
    
    // Mapping edges get teal arrowheads
    if (edge.isMappingEdge) {
      return "url(#arrowhead-teal)"; // Teal for mapping edges
    }
    
    // All analytics edges get green arrowheads
    if (isAnalyticsEdge(edge)) {
      return "url(#arrowhead-green)"; // Green for all analytics edges
    }
    
    // Regular relationship edges
    return "url(#arrowhead)";
  };
  
  // Helper function to get the stroke dash array for an edge
  const getStrokeDashArray = (edge: any): string => {
    // Mapping edges get a different dash pattern
    if (edge.isMappingEdge) {
      return "4 2"; // Dashed line for mapping connections
    }
    
    // Make analytics edges dashed to distinguish them
    if (isAnalyticsEdge(edge)) {
      return "4 2"; // Dashed line for analytics
    }
    
    // Regular relationship edges are solid
    return "";
  };
  
  // Source-to-EKG mapping helper functions
  const toggleSourceSection = (dmoId: string) => {
    setCollapsedSourceSections(prev => 
      prev.includes(dmoId) 
        ? prev.filter(id => id !== dmoId) 
        : [...prev, dmoId]
    );
  };
  
  const toggleEkgSection = (dmoId: string) => {
    setCollapsedEkgSections(prev => 
      prev.includes(dmoId) 
        ? prev.filter(id => id !== dmoId) 
        : [...prev, dmoId]
    );
  };

  const createMapping = (sourceFieldId: string, ekgFieldId: string) => {
    setMappedFields(prev => ({
      ...prev,
      [sourceFieldId]: ekgFieldId
    }));
  };
  
  const filterFields = (fields: Field[], searchTerm: string) => {
    if (!searchTerm) return fields;
    return fields.filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const getMappedFieldCount = (dmoId: string, fields: Field[]) => {
    if (dmoId === 'document' || dmoId === 'person') {
      // For EKG DMOs, count how many fields are targets of mappings
      const mappedValues = Object.values(mappedFields);
      return fields.filter(field => mappedValues.includes(field.id)).length;
    } else {
      // For source DMOs, count how many fields are keys in mappings
      return fields.filter(field => field.id in mappedFields).length;
    }
  };
  
  // Function is already defined earlier

  // Helper function to check if a DMO has mappings
  const hasMappings = (dmoId: string): boolean => {
    // Check if it's an EKG DMO (document/person)
    if (dmoId === 'document' || dmoId === 'person') {
      // Get all the fields for this DMO
      const dmoObj = ekgDMOs.find(dmo => dmo.id === dmoId);
      if (!dmoObj) return false;
      
      // Check if any field is used as a target in mappings
      const mappedValues = Object.values(mappedFields);
      return dmoObj.fields.some(field => mappedValues.includes(field.id));
    } 
    // Check if it's a source DMO (file/user)
    else if (dmoId === 'file' || dmoId === 'user') {
      // Get all the fields for this DMO
      const dmoObj = sourceDMOs.find(dmo => dmo.id === dmoId);
      if (!dmoObj) return false;
      
      // Check if any field is used as a key in mappings
      return dmoObj.fields.some(field => field.id in mappedFields);
    }
    
    return false;
  };
  
  // Interactive Graph Visualization
  const renderGraph = () => {
    // Get selected EKG DMOs
    const selectedDMOs = dmos.filter(dmo => dmo.selected);
    
    // Create an array to track all nodes to display (EKG DMOs + mapped source DMOs)
    const allNodesToDisplay: Array<{
      id: string;
      name: string;
      icon: React.ReactNode;
      isSource?: boolean;
      mappedToId?: string; // For source DMOs, indicates which EKG DMO they map to
    }> = [...selectedDMOs.map(dmo => ({
      id: dmo.id,
      name: dmo.name,
      icon: dmo.icon,
      isSource: false
    }))];
    
    // Custom edges for source-to-EKG mappings
    const mappingEdges: Array<{
      id: string;
      from: string;
      to: string;
      label: string;
      isMappingEdge: boolean;
    }> = [];
    
    // Check which source DMOs have mappings to EKG entities
    const sourceMappings = new Map<string, Set<string>>();
    
    // Process all field mappings to find which source DMOs map to which EKG DMOs
    for (const [sourceFieldId, targetFieldId] of Object.entries(mappedFields)) {
      // Find which source DMO this field belongs to
      let sourceDmoId: string | null = null;
      let targetDmoId: string | null = null;
      
      // Find source DMO ID
      for (const dmo of sourceDMOs) {
        if (dmo.fields.some(f => f.id === sourceFieldId)) {
          sourceDmoId = dmo.id;
          break;
        }
      }
      
      // Find target EKG DMO ID
      for (const dmo of ekgDMOs) {
        if (dmo.fields.some(f => f.id === targetFieldId)) {
          targetDmoId = dmo.id;
          break;
        }
      }
      
      if (sourceDmoId && targetDmoId) {
        // Add to our mapping tracking
        if (!sourceMappings.has(sourceDmoId)) {
          sourceMappings.set(sourceDmoId, new Set());
        }
        sourceMappings.get(sourceDmoId)!.add(targetDmoId);
      }
    }
    
    // Add source DMOs to visualization if they have mappings
    sourceMappings.forEach((targetDmoIds, sourceDmoId) => {
      const sourceDmo = sourceDMOs.find(dmo => dmo.id === sourceDmoId);
      if (sourceDmo) {
        // Add source DMO to nodes list
        allNodesToDisplay.push({
          id: `source_${sourceDmo.id}`,
          name: sourceDmo.name,
          icon: sourceDmo.id === 'file' ? <FileText className="h-6 w-6 text-blue-500" /> : <User className="h-6 w-6 text-green-500" />,
          isSource: true
        });
        
        // Add edges for each mapping
        targetDmoIds.forEach(targetDmoId => {
          // Only add edge if target DMO is in the selected list
          if (selectedDMOs.some(dmo => dmo.id === targetDmoId)) {
            mappingEdges.push({
              id: `mapping_${sourceDmo.id}_to_${targetDmoId}`,
              from: `source_${sourceDmo.id}`,
              to: targetDmoId,
              label: "Mapped To",
              isMappingEdge: true
            });
          }
        });
      }
    });
    
    // Highlight mapped DMOs
    const getMappedStatus = (dmoId: string): { isMapped: boolean, mappedToId: string | null } => {
      const isMapped = hasMappings(dmoId);
      
      // For source DMOs that start with "source_", extract the real ID
      if (dmoId.startsWith('source_')) {
        const realId = dmoId.substring(7); // Remove "source_" prefix
        
        // Find which EKG DMO this source DMO maps to
        if (sourceMappings.has(realId)) {
          // Just pick the first one for coloring purposes
          const targetDmoIds = Array.from(sourceMappings.get(realId)!);
          if (targetDmoIds.length > 0) {
            return { isMapped: true, mappedToId: targetDmoIds[0] };
          }
        }
        return { isMapped: false, mappedToId: null };
      }
      
      // For EKG DMOs (document/person, etc.), check if any source DMO maps to them
      const mappedFromSourceDmo = Array.from(sourceMappings.entries())
        .find(([_, targetSet]) => targetSet.has(dmoId));
      
      if (mappedFromSourceDmo) {
        return { isMapped: true, mappedToId: `source_${mappedFromSourceDmo[0]}` };
      }
      
      return { isMapped: false, mappedToId: null };
    };
    
    // Filter edges based on enabled analytics
    const filteredEdges = edges.filter(edge => {
      const fromDMO = getDMOById(edge.fromNodeType);
      const toDMO = getDMOById(edge.toNodeType);
      
      // Basic edge filtering - both nodes must be selected
      const basicFilter = fromDMO?.selected && toDMO?.selected;
      if (!basicFilter) return false;
      
      // Analytics-based filtering
      if (edge.fromNodeType === 'person' && edge.toNodeType === 'person') {
        // Person-to-person relationships (Who Knows Who analytics)
        return enabledAnalytics.whoKnowsWho;
      }
      
      if ((edge.fromNodeType === 'person' && edge.toNodeType === 'project') || 
          (edge.fromNodeType === 'person' && edge.toNodeType === 'document')) {
        // Person-to-project or Person-to-document relationships (Who Does What analytics)
        return enabledAnalytics.whoDoesWhat;
      }
      
      // Default to showing the edge if it doesn't match specific analytics
      return true;
    });
    
    // Combine regular edges with mapping edges
    const allEdges = [
      ...filteredEdges,
      ...mappingEdges.map(mappingEdge => ({
        id: mappingEdge.id,
        fromNodeType: mappingEdge.from,
        toNodeType: mappingEdge.to,
        name: mappingEdge.label,
        isBidirectional: false,
        attributes: [],
        isMappingEdge: true
      }))
    ];
    
    // Generate node positions in a circular layout
    const nodePositions: Record<string, { x: number, y: number }> = {};
    const centerX = 300;
    const centerY = 300; // Move the center point down to utilize vertical space better
    const radius = 220; // Increase the radius to spread out nodes in the larger space
    
    allNodesToDisplay.forEach((node, index) => {
      const angle = (index / allNodesToDisplay.length) * 2 * Math.PI;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    return (
      <div className="flex flex-col space-y-2">
        <div className="border rounded-lg overflow-auto" style={{ height: 'calc(100vh - 250px)' }}>
          <svg ref={svgRef} width="100%" height="800" viewBox="0 0 600 600">
            {/* Edge connections - includes both regular edges and mapping edges */}
            {allEdges.map((edge) => {
              const fromPos = nodePositions[edge.fromNodeType];
              const toPos = nodePositions[edge.toNodeType];
              
              if (!fromPos || !toPos) return null;
              
              // Check if this is a self-referencing edge (affinity between the same node)
              const isSelfReference = edge.fromNodeType === edge.toNodeType;
              
              if (isSelfReference) {
                // Draw a curved arc for self-reference to make it more visible
                const centerX = fromPos.x;
                const centerY = fromPos.y;
                const radius = 30; // Reduced radius for the arc
                
                // Create a curved path for self-reference
                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${centerX},${centerY - 14} 
                          C ${centerX + 40},${centerY - 40} 
                            ${centerX + 40},${centerY + 40} 
                            ${centerX},${centerY + 14}`}
                      fill="none"
                      stroke={getStrokeColor(edge)}
                      strokeWidth="1.5"
                      strokeDasharray={getStrokeDashArray(edge)}
                      markerEnd={getMarkerEnd(edge)}
                    />
                    
                    {/* Edge label */}
                    <text 
                      x={centerX + 40} 
                      y={centerY} 
                      textAnchor="middle" 
                      fill="#4b5563" 
                      fontSize="8" 
                      fontWeight="medium"
                      className="select-none"
                    >
                      {edge.name}
                    </text>
                  </g>
                );
              }
              
              // Regular edge between different nodes
              return (
                <g key={edge.id}>
                  {/* Edge line */}
                  <line 
                    x1={fromPos.x} 
                    y1={fromPos.y} 
                    x2={toPos.x} 
                    y2={toPos.y} 
                    stroke={getStrokeColor(edge)} 
                    strokeWidth="1.5" 
                    markerEnd={getMarkerEnd(edge)} 
                    strokeDasharray={getStrokeDashArray(edge)} 
                  />
                  
                  {/* Edge label */}
                  <text 
                    x={(fromPos.x + toPos.x) / 2} 
                    y={(fromPos.y + toPos.y) / 2 - 6} 
                    textAnchor="middle" 
                    fill="#4b5563" 
                    fontSize="8" 
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
                      strokeWidth="1.5" 
                      markerEnd={getMarkerEnd(edge)} 
                    />
                  )}
                </g>
              );
            })}
            
            {/* All DMO nodes (includes EKG and source DMOs) */}
            {allNodesToDisplay.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              // Check if this DMO is mapped
              const { isMapped, mappedToId } = getMappedStatus(node.id);
              
              // Choose border color and width based on mapping status
              const getNodeStyleProps = () => {
                // Default EKG node styling
                if (!node.isSource) {
                  const dmo = dmos.find(d => d.id === node.id);
                  const defaultStyle = {
                    fill: dmo?.required ? "#f0fdf4" : "#f9fafb",
                    stroke: dmo?.required ? "#10b981" : "#6b7280",
                    strokeWidth: 1.5
                  };
                  
                  // If this is a mapped EKG node (document or person, etc.)
                  if (isMapped) {
                    return {
                      fill: "#e0f2fe", // Light blue background
                      stroke: "#3b82f6", // Blue border
                      strokeWidth: 2 // Thicker border
                    };
                  }
                  
                  return defaultStyle;
                } 
                // Source DMO styling
                else {
                  // If source DMO is mapped to an EKG entity
                  if (isMapped) {
                    return {
                      fill: "#e0f7fa", // Light teal background
                      stroke: "#06b6d4", // Teal border
                      strokeWidth: 2 // Thicker border
                    };
                  }
                  
                  // Default source DMO style
                  return {
                    fill: "#f5f5f5", // Light gray background
                    stroke: "#94a3b8", // Gray border
                    strokeWidth: 1.5
                  };
                }
              };
              
              const nodeStyle = getNodeStyleProps();
              
              // Add a dashed border for source DMOs
              const borderDash = node.isSource ? "2,2" : "none";
              
              return (
                <g key={node.id}>
                  {/* Node circle - reduced size by 60% */}
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="14" 
                    fill={nodeStyle.fill} 
                    stroke={nodeStyle.stroke} 
                    strokeWidth={nodeStyle.strokeWidth} 
                    strokeDasharray={borderDash}
                    className="cursor-pointer"
                  />
                  
                  {/* Node icon - reduced size */}
                  <foreignObject x={pos.x - 6} y={pos.y - 6} width="12" height="12">
                    <div className="flex items-center justify-center h-full">
                      {React.cloneElement(node.icon as React.ReactElement, { className: "h-3 w-3" })}
                    </div>
                  </foreignObject>
                  
                  {/* Node name - smaller font */}
                  <text 
                    x={pos.x} 
                    y={pos.y + 10} 
                    textAnchor="middle" 
                    fill="#374151" 
                    fontSize="8" 
                    fontWeight="medium"
                    className="select-none"
                  >
                    {node.name}
                  </text>
                  
                  {/* Add "Source" label for source DMOs */}
                  {node.isSource && (
                    <text 
                      x={pos.x} 
                      y={pos.y + 18} 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize="5" 
                      fontStyle="italic"
                      className="select-none"
                    >
                      (Source)
                    </text>
                  )}
                  
                  {/* Mapping indicator if this node is mapped */}
                  {isMapped && (
                    <circle 
                      cx={pos.x + 12} 
                      cy={pos.y - 8} 
                      r="4" 
                      fill={node.isSource ? "#06b6d4" : "#3b82f6"} 
                      stroke="#fff" 
                      strokeWidth="1" 
                    />
                  )}
                  
                  {/* Draw mapping indicator line between mapped nodes if applicable */}
                  {isMapped && mappedToId && activeTab === 'mapping' && (
                    (() => {
                      // Find the position of the mapped node
                      const mappedNodeId = mappedToId;
                      const mappedPos = nodePositions[mappedNodeId];
                      
                      if (!mappedPos) return null;
                      
                      return (
                        <path
                          d={`M ${pos.x},${pos.y} 
                             C ${(pos.x + mappedPos.x) / 2},${pos.y - 40} 
                               ${(pos.x + mappedPos.x) / 2},${mappedPos.y - 40} 
                               ${mappedPos.x},${mappedPos.y}`}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="1"
                          strokeDasharray="4 2"
                          opacity="0.7"
                        />
                      );
                    })()
                  )}
                </g>
              );
            })}
            
            {/* Arrow marker definition */}
            <defs>
              {/* Multiple arrowhead markers with different colors */}
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
              <marker 
                id="arrowhead-orange" 
                markerWidth="10" 
                markerHeight="7" 
                refX="9" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#ff5722" />
              </marker>
              <marker 
                id="arrowhead-green" 
                markerWidth="10" 
                markerHeight="7" 
                refX="9" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#4caf50" />
              </marker>
              <marker 
                id="arrowhead-teal" 
                markerWidth="10" 
                markerHeight="7" 
                refX="9" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#009688" />
              </marker>
            </defs>
          </svg>
        </div>
        
        {/* Enhanced Legend with mapping indicators */}
        <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-2 py-2 px-4 bg-gray-50 rounded border">
          <div className="flex items-center">
            <div className="h-5 w-5 rounded-full border border-gray-500 bg-white mr-2"></div>
            <span className="text-sm text-gray-600">Node/Entity</span>
          </div>
          
          <div className="flex items-center">
            <div className="h-px w-8 bg-blue-500 mr-2" style={{ height: '2px' }}></div>
            <span className="text-sm text-gray-600">Edge</span>
          </div>
          
          <div className="flex items-center">
            <div className="h-px w-8 mr-2" style={{ 
              height: '2px', 
              background: 'repeating-linear-gradient(to right, #4caf50 0, #4caf50 4px, transparent 4px, transparent 6px)' 
            }}></div>
            <span className="text-sm text-gray-600">Analytics</span>
          </div>
          
          {activeTab === 'mapping' && (
            <>
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full border border-blue-500 bg-blue-50 mr-2 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-blue-500 border border-white" style={{ transform: 'translate(25%, -25%)' }}></div>
                </div>
                <span className="text-sm text-gray-600">EKG Entity with Mapping</span>
              </div>
              
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full border border-cyan-500 bg-cyan-50 mr-2 relative">
                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-cyan-500 border border-white" style={{ transform: 'translate(25%, -25%)' }}></div>
                </div>
                <span className="text-sm text-gray-600">Source Data with Mapping</span>
              </div>
              
              <div className="flex items-center">
                <div className="h-px w-8 mr-2" style={{ 
                  height: '2px', 
                  background: 'repeating-linear-gradient(to right, #06b6d4 0, #06b6d4 4px, transparent 4px, transparent 2px)' 
                }}></div>
                <span className="text-sm text-gray-600">Mapping Connection</span>
              </div>
            </>
          )}
        </div>
      </div>
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

  // Source-to-EKG Mapping Panel for the right side
  const SourceToEKGMappingPanel = () => (
    <div className="space-y-4">
      <h2 className="text-md font-medium">Source-to-EKG Mapping</h2>
      <p className="text-sm text-gray-600 mb-4">
        Map source data fields to EKG entities to integrate your data into the knowledge graph.
      </p>
      
      {/* Source Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search source fields..."
            className="pl-9"
            value={searchSourceTerm}
            onChange={e => setSearchSourceTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Source DMOs */}
      <div className="space-y-4 max-h-[200px] overflow-y-auto">
        {sourceDMOs.map(dmo => {
          const isCollapsed = collapsedSourceSections.includes(dmo.id);
          const filteredFields = filterFields(dmo.fields, searchSourceTerm);
          const mappedCount = getMappedFieldCount(dmo.id, dmo.fields);
          
          return (
            <div key={dmo.id} className="border rounded-md">
              <div 
                className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSourceSection(dmo.id)}
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{dmo.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Mapped ({mappedCount})
                  </Badge>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {filteredFields.length > 0 ? (
                    filteredFields.map(field => {
                      const isMapped = field.id in mappedFields;
                      const targetFieldId = mappedFields[field.id];
                      
                      return (
                        <div 
                          key={field.id} 
                          className={`p-2 rounded-sm border flex items-center justify-between ${isMapped ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                          onMouseEnter={() => targetFieldId ? setActiveLine([field.id, targetFieldId]) : null}
                          onMouseLeave={() => setActiveLine(null)}
                        >
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(field.type)}
                            <span className="text-sm">{field.name}</span>
                            {field.isPrimaryKey && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 bg-purple-50 text-purple-700 border-purple-200">PK</Badge>
                            )}
                            {field.isRequired && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 bg-red-50 text-red-700 border-red-200">Required</Badge>
                            )}
                          </div>
                          
                          {isMapped ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeMapping(field.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 bg-gray-50 text-gray-500 border-gray-200">
                              Not Mapped
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 italic py-2">No fields match your search</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* EKG Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search EKG fields..."
            className="pl-9"
            value={searchEKGTerm}
            onChange={e => setSearchEKGTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* EKG DMOs */}
      <div className="space-y-4 max-h-[200px] overflow-y-auto">
        {ekgDMOs.map(dmo => {
          const isCollapsed = collapsedEKGSections.includes(dmo.id);
          const filteredFields = filterFields(dmo.fields, searchEKGTerm);
          const mappedCount = getMappedFieldCount(dmo.id, dmo.fields);
          
          return (
            <div key={dmo.id} className="border rounded-md">
              <div 
                className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
                onClick={() => toggleEKGSection(dmo.id)}
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">{dmo.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Is Mapped ({mappedCount})
                  </Badge>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {filteredFields.length > 0 ? (
                    filteredFields.map(field => {
                      // Check if this field is a target of any mapping
                      const sourceFieldIds = Object.entries(mappedFields)
                        .filter(([_, target]) => target === field.id)
                        .map(([source, _]) => source);
                      const isMapped = sourceFieldIds.length > 0;
                      
                      return (
                        <div 
                          key={field.id} 
                          className={`p-2 rounded-sm border flex items-center justify-between ${isMapped ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                          onMouseEnter={() => sourceFieldIds.length ? setActiveLine([sourceFieldIds[0], field.id]) : null}
                          onMouseLeave={() => setActiveLine(null)}
                        >
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(field.type)}
                            <span className="text-sm">{field.name}</span>
                            {field.isPrimaryKey && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 bg-purple-50 text-purple-700 border-purple-200">PK</Badge>
                            )}
                            {field.isRequired && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 bg-red-50 text-red-700 border-red-200">Required</Badge>
                            )}
                          </div>
                          
                          {isMapped ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeMapping(sourceFieldIds[0])}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 bg-gray-50 text-gray-500 border-gray-200">
                              Unmapped
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 italic py-2">No fields match your search</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Right panel content with tabs for DMOs, Edges, Analytics, and Mapping
  const rightPanelContent = (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dmos' | 'edges' | 'analytics' | 'mapping')} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="dmos" className="text-xs">
            EKG Entities
          </TabsTrigger>
          <TabsTrigger value="edges" className="text-xs">
            Relationships
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="mapping" className="text-xs">
            Mapping
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dmos" className="pt-4">
          <DMOSelectionPanel />
        </TabsContent>
        <TabsContent value="edges" className="pt-4">
          <EdgeDefinitionsPanel />
        </TabsContent>
        <TabsContent value="mapping" className="pt-4">
          <div className="space-y-4">
            <h2 className="text-md font-medium">Source-to-EKG Mapping</h2>
            <p className="text-sm text-gray-600 mb-4">
              Map your source data models to EKG entities to create intelligent connections.
            </p>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mapping Dashboard</CardTitle>
                <CardDescription>
                  View and manage field mappings between source data and EKG entities
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium">Mapping Status</h3>
                      <p className="text-xs text-gray-500">
                        {Object.keys(mappedFields).length > 0 
                          ? `${Object.keys(mappedFields).length} field mappings defined` 
                          : "No mappings defined yet"}
                      </p>
                    </div>
                    
                    <Button onClick={() => {
                      console.log("Opening mapping modal...");
                      setShowMappingModal(true);
                    }}>
                      {Object.keys(mappedFields).length > 0 ? "Edit Mappings" : "Create Mappings"}
                    </Button>
                  </div>
                  
                  {Object.keys(mappedFields).length > 0 && (
                    <div className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Current Mappings</h4>
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(mappedFields).length} Fields
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {Object.entries(mappedFields).map(([sourceId, targetId]) => {
                          // Find source field details
                          let sourceField;
                          let sourceDmo;
                          for (const dmo of sourceDMOs) {
                            const field = dmo.fields.find(f => f.id === sourceId);
                            if (field) {
                              sourceField = field;
                              sourceDmo = dmo;
                              break;
                            }
                          }
                          
                          // Find target field details
                          let targetField;
                          let targetDmo;
                          for (const dmo of ekgDMOs) {
                            const field = dmo.fields.find(f => f.id === targetId);
                            if (field) {
                              targetField = field;
                              targetDmo = dmo;
                              break;
                            }
                          }
                          
                          if (!sourceField || !targetField || !sourceDmo || !targetDmo) {
                            return null;
                          }
                          
                          return (
                            <div 
                              key={sourceId} 
                              className="flex items-center justify-between p-2 border rounded-md bg-gray-50 text-xs"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{sourceDmo.name}</span>
                                <span>.</span>
                                <span>{sourceField.name}</span>
                                <span>{getTypeIcon(sourceField.type)}</span>
                              </div>
                              
                              <ArrowRight className="h-3 w-3 text-gray-400 mx-2" />
                              
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{targetDmo.name}</span>
                                <span>.</span>
                                <span>{targetField.name}</span>
                                <span>{getTypeIcon(targetField.type)}</span>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-2"
                                onClick={() => removeMapping(sourceId)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(mappedFields).length === 0 && (
                    <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center">
                      <ArrowLeftRight className="h-8 w-8 text-gray-300 mb-2" />
                      <h3 className="text-sm font-medium">No Mappings Defined</h3>
                      <p className="text-xs text-gray-500 mt-1 mb-4">
                        Create field mappings between your source data and EKG entities
                      </p>
                      <Button size="sm" onClick={() => {
                        console.log("Creating first mapping...");
                        setShowMappingModal(true);
                      }}>
                        Create First Mapping
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <Switch 
                      id="wkw-toggle" 
                      checked={enabledAnalytics.whoKnowsWho}
                      onCheckedChange={(checked) => {
                        setEnabledAnalytics(prev => ({
                          ...prev,
                          whoKnowsWho: checked
                        }));
                      }}
                    />
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
                    <Switch 
                      id="wdw-toggle" 
                      checked={enabledAnalytics.whoDoesWhat}
                      onCheckedChange={(checked) => {
                        setEnabledAnalytics(prev => ({
                          ...prev,
                          whoDoesWhat: checked
                        }));
                      }}
                    />
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
                    <Switch 
                      id="centrality-toggle" 
                      checked={enabledAnalytics.centralityAnalysis}
                      onCheckedChange={(checked) => {
                        setEnabledAnalytics(prev => ({
                          ...prev,
                          centralityAnalysis: checked
                        }));
                      }}
                    />
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
                    <Switch 
                      id="community-toggle" 
                      checked={enabledAnalytics.communityDetection}
                      onCheckedChange={(checked) => {
                        setEnabledAnalytics(prev => ({
                          ...prev,
                          communityDetection: checked
                        }));
                      }}
                    />
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
      
      {/* Source-to-EKG Mapping Modal */}
      <Dialog open={showMappingModal} onOpenChange={setShowMappingModal}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Source-to-EKG Field Mapping</DialogTitle>
            <DialogDescription>
              Connect your source data models to EKG entities by mapping fields between them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {/* Source Models */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Source Data Models</h3>
                <div className="relative w-full max-w-[180px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search source fields..."
                    value={searchSourceTerm}
                    onChange={(e) => setSearchSourceTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden bg-gray-50">
                <div className="max-h-[400px] overflow-y-auto p-1">
                  {sourceDMOs.map((dmo) => {
                    const isCollapsed = collapsedSourceSections.includes(dmo.id);
                    const filteredFields = dmo.fields.filter(field => 
                      field.name.toLowerCase().includes(searchSourceTerm.toLowerCase()) ||
                      field.description?.toLowerCase().includes(searchSourceTerm.toLowerCase()) ||
                      dmo.name.toLowerCase().includes(searchSourceTerm.toLowerCase())
                    );
                    
                    if (filteredFields.length === 0) return null;
                    
                    return (
                      <div key={dmo.id} className="mb-2">
                        <div 
                          className="flex items-center justify-between p-2 bg-white rounded-md cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSourceSection(dmo.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded bg-gray-100">
                              {dmo.icon}
                            </div>
                            <span className="font-medium text-sm">{dmo.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {!isCollapsed && (
                          <div className="pl-4 py-1 space-y-1">
                            {filteredFields.map((field) => (
                              <div 
                                key={field.id}
                                className={`p-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between
                                  ${activeLine && activeLine[0] === field.id ? 'bg-amber-50 border border-amber-200' : ''}
                                `}
                                onClick={() => {
                                  if (activeLine && activeLine[0] === field.id) {
                                    // Deselect if already selected
                                    setActiveLine(null);
                                  } else {
                                    setActiveLine([field.id, activeLine ? activeLine[1] : '']);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{field.name}</span>
                                  <span className="text-xs text-gray-500">{getTypeIcon(field.type)}</span>
                                </div>
                                {activeLine && activeLine[0] === field.id && (
                                  <Check className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* EKG Entities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">EKG Entities</h3>
                <div className="relative w-full max-w-[180px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search EKG fields..."
                    value={searchEkgTerm}
                    onChange={(e) => setSearchEkgTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden bg-gray-50">
                <div className="max-h-[400px] overflow-y-auto p-1">
                  {ekgDMOs.map((dmo) => {
                    const isCollapsed = collapsedEkgSections.includes(dmo.id);
                    const filteredFields = dmo.fields.filter(field => 
                      field.name.toLowerCase().includes(searchEkgTerm.toLowerCase()) ||
                      field.description?.toLowerCase().includes(searchEkgTerm.toLowerCase()) ||
                      dmo.name.toLowerCase().includes(searchEkgTerm.toLowerCase())
                    );
                    
                    if (filteredFields.length === 0) return null;
                    
                    return (
                      <div key={dmo.id} className="mb-2">
                        <div 
                          className="flex items-center justify-between p-2 bg-white rounded-md cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleEkgSection(dmo.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded bg-gray-100">
                              {dmo.icon}
                            </div>
                            <span className="font-medium text-sm">{dmo.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {!isCollapsed && (
                          <div className="pl-4 py-1 space-y-1">
                            {filteredFields.map((field) => (
                              <div 
                                key={field.id}
                                className={`p-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between
                                  ${activeLine && activeLine[1] === field.id ? 'bg-amber-50 border border-amber-200' : ''}
                                `}
                                onClick={() => {
                                  if (activeLine && activeLine[1] === field.id) {
                                    // Deselect if already selected
                                    setActiveLine(null);
                                  } else {
                                    setActiveLine([activeLine ? activeLine[0] : '', field.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{field.name}</span>
                                  <span className="text-xs text-gray-500">{getTypeIcon(field.type)}</span>
                                </div>
                                {activeLine && activeLine[1] === field.id && (
                                  <Check className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center mt-6">
            <div>
              {activeLine && (activeLine[0] || activeLine[1]) && (
                <p className="text-sm text-gray-600">
                  {activeLine[0] && activeLine[1] ? 'Ready to create mapping' : 'Select both source and target fields'}
                </p>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setShowMappingModal(false)}>
                Cancel
              </Button>
              <Button 
                disabled={!activeLine || !activeLine[0] || !activeLine[1]}
                onClick={() => {
                  if (activeLine && activeLine[0] && activeLine[1]) {
                    addMapping(activeLine[0], activeLine[1]);
                    setActiveLine(null);
                    setShowMappingModal(false);
                  }
                }}
              >
                Create Mapping
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  
  // Source-to-EKG Mapping Modal
  const renderSourceToEKGMappingModal = () => {
    return (
      <Dialog open={showMappingModal} onOpenChange={setShowMappingModal}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Source-to-EKG Field Mapping</DialogTitle>
            <DialogDescription>
              Connect your source data models to EKG entities by mapping fields between them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {/* Source Models */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Source Data Models</h3>
                <div className="relative w-full max-w-[180px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search source fields..."
                    value={searchSourceTerm}
                    onChange={(e) => setSearchSourceTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden bg-gray-50">
                <div className="max-h-[400px] overflow-y-auto p-1">
                  {sourceDMOs.map((dmo) => {
                    const isCollapsed = collapsedSourceSections.includes(dmo.id);
                    const filteredFields = dmo.fields.filter(field => 
                      field.name.toLowerCase().includes(searchSourceTerm.toLowerCase()) ||
                      field.description?.toLowerCase().includes(searchSourceTerm.toLowerCase()) ||
                      dmo.name.toLowerCase().includes(searchSourceTerm.toLowerCase())
                    );
                    
                    if (filteredFields.length === 0 && searchSourceTerm) return null;
                    
                    return (
                      <div key={dmo.id} className="mb-2">
                        <div 
                          className="flex items-center justify-between p-2 bg-gray-100 rounded cursor-pointer"
                          onClick={() => {
                            if (isCollapsed) {
                              setCollapsedSourceSections(collapsedSourceSections.filter(id => id !== dmo.id));
                            } else {
                              setCollapsedSourceSections([...collapsedSourceSections, dmo.id]);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-medium text-sm">{dmo.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {!isCollapsed && (
                          <div className="pl-4 pt-1 pb-1">
                            {filteredFields.map((field) => (
                              <div 
                                key={field.id} 
                                className={`
                                  flex items-center justify-between p-2 rounded-md text-sm cursor-pointer my-1
                                  ${Object.keys(mappedFields).includes(field.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100 border border-transparent'}
                                  ${activeLine && activeLine[0] === field.id ? 'bg-amber-50 border border-amber-200' : ''}
                                `}
                                onClick={() => {
                                  if (activeLine && activeLine[0] === field.id) {
                                    setActiveLine(null);
                                  } else {
                                    setActiveLine([field.id, activeLine ? activeLine[1] : '']);
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="flex items-center">
                                    {getTypeIcon(field.type)}
                                    <span className="ml-2">{field.name}</span>
                                  </span>
                                  {field.isPrimaryKey && (
                                    <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">PK</Badge>
                                  )}
                                </div>
                                
                                {Object.keys(mappedFields).includes(field.id) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMapping(field.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* EKG Models */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">EKG Entities</h3>
                <div className="relative w-full max-w-[180px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search EKG fields..."
                    value={searchEKGTerm}
                    onChange={(e) => setSearchEKGTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden bg-gray-50">
                <div className="max-h-[400px] overflow-y-auto p-1">
                  {ekgDMOs.map((dmo) => {
                    const isCollapsed = collapsedEKGSections.includes(dmo.id);
                    const filteredFields = dmo.fields.filter(field => 
                      field.name.toLowerCase().includes(searchEKGTerm.toLowerCase()) ||
                      field.description?.toLowerCase().includes(searchEKGTerm.toLowerCase()) ||
                      dmo.name.toLowerCase().includes(searchEKGTerm.toLowerCase())
                    );
                    
                    if (filteredFields.length === 0 && searchEKGTerm) return null;
                    
                    return (
                      <div key={dmo.id} className="mb-2">
                        <div 
                          className="flex items-center justify-between p-2 bg-gray-100 rounded cursor-pointer"
                          onClick={() => {
                            if (isCollapsed) {
                              setCollapsedEKGSections(collapsedEKGSections.filter(id => id !== dmo.id));
                            } else {
                              setCollapsedEKGSections([...collapsedEKGSections, dmo.id]);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            {dmo.id === 'person' ? (
                              <User className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            )}
                            <span className="font-medium text-sm">{dmo.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {!isCollapsed && (
                          <div className="pl-4 pt-1 pb-1">
                            {filteredFields.map((field) => (
                              <div 
                                key={field.id} 
                                className={`
                                  flex items-center justify-between p-2 rounded-md text-sm cursor-pointer my-1
                                  ${Object.values(mappedFields).includes(field.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100 border border-transparent'}
                                  ${activeLine && activeLine[1] === field.id ? 'bg-amber-50 border border-amber-200' : ''}
                                `}
                                onClick={() => {
                                  if (activeLine && activeLine[1] === field.id) {
                                    setActiveLine(null);
                                  } else {
                                    setActiveLine([activeLine ? activeLine[0] : '', field.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="flex items-center">
                                    {getTypeIcon(field.type)}
                                    <span className="ml-2">{field.name}</span>
                                  </span>
                                  {field.isPrimaryKey && (
                                    <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">PK</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection lines visualization */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Current Mappings</h3>
              <Button 
                size="sm" 
                disabled={!activeLine || !activeLine[0] || !activeLine[1]}
                onClick={() => {
                  if (activeLine && activeLine[0] && activeLine[1]) {
                    addMapping(activeLine[0], activeLine[1]);
                    setActiveLine(null);
                  }
                }}
              >
                Create Mapping
              </Button>
            </div>
            
            <div className="border rounded-md p-4 bg-gray-50 min-h-[120px]">
              {Object.keys(mappedFields).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(mappedFields).map(([sourceId, targetId]) => {
                    // Find source field details
                    let sourceField;
                    let sourceDmo;
                    for (const dmo of sourceDMOs) {
                      const field = dmo.fields.find(f => f.id === sourceId);
                      if (field) {
                        sourceField = field;
                        sourceDmo = dmo;
                        break;
                      }
                    }
                    
                    // Find target field details
                    let targetField;
                    let targetDmo;
                    for (const dmo of ekgDMOs) {
                      const field = dmo.fields.find(f => f.id === targetId);
                      if (field) {
                        targetField = field;
                        targetDmo = dmo;
                        break;
                      }
                    }
                    
                    if (!sourceField || !targetField || !sourceDmo || !targetDmo) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={sourceId} 
                        className="flex items-center justify-between p-2 border rounded-md bg-white"
                      >
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-xs">{sourceDmo.name}</span>
                          <span className="text-xs text-gray-500">.</span>
                          <span className="text-xs">{sourceField.name}</span>
                          <span>{getTypeIcon(sourceField.type)}</span>
                        </div>
                        
                        <div className="flex items-center px-2">
                          <div className="w-16 h-0 border-t border-dashed border-gray-400"></div>
                          <ArrowRight className="h-3 w-3 text-gray-500 mx-1" />
                          <div className="w-16 h-0 border-t border-dashed border-gray-400"></div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-xs">{targetDmo.name}</span>
                          <span className="text-xs text-gray-500">.</span>
                          <span className="text-xs">{targetField.name}</span>
                          <span>{getTypeIcon(targetField.type)}</span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => removeMapping(sourceId)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[120px] text-center">
                  <p className="text-sm text-gray-500">
                    No mappings defined yet. Select a source field and EKG field, then click "Create Mapping".
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowMappingModal(false)}>Cancel</Button>
            <Button onClick={() => setShowMappingModal(false)}>Save Mappings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // State for visualization/playground view
  const [visualizationView, setVisualizationView] = useState<'visualization' | 'playground'>('visualization');
  
  // Sample query results state for demo
  const [queryResults, setQueryResults] = useState<null | {
    nodes: { id: string; label: string; type: string }[];
    edges: { source: string; target: string; label: string; type: string }[];
    answer: string;
  }>(null);
  
  // Sample queries for suggestions
  const sampleQueries = [
    "Show me all Person entities with affinity to Project X",
    "Find key collaborators of Jane Smith",
    "What Document entities are connected to Department A?",
    "Show high-affinity relationships between Persons and Projects",
    "List all entities with more than 3 connections"
  ];
  
  // Function to simulate executing a query
  const executeQuery = (query: string) => {
    console.log("Executing query:", query);
    
    // Simulate processing time
    setTimeout(() => {
      // Demo result data
      setQueryResults({
        nodes: [
          { id: '1', label: 'Jane Smith', type: 'Person' },
          { id: '2', label: 'John Doe', type: 'Person' },
          { id: '3', label: 'Project Alpha', type: 'Project' },
          { id: '4', label: 'Marketing Dept', type: 'Department' },
        ],
        edges: [
          { source: '1', target: '3', label: 'Manages', type: 'relationship' },
          { source: '2', target: '3', label: 'WorksOn', type: 'relationship' },
          { source: '1', target: '2', label: 'Collaborates', type: 'affinity' },
          { source: '1', target: '4', label: 'BelongsTo', type: 'relationship' },
        ],
        answer: "Jane Smith is a Person who manages Project Alpha and collaborates with John Doe. She belongs to the Marketing Department. John Doe works on Project Alpha."
      });
    }, 500);
  };
  
  // Render the playground view with enhanced query functionality
  const renderEKGQueryPlayground = () => {
    // State needs to be lifted up to the component level
    // since useState won't work inside this render function
    const queryInputRef = useRef<string>('');
    
    // Helper function to update input value
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      queryInputRef.current = e.target.value;
    };
    
    // Helper function to execute query with the current ref value
    const runQuery = () => {
      if (queryInputRef.current.trim()) {
        executeQuery(queryInputRef.current);
      }
    };
    
    return (
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
                        
                        return (
                          <g key={`edge-${i}`}>
                            <path 
                              d={`M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`}
                              fill="none"
                              stroke={edge.type === 'affinity' ? '#8866dd' : '#666'}
                              strokeWidth="2"
                              strokeDasharray={edge.type === 'affinity' ? "5,5" : "none"}
                              markerEnd="url(#arrowhead)"
                            />
                            <rect x={midX-30} y={midY-10} width="60" height="20" rx="10" fill="white" opacity="0.8" />
                            <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="500">
                              {edge.label}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Define arrow marker for directed edges */}
                      <defs>
                        <marker 
                          id="arrowhead" 
                          markerWidth="6" 
                          markerHeight="4" 
                          refX="6" 
                          refY="2"
                          orient="auto"
                        >
                          <polygon points="0 0, 6 2, 0 4" fill="#666" />
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
    );
  };
  
  // Simple right panel for demonstration
  const rightPanel = (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">EKG Configuration</h3>
      <p className="text-sm text-gray-500 mb-4">
        Configure your Enterprise Knowledge Graph settings.
      </p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="ekg-name">EKG Name</Label>
          <Input id="ekg-name" placeholder="Enter a name for your EKG" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="ekg-description">Description</Label>
          <Input id="ekg-description" placeholder="Describe your EKG" className="mt-1" />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="public-ekg" />
          <Label htmlFor="public-ekg">Make EKG public</Label>
        </div>
      </div>
    </div>
  );
  
  // Navigation handlers
  const handleNextStep = () => {
    // Navigate to next step
    console.log("Navigating to next step");
  };
  
  const handlePreviousStep = () => {
    // Navigate to previous step
    console.log("Navigating to previous step");
  };
  
  // Render everything
  return (
    <KnowledgeGraphLayout
      title="EKG Setup"
      rightPanelContent={rightPanel}
      currentStep={2}
      totalSteps={5}
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
    >
      <div className="flex flex-col space-y-4">
        <Tabs value={visualizationView} onValueChange={(value) => setVisualizationView(value as 'visualization' | 'playground')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="playground">Query Playground</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization" className="mt-4">
            {/* Original graph visualization */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Enterprise Knowledge Graph Structure</h3>
              <p className="text-sm text-gray-500 mb-6">
                This visualization shows your EKG structure with entities and relationships.
              </p>
              <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border">
                {/* We'll replace this with actual graph when it's fixed */}
                <div className="text-center">
                  <svg width="200" height="200" viewBox="0 0 100 100">
                    <circle cx="50" cy="30" r="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                    <circle cx="30" cy="70" r="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                    <circle cx="70" cy="70" r="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="50" y1="30" x2="30" y2="70" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="50" y1="30" x2="70" y2="70" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                  <p className="mt-4 text-gray-500">Graph visualization</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="playground" className="mt-4">
            {renderEKGQueryPlayground()}
          </TabsContent>
        </Tabs>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default EKGSetup;