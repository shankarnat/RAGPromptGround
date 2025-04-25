import React, { useState } from 'react';
import { useLocation } from 'wouter';
import KnowledgeGraphLayout from '@/components/KnowledgeGraphLayout';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, MessageSquare, FileText, Database, FolderGit2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  group: 'scratch' | 'template';
}

const TemplateSelection: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const templates: Template[] = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Create from scratch',
      icon: <PlusCircle className="h-8 w-8 text-primary-500" />,
      group: 'scratch'
    },
    {
      id: 'slack',
      name: 'Activity Graph from Slack',
      description: 'Create a knowledge graph from Slack workspace data',
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      group: 'template'
    },
    {
      id: 'gdrive',
      name: 'Activity Graph from Google Drive',
      description: 'Create a knowledge graph from Google Drive data',
      icon: <FolderGit2 className="h-8 w-8 text-yellow-600" />,
      group: 'template'
    },
    {
      id: 'sharepoint',
      name: 'Activity Graph from SharePoint',
      description: 'Create a knowledge graph from SharePoint data',
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      group: 'template'
    },
    {
      id: 'database',
      name: 'Import from Database',
      description: 'Create a knowledge graph from database tables and relationships',
      icon: <Database className="h-8 w-8 text-green-600" />,
      group: 'template'
    }
  ];

  const handleNext = () => {
    if (selectedTemplate === 'slack') {
      // For Slack template, navigate to EKG setup with Slack preset settings
      navigate('/kg/dmo?template=slack');
    } else {
      // For other templates, just navigate to DMO selection
      navigate('/kg/dmo');
    }
  };

  // Group templates
  const scratchTemplates = templates.filter(t => t.group === 'scratch');
  const integrationTemplates = templates.filter(t => t.group === 'template');

  // Help panel content
  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Template Selection</h3>
        <p className="text-sm text-gray-600">
          Choose a template for your knowledge graph. Templates provide pre-configured settings for specific use cases.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">About Knowledge Graphs</h3>
        <p className="text-sm text-gray-600">
          A knowledge graph represents entities and their relationships in a graph structure. This helps in organizing information and discovering connections.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Standard vs Templates</h3>
        <p className="text-sm text-gray-600">
          The Standard option lets you build from scratch, while templates provide pre-configured settings for specific sources like Slack, Google Drive, or SharePoint.
        </p>
      </div>
    </div>
  );

  return (
    <KnowledgeGraphLayout
      title="Template Selection"
      rightPanelContent={rightPanelContent}
      currentStep={1}
      totalSteps={7}
      onNext={selectedTemplate ? handleNext : undefined}
    >
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">New Knowledge Graph</h2>
            <p className="text-gray-600 mb-6">
              Select a template to create a new knowledge graph. You can start from scratch or use a pre-configured template.
            </p>
            
            <RadioGroup 
              value={selectedTemplate || ""} 
              onValueChange={setSelectedTemplate}
            >
              {/* From Scratch section */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-3">From scratch</h3>
                <div className="space-y-3">
                  {scratchTemplates.map(template => (
                    <div key={template.id} className={`border rounded-md p-4 ${selectedTemplate === template.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <RadioGroupItem 
                        value={template.id} 
                        id={template.id} 
                        className="sr-only"
                      />
                      <Label 
                        htmlFor={template.id} 
                        className="flex items-center cursor-pointer"
                      >
                        <div className="mr-4">
                          {template.icon}
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Templates section */}
              <div>
                <h3 className="text-md font-medium mb-3">Use Templates</h3>
                <div className="space-y-3">
                  {integrationTemplates.map(template => (
                    <div key={template.id} className={`border rounded-md p-4 ${selectedTemplate === template.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <RadioGroupItem 
                        value={template.id} 
                        id={template.id} 
                        className="sr-only"
                      />
                      <Label 
                        htmlFor={template.id} 
                        className="flex items-center cursor-pointer"
                      >
                        <div className="mr-4">
                          {template.icon}
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </KnowledgeGraphLayout>
  );
};

export default TemplateSelection;