import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Network, 
  Users,
  FileText,
  Briefcase,
  BarChart3, 
  PieChart, 
  LineChart, 
  Search, 
  Clock, 
  Zap, 
  List, 
  Plus,
  Check,
  Settings,
  Eye,
  Lightbulb,
  HelpCircle,
  UserCog,
  Workflow,
  Layers,
  GripVertical,
  PlusSquare,
  Trash2,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Interface definitions
interface AnalyticsConfig {
  id: string;
  name: string;
  description: string;
  type: 'relationship' | 'activity' | 'centrality' | 'pathfinding' | 'clustering' | 'ranking';
  category: 'default' | 'custom';
  enabled: boolean;
  parameters: Record<string, any>;
  visualizationType: 'network' | 'matrix' | 'heatmap' | 'bar' | 'line' | 'pie';
  entityTypes: string[];
  relationships: string[];
  order?: number;
}

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

interface VisualizationOption {
  id: string;
  name: string;
  type: 'network' | 'matrix' | 'heatmap' | 'bar' | 'line' | 'pie';
  icon: React.ReactNode;
  description: string;
}

interface AnalyticsCategory {
  id: string;
  name: string;
  description: string;
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

// Define Sortable Item component
const SortableItem = ({ id, children, handle = true }) => {
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
    position: 'relative',
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
const ComponentLibraryItem = ({ component, onAddToPipeline }) => {
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
const PipelineComponentItem = ({ component, onRemove, isActive, onToggleActive }) => {
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

const AnalyticsConfiguration: React.FC = () => {
  const [, navigate] = useLocation();
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
    },
    { 
      id: 'bar', 
      name: 'Bar Chart', 
      type: 'bar', 
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Shows quantitative comparison between entities'
    },
    { 
      id: 'line', 
      name: 'Line Chart', 
      type: 'line', 
      icon: <LineChart className="h-4 w-4" />,
      description: 'Displays trends over time or categories'
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
    {
      id: 'rel-works-on',
      type: 'relationship',
      name: 'Works On',
      description: 'Person-to-project activity',
      icon: <ArrowRight className="h-4 w-4 text-orange-500" />,
      category: 'relationship',
      compatibleWith: ['entity-person', 'entity-project'],
      parameters: {
        weight: 0.7,
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
    {
      id: 'algo-community',
      type: 'algorithm',
      name: 'Community Detection',
      description: 'Identifies clusters and communities',
      icon: <Layers className="h-4 w-4 text-purple-500" />,
      category: 'algorithm',
      parameters: {
        algorithm: 'louvain',
        resolution: 1.0
      }
    },
    {
      id: 'algo-similarity',
      type: 'algorithm',
      name: 'Similarity Analysis',
      description: 'Computes similarity between nodes',
      icon: <Search className="h-4 w-4 text-green-500" />,
      category: 'algorithm',
      parameters: {
        method: 'cosine',
        threshold: 0.7
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
    },
    {
      id: 'vis-matrix',
      type: 'visualization',
      name: 'Adjacency Matrix',
      description: 'Grid-based visualization of relationships',
      icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
      category: 'visualization',
      parameters: {
        sortBy: 'cluster',
        showLabels: true
      }
    }
  ]);
  
  // Analytics pipeline
  const [analyticsPipeline, setAnalyticsPipeline] = useState<(AnalyticsComponent & { active: boolean, id: string })[]>([
    // Pre-configured "Who Knows Who" analytics components
    {
      ...componentLibrary.find(c => c.id === 'entity-person'),
      id: 'pipeline-person-1',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'rel-collaborates'),
      id: 'pipeline-collaborates',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'rel-knows'),
      id: 'pipeline-knows',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'algo-pagerank'),
      id: 'pipeline-pagerank',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'vis-network'),
      id: 'pipeline-network-1',
      active: true
    },
    
    // Pre-configured "Who Does What" analytics components
    {
      ...componentLibrary.find(c => c.id === 'entity-person'),
      id: 'pipeline-person-2',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'entity-document'),
      id: 'pipeline-document',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'rel-created'),
      id: 'pipeline-created',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'algo-similarity'),
      id: 'pipeline-similarity',
      active: true
    },
    {
      ...componentLibrary.find(c => c.id === 'vis-heatmap'),
      id: 'pipeline-heatmap',
      active: true
    }
  ]);
  
  // Traditional analytics configurations (for backwards compatibility)
  const [analytics] = useState<AnalyticsConfig[]>([
    // Pre-configured "Who Knows Who" analytics
    {
      id: 'who-knows-who',
      name: 'Who Knows Who',
      description: 'Identify and analyze relationships between people',
      type: 'relationship',
      category: 'default',
      enabled: true,
      parameters: {
        entityType: 'person',
        relationshipTypes: ['collaborates', 'knows'],
        weightFactors: {
          frequency: 0.6,
          duration: 0.3,
          recency: 0.1
        },
        timeDecay: {
          enabled: true,
          halfLife: 90 // days
        },
        thresholds: {
          minWeight: 0.3,
          minInteractions: 5
        }
      },
      visualizationType: 'network',
      entityTypes: ['person'],
      relationships: ['collaborates', 'knows']
    },
    
    // Pre-configured "Who Does What" analytics
    {
      id: 'who-does-what',
      name: 'Who Does What',
      description: 'Identify expertise and activities of people based on their content and projects',
      type: 'activity',
      category: 'default',
      enabled: true,
      parameters: {
        entityTypes: ['person', 'document', 'project'],
        relationshipTypes: ['created', 'works_on'],
        contentWeights: {
          document: 0.6,
          project: 0.4
        },
        expertiseThreshold: 0.7,
        topicExtraction: {
          method: 'tf-idf',
          minFrequency: 3
        }
      },
      visualizationType: 'heatmap',
      entityTypes: ['person', 'document', 'project'],
      relationships: ['created', 'works_on']
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
  
  // Add a component to the pipeline
  const handleAddToPipeline = (component: AnalyticsComponent) => {
    // Create a unique ID for the new component
    const newId = `pipeline-${component.id}-${Date.now()}`;
    
    setAnalyticsPipeline((currentPipeline) => [
      ...currentPipeline,
      {
        ...component,
        id: newId,
        active: true
      }
    ]);
  };
  
  // Remove a component from the pipeline
  const handleRemoveFromPipeline = (componentId: string) => {
    setAnalyticsPipeline((currentPipeline) => 
      currentPipeline.filter((component) => component.id !== componentId)
    );
  };
  
  // Toggle component active state
  const handleToggleActive = (componentId: string) => {
    setAnalyticsPipeline((currentPipeline) => 
      currentPipeline.map((component) => 
        component.id === componentId 
          ? { ...component, active: !component.active } 
          : component
      )
    );
  };
  
  // Toggle section expanded state
  const handleToggleSection = (section: string) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  };
  
  // Filter components by category
  const filteredComponents = componentFilter 
    ? componentLibrary.filter(component => component.category === componentFilter)
    : componentLibrary;
  
  // Group components by type
  const groupedComponents = filteredComponents.reduce((acc, component) => {
    if (!acc[component.type]) {
      acc[component.type] = [];
    }
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, AnalyticsComponent[]>);
  
  // Navigation handlers
  const handleNext = () => {
    // Navigate to the Query Playground (step 3)
    navigate('/kg/playground');
  };
  
  const handlePrevious = () => {
    // Navigate back to EKG Setup (step 2)
    navigate('/kg/ekg');
  };
  
  // Generate preview of the analytics
  const renderAnalyticsPreview = () => {
    // Check if we have both entity and relationship components that are active
    const hasEntities = analyticsPipeline.some(c => c.type === 'entity' && c.active);
    const hasRelationships = analyticsPipeline.some(c => c.type === 'relationship' && c.active);
    const hasAlgorithms = analyticsPipeline.some(c => c.type === 'algorithm' && c.active);
    const hasVisualizations = analyticsPipeline.some(c => c.type === 'visualization' && c.active);
    
    if (!hasEntities || !hasRelationships) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
          <Lightbulb className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-400 mb-2">Add at least one entity and one relationship to see a preview</p>
          <p className="text-gray-300 text-sm">Drag components from the left panel to build your analytics pipeline</p>
        </div>
      );
    }
    
    // Determine visualization type
    const visualizationComponent = analyticsPipeline.find(c => c.type === 'visualization' && c.active);
    const visualizationType = visualizationComponent?.id.includes('network') 
      ? 'network' 
      : visualizationComponent?.id.includes('heatmap')
      ? 'heatmap'
      : visualizationComponent?.id.includes('matrix')
      ? 'matrix'
      : 'bar';
    
    // Network diagram visualization
    if (visualizationType === 'network') {
      return (
        <div className="w-full h-full">
          <svg width="100%" height="400" viewBox="0 0 800 400">
            {/* Network background */}
            <g transform="translate(400, 200)">
              {/* Main nodes */}
              <circle cx="-120" cy="-80" r="30" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="0" cy="40" r="30" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="140" cy="-60" r="30" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="80" cy="100" r="30" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
              
              {/* Node content */}
              <text x="-120" y="-80" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">P1</text>
              <text x="0" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">P2</text>
              <text x="140" y="-60" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">P3</text>
              <text x="80" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">P4</text>
              
              {/* Document nodes - only shown if there are document entities */}
              {analyticsPipeline.some(c => c.id.includes('document') && c.active) && (
                <>
                  <rect x="-170" y="20" width="40" height="50" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />
                  <rect x="70" y="-130" width="40" height="50" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />
                  <rect x="180" y="40" width="40" height="50" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />
                  
                  <text x="-150" y="45" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">D1</text>
                  <text x="90" y="-105" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">D2</text>
                  <text x="200" y="65" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">D3</text>
                </>
              )}
              
              {/* Project nodes - only shown if there are project entities */}
              {analyticsPipeline.some(c => c.id.includes('project') && c.active) && (
                <>
                  <rect x="-60" y="-140" width="50" height="40" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  <rect x="-180" y="-20" width="50" height="40" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  
                  <text x="-35" y="-120" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">Pr1</text>
                  <text x="-155" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">Pr2</text>
                </>
              )}
              
              {/* Person-to-Person edges */}
              {analyticsPipeline.some(c => (c.id.includes('collaborates') || c.id.includes('knows')) && c.active) && (
                <>
                  <line x1="-120" y1="-80" x2="0" y2="40" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="0" y1="40" x2="140" y2="-60" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="140" y1="-60" x2="80" y2="100" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="-120" y1="-80" x2="140" y2="-60" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                </>
              )}
              
              {/* Person-to-Document edges */}
              {analyticsPipeline.some(c => c.id.includes('created') && c.active) && (
                <>
                  <line x1="-120" y1="-80" x2="-170" y2="20" stroke="#22c55e" strokeWidth="2" />
                  <line x1="140" y1="-60" x2="70" y2="-130" stroke="#22c55e" strokeWidth="2" />
                  <line x1="80" y1="100" x2="180" y2="40" stroke="#22c55e" strokeWidth="2" />
                </>
              )}
              
              {/* Person-to-Project edges */}
              {analyticsPipeline.some(c => c.id.includes('works-on') && c.active) && (
                <>
                  <line x1="-120" y1="-80" x2="-60" y2="-140" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="0" y1="40" x2="-60" y2="-140" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="140" y1="-60" x2="-60" y2="-140" stroke="#f59e0b" strokeWidth="2" />
                  
                  <line x1="-120" y1="-80" x2="-180" y2="-20" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="0" y1="40" x2="-180" y2="-20" stroke="#f59e0b" strokeWidth="2" />
                </>
              )}
              
              {/* Centrality indicators */}
              {analyticsPipeline.some(c => c.id.includes('betweenness') && c.active) && (
                <>
                  <circle cx="-120" cy="-80" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4" />
                  <circle cx="140" cy="-60" r="36" fill="transparent" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4" />
                </>
              )}
              
              {/* Community detection */}
              {analyticsPipeline.some(c => c.id.includes('community') && c.active) && (
                <>
                  <circle cx="-150" cy="-70" r="100" fill="rgba(219, 234, 254, 0.3)" stroke="#93c5fd" strokeWidth="1" strokeDasharray="4" />
                  <circle cx="120" cy="50" r="120" fill="rgba(254, 226, 226, 0.3)" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4" />
                </>
              )}
            </g>
            
            {/* Legend */}
            <g transform="translate(20, 20)">
              <rect x="0" y="0" width="180" height={analyticsPipeline.filter(c => c.active).length * 25 + 30} fill="white" stroke="#e5e7eb" rx="4" />
              <text x="10" y="20" fontSize="12" fontWeight="bold">Analytics Components</text>
              
              {analyticsPipeline.filter(c => c.active).map((component, idx) => (
                <g key={component.id} transform={`translate(10, ${idx * 25 + 40})`}>
                  <rect x="0" y="-10" width="10" height="10" 
                    fill={
                      component.type === 'entity' ? '#3b82f6' : 
                      component.type === 'relationship' ? '#22c55e' :
                      component.type === 'algorithm' ? '#8b5cf6' :
                      component.type === 'visualization' ? '#93c5fd' : 
                      '#6b7280'
                    } 
                  />
                  <text x="20" y="0" fontSize="12">{component.name}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      );
    }
    
    // Heatmap visualization
    if (visualizationType === 'heatmap') {
      return (
        <div className="w-full h-full">
          <svg width="100%" height="400" viewBox="0 0 800 400">
            <g transform="translate(100, 50)">
              {/* Heatmap title */}
              <text x="300" y="0" textAnchor="middle" fontSize="16" fontWeight="bold">
                {analyticsPipeline.some(c => c.id.includes('who-does-what') || c.id.includes('similarity'))
                  ? "Topic Expertise Heatmap"
                  : "Relationship Intensity Heatmap"}
              </text>
              
              {/* Heatmap cells */}
              <g transform="translate(50, 30)">
                {/* Row labels */}
                <text x="-10" y="25" textAnchor="end" fontSize="12">Topic 1</text>
                <text x="-10" y="75" textAnchor="end" fontSize="12">Topic 2</text>
                <text x="-10" y="125" textAnchor="end" fontSize="12">Topic 3</text>
                <text x="-10" y="175" textAnchor="end" fontSize="12">Topic 4</text>
                <text x="-10" y="225" textAnchor="end" fontSize="12">Topic 5</text>
                
                {/* Column labels */}
                <text x="30" y="-10" textAnchor="middle" fontSize="12">Person 1</text>
                <text x="90" y="-10" textAnchor="middle" fontSize="12">Person 2</text>
                <text x="150" y="-10" textAnchor="middle" fontSize="12">Person 3</text>
                <text x="210" y="-10" textAnchor="middle" fontSize="12">Person 4</text>
                <text x="270" y="-10" textAnchor="middle" fontSize="12">Person 5</text>
                <text x="330" y="-10" textAnchor="middle" fontSize="12">Person 6</text>
                <text x="390" y="-10" textAnchor="middle" fontSize="12">Person 7</text>
                <text x="450" y="-10" textAnchor="middle" fontSize="12">Person 8</text>
                <text x="510" y="-10" textAnchor="middle" fontSize="12">Person 9</text>
                
                {/* Row 1 */}
                <rect x="0" y="0" width="60" height="50" fill="#fee2e2" />
                <rect x="60" y="0" width="60" height="50" fill="#fecaca" />
                <rect x="120" y="0" width="60" height="50" fill="#f87171" />
                <rect x="180" y="0" width="60" height="50" fill="#ef4444" />
                <rect x="240" y="0" width="60" height="50" fill="#dc2626" />
                <rect x="300" y="0" width="60" height="50" fill="#f87171" />
                <rect x="360" y="0" width="60" height="50" fill="#fecaca" />
                <rect x="420" y="0" width="60" height="50" fill="#fee2e2" />
                <rect x="480" y="0" width="60" height="50" fill="#fef2f2" />
                
                {/* Row 2 */}
                <rect x="0" y="50" width="60" height="50" fill="#dbeafe" />
                <rect x="60" y="50" width="60" height="50" fill="#bfdbfe" />
                <rect x="120" y="50" width="60" height="50" fill="#60a5fa" />
                <rect x="180" y="50" width="60" height="50" fill="#3b82f6" />
                <rect x="240" y="50" width="60" height="50" fill="#2563eb" />
                <rect x="300" y="50" width="60" height="50" fill="#60a5fa" />
                <rect x="360" y="50" width="60" height="50" fill="#93c5fd" />
                <rect x="420" y="50" width="60" height="50" fill="#bfdbfe" />
                <rect x="480" y="50" width="60" height="50" fill="#dbeafe" />
                
                {/* Row 3 */}
                <rect x="0" y="100" width="60" height="50" fill="#dcfce7" />
                <rect x="60" y="100" width="60" height="50" fill="#bbf7d0" />
                <rect x="120" y="100" width="60" height="50" fill="#4ade80" />
                <rect x="180" y="100" width="60" height="50" fill="#22c55e" />
                <rect x="240" y="100" width="60" height="50" fill="#16a34a" />
                <rect x="300" y="100" width="60" height="50" fill="#22c55e" />
                <rect x="360" y="100" width="60" height="50" fill="#4ade80" />
                <rect x="420" y="100" width="60" height="50" fill="#86efac" />
                <rect x="480" y="100" width="60" height="50" fill="#dcfce7" />
                
                {/* Row 4 */}
                <rect x="0" y="150" width="60" height="50" fill="#fef3c7" />
                <rect x="60" y="150" width="60" height="50" fill="#fde68a" />
                <rect x="120" y="150" width="60" height="50" fill="#fcd34d" />
                <rect x="180" y="150" width="60" height="50" fill="#fbbf24" />
                <rect x="240" y="150" width="60" height="50" fill="#f59e0b" />
                <rect x="300" y="150" width="60" height="50" fill="#fbbf24" />
                <rect x="360" y="150" width="60" height="50" fill="#fcd34d" />
                <rect x="420" y="150" width="60" height="50" fill="#fde68a" />
                <rect x="480" y="150" width="60" height="50" fill="#fef3c7" />
                
                {/* Row 5 */}
                <rect x="0" y="200" width="60" height="50" fill="#f3f4f6" />
                <rect x="60" y="200" width="60" height="50" fill="#e5e7eb" />
                <rect x="120" y="200" width="60" height="50" fill="#d1d5db" />
                <rect x="180" y="200" width="60" height="50" fill="#9ca3af" />
                <rect x="240" y="200" width="60" height="50" fill="#6b7280" />
                <rect x="300" y="200" width="60" height="50" fill="#9ca3af" />
                <rect x="360" y="200" width="60" height="50" fill="#d1d5db" />
                <rect x="420" y="200" width="60" height="50" fill="#e5e7eb" />
                <rect x="480" y="200" width="60" height="50" fill="#f3f4f6" />
              </g>
              
              {/* Legend */}
              <g transform="translate(600, 100)">
                <text x="0" y="0" fontSize="12" fontWeight="bold">Intensity</text>
                <rect x="0" y="10" width="20" height="20" fill="#dc2626" />
                <rect x="0" y="30" width="20" height="20" fill="#ef4444" />
                <rect x="0" y="50" width="20" height="20" fill="#f87171" />
                <rect x="0" y="70" width="20" height="20" fill="#fecaca" />
                <rect x="0" y="90" width="20" height="20" fill="#fee2e2" />
                
                <text x="30" y="25" fontSize="12">Very High</text>
                <text x="30" y="45" fontSize="12">High</text>
                <text x="30" y="65" fontSize="12">Medium</text>
                <text x="30" y="85" fontSize="12">Low</text>
                <text x="30" y="105" fontSize="12">Very Low</text>
              </g>
            </g>
          </svg>
        </div>
      );
    }
    
    // Matrix visualization
    if (visualizationType === 'matrix') {
      return (
        <div className="w-full h-full">
          <svg width="100%" height="400" viewBox="0 0 800 400">
            <g transform="translate(100, 50)">
              {/* Matrix title */}
              <text x="250" y="0" textAnchor="middle" fontSize="16" fontWeight="bold">
                Relationship Matrix
              </text>
              
              <g transform="translate(70, 30)">
                {/* X-axis labels */}
                <text x="20" y="-10" textAnchor="middle" transform="rotate(-45, 20, -10)" fontSize="10">Person 1</text>
                <text x="60" y="-10" textAnchor="middle" transform="rotate(-45, 60, -10)" fontSize="10">Person 2</text>
                <text x="100" y="-10" textAnchor="middle" transform="rotate(-45, 100, -10)" fontSize="10">Person 3</text>
                <text x="140" y="-10" textAnchor="middle" transform="rotate(-45, 140, -10)" fontSize="10">Person 4</text>
                <text x="180" y="-10" textAnchor="middle" transform="rotate(-45, 180, -10)" fontSize="10">Person 5</text>
                <text x="220" y="-10" textAnchor="middle" transform="rotate(-45, 220, -10)" fontSize="10">Person 6</text>
                <text x="260" y="-10" textAnchor="middle" transform="rotate(-45, 260, -10)" fontSize="10">Person 7</text>
                <text x="300" y="-10" textAnchor="middle" transform="rotate(-45, 300, -10)" fontSize="10">Person 8</text>
                <text x="340" y="-10" textAnchor="middle" transform="rotate(-45, 340, -10)" fontSize="10">Person 9</text>
                <text x="380" y="-10" textAnchor="middle" transform="rotate(-45, 380, -10)" fontSize="10">Person 10</text>
                
                {/* Y-axis labels */}
                <text x="-10" y="25" textAnchor="end" fontSize="10">Person 1</text>
                <text x="-10" y="65" textAnchor="end" fontSize="10">Person 2</text>
                <text x="-10" y="105" textAnchor="end" fontSize="10">Person 3</text>
                <text x="-10" y="145" textAnchor="end" fontSize="10">Person 4</text>
                <text x="-10" y="185" textAnchor="end" fontSize="10">Person 5</text>
                <text x="-10" y="225" textAnchor="end" fontSize="10">Person 6</text>
                <text x="-10" y="265" textAnchor="end" fontSize="10">Person 7</text>
                <text x="-10" y="305" textAnchor="end" fontSize="10">Person 8</text>
                
                {/* Matrix cells */}
                <g>
                  {/* Row 1 */}
                  <rect x="0" y="10" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="40" y="10" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="80" y="10" width="40" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                  <rect x="120" y="10" width="40" height="30" fill="#2563eb" stroke="#e5e7eb" />
                  <rect x="160" y="10" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="200" y="10" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="240" y="10" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="280" y="10" width="40" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                  <rect x="320" y="10" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="360" y="10" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  
                  {/* Row 2 */}
                  <rect x="0" y="50" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="40" y="50" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="80" y="50" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="120" y="50" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="160" y="50" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="200" y="50" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="240" y="50" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="280" y="50" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="320" y="50" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="360" y="50" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  
                  {/* Row 3 */}
                  <rect x="0" y="90" width="40" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                  <rect x="40" y="90" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="80" y="90" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="120" y="90" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="160" y="90" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="200" y="90" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="240" y="90" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="280" y="90" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="320" y="90" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="360" y="90" width="40" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                  
                  {/* Remaining rows */}
                  <rect x="0" y="130" width="40" height="30" fill="#2563eb" stroke="#e5e7eb" />
                  <rect x="40" y="130" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="80" y="130" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="120" y="130" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="160" y="130" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="200" y="130" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="240" y="130" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="280" y="130" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="320" y="130" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="360" y="130" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  
                  <rect x="0" y="170" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="40" y="170" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="80" y="170" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="120" y="170" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="160" y="170" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="200" y="170" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="240" y="170" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="280" y="170" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="320" y="170" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="360" y="170" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  
                  <rect x="0" y="210" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="40" y="210" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="80" y="210" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="120" y="210" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="160" y="210" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="200" y="210" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="240" y="210" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="280" y="210" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="320" y="210" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="360" y="210" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  
                  <rect x="0" y="250" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="40" y="250" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="80" y="250" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="120" y="250" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="160" y="250" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="200" y="250" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="240" y="250" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="280" y="250" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="320" y="250" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="360" y="250" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  
                  <rect x="0" y="290" width="40" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                  <rect x="40" y="290" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="80" y="290" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="120" y="290" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="160" y="290" width="40" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                  <rect x="200" y="290" width="40" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                  <rect x="240" y="290" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="280" y="290" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                  <rect x="320" y="290" width="40" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                  <rect x="360" y="290" width="40" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                </g>
              </g>
              
              {/* Legend */}
              <g transform="translate(530, 100)">
                <text x="0" y="0" fontSize="12" fontWeight="bold">Connection Strength</text>
                <rect x="0" y="10" width="20" height="20" fill="#2563eb" />
                <rect x="0" y="35" width="20" height="20" fill="#3b82f6" />
                <rect x="0" y="60" width="20" height="20" fill="#60a5fa" />
                <rect x="0" y="85" width="20" height="20" fill="#93c5fd" />
                <rect x="0" y="110" width="20" height="20" fill="#dbeafe" />
                <rect x="0" y="135" width="20" height="20" fill="#f9fafb" />
                
                <text x="30" y="25" fontSize="12">Very Strong</text>
                <text x="30" y="50" fontSize="12">Strong</text>
                <text x="30" y="75" fontSize="12">Medium</text>
                <text x="30" y="100" fontSize="12">Weak</text>
                <text x="30" y="125" fontSize="12">Very Weak</text>
                <text x="30" y="150" fontSize="12">None</text>
              </g>
            </g>
          </svg>
        </div>
      );
    }
    
    // Default bar chart
    return (
      <div className="w-full h-full">
        <svg width="100%" height="400" viewBox="0 0 800 400">
          <g transform="translate(100, 50)">
            {/* Chart title */}
            <text x="250" y="0" textAnchor="middle" fontSize="16" fontWeight="bold">
              {analyticsPipeline.some(c => c.id.includes('pagerank'))
                ? "Node Importance Ranking"
                : analyticsPipeline.some(c => c.id.includes('betweenness'))
                ? "Centrality Analysis"
                : "Entity Metrics"}
            </text>
            
            {/* X-axis */}
            <line x1="0" y1="300" x2="550" y2="300" stroke="#6b7280" strokeWidth="2" />
            
            {/* Y-axis */}
            <line x1="0" y1="50" x2="0" y2="300" stroke="#6b7280" strokeWidth="2" />
            
            {/* X-axis labels */}
            <text x="40" y="320" textAnchor="middle" fontSize="12">Person 1</text>
            <text x="100" y="320" textAnchor="middle" fontSize="12">Person 2</text>
            <text x="160" y="320" textAnchor="middle" fontSize="12">Person 3</text>
            <text x="220" y="320" textAnchor="middle" fontSize="12">Person 4</text>
            <text x="280" y="320" textAnchor="middle" fontSize="12">Person 5</text>
            <text x="340" y="320" textAnchor="middle" fontSize="12">Person 6</text>
            <text x="400" y="320" textAnchor="middle" fontSize="12">Person 7</text>
            <text x="460" y="320" textAnchor="middle" fontSize="12">Person 8</text>
            <text x="520" y="320" textAnchor="middle" fontSize="12">Person 9</text>
            
            {/* Y-axis labels */}
            <text x="-10" y="300" textAnchor="end" fontSize="12">0</text>
            <text x="-10" y="250" textAnchor="end" fontSize="12">0.2</text>
            <text x="-10" y="200" textAnchor="end" fontSize="12">0.4</text>
            <text x="-10" y="150" textAnchor="end" fontSize="12">0.6</text>
            <text x="-10" y="100" textAnchor="end" fontSize="12">0.8</text>
            <text x="-10" y="50" textAnchor="end" fontSize="12">1.0</text>
            
            {/* Grid lines */}
            <line x1="0" y1="250" x2="550" y2="250" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="200" x2="550" y2="200" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="150" x2="550" y2="150" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="100" x2="550" y2="100" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="50" x2="550" y2="50" stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Bars */}
            <rect x="20" y="90" width="40" height="210" fill="#3b82f6" />
            <rect x="80" y="150" width="40" height="150" fill="#3b82f6" />
            <rect x="140" y="70" width="40" height="230" fill="#3b82f6" />
            <rect x="200" y="170" width="40" height="130" fill="#3b82f6" />
            <rect x="260" y="120" width="40" height="180" fill="#3b82f6" />
            <rect x="320" y="200" width="40" height="100" fill="#3b82f6" />
            <rect x="380" y="180" width="40" height="120" fill="#3b82f6" />
            <rect x="440" y="230" width="40" height="70" fill="#3b82f6" />
            <rect x="500" y="250" width="40" height="50" fill="#3b82f6" />
            
            {/* Centrality indicators */}
            {analyticsPipeline.some(c => c.id.includes('betweenness') && c.active) && (
              <>
                <rect x="20" y="90" width="40" height="210" fill="#8b5cf6" />
                <rect x="140" y="70" width="40" height="230" fill="#8b5cf6" />
              </>
            )}
            
            {/* PageRank indicators */}
            {analyticsPipeline.some(c => c.id.includes('pagerank') && c.active) && (
              <>
                <line x1="20" y1="90" x2="60" y2="90" stroke="#f59e0b" strokeWidth="3" />
                <line x1="140" y1="70" x2="180" y2="70" stroke="#f59e0b" strokeWidth="3" />
                <line x1="260" y1="120" x2="300" y2="120" stroke="#f59e0b" strokeWidth="3" />
              </>
            )}
          </g>
        </svg>
      </div>
    );
  };
  
  // Configuration panel content
  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Analytics Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure analytics to extract insights from your knowledge graph. Two pre-configured analytics are enabled by default.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Drag & Drop Builder</h3>
        <p className="text-sm text-gray-600">
          Drag components from the component library into the analytics pipeline to build your custom analytics workflow.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Component Types</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="mt-0.5 h-3 w-3 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-xs font-medium">Entities</p>
              <p className="text-xs text-gray-600">People, documents, projects</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="mt-0.5 h-3 w-3 rounded-full bg-green-500"></div>
            <div>
              <p className="text-xs font-medium">Relationships</p>
              <p className="text-xs text-gray-600">Connects entities together</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="mt-0.5 h-3 w-3 rounded-full bg-purple-500"></div>
            <div>
              <p className="text-xs font-medium">Algorithms</p>
              <p className="text-xs text-gray-600">Analysis methods</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="mt-0.5 h-3 w-3 rounded-full bg-gray-500"></div>
            <div>
              <p className="text-xs font-medium">Visualizations</p>
              <p className="text-xs text-gray-600">Display methods</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Default Analytics</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <UserCog className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Who Knows Who</p>
              <p className="text-xs text-gray-600">
                Analyzes person-to-person connections
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Workflow className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Who Does What</p>
              <p className="text-xs text-gray-600">
                Identifies expertise and activities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <KnowledgeGraphLayout
      title="Graph Analytics Configuration"
      rightPanelContent={rightPanelContent}
      currentStep={3}
      totalSteps={4}  // 4 steps: Template, Setup, Playground, Share
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Configure Knowledge Graph Analytics</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Build your analytics workflow by dragging and dropping components into the pipeline.
                </p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Analytics Preview Playground - Center Stage */}
              <div className="mb-8">
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
                
                <Card className="bg-blue-50 border-blue-200 mt-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <Network className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-blue-800 mb-2">Analytics Insights</h3>
                        <p className="text-sm text-blue-700 mb-4">
                          Your analytics configuration will enable these insights:
                        </p>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
                          {analyticsPipeline.some(c => (c.id.includes('collaborates') || c.id.includes('knows')) && c.active) && (
                            <li>Identification of key relationships and collaboration patterns between people</li>
                          )}
                          {analyticsPipeline.some(c => c.id.includes('created') && c.active) && (
                            <li>Expertise mapping showing who specializes in which topics and activities</li>
                          )}
                          {analyticsPipeline.some(c => (c.id.includes('betweenness') || c.id.includes('pagerank')) && c.active) && (
                            <li>Identification of key influencers and central nodes in your knowledge graph</li>
                          )}
                          {analyticsPipeline.some(c => c.id.includes('community') && c.active) && (
                            <li>Discovery of natural communities and clusters of related entities</li>
                          )}
                          {analyticsPipeline.some(c => c.id.includes('similarity') && c.active) && (
                            <li>Similarity and relevance analysis between content and people</li>
                          )}
                          {!analyticsPipeline.some(c => c.active) && (
                            <li>No analytics currently enabled. Select at least one to generate insights.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs for Builder Interface - Below Playground */}
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="builder" className="flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Analytics Builder
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Configuration
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="builder" className="pt-4">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Component Library - Left Side */}
                  <div className="lg:w-1/3 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Component Library</CardTitle>
                        <CardDescription>
                          Drag components from here to build your analytics
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Filter buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant={componentFilter === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComponentFilter(null)}
                            className="text-xs h-8"
                          >
                            All
                          </Button>
                          <Button 
                            variant={componentFilter === 'entity' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComponentFilter('entity')}
                            className="text-xs h-8"
                          >
                            Entities
                          </Button>
                          <Button 
                            variant={componentFilter === 'relationship' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComponentFilter('relationship')}
                            className="text-xs h-8"
                          >
                            Relationships
                          </Button>
                          <Button 
                            variant={componentFilter === 'algorithm' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComponentFilter('algorithm')}
                            className="text-xs h-8"
                          >
                            Algorithms
                          </Button>
                          <Button 
                            variant={componentFilter === 'visualization' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComponentFilter('visualization')}
                            className="text-xs h-8"
                          >
                            Visualizations
                          </Button>
                        </div>
                        
                        {/* Entity components */}
                        {groupedComponents['entity'] && (
                          <div className="mt-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => handleToggleSection('entity')}
                            >
                              <h3 className="text-md font-medium mb-2 flex items-center">
                                <Users className="h-4 w-4 text-blue-500 mr-2" />
                                Entities
                              </h3>
                              {expandedSections['entity'] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            
                            {expandedSections['entity'] && (
                              <div className="space-y-2 mt-2">
                                {groupedComponents['entity'].map(component => (
                                  <ComponentLibraryItem 
                                    key={component.id}
                                    component={component}
                                    onAddToPipeline={handleAddToPipeline}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Relationship components */}
                        {groupedComponents['relationship'] && (
                          <div className="mt-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => handleToggleSection('relationship')}
                            >
                              <h3 className="text-md font-medium mb-2 flex items-center">
                                <Network className="h-4 w-4 text-green-500 mr-2" />
                                Relationships
                              </h3>
                              {expandedSections['relationship'] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            
                            {expandedSections['relationship'] && (
                              <div className="space-y-2 mt-2">
                                {groupedComponents['relationship'].map(component => (
                                  <ComponentLibraryItem 
                                    key={component.id}
                                    component={component}
                                    onAddToPipeline={handleAddToPipeline}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Algorithm components */}
                        {groupedComponents['algorithm'] && (
                          <div className="mt-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => handleToggleSection('algorithm')}
                            >
                              <h3 className="text-md font-medium mb-2 flex items-center">
                                <Zap className="h-4 w-4 text-purple-500 mr-2" />
                                Algorithms
                              </h3>
                              {expandedSections['algorithm'] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            
                            {expandedSections['algorithm'] && (
                              <div className="space-y-2 mt-2">
                                {groupedComponents['algorithm'].map(component => (
                                  <ComponentLibraryItem 
                                    key={component.id}
                                    component={component}
                                    onAddToPipeline={handleAddToPipeline}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Visualization components */}
                        {groupedComponents['visualization'] && (
                          <div className="mt-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => handleToggleSection('visualization')}
                            >
                              <h3 className="text-md font-medium mb-2 flex items-center">
                                <BarChart3 className="h-4 w-4 text-gray-500 mr-2" />
                                Visualizations
                              </h3>
                              {expandedSections['visualization'] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            
                            {expandedSections['visualization'] && (
                              <div className="space-y-2 mt-2">
                                {groupedComponents['visualization'].map(component => (
                                  <ComponentLibraryItem 
                                    key={component.id}
                                    component={component}
                                    onAddToPipeline={handleAddToPipeline}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Analytics Pipeline - Right Side */}
                  <div className="lg:w-2/3 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Analytics Pipeline</CardTitle>
                        <CardDescription>
                          Arrange and configure your analytics components
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="border-2 border-dashed border-gray-200 rounded-md p-4 min-h-[400px]">
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
                                      .filter(c => c.id.includes('pipeline-person-1') || c.id.includes('pipeline-collaborates') || c.id.includes('pipeline-knows') || c.id.includes('pipeline-pagerank') || c.id.includes('pipeline-network-1'))
                                      .map(component => (
                                        <SortableItem key={component.id} id={component.id}>
                                          <PipelineComponentItem
                                            component={component}
                                            onRemove={() => handleRemoveFromPipeline(component.id)}
                                            isActive={component.active}
                                            onToggleActive={() => handleToggleActive(component.id)}
                                          />
                                        </SortableItem>
                                      ))
                                    }
                                  </div>
                                  
                                  {/* "Who Does What" section */}
                                  <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                      <Badge className="mr-2">Default</Badge>
                                      <h3 className="font-medium">Who Does What</h3>
                                    </div>
                                    {analyticsPipeline
                                      .filter(c => c.id.includes('pipeline-person-2') || c.id.includes('pipeline-document') || c.id.includes('pipeline-created') || c.id.includes('pipeline-similarity') || c.id.includes('pipeline-heatmap'))
                                      .map(component => (
                                        <SortableItem key={component.id} id={component.id}>
                                          <PipelineComponentItem
                                            component={component}
                                            onRemove={() => handleRemoveFromPipeline(component.id)}
                                            isActive={component.active}
                                            onToggleActive={() => handleToggleActive(component.id)}
                                          />
                                        </SortableItem>
                                      ))
                                    }
                                  </div>
                                  
                                  {/* Custom components section */}
                                  {analyticsPipeline.filter(c => 
                                    !c.id.includes('pipeline-person-1') && 
                                    !c.id.includes('pipeline-collaborates') && 
                                    !c.id.includes('pipeline-knows') && 
                                    !c.id.includes('pipeline-pagerank') && 
                                    !c.id.includes('pipeline-network-1') &&
                                    !c.id.includes('pipeline-person-2') && 
                                    !c.id.includes('pipeline-document') && 
                                    !c.id.includes('pipeline-created') && 
                                    !c.id.includes('pipeline-similarity') && 
                                    !c.id.includes('pipeline-heatmap')
                                  ).length > 0 && (
                                    <div>
                                      <div className="flex items-center mb-2">
                                        <Badge className="mr-2 bg-gray-100 text-gray-800">Custom</Badge>
                                        <h3 className="font-medium">Custom Analytics</h3>
                                      </div>
                                      {analyticsPipeline
                                        .filter(c => 
                                          !c.id.includes('pipeline-person-1') && 
                                          !c.id.includes('pipeline-collaborates') && 
                                          !c.id.includes('pipeline-knows') && 
                                          !c.id.includes('pipeline-pagerank') && 
                                          !c.id.includes('pipeline-network-1') &&
                                          !c.id.includes('pipeline-person-2') && 
                                          !c.id.includes('pipeline-document') && 
                                          !c.id.includes('pipeline-created') && 
                                          !c.id.includes('pipeline-similarity') && 
                                          !c.id.includes('pipeline-heatmap')
                                        )
                                        .map(component => (
                                          <SortableItem key={component.id} id={component.id}>
                                            <PipelineComponentItem
                                              component={component}
                                              onRemove={() => handleRemoveFromPipeline(component.id)}
                                              isActive={component.active}
                                              onToggleActive={() => handleToggleActive(component.id)}
                                            />
                                          </SortableItem>
                                        ))
                                      }
                                    </div>
                                  )}
                                </div>
                              )}
                            </SortableContext>
                            
                            <DragOverlay>
                              {activeComponentId ? (
                                <div className="border rounded-md p-3 bg-blue-50 border-blue-200 shadow-md">
                                  {analyticsPipeline.find(item => item.id === activeComponentId)?.name}
                                </div>
                              ) : null}
                            </DragOverlay>
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
                        <h3 className="text-md font-medium mb-4">Global Analytics Settings</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Threshold Settings</h4>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label htmlFor="min-weight" className="text-xs">
                                  Minimum Relationship Weight
                                </Label>
                                <span className="text-xs font-medium">0.3</span>
                              </div>
                              <Slider
                                id="min-weight"
                                min={0}
                                max={1}
                                step={0.1}
                                value={[0.3]}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label htmlFor="expertise-threshold" className="text-xs">
                                  Expertise Threshold
                                </Label>
                                <span className="text-xs font-medium">0.7</span>
                              </div>
                              <Slider
                                id="expertise-threshold"
                                min={0}
                                max={1}
                                step={0.1}
                                value={[0.7]}
                                className="w-full"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Time Decay Settings</h4>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="time-decay-toggle" className="text-xs">
                                Enable Time Decay
                              </Label>
                              <Switch
                                id="time-decay-toggle"
                                checked={true}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="half-life" className="text-xs">
                                Half-life (days)
                              </Label>
                              <Input
                                id="half-life"
                                type="number"
                                value="90"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* More advanced options */}
                      <div className="bg-gray-50 rounded-md p-4">
                        <h3 className="text-md font-medium mb-4">Visualization Settings</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Network Diagram Settings</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="layout-algorithm" className="text-xs">
                                Layout Algorithm
                              </Label>
                              <Select defaultValue="force-directed">
                                <SelectTrigger id="layout-algorithm" className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="force-directed" className="text-xs">Force-directed</SelectItem>
                                  <SelectItem value="circular" className="text-xs">Circular</SelectItem>
                                  <SelectItem value="hierarchical" className="text-xs">Hierarchical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="node-size" className="text-xs">
                                Node Size Based On
                              </Label>
                              <Select defaultValue="degree">
                                <SelectTrigger id="node-size" className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="degree" className="text-xs">Connection Degree</SelectItem>
                                  <SelectItem value="centrality" className="text-xs">Centrality</SelectItem>
                                  <SelectItem value="equal" className="text-xs">Equal Size</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Color & Styling</h4>
                            
                            <div className="space-y-2">
                              <Label htmlFor="color-scheme" className="text-xs">
                                Color Scheme
                              </Label>
                              <Select defaultValue="blue-to-red">
                                <SelectTrigger id="color-scheme" className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="blue-to-red" className="text-xs">Blue to Red</SelectItem>
                                  <SelectItem value="green-to-purple" className="text-xs">Green to Purple</SelectItem>
                                  <SelectItem value="categorical" className="text-xs">Categorical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="show-labels" className="text-xs">
                                Show Node Labels
                              </Label>
                              <Switch
                                id="show-labels"
                                checked={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default AnalyticsConfiguration;