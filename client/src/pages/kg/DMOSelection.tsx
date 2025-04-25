import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  User, 
  MessageSquare, 
  Calendar, 
  Tag, 
  Plus,
  Star
} from 'lucide-react';

interface DMO {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  selected: boolean;
}

const DMOSelection: React.FC = () => {
  const [, navigate] = useLocation();
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
      icon: <Calendar className="h-6 w-6 text-orange-500" />,
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

  const handleNext = () => {
    navigate('/kg/mapping');
  };

  const handlePrevious = () => {
    navigate('/kg/template');
  };

  // Configuration panel content - moved EKG DMO selection here
  const rightPanelContent = (
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

  // Simple graph visualization of the selected DMOs
  const GraphVisualization = () => {
    const selectedDMOs = dmos.filter(dmo => dmo.selected);
    
    return (
      <div className="bg-white rounded-lg border p-6 min-h-[400px] flex items-center justify-center">
        <svg width="400" height="300" viewBox="0 0 400 300">
          {/* Central circle representing the knowledge graph */}
          <circle cx="200" cy="150" r="40" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
          <text x="200" y="155" textAnchor="middle" fill="#4f46e5" fontSize="12" fontWeight="bold">Enterprise KG</text>
          
          {/* DMO nodes arranged in a circle around the central node */}
          {selectedDMOs.map((dmo, index) => {
            const total = selectedDMOs.length;
            const angle = (index / total) * 2 * Math.PI;
            const radius = 120;
            const x = 200 + radius * Math.cos(angle);
            const y = 150 + radius * Math.sin(angle);
            
            return (
              <g key={dmo.id}>
                {/* Line connecting to center */}
                <line 
                  x1="200" 
                  y1="150" 
                  x2={x} 
                  y2={y} 
                  stroke="#d1d5db" 
                  strokeWidth="2" 
                />
                
                {/* DMO node */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="30" 
                  fill={dmo.required ? "#f0fdf4" : "#f9fafb"} 
                  stroke={dmo.required ? "#10b981" : "#6b7280"} 
                  strokeWidth="2" 
                />
                
                {/* DMO name */}
                <text 
                  x={x} 
                  y={y} 
                  textAnchor="middle" 
                  fill="#374151" 
                  fontSize="10" 
                  fontWeight="medium"
                >
                  {dmo.name}
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
      title="EKG Data Models"
      rightPanelContent={rightPanelContent}
      currentStep={2}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="flex">
        {/* Graph visualization panel - now full width */}
        <div className="w-full">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-4">Enterprise Knowledge Graph Structure</h2>
              <p className="text-gray-600 mb-6">
                This visualization shows how your selected EKG entities will be organized in the enterprise knowledge graph.
              </p>
              <GraphVisualization />
            </CardContent>
          </Card>
        </div>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default DMOSelection;