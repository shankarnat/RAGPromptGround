import React, { useState } from 'react';
import { AutomotiveTable } from '@/data/acuraTableData';
import { ExtractedTableData } from '@/services/TableExtractor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Table as TableIcon, FileText, Settings, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtractedTablesDisplayProps {
  extractedData: ExtractedTableData;
  className?: string;
}

export function ExtractedTablesDisplay({ extractedData, className = '' }: ExtractedTablesDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTables = extractedData.tables.filter(table => {
    const matchesSearch = searchTerm === '' || 
      table.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.headers.some(h => h.toLowerCase().includes(searchTerm.toLowerCase())) ||
      table.rows.some(row => row.some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'all' || table.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const exportTableAsCSV = (table: AutomotiveTable) => {
    const headers = table.headers.join(',');
    const rows = table.rows.map(row => row.join(',')).join('\n');
    const csv = `${table.title}\n${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drivetrain': return <Settings className="h-4 w-4" />;
      case 'engine': return <BarChart3 className="h-4 w-4" />;
      case 'dimensions': return <TableIcon className="h-4 w-4" />;
      case 'features': return <FileText className="h-4 w-4" />;
      default: return <TableIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Extracted Automotive Tables
          </CardTitle>
          <CardDescription>
            {extractedData.summary.totalTables} tables extracted from {extractedData.metadata.documentName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {extractedData.summary.hasVINData && (
              <Badge variant="secondary">VIN Data</Badge>
            )}
            {extractedData.summary.hasPartNumbers && (
              <Badge variant="secondary">Part Numbers</Badge>
            )}
            {extractedData.summary.hasTorqueSpecs && (
              <Badge variant="secondary">Torque Specs</Badge>
            )}
            {extractedData.summary.hasServiceIntervals && (
              <Badge variant="secondary">Service Intervals</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {extractedData.summary.categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Tables Display */}
      <div className="space-y-4">
        {filteredTables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(table.category)}
                  <CardTitle className="text-lg">{table.title}</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    Page {table.page}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportTableAsCSV(table)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.headers.map((header, idx) => (
                        <TableHead key={idx} className="font-semibold">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No tables found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}