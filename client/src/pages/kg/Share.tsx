import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '../../components/KnowledgeGraphLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { 
  Search,
  Download,
  Share as ShareIcon,
  ChevronDown,
  Copy,
  FileJson,
  FileText,
  Activity,
  User,
  UserSquare2,
  Network,
  Workflow,
  MessageSquare,
  Briefcase,
  Tag
} from 'lucide-react';

const Share = () => {
  const [location, setLocation] = useLocation();
  
  // Navigation helper function
  const navigate = (path: string) => {
    setLocation(path);
  };
  
  // Sample data for Analytics DMOs
  const analyticsDMOs = [
    { id: 'analytics-1', name: 'Activity DMO', fieldCount: 20, lastUpdated: '5/04/2025 12:00:00', icon: <Activity className="h-4 w-4 text-blue-500" /> },
    { id: 'analytics-2', name: 'Relationship DMO', fieldCount: 45, lastUpdated: '5/04/2025 12:00:00', icon: <Network className="h-4 w-4 text-purple-500" /> },
    { id: 'analytics-3', name: 'User DMO', fieldCount: 50, lastUpdated: '5/04/2025 12:00:00', icon: <User className="h-4 w-4 text-green-500" /> },
    { id: 'analytics-4', name: 'Group DMO', fieldCount: 10, lastUpdated: '5/04/2025 12:00:00', icon: <UserSquare2 className="h-4 w-4 text-orange-500" /> },
  ];
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample EKG DMOs data
  const ekgDmos = [
    {
      id: 'document',
      name: 'Document',
      description: 'Document or content entity in the EKG',
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      fieldCount: 15
    },
    {
      id: 'person',
      name: 'Person',
      description: 'Person or user entity in the enterprise',
      icon: <User className="h-6 w-6 text-green-500" />,
      fieldCount: 12
    },
    {
      id: 'concept',
      name: 'Concept',
      description: 'Abstract idea or knowledge concept',
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      fieldCount: 8
    },
    {
      id: 'project',
      name: 'Project',
      description: 'Enterprise project or initiative',
      icon: <Briefcase className="h-6 w-6 text-orange-500" />,
      fieldCount: 10
    },
    {
      id: 'department',
      name: 'Department',
      description: 'Organizational unit or team',
      icon: <Tag className="h-6 w-6 text-red-500" />,
      fieldCount: 9
    }
  ];
  
  // Sample Edge DMOs data
  const edgeDmos = [
    {
      id: '1',
      name: 'Created',
      fromNodeType: 'person',
      toNodeType: 'document'
    },
    {
      id: '2',
      name: 'WorksIn',
      fromNodeType: 'person',
      toNodeType: 'department'
    },
    {
      id: '3',
      name: 'Collaborates',
      fromNodeType: 'person',
      toNodeType: 'person'
    },
    {
      id: '4',
      name: 'PartOf',
      fromNodeType: 'document',
      toNodeType: 'project'
    },
    {
      id: '5',
      name: 'Manages',
      fromNodeType: 'person',
      toNodeType: 'project'
    }
  ];
  
  // Filter DMOs based on search query
  const filteredEKGDMOs = ekgDmos.filter((dmo) => 
    dmo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dmo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredEdges = edgeDmos.filter((edge) => 
    edge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    edge.fromNodeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    edge.toNodeType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAnalyticsDMOs = analyticsDMOs.filter(dmo => 
    dmo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Navigation handlers
  const handlePrevious = () => {
    navigate('/kg/playground');
  };
  
  // Right panel content
  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h2 className="text-md font-medium mb-2">Export Options</h2>
        <p className="text-sm text-gray-600 mb-4">
          Export your knowledge graph configuration for use in other systems.
        </p>
        
        <div className="space-y-4">
          <Button className="w-full flex items-center" variant="outline">
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          
          <Button className="w-full flex items-center" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
          
          <Button className="w-full flex items-center" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Schema
          </Button>
          
          <Button className="w-full flex items-center" variant="outline">
            <Workflow className="h-4 w-4 mr-2" />
            API Integration
          </Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-md font-medium mb-2">Sharing</h2>
        <p className="text-sm text-gray-600 mb-4">
          Share this knowledge graph configuration with others.
        </p>
        
        <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
          <Input 
            value="https://knowledge-graph.example.com/share/kg123456"
            readOnly
            className="text-xs"
          />
          <Button variant="ghost" size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <Button className="w-full mt-4 flex items-center">
          <ShareIcon className="h-4 w-4 mr-2" />
          Share Configuration
        </Button>
      </div>
    </div>
  );
  
  return (
    <KnowledgeGraphLayout
      title="Save &amp; Share"
      rightPanelContent={rightPanelContent}
      onPrevious={handlePrevious}
      currentStep={4}
      totalSteps={4}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Knowledge Graph Configuration</h2>
          <div className="relative w-64">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
            <Input
              placeholder="Search DMOs and edges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Tabs defaultValue="ekg-dmos">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="ekg-dmos">EKG DMOs</TabsTrigger>
            <TabsTrigger value="edge-dmos">Edge DMOs</TabsTrigger>
            <TabsTrigger value="analytics-dmos">Analytics DMOs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ekg-dmos" className="pt-2">
            <Card className="border rounded-md overflow-hidden">
              <div className="p-4 bg-white">
                <h3 className="text-sm font-medium flex items-center">
                  DMOs ({filteredEKGDMOs.length})
                </h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex items-center space-x-1">
                      <span>DMO</span>
                      <ChevronDown className="h-3 w-3" />
                    </TableHead>
                    <TableHead>Number of fields</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEKGDMOs.map(dmo => (
                    <TableRow key={dmo.id}>
                      <TableCell className="font-medium flex items-center space-x-2">
                        <span>{dmo.icon}</span>
                        <span>{dmo.name}</span>
                      </TableCell>
                      <TableCell>{dmo.fieldCount}</TableCell>
                      <TableCell>5/04/2025 12:00:00</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="edge-dmos" className="pt-2">
            <Card className="border rounded-md overflow-hidden">
              <div className="p-4 bg-white">
                <h3 className="text-sm font-medium flex items-center">
                  Edge DMOs ({filteredEdges.length})
                </h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex items-center space-x-1">
                      <span>Edge</span>
                      <ChevronDown className="h-3 w-3" />
                    </TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEdges.map(edge => (
                    <TableRow key={edge.id}>
                      <TableCell className="font-medium">
                        {edge.name}
                      </TableCell>
                      <TableCell>
                        {edge.fromNodeType.charAt(0).toUpperCase() + edge.fromNodeType.slice(1)}
                      </TableCell>
                      <TableCell>
                        {edge.toNodeType.charAt(0).toUpperCase() + edge.toNodeType.slice(1)}
                      </TableCell>
                      <TableCell>5/04/2025 12:00:00</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics-dmos" className="pt-2">
            <Card className="border rounded-md overflow-hidden">
              <div className="p-4 bg-white">
                <h3 className="text-sm font-medium flex items-center">
                  Analytics DMOs ({filteredAnalyticsDMOs.length})
                </h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex items-center space-x-1">
                      <span>DMO</span>
                      <ChevronDown className="h-3 w-3" />
                    </TableHead>
                    <TableHead>Number of fields</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalyticsDMOs.map(dmo => (
                    <TableRow key={dmo.id}>
                      <TableCell className="font-medium flex items-center space-x-2">
                        <span>{dmo.icon}</span>
                        <span>{dmo.name}</span>
                      </TableCell>
                      <TableCell>{dmo.fieldCount}</TableCell>
                      <TableCell>{dmo.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default Share;