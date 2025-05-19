import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Save,
  FileDown,
  FileUp,
  MoreVertical,
  Search,
  Trash2,
  Edit,
  Copy,
  Check,
  Info,
  FileText,
  Network,
  BrainCircuit,
  Calendar,
  User,
  Tag,
  Star,
  CheckCircle,
  Upload
} from 'lucide-react';
import { useTemplateSystem } from '@/hooks/useTemplateSystem';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TemplateSystemProps {
  onTemplateSelect?: (templateId: string) => void;
  showCreateButton?: boolean;
  compactMode?: boolean;
}

const TemplateSystem: React.FC<TemplateSystemProps> = ({
  onTemplateSelect,
  showCreateButton = true,
  compactMode = false
}) => {
  const {
    templates,
    selectedTemplateId,
    createTemplate,
    applyTemplate,
    updateTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
    getTemplatesByCategory,
    searchTemplates,
    setSelectedTemplateId
  } = useTemplateSystem();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'user'>('all');
  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const [importJson, setImportJson] = useState('');

  // Filter templates based on search and category
  const filteredTemplates = searchQuery 
    ? searchTemplates(searchQuery)
    : getTemplatesByCategory(activeTab);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    applyTemplate(templateId);
    onTemplateSelect?.(templateId);
    
    toast({
      title: "Template Applied",
      description: `Successfully applied template: ${templates.find(t => t.id === templateId)?.name}`,
    });
  };

  // Handle template creation
  const handleCreateTemplate = () => {
    if (!newTemplateData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for the template",
        variant: "destructive"
      });
      return;
    }

    const template = createTemplate(newTemplateData.name, newTemplateData.description);
    
    // Add tags if provided
    if (newTemplateData.tags) {
      const tags = newTemplateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      updateTemplate(template.id, { 
        metadata: { ...template.metadata, tags } 
      });
    }

    toast({
      title: "Template Created",
      description: `Successfully created template: ${template.name}`,
    });

    setShowCreateDialog(false);
    setNewTemplateData({ name: '', description: '', tags: '' });
  };

  // Handle template export
  const handleExportTemplate = (templateId: string) => {
    try {
      const jsonData = exportTemplate(templateId);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const template = templates.find(t => t.id === templateId);
      a.href = url;
      a.download = `${template?.name.toLowerCase().replace(/\s+/g, '-')}-template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Template Exported",
        description: `Successfully exported template: ${template?.name}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export template",
        variant: "destructive"
      });
    }
  };

  // Handle template import
  const handleImportTemplate = () => {
    try {
      const template = importTemplate(importJson);
      
      toast({
        title: "Template Imported",
        description: `Successfully imported template: ${template.name}`,
      });

      setShowImportDialog(false);
      setImportJson('');
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import template",
        variant: "destructive"
      });
    }
  };

  // Handle file upload for import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  // Handle template deletion
  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || template.category === 'system') return;

    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplate(templateId);
      toast({
        title: "Template Deleted",
        description: `Successfully deleted template: ${template.name}`,
      });
    }
  };

  // Handle template duplication
  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const duplicatedTemplate = createTemplate(
      `${template.name} (Copy)`,
      template.description
    );

    // Copy all settings
    updateTemplate(duplicatedTemplate.id, {
      configuration: template.configuration,
      metadata: {
        ...template.metadata,
        author: 'current-user',
        usageCount: 0,
        lastUsed: new Date().toISOString()
      }
    });

    toast({
      title: "Template Duplicated",
      description: `Successfully duplicated template: ${template.name}`,
    });
  };

  // Get icon for processing type
  const getProcessingIcon = (type: 'rag' | 'kg' | 'idp') => {
    switch (type) {
      case 'rag': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'kg': return <Network className="h-4 w-4 text-green-500" />;
      case 'idp': return <BrainCircuit className="h-4 w-4 text-purple-500" />;
    }
  };

  // Render template card
  const renderTemplateCard = (template: any) => {
    const isSelected = selectedTemplateId === template.id;
    const isSystem = template.category === 'system';
    
    return (
      <Card 
        key={template.id}
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
        }`}
        onClick={() => handleSelectTemplate(template.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base mb-1">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTemplate(template.id);
                }}>
                  <Check className="mr-2 h-4 w-4" />
                  Apply Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleExportTemplate(template.id);
                }}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateTemplate(template.id);
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {!isSystem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {template.configuration.processingTypes.rag && getProcessingIcon('rag')}
              {template.configuration.processingTypes.kg && getProcessingIcon('kg')}
              {template.configuration.processingTypes.idp && getProcessingIcon('idp')}
            </div>
            <div className="flex items-center space-x-2">
              {isSystem && <Badge variant="secondary">System</Badge>}
              {isSelected && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          
          {template.metadata?.tags && template.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {template.metadata.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>v{template.version}</span>
            <span>{format(new Date(template.updatedAt), 'MMM d, yyyy')}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (compactMode) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Templates</CardTitle>
            {showCreateButton && (
              <Button size="sm" variant="outline" onClick={() => setShowCreateDialog(true)}>
                <Save className="h-4 w-4 mr-1" />
                Save Current
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplateId || ''} onValueChange={handleSelectTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center space-x-2">
                    <span>{template.name}</span>
                    {template.category === 'system' && <Badge variant="secondary">System</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Processing Templates</CardTitle>
              <CardDescription>Save and reuse configuration presets</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {showCreateButton && (
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowImportDialog(true)}>
                <FileUp className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="user">My Templates</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <ScrollArea className="h-[400px] pr-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map(template => renderTemplateCard(template))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Save the current configuration as a reusable template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="My Custom Template"
                value={newTemplateData.name}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is for..."
                value={newTemplateData.description}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="template-tags">Tags (comma-separated)</Label>
              <Input
                id="template-tags"
                placeholder="financial, report, analysis"
                value={newTemplateData.tags}
                onChange={(e) => setNewTemplateData({ ...newTemplateData, tags: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Template Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Template</DialogTitle>
            <DialogDescription>
              Import a template from a JSON file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center space-x-2">
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="json-input">Or Paste JSON</Label>
              <Textarea
                id="json-input"
                placeholder="Paste template JSON here..."
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportTemplate} disabled={!importJson.trim()}>
              Import Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSystem;