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
  Workflow
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

const AnalyticsConfiguration: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('analytics');
  
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
  
  // Analytics categories
  const [categories] = useState<AnalyticsCategory[]>([
    { 
      id: 'relationship', 
      name: 'Relationship Analysis', 
      description: 'Analyze connections between entities'
    },
    { 
      id: 'activity', 
      name: 'Activity Analysis', 
      description: 'Analyze actions and behaviors' 
    },
    { 
      id: 'structure', 
      name: 'Graph Structure Analysis', 
      description: 'Analyze the overall structure of the graph' 
    }
  ]);
  
  // Analytics configurations
  const [analytics, setAnalytics] = useState<AnalyticsConfig[]>([
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
    },
    
    // Additional example analytics
    {
      id: 'centrality-analysis',
      name: 'Centrality Analysis',
      description: 'Identify central and influential nodes in the network',
      type: 'centrality',
      category: 'custom',
      enabled: false,
      parameters: {
        algorithm: 'betweenness',
        normalization: true,
        directedGraph: true
      },
      visualizationType: 'network',
      entityTypes: ['person', 'document', 'project'],
      relationships: ['collaborates', 'knows', 'created', 'works_on']
    },
    
    {
      id: 'community-detection',
      name: 'Community Detection',
      description: 'Identify groups and communities within the network',
      type: 'clustering',
      category: 'custom',
      enabled: false,
      parameters: {
        algorithm: 'louvain',
        resolution: 1.0,
        includeEntityTypes: ['person']
      },
      visualizationType: 'network',
      entityTypes: ['person'],
      relationships: ['collaborates', 'knows']
    }
  ]);
  
  // Handle toggle analytics
  const handleToggleAnalytics = (id: string) => {
    setAnalytics(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };
  
  // Handle parameter change
  const handleParameterChange = (analyticId: string, paramPath: string, value: any) => {
    setAnalytics(prev => prev.map(analytic => {
      if (analytic.id !== analyticId) return analytic;
      
      // Modify deeply nested parameters using path like "weightFactors.frequency"
      const newParameters = { ...analytic.parameters };
      const pathParts = paramPath.split('.');
      
      let current: any = newParameters;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;
      
      return {
        ...analytic,
        parameters: newParameters
      };
    }));
  };
  
  // Handle changing visualization type
  const handleChangeVisualization = (analyticId: string, visualizationType: 'network' | 'matrix' | 'heatmap' | 'bar' | 'line' | 'pie') => {
    setAnalytics(prev => prev.map(analytic => 
      analytic.id === analyticId ? { ...analytic, visualizationType } : analytic
    ));
  };
  
  // Navigation handlers
  const handleNext = () => {
    navigate('/kg/mapping');
  };
  
  const handlePrevious = () => {
    navigate('/kg/edge');
  };
  
  // Render parameter controls based on parameter type
  const renderParameterControl = (
    analytic: AnalyticsConfig,
    paramPath: string,
    label: string,
    controlType: 'slider' | 'switch' | 'select' | 'input',
    options?: { value: string; label: string }[]
  ) => {
    // Get current value from nested path
    const getValue = (obj: any, path: string) => {
      const pathParts = path.split('.');
      let current = obj;
      for (const part of pathParts) {
        if (current === undefined) return undefined;
        current = current[part];
      }
      return current;
    };
    
    const value = getValue(analytic.parameters, paramPath);
    
    switch (controlType) {
      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`${analytic.id}-${paramPath}`} className="text-xs">
                {label}
              </Label>
              <span className="text-xs font-medium">{value}</span>
            </div>
            <Slider
              id={`${analytic.id}-${paramPath}`}
              min={0}
              max={1}
              step={0.1}
              value={[value]}
              onValueChange={([newValue]) => handleParameterChange(analytic.id, paramPath, newValue)}
            />
          </div>
        );
        
      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={`${analytic.id}-${paramPath}`} className="text-xs">
              {label}
            </Label>
            <Switch
              id={`${analytic.id}-${paramPath}`}
              checked={value}
              onCheckedChange={(checked) => handleParameterChange(analytic.id, paramPath, checked)}
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={`${analytic.id}-${paramPath}`} className="text-xs">
              {label}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleParameterChange(analytic.id, paramPath, newValue)}
            >
              <SelectTrigger id={`${analytic.id}-${paramPath}`} className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options?.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'input':
        return (
          <div className="space-y-2">
            <Label htmlFor={`${analytic.id}-${paramPath}`} className="text-xs">
              {label}
            </Label>
            <Input
              id={`${analytic.id}-${paramPath}`}
              type="number"
              value={value}
              onChange={(e) => {
                const newValue = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                handleParameterChange(analytic.id, paramPath, newValue);
              }}
              className="h-8 text-xs"
            />
          </div>
        );
    }
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
        <h3 className="text-sm font-medium mb-2">Default Analytics</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <UserCog className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Who Knows Who</p>
              <p className="text-xs text-gray-600">
                Analyzes person-to-person connections and relationship strengths
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Workflow className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Who Does What</p>
              <p className="text-xs text-gray-600">
                Identifies expertise and activities based on content relationships
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Parameter Settings</h3>
        <p className="text-sm text-gray-600">
          Adjust weight factors, thresholds, and visualization options in the main panel to customize the analytics.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Visualization Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {visualizationOptions.map(option => (
            <div key={option.id} className="flex items-center space-x-1 text-xs">
              {option.icon}
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Sample visualizations for each analysis type
  const renderVisualizationPreview = (analytic: AnalyticsConfig) => {
    return (
      <div className="relative bg-gray-50 border rounded-md p-4 min-h-[200px] flex items-center justify-center">
        {!analytic.enabled ? (
          <div className="text-center text-gray-400">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Enable this analytics to see a preview</p>
          </div>
        ) : analytic.visualizationType === 'network' ? (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 300 200">
              {/* Simplified network visualization */}
              <g transform="translate(150, 100)">
                {/* Nodes */}
                <circle cx="-60" cy="-40" r="15" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="0" cy="20" r="15" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="70" cy="-30" r="15" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="40" cy="50" r="15" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
                
                {/* Node content */}
                <text x="-60" y="-40" textAnchor="middle" dominantBaseline="middle" fontSize="10">P1</text>
                <text x="0" y="20" textAnchor="middle" dominantBaseline="middle" fontSize="10">P2</text>
                <text x="70" y="-30" textAnchor="middle" dominantBaseline="middle" fontSize="10">P3</text>
                <text x="40" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="10">P4</text>
                
                {/* Edges */}
                <line x1="-60" y1="-40" x2="0" y2="20" stroke="#3b82f6" strokeWidth="2" />
                <line x1="0" y1="20" x2="70" y2="-30" stroke="#3b82f6" strokeWidth="2" />
                <line x1="70" y1="-30" x2="40" y2="50" stroke="#3b82f6" strokeWidth="2" />
                <line x1="-60" y1="-40" x2="70" y2="-30" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
              </g>
            </svg>
          </div>
        ) : analytic.visualizationType === 'heatmap' ? (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 300 200">
              <g transform="translate(50, 30)">
                {/* Heatmap cells */}
                <rect x="0" y="0" width="40" height="30" fill="#fee2e2" />
                <rect x="40" y="0" width="40" height="30" fill="#fecaca" />
                <rect x="80" y="0" width="40" height="30" fill="#f87171" />
                <rect x="120" y="0" width="40" height="30" fill="#ef4444" />
                <rect x="160" y="0" width="40" height="30" fill="#b91c1c" />
                
                <rect x="0" y="30" width="40" height="30" fill="#dbeafe" />
                <rect x="40" y="30" width="40" height="30" fill="#bfdbfe" />
                <rect x="80" y="30" width="40" height="30" fill="#60a5fa" />
                <rect x="120" y="30" width="40" height="30" fill="#3b82f6" />
                <rect x="160" y="30" width="40" height="30" fill="#1d4ed8" />
                
                <rect x="0" y="60" width="40" height="30" fill="#dcfce7" />
                <rect x="40" y="60" width="40" height="30" fill="#bbf7d0" />
                <rect x="80" y="60" width="40" height="30" fill="#4ade80" />
                <rect x="120" y="60" width="40" height="30" fill="#22c55e" />
                <rect x="160" y="60" width="40" height="30" fill="#15803d" />
                
                <rect x="0" y="90" width="40" height="30" fill="#f3f4f6" />
                <rect x="40" y="90" width="40" height="30" fill="#e5e7eb" />
                <rect x="80" y="90" width="40" height="30" fill="#d1d5db" />
                <rect x="120" y="90" width="40" height="30" fill="#9ca3af" />
                <rect x="160" y="90" width="40" height="30" fill="#6b7280" />
                
                {/* Axis labels */}
                <text x="-5" y="15" textAnchor="end" fontSize="8">Topic 1</text>
                <text x="-5" y="45" textAnchor="end" fontSize="8">Topic 2</text>
                <text x="-5" y="75" textAnchor="end" fontSize="8">Topic 3</text>
                <text x="-5" y="105" textAnchor="end" fontSize="8">Topic 4</text>
                
                <text x="20" y="135" textAnchor="middle" fontSize="8">Person 1</text>
                <text x="60" y="135" textAnchor="middle" fontSize="8">Person 2</text>
                <text x="100" y="135" textAnchor="middle" fontSize="8">Person 3</text>
                <text x="140" y="135" textAnchor="middle" fontSize="8">Person 4</text>
                <text x="180" y="135" textAnchor="middle" fontSize="8">Person 5</text>
              </g>
            </svg>
          </div>
        ) : analytic.visualizationType === 'matrix' ? (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 300 200">
              <g transform="translate(70, 30)">
                {/* Matrix cells */}
                <rect x="0" y="0" width="30" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                <rect x="30" y="0" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                <rect x="60" y="0" width="30" height="30" fill="#bfdbfe" stroke="#e5e7eb" />
                <rect x="90" y="0" width="30" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                <rect x="120" y="0" width="30" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                
                <rect x="0" y="30" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                <rect x="30" y="30" width="30" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                <rect x="60" y="30" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                <rect x="90" y="30" width="30" height="30" fill="#bfdbfe" stroke="#e5e7eb" />
                <rect x="120" y="30" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                
                <rect x="0" y="60" width="30" height="30" fill="#bfdbfe" stroke="#e5e7eb" />
                <rect x="30" y="60" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                <rect x="60" y="60" width="30" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                <rect x="90" y="60" width="30" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                <rect x="120" y="60" width="30" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                
                <rect x="0" y="90" width="30" height="30" fill="#93c5fd" stroke="#e5e7eb" />
                <rect x="30" y="90" width="30" height="30" fill="#bfdbfe" stroke="#e5e7eb" />
                <rect x="60" y="90" width="30" height="30" fill="#3b82f6" stroke="#e5e7eb" />
                <rect x="90" y="90" width="30" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                <rect x="120" y="90" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                
                <rect x="0" y="120" width="30" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                <rect x="30" y="120" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                <rect x="60" y="120" width="30" height="30" fill="#60a5fa" stroke="#e5e7eb" />
                <rect x="90" y="120" width="30" height="30" fill="#dbeafe" stroke="#e5e7eb" />
                <rect x="120" y="120" width="30" height="30" fill="#f9fafb" stroke="#e5e7eb" />
                
                {/* Axis labels */}
                <text x="-5" y="15" textAnchor="end" fontSize="8">P1</text>
                <text x="-5" y="45" textAnchor="end" fontSize="8">P2</text>
                <text x="-5" y="75" textAnchor="end" fontSize="8">P3</text>
                <text x="-5" y="105" textAnchor="end" fontSize="8">P4</text>
                <text x="-5" y="135" textAnchor="end" fontSize="8">P5</text>
                
                <text x="15" y="-5" textAnchor="middle" fontSize="8">P1</text>
                <text x="45" y="-5" textAnchor="middle" fontSize="8">P2</text>
                <text x="75" y="-5" textAnchor="middle" fontSize="8">P3</text>
                <text x="105" y="-5" textAnchor="middle" fontSize="8">P4</text>
                <text x="135" y="-5" textAnchor="middle" fontSize="8">P5</text>
              </g>
            </svg>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 300 200">
              <g transform="translate(50, 20)">
                {/* Bar chart */}
                <rect x="10" y="20" width="30" height="60" fill="#3b82f6" />
                <rect x="50" y="40" width="30" height="40" fill="#3b82f6" />
                <rect x="90" y="10" width="30" height="70" fill="#3b82f6" />
                <rect x="130" y="50" width="30" height="30" fill="#3b82f6" />
                <rect x="170" y="30" width="30" height="50" fill="#3b82f6" />
                
                {/* X axis */}
                <line x1="0" y1="80" x2="210" y2="80" stroke="#6b7280" strokeWidth="1" />
                
                {/* Y axis */}
                <line x1="0" y1="0" x2="0" y2="80" stroke="#6b7280" strokeWidth="1" />
                
                {/* X labels */}
                <text x="25" y="95" textAnchor="middle" fontSize="8">P1</text>
                <text x="65" y="95" textAnchor="middle" fontSize="8">P2</text>
                <text x="105" y="95" textAnchor="middle" fontSize="8">P3</text>
                <text x="145" y="95" textAnchor="middle" fontSize="8">P4</text>
                <text x="185" y="95" textAnchor="middle" fontSize="8">P5</text>
                
                {/* Y labels */}
                <text x="-5" y="80" textAnchor="end" fontSize="8">0</text>
                <text x="-5" y="60" textAnchor="end" fontSize="8">20</text>
                <text x="-5" y="40" textAnchor="end" fontSize="8">40</text>
                <text x="-5" y="20" textAnchor="end" fontSize="8">60</text>
                <text x="-5" y="0" textAnchor="end" fontSize="8">80</text>
              </g>
            </svg>
          </div>
        )}
        
        <div className="absolute bottom-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                  <Settings className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Customize visualization</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };
  
  // Render parameter editing UI for specific analytics types
  const renderAnalyticParameters = (analytic: AnalyticsConfig) => {
    if (!analytic.enabled) return null;
    
    switch (analytic.type) {
      case 'relationship':
        return (
          <div className="space-y-4 mt-4">
            <h4 className="text-sm font-medium">Relationship Parameters</h4>
            
            <div className="space-y-4 bg-gray-50 p-3 rounded-md">
              <h5 className="text-xs font-medium text-gray-700">Weight Factors</h5>
              {renderParameterControl(analytic, 'weightFactors.frequency', 'Interaction Frequency', 'slider')}
              {renderParameterControl(analytic, 'weightFactors.duration', 'Relationship Duration', 'slider')}
              {renderParameterControl(analytic, 'weightFactors.recency', 'Recency Factor', 'slider')}
            </div>
            
            <div className="space-y-4 bg-gray-50 p-3 rounded-md">
              <h5 className="text-xs font-medium text-gray-700">Time Decay</h5>
              {renderParameterControl(analytic, 'timeDecay.enabled', 'Enable Time Decay', 'switch')}
              {analytic.parameters.timeDecay?.enabled && 
                renderParameterControl(analytic, 'timeDecay.halfLife', 'Half-life (days)', 'input')
              }
            </div>
            
            <div className="space-y-4 bg-gray-50 p-3 rounded-md">
              <h5 className="text-xs font-medium text-gray-700">Threshold Settings</h5>
              {renderParameterControl(analytic, 'thresholds.minWeight', 'Minimum Relationship Weight', 'slider')}
              {renderParameterControl(analytic, 'thresholds.minInteractions', 'Minimum Interactions', 'input')}
            </div>
          </div>
        );
        
      case 'activity':
        return (
          <div className="space-y-4 mt-4">
            <h4 className="text-sm font-medium">Activity Parameters</h4>
            
            <div className="space-y-4 bg-gray-50 p-3 rounded-md">
              <h5 className="text-xs font-medium text-gray-700">Content Type Weights</h5>
              {renderParameterControl(analytic, 'contentWeights.document', 'Document Weight', 'slider')}
              {renderParameterControl(analytic, 'contentWeights.project', 'Project Weight', 'slider')}
            </div>
            
            <div className="space-y-4 bg-gray-50 p-3 rounded-md">
              <h5 className="text-xs font-medium text-gray-700">Expertise Settings</h5>
              {renderParameterControl(analytic, 'expertiseThreshold', 'Expertise Threshold', 'slider')}
              {renderParameterControl(
                analytic, 
                'topicExtraction.method', 
                'Topic Extraction Method', 
                'select',
                [
                  { value: 'tf-idf', label: 'TF-IDF' },
                  { value: 'bert', label: 'BERT Embeddings' },
                  { value: 'lda', label: 'LDA Topic Modeling' }
                ]
              )}
              {renderParameterControl(analytic, 'topicExtraction.minFrequency', 'Min. Topic Frequency', 'input')}
            </div>
          </div>
        );
        
      case 'centrality':
      case 'pathfinding':
      case 'clustering':
      case 'ranking':
        return (
          <div className="space-y-4 mt-4">
            <h4 className="text-sm font-medium">Algorithm Parameters</h4>
            
            <div className="space-y-4 bg-gray-50 p-3 rounded-md">
              <h5 className="text-xs font-medium text-gray-700">Algorithm Settings</h5>
              {renderParameterControl(
                analytic, 
                'algorithm', 
                'Algorithm', 
                'select',
                analytic.type === 'centrality' 
                  ? [
                      { value: 'betweenness', label: 'Betweenness' },
                      { value: 'eigenvector', label: 'Eigenvector' },
                      { value: 'pagerank', label: 'PageRank' }
                    ]
                  : analytic.type === 'clustering'
                  ? [
                      { value: 'louvain', label: 'Louvain' },
                      { value: 'label-propagation', label: 'Label Propagation' },
                      { value: 'k-means', label: 'K-Means' }
                    ]
                  : [
                      { value: 'dijkstra', label: 'Dijkstra' },
                      { value: 'a-star', label: 'A* Search' },
                      { value: 'bellman-ford', label: 'Bellman-Ford' }
                    ]
              )}
              {analytic.type === 'centrality' && renderParameterControl(analytic, 'normalization', 'Normalize Results', 'switch')}
              {analytic.type === 'centrality' && renderParameterControl(analytic, 'directedGraph', 'Treat as Directed Graph', 'switch')}
              {analytic.type === 'clustering' && renderParameterControl(analytic, 'resolution', 'Resolution Parameter', 'slider')}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">No parameters available for this analytics type.</p>
          </div>
        );
    }
  };
  
  // Render visualization selector
  const renderVisualizationSelector = (analytic: AnalyticsConfig) => {
    if (!analytic.enabled) return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Visualization Type</h4>
        <div className="grid grid-cols-5 gap-2">
          {visualizationOptions.map(option => (
            <Button
              key={option.id}
              variant={analytic.visualizationType === option.type ? "default" : "outline"}
              size="sm"
              className="h-10 flex flex-col items-center justify-center px-1 py-1"
              onClick={() => handleChangeVisualization(analytic.id, option.type)}
            >
              <div className="mb-1">{option.icon}</div>
              <span className="text-[10px] font-normal">{option.name}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <KnowledgeGraphLayout
      title="Graph Analytics Configuration"
      rightPanelContent={rightPanelContent}
      currentStep={4}
      totalSteps={7}
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
                  Select and configure analytics to extract insights from your knowledge graph. Pre-configured options are enabled by default.
                </p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="analytics" className="flex items-center">
                  <Network className="h-4 w-4 mr-2" />
                  Analytics Selection
                </TabsTrigger>
                <TabsTrigger value="visualization" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visualization Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="pt-4">
                <div className="space-y-6">
                  {/* Default analytics section */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Default</Badge>
                      <h3 className="text-base font-medium">Pre-configured Analytics</h3>
                    </div>
                    
                    {analytics
                      .filter(analytic => analytic.category === 'default')
                      .map(analytic => (
                        <Card key={analytic.id} className="mb-4 border-l-4 border-l-blue-500 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <Checkbox 
                                  id={`analytics-${analytic.id}`}
                                  checked={analytic.enabled}
                                  onCheckedChange={() => handleToggleAnalytics(analytic.id)}
                                  className="mr-3"
                                />
                                <div>
                                  <Label 
                                    htmlFor={`analytics-${analytic.id}`} 
                                    className="text-base font-medium cursor-pointer"
                                  >
                                    {analytic.name}
                                  </Label>
                                  <p className="text-sm text-gray-600">{analytic.description}</p>
                                </div>
                              </div>
                              <Badge variant={analytic.enabled ? "default" : "outline"}>
                                {analytic.type}
                              </Badge>
                            </div>
                            
                            {renderVisualizationPreview(analytic)}
                            {renderVisualizationSelector(analytic)}
                            {renderAnalyticParameters(analytic)}
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                  
                  {/* Additional analytics section */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Badge className="mr-2 bg-gray-100 text-gray-800 hover:bg-gray-100">Additional</Badge>
                      <h3 className="text-base font-medium">Optional Analytics</h3>
                    </div>
                    
                    {analytics
                      .filter(analytic => analytic.category === 'custom')
                      .map(analytic => (
                        <Card key={analytic.id} className="mb-4 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <Checkbox 
                                  id={`analytics-${analytic.id}`}
                                  checked={analytic.enabled}
                                  onCheckedChange={() => handleToggleAnalytics(analytic.id)}
                                  className="mr-3"
                                />
                                <div>
                                  <Label 
                                    htmlFor={`analytics-${analytic.id}`} 
                                    className="text-base font-medium cursor-pointer"
                                  >
                                    {analytic.name}
                                  </Label>
                                  <p className="text-sm text-gray-600">{analytic.description}</p>
                                </div>
                              </div>
                              <Badge variant={analytic.enabled ? "default" : "outline"}>
                                {analytic.type}
                              </Badge>
                            </div>
                            
                            {renderVisualizationPreview(analytic)}
                            {renderVisualizationSelector(analytic)}
                            {renderAnalyticParameters(analytic)}
                          </CardContent>
                        </Card>
                    ))}
                    
                    {/* Add new analytics button */}
                    <Button variant="outline" className="w-full py-6 border-dashed">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Analytics
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="visualization" className="pt-4">
                <div className="space-y-6">
                  <div className="bg-white border p-4 rounded-md mb-4">
                    <h3 className="text-base font-medium mb-3">Analytics Visualization Preview</h3>
                    <p className="text-sm text-gray-600 mb-4">This preview shows how the enabled analytics will look when applied to your knowledge graph.</p>
                    
                    <div className="bg-gray-50 rounded-md p-6 min-h-[400px] relative">
                      {analytics.filter(a => a.enabled).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Lightbulb className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-gray-400 text-center">Enable analytics to see a combined visualization preview</p>
                        </div>
                      ) : (
                        <div>
                          <div className="absolute top-3 right-3 flex space-x-2">
                            {analytics.filter(a => a.enabled).map(analytic => (
                              <Badge key={analytic.id} className="bg-white">
                                {analytic.name}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Combined visualization preview */}
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
                              
                              {/* Document nodes */}
                              <rect x="-170" y="20" width="40" height="50" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />
                              <rect x="70" y="-130" width="40" height="50" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />
                              <rect x="180" y="40" width="40" height="50" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />
                              
                              {/* Project nodes */}
                              <rect x="-60" y="-140" width="50" height="40" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                              <rect x="-180" y="-20" width="50" height="40" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                              
                              {/* Edges */}
                              <line x1="-120" y1="-80" x2="0" y2="40" stroke="#3b82f6" strokeWidth="3" />
                              <line x1="0" y1="40" x2="140" y2="-60" stroke="#3b82f6" strokeWidth="3" />
                              <line x1="140" y1="-60" x2="80" y2="100" stroke="#3b82f6" strokeWidth="3" />
                              <line x1="-120" y1="-80" x2="140" y2="-60" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                              
                              {/* Activity connections */}
                              <line x1="-120" y1="-80" x2="-60" y2="-140" stroke="#f59e0b" strokeWidth="2" />
                              <line x1="0" y1="40" x2="-60" y2="-140" stroke="#f59e0b" strokeWidth="2" />
                              <line x1="140" y1="-60" x2="-60" y2="-140" stroke="#f59e0b" strokeWidth="2" />
                              
                              <line x1="-120" y1="-80" x2="-180" y2="-20" stroke="#f59e0b" strokeWidth="2" />
                              <line x1="0" y1="40" x2="-180" y2="-20" stroke="#f59e0b" strokeWidth="2" />
                              
                              <line x1="-120" y1="-80" x2="-170" y2="20" stroke="#22c55e" strokeWidth="2" />
                              <line x1="140" y1="-60" x2="70" y2="-130" stroke="#22c55e" strokeWidth="2" />
                              <line x1="80" y1="100" x2="180" y2="40" stroke="#22c55e" strokeWidth="2" />
                              
                              {/* Centrality indicators */}
                              {analytics.find(a => a.id === 'centrality-analysis' && a.enabled) && (
                                <>
                                  <circle cx="-120" cy="-80" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4" />
                                  <circle cx="140" cy="-60" r="36" fill="transparent" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4" />
                                </>
                              )}
                              
                              {/* Community detection */}
                              {analytics.find(a => a.id === 'community-detection' && a.enabled) && (
                                <>
                                  <circle cx="-150" cy="-70" r="100" fill="rgba(219, 234, 254, 0.3)" stroke="#93c5fd" strokeWidth="1" strokeDasharray="4" />
                                  <circle cx="120" cy="50" r="120" fill="rgba(254, 226, 226, 0.3)" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4" />
                                </>
                              )}
                            </g>
                            
                            {/* Legend */}
                            <g transform="translate(20, 20)">
                              <rect x="0" y="0" width="180" height={analytics.filter(a => a.enabled).length * 25 + 30} fill="white" stroke="#e5e7eb" rx="4" />
                              <text x="10" y="20" fontSize="12" fontWeight="bold">Analytics Legend</text>
                              
                              {analytics.filter(a => a.enabled).map((analytic, idx) => (
                                <g key={analytic.id} transform={`translate(10, ${idx * 25 + 40})`}>
                                  <rect x="0" y="-10" width="10" height="10" 
                                    fill={
                                      analytic.id === 'who-knows-who' ? '#3b82f6' : 
                                      analytic.id === 'who-does-what' ? '#22c55e' :
                                      analytic.id === 'centrality-analysis' ? '#8b5cf6' :
                                      analytic.id === 'community-detection' ? '#93c5fd' : 
                                      '#6b7280'
                                    } 
                                  />
                                  <text x="20" y="0" fontSize="12">{analytic.name}</text>
                                </g>
                              ))}
                            </g>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Card className="bg-blue-50 border-blue-200">
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
                            {analytics.find(a => a.id === 'who-knows-who' && a.enabled) && (
                              <li>Identification of key relationships and collaboration patterns between people</li>
                            )}
                            {analytics.find(a => a.id === 'who-does-what' && a.enabled) && (
                              <li>Expertise mapping showing who specializes in which topics and activities</li>
                            )}
                            {analytics.find(a => a.id === 'centrality-analysis' && a.enabled) && (
                              <li>Identification of key influencers and central nodes in your knowledge graph</li>
                            )}
                            {analytics.find(a => a.id === 'community-detection' && a.enabled) && (
                              <li>Discovery of natural communities and clusters of related entities</li>
                            )}
                            {analytics.filter(a => a.enabled).length === 0 && (
                              <li>No analytics currently enabled. Select at least one to generate insights.</li>
                            )}
                          </ul>
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