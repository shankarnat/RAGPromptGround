import { FC, useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface WelcomeSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const WelcomeSlideout: FC<WelcomeSlideoutProps> = ({ isOpen, onClose, onToggle }) => {
  // Feature cards for the different playground options
  const features = [
    {
      title: "Search Index",
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
    <>
      {/* Toggle button when panel is closed */}
      {!isOpen && (
        <div 
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-30"
        >
          <Button 
            onClick={onToggle}
            className="h-12 px-2 rounded-r-lg rounded-l-none bg-primary text-white shadow-lg hover:bg-primary/90"
            aria-label="Open welcome guide"
          >
            <ChevronRight className="h-5 w-5" />
            <Info className="h-5 w-5 ml-1" />
          </Button>
        </div>
      )}

      {/* Overlay background */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={onToggle} />
      )}
      
      {/* Main slideout panel - now an overlay that doesn't take the full height */}
      <div className={`fixed top-1/2 left-1/2 -translate-y-1/2 z-40 max-h-[90vh] w-[95%] max-w-[950px] transform ${isOpen ? 'translate-x-[-50%] opacity-100' : 'translate-x-[-200%] opacity-0'} transition-all duration-300 ease-in-out bg-white shadow-xl rounded-xl overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-none p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">Welcome to Document Intelligence Centre</h2>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={onToggle}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-base text-gray-600 mt-1">
              Discover powerful ways to extract value from your unstructured data with our interactive playgrounds.
            </p>
          </div>

          {/* Body content */}
          <div className="flex-grow p-6 overflow-y-auto max-h-[60vh]">
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
                  <CardFooter className="px-4 pb-4">
                    <Link href={feature.path} className="w-full">
                      <Button 
                        className="w-full text-sm py-1.5 overflow-hidden text-ellipsis whitespace-nowrap" 
                        onClick={onToggle}
                      >
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

          {/* Footer */}
          <div className="flex-none p-4 border-t border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Start exploring today and transform your data landscape
              </div>
              <Button onClick={onClose} variant="outline" className="text-sm py-1.5 px-4">Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeSlideout;