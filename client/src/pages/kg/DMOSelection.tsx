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
  const [location, navigate] = useLocation();
  const [showNewDMO, setShowNewDMO] = useState(false);
  const [newDMOName, setNewDMOName] = useState('');
  
  // Parse URL query parameters to check if a template was selected
  const params = new URLSearchParams(window.location.search);
  const selectedTemplate = params.get('template');
  
  // Standard EKG DMOs
  const standardDMOs: DMO[] = [
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
  ];
  
  // Slack Activity Graph DMOs
  const slackActivityDMOs: DMO[] = [
    {
      id: 'user',
      name: 'User',
      description: 'User profiles from Slack workspace',
      icon: <User className="h-6 w-6 text-green-500" />,
      required: true,
      selected: true
    },
    {
      id: 'content',
      name: 'Content',
      description: 'Messages and files shared in Slack',
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      required: true,
      selected: true
    },
    {
      id: 'activity',
      name: 'Activity',
      description: 'User actions and interactions in Slack',
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      required: true,
      selected: true
    },
    {
      id: 'channel',
      name: 'Channel',
      description: 'Channels in Slack workspace',
      icon: <Tag className="h-6 w-6 text-red-500" />,
      required: false,
      selected: true
    }
  ];
  
  // Select appropriate DMOs based on template
  const initialDMOs = selectedTemplate === 'slack' ? slackActivityDMOs : standardDMOs;
  
  // State for DMOs
  const [dmos, setDmos] = useState<DMO[]>(initialDMOs);

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
    // Navigate to EKG Setup (updated flow)
    navigate('/kg/ekg');
  };

  const handlePrevious = () => {
    navigate('/kg/template');
  };

  // Configuration panel content - moved EKG DMO selection here
  const rightPanelContent = (
    <div className="space-y-6">
      <h2 className="text-md font-medium">
        {selectedTemplate === 'slack' ? 'Slack Activity Graph' : 'Select EKG Data Model Objects'}
      </h2>
      
      {selectedTemplate === 'slack' ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            The Activity-User-Content model maps Slack communication data to 
            understand interactions between users and content.
          </p>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Auto-generated Relationships</h3>
            <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
              <li>User → Content (Authored, Reacted, Edited, Mentioned)</li>
              <li>User → User (Collaboration)</li>
              <li>Activity → User (Performed By)</li>
              <li>Activity → Content (Performed On)</li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-4">
          Choose which entities to include in your enterprise knowledge graph.
        </p>
      )}
      
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
              {selectedTemplate === 'slack' && dmo.id === 'activity' && (
                <div className="mt-1 text-xs text-purple-600">
                  Maps to: PostMessage, EditMessage, ReactToMessage, ShareFile, etc.
                </div>
              )}
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

  // Enhanced graph visualization of the selected DMOs
  const GraphVisualization = () => {
    const selectedDMOs = dmos.filter(dmo => dmo.selected);
    
    // Special visualization for Slack Activity-User-Content structure
    if (selectedTemplate === 'slack' && selectedDMOs.some(dmo => dmo.id === 'activity')) {
      return (
        <div className="bg-white rounded-lg border p-6 min-h-[400px] flex items-center justify-center">
          <svg width="500" height="400" viewBox="0 0 500 400">
            {(() => {
              // Find nodes
              const userNode = selectedDMOs.find(dmo => dmo.id === 'user');
              const contentNode = selectedDMOs.find(dmo => dmo.id === 'content');
              const activityNode = selectedDMOs.find(dmo => dmo.id === 'activity');
              const channelNode = selectedDMOs.find(dmo => dmo.id === 'channel');
              
              return (
                <>
                  {/* User node */}
                  {userNode && (
                    <g>
                      <circle cx="200" cy="150" r="40" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" />
                      <text x="200" y="155" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">User</text>
                    </g>
                  )}
                  
                  {/* Content node */}
                  {contentNode && (
                    <g>
                      <circle cx="350" cy="150" r="40" fill="#f0fdf4" stroke="#3b82f6" strokeWidth="2" />
                      <text x="350" y="155" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">Content</text>
                    </g>
                  )}
                  
                  {/* Activity node */}
                  {activityNode && (
                    <g>
                      <circle cx="275" cy="275" r="40" fill="#f0fdf4" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="275" y="280" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">Activity</text>
                    </g>
                  )}
                  
                  {/* Channel node */}
                  {channelNode && (
                    <g>
                      <circle cx="125" cy="275" r="35" fill="#f9fafb" stroke="#6b7280" strokeWidth="2" />
                      <text x="125" y="280" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">Channel</text>
                    </g>
                  )}
                </>
              );
            })()}
            
            {/* Draw edges for User-Content relationships */}
            {userNode && contentNode && (
              <g>
                <line x1="240" y1="150" x2="310" y2="150" stroke="#3b82f6" strokeWidth="2" />
                <text x="275" y="140" textAnchor="middle" fill="#3b82f6" fontSize="10">Authored/Reacted</text>
              </g>
            )}
            
            {/* Draw edges for User-User collaboration */}
            {userNode && (
              <g>
                <path d="M190,110 C175,75 225,75 210,110" stroke="#10b981" strokeWidth="2" fill="transparent" />
                <text x="200" y="85" textAnchor="middle" fill="#10b981" fontSize="10">Collaborates</text>
              </g>
            )}
            
            {/* Draw edges from Activity to User (PerformedBy) */}
            {activityNode && userNode && (
              <g>
                <line x1="245" y1="240" x2="215" y2="190" stroke="#8b5cf6" strokeWidth="2" />
                <text x="215" y="220" textAnchor="middle" fill="#8b5cf6" fontSize="10">Performed By</text>
              </g>
            )}
            
            {/* Draw edges from Activity to Content (PerformedOn) */}
            {activityNode && contentNode && (
              <g>
                <line x1="305" y1="240" x2="335" y2="190" stroke="#8b5cf6" strokeWidth="2" />
                <text x="335" y="220" textAnchor="middle" fill="#8b5cf6" fontSize="10">Performed On</text>
              </g>
            )}
            
            {/* Draw edges for Member Of relationship */}
            {userNode && channelNode && (
              <g>
                <line x1="175" y1="185" x2="145" y2="240" stroke="#6b7280" strokeWidth="2" />
                <text x="145" y="220" textAnchor="middle" fill="#6b7280" fontSize="10">Member Of</text>
              </g>
            )}
            
            {/* Legend */}
            <g transform="translate(20, 20)">
              <rect x="0" y="0" width="150" height="90" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="4" />
              <text x="75" y="15" textAnchor="middle" fontSize="10" fontWeight="bold">Relationship Types</text>
              
              <line x1="10" y1="30" x2="30" y2="30" stroke="#3b82f6" strokeWidth="2" />
              <text x="35" y="33" fontSize="9">User-Content</text>
              
              <line x1="10" y1="45" x2="30" y2="45" stroke="#10b981" strokeWidth="2" />
              <text x="35" y="48" fontSize="9">User-User</text>
              
              <line x1="10" y1="60" x2="30" y2="60" stroke="#8b5cf6" strokeWidth="2" />
              <text x="35" y="63" fontSize="9">Activity-based</text>
              
              <line x1="10" y1="75" x2="30" y2="75" stroke="#6b7280" strokeWidth="2" />
              <text x="35" y="78" fontSize="9">Membership</text>
            </g>
          </svg>
        </div>
      );
    }
    
    // Default standard visualization
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
      totalSteps={4}  // 4 steps: Template, Setup, Playground, Share
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