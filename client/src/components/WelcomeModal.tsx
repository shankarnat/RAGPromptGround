import { FC, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  // Feature cards for the different playground options
  const features = [
    {
      title: "Document Intelligence",
      badge: "Search Index",
      description: "Transform unstructured documents into searchable, intelligent indexes with advanced parsing and chunking capabilities.",
      path: "/upload",
      icon: "📄",
      highlight: "Popular"
    },
    {
      title: "Knowledge Graph",
      badge: "KG",
      description: "Create enterprise knowledge graphs that map relationships between entities and enable powerful graph-based queries.",
      path: "/kg/template",
      icon: "🔄",
      highlight: "Advanced"
    },
    {
      title: "Intelligent Document Processing",
      badge: "IDP",
      description: "Extract structured data from forms, invoices, and other documents with record-level indexing and metadata management.",
      path: "/parse-chunk",
      icon: "📋",
      highlight: "New"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-primary">Welcome to Document Intelligence Platform</DialogTitle>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            Discover powerful ways to extract value from your unstructured data with our interactive playgrounds.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Unlock the full potential of your content with our intelligent workflows
          </h3>
          
          <p className="text-gray-700 mb-6">
            Our playground environments help you find the easiest path to build value from unstructured data. 
            Each specialized workflow offers a guided experience to transform raw content into actionable insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 font-medium">
                      {feature.badge}
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center mt-2">
                    <span className="text-3xl mr-2">{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600 min-h-[80px]">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Link href={feature.path}>
                    <Button className="w-full" onClick={onClose}>
                      Explore {feature.title}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Why use our playgrounds?</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Streamlined workflows guide you through each step with best practices</li>
              <li>Visualize transformations in real-time to understand data processing</li>
              <li>Configure complex parameters through intuitive interfaces</li>
              <li>Test and validate results before implementing in production</li>
              <li>Easily share configurations with stakeholders using our shareable links</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Start exploring today and transform your data landscape
          </div>
          <Button onClick={onClose}>Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;