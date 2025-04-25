import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Network, 
  Search, 
  Clock, 
  Zap, 
  List, 
  Plus,
  Check
} from 'lucide-react';

interface AnalyticsConfig {
  id: string;
  name: string;
  type: 'centrality' | 'pathfinding' | 'clustering' | 'ranking';
  enabled: boolean;
  parameters: Record<string, any>;
  visualizationType: 'network' | 'bar' | 'line' | 'pie';
}

interface MetricConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  alert?: boolean;
}

const AnalyticsConfiguration: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('algorithms');
  
  // Analytics algorithm configurations
  const [algorithms, setAlgorithms] = useState<AnalyticsConfig[]>([
    {
      id: 'centrality-1',
      name: 'Node Centrality Analysis',
      type: 'centrality',
      enabled: true,
      parameters: {
        algorithm: 'betweenness',
        normalization: true
      },
      visualizationType: 'network'
    },
    {
      id: 'pathfinding-1',
      name: 'Shortest Path Analysis',
      type: 'pathfinding',
      enabled: false,
      parameters: {
        algorithm: 'dijkstra',
        weightProperty: 'weight'
      },
      visualizationType: 'network'
    },
    {
      id: 'clustering-1',
      name: 'Community Detection',
      type: 'clustering',
      enabled: true,
      parameters: {
        algorithm: 'louvain',
        resolution: 1.0
      },
      visualizationType: 'network'
    },
    {
      id: 'ranking-1',
      name: 'Node Importance Ranking',
      type: 'ranking',
      enabled: true,
      parameters: {
        algorithm: 'pagerank',
        dampingFactor: 0.85,
        iterations: 100
      },
      visualizationType: 'bar'
    }
  ]);
  
  // Metrics and KPIs
  const [metrics, setMetrics] = useState<MetricConfig[]>([
    {
      id: 'metric-1',
      name: 'Knowledge Graph Density',
      description: 'Measures the proportion of potential connections that are actual connections',
      enabled: true,
      threshold: 0.4,
      alert: true
    },
    {
      id: 'metric-2',
      name: 'Average Node Degree',
      description: 'Average number of connections per node',
      enabled: true,
      threshold: 5,
      alert: false
    },
    {
      id: 'metric-3',
      name: 'Graph Diameter',
      description: 'The longest shortest path between any two nodes',
      enabled: true,
      threshold: 10,
      alert: true
    },
    {
      id: 'metric-4',
      name: 'Clustering Coefficient',
      description: 'Measures how nodes tend to cluster together',
      enabled: false,
      threshold: 0.6,
      alert: false
    }
  ]);
  
  const handleToggleAlgorithm = (id: string) => {
    setAlgorithms(prev => prev.map(alg => 
      alg.id === id ? { ...alg, enabled: !alg.enabled } : alg
    ));
  };
  
  const handleToggleMetric = (id: string) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, enabled: !metric.enabled } : metric
    ));
  };
  
  const handleToggleMetricAlert = (id: string) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, alert: !metric.alert } : metric
    ));
  };
  
  const handleUpdateMetricThreshold = (id: string, value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setMetrics(prev => prev.map(metric => 
        metric.id === id ? { ...metric, threshold: numericValue } : metric
      ));
    }
  };
  
  // Navigation handlers
  const handleNext = () => {
    navigate('/kg/mapping');
  };
  
  const handlePrevious = () => {
    navigate('/kg/edge');
  };
  
  // Configuration panel content
  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Analytics Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure graph analytics algorithms and metrics to extract insights from your knowledge graph.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Algorithm Selection</h3>
        <p className="text-sm text-gray-600">
          Choose analytics algorithms based on your specific needs. Each algorithm helps uncover different patterns and insights.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
        <p className="text-sm text-gray-600">
          Define key performance indicators and thresholds to monitor the health and effectiveness of your knowledge graph.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Visualization Techniques</h3>
        <p className="text-sm text-gray-600">
          Select appropriate visualization methods to best represent the analytics results for different stakeholders.
        </p>
      </div>
    </div>
  );
  
  return (
    <KnowledgeGraphLayout
      title="Analytics Configuration"
      rightPanelContent={rightPanelContent}
      currentStep={4}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-6">Configure Knowledge Graph Analytics</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="algorithms" className="flex items-center">
                  <Network className="h-4 w-4 mr-2" />
                  Analytics Algorithms
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Metrics & KPIs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="algorithms" className="pt-4">
                <div className="space-y-6">
                  {algorithms.map(algorithm => (
                    <div key={algorithm.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Checkbox 
                            id={`algo-${algorithm.id}`}
                            checked={algorithm.enabled}
                            onCheckedChange={() => handleToggleAlgorithm(algorithm.id)}
                          />
                          <Label 
                            htmlFor={`algo-${algorithm.id}`} 
                            className="ml-2 font-medium cursor-pointer"
                          >
                            {algorithm.name}
                          </Label>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="flex items-center mr-4">
                            {algorithm.type === 'centrality' && <Network className="h-4 w-4 mr-1 text-blue-500" />}
                            {algorithm.type === 'pathfinding' && <Search className="h-4 w-4 mr-1 text-green-500" />}
                            {algorithm.type === 'clustering' && <List className="h-4 w-4 mr-1 text-purple-500" />}
                            {algorithm.type === 'ranking' && <Zap className="h-4 w-4 mr-1 text-amber-500" />}
                            {algorithm.type}
                          </span>
                          <span className="flex items-center">
                            {algorithm.visualizationType === 'network' && <Network className="h-4 w-4 mr-1 text-gray-500" />}
                            {algorithm.visualizationType === 'bar' && <BarChart3 className="h-4 w-4 mr-1 text-gray-500" />}
                            {algorithm.visualizationType === 'line' && <LineChart className="h-4 w-4 mr-1 text-gray-500" />}
                            {algorithm.visualizationType === 'pie' && <PieChart className="h-4 w-4 mr-1 text-gray-500" />}
                            {algorithm.visualizationType}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-6 pl-2 border-l-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">
                          {algorithm.type === 'centrality' && 'Identifies important nodes based on their position in the network'}
                          {algorithm.type === 'pathfinding' && 'Calculates optimal paths between entities in the graph'}
                          {algorithm.type === 'clustering' && 'Groups similar nodes together to identify communities'}
                          {algorithm.type === 'ranking' && 'Ranks nodes based on their relative importance'}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          {Object.entries(algorithm.parameters).map(([key, value]) => (
                            <div key={`${algorithm.id}-${key}`} className="flex items-center">
                              <div className="text-xs text-gray-500 mr-2">{key}:</div>
                              <div className="text-xs font-medium">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="pt-4">
                <div className="space-y-6">
                  {metrics.map(metric => (
                    <div key={metric.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Checkbox 
                            id={`metric-${metric.id}`}
                            checked={metric.enabled}
                            onCheckedChange={() => handleToggleMetric(metric.id)}
                          />
                          <Label 
                            htmlFor={`metric-${metric.id}`} 
                            className="ml-2 font-medium cursor-pointer"
                          >
                            {metric.name}
                          </Label>
                        </div>
                      </div>
                      
                      <div className="ml-6 pl-2 border-l-2 border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          {metric.description}
                        </p>
                        
                        <div className="flex items-end space-x-4">
                          <div className="w-1/3">
                            <Label htmlFor={`threshold-${metric.id}`} className="text-xs mb-1 block">Threshold</Label>
                            <Input 
                              id={`threshold-${metric.id}`}
                              value={metric.threshold}
                              onChange={(e) => handleUpdateMetricThreshold(metric.id, e.target.value)}
                              className="h-8 text-sm"
                              disabled={!metric.enabled}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`alert-${metric.id}`}
                              checked={metric.alert}
                              onCheckedChange={() => handleToggleMetricAlert(metric.id)}
                              disabled={!metric.enabled}
                            />
                            <Label 
                              htmlFor={`alert-${metric.id}`}
                              className="text-sm cursor-pointer"
                            >
                              Alert when threshold exceeded
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Network className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-800 mb-2">Analytics Insights</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Your analytics configuration will enable the following insights:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
                  <li>Identification of key influencers and central nodes in your knowledge graph</li>
                  <li>Discovery of natural communities and clusters of related entities</li>
                  <li>Measurement of knowledge graph health and connectivity metrics</li>
                  <li>Ranking of entities by importance and relevance to business objectives</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default AnalyticsConfiguration;