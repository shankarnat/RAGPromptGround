import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import SearchIndexFlowChart from '../components/SearchIndexFlowChart';

const SearchFlowOverview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Search Index Workflow Overview</h1>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700">
          This diagram illustrates the complete workflow for setting up and configuring a search index
          in the Document Intelligence Platform. Each step is designed to guide you through the process
          of transforming raw documents into searchable, intelligent content.
        </p>
      </div>
      
      <SearchIndexFlowChart />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-bold mb-2">Start from the beginning</h3>
          <p className="text-sm mb-4">Upload a new document and go through the complete workflow</p>
          <Link href="/DocumentUpload">
            <Button className="w-full" variant="default">Start New Upload</Button>
          </Link>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-bold mb-2">Jump to configuration</h3>
          <p className="text-sm mb-4">Configure your index fields and properties directly</p>
          <Link href="/ConfigureIndex">
            <Button className="w-full" variant="outline">Go to Index Configuration</Button>
          </Link>
        </div>
        
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <h3 className="font-bold mb-2">Test your index</h3>
          <p className="text-sm mb-4">Run test queries against your configured index</p>
          <Link href="/TestAndResults">
            <Button className="w-full" variant="outline">Open Test Interface</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchFlowOverview;