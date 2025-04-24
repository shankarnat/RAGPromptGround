import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface TestQueryResult {
  answer: string;
  sources: {
    text: string;
    document: string;
    confidence: number;
  }[];
  metrics: {
    accuracy: number;
    latency: number;
    testsPassed: number;
  };
}

const TestQueryInterface: FC = () => {
  const [query, setQuery] = useState("What were Q1 revenue figures?");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestQueryResult | null>(null);
  const [activeTab, setActiveTab] = useState("test");

  const handleQuerySubmit = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setResult({
        answer: "In Q1 2023, the company reported total revenue of $45.7 million, representing a 12.4% year-over-year increase from Q1 2022 ($40.7 million). The growth was primarily driven by a 28% increase in subscription services revenue and 15% growth in professional services.",
        sources: [
          {
            text: "For the first quarter of 2023, we recorded total revenue of $45.7 million, up 12.4% compared to $40.7 million in the first quarter of 2022.",
            document: "Financial Report Q1 2023",
            confidence: 0.92
          },
          {
            text: "The revenue growth was primarily driven by a 28% increase in subscription services revenue and 15% growth in professional services compared to the same period last year.",
            document: "Financial Report Q1 2023",
            confidence: 0.87
          }
        ],
        metrics: {
          accuracy: 0.89,
          latency: 654,
          testsPassed: 3
        }
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleRefresh = () => {
    // Simulate refresh action
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Preview
        </Button>
        <div className="text-sm text-gray-600">
          Last updated: 5 minutes ago
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 px-4 pt-4">
          <TabsTrigger value="document">Original Document</TabsTrigger>
          <TabsTrigger value="chunks">Chunks</TabsTrigger>
          <TabsTrigger value="record">Record Index</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="document" className="p-4">
          <div className="border rounded-lg p-6 min-h-[500px]">
            <h3 className="font-medium mb-3">Financial Report Q1 2023</h3>
            <p className="text-sm text-gray-600 mb-3">
              Executive Summary
            </p>
            <p className="text-sm mb-2">
              For the first quarter of 2023, we recorded total revenue of $45.7 million, up 12.4% compared to $40.7 million in the first quarter of 2022. The revenue growth was primarily driven by a 28% increase in subscription services revenue and 15% growth in professional services compared to the same period last year.
            </p>
            <p className="text-sm mb-2">
              Operating income was $5.3 million, representing an operating margin of 11.6%, compared to $3.8 million and 9.3% in the first quarter of 2022.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="chunks" className="p-4">
          <div className="border rounded-lg p-6 min-h-[500px]">
            <h3 className="font-medium mb-3">Document Chunks</h3>
            <div className="space-y-4">
              <div className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium">Chunk #1</span>
                  <span className="text-xs text-gray-500">256 tokens</span>
                </div>
                <p className="text-sm">
                  Executive Summary. For the first quarter of 2023, we recorded total revenue of $45.7 million, up 12.4% compared to $40.7 million in the first quarter of 2022.
                </p>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium">Chunk #2</span>
                  <span className="text-xs text-gray-500">242 tokens</span>
                </div>
                <p className="text-sm">
                  The revenue growth was primarily driven by a 28% increase in subscription services revenue and 15% growth in professional services compared to the same period last year.
                </p>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium">Chunk #3</span>
                  <span className="text-xs text-gray-500">267 tokens</span>
                </div>
                <p className="text-sm">
                  Operating income was $5.3 million, representing an operating margin of 11.6%, compared to $3.8 million and 9.3% in the first quarter of 2022.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="record" className="p-4">
          <div className="border rounded-lg p-6 min-h-[500px]">
            <h3 className="font-medium mb-3">Record Index</h3>
            <pre className="text-xs text-gray-700 overflow-auto bg-gray-50 p-4 rounded border">
{`{
  "id": "fin_report_q1_2023",
  "title": "Financial Report Q1 2023",
  "date": "2023-04-15",
  "fields": {
    "quarter": "Q1",
    "year": "2023",
    "revenue": "$45.7 million",
    "growth": "12.4%",
    "operating_income": "$5.3 million",
    "operating_margin": "11.6%"
  },
  "embeddings": {
    "model": "E5 Large V2",
    "dimensions": 1536,
    "vector": [0.0231, -0.0124, 0.0342, ...]
  }
}`}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="test" className="p-4">
          <div className="border rounded-lg p-6 min-h-[500px]">
            <h3 className="font-medium mb-3">Test Query</h3>
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your test query"
                  className="flex-1"
                />
                <Button 
                  onClick={handleQuerySubmit}
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? 'Running...' : 'Run'}
                </Button>
              </div>
              
              {result && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Answer</h4>
                    <p className="text-sm">{result.answer}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Sources</h4>
                    <div className="space-y-3">
                      {result.sources.map((source, idx) => (
                        <div key={idx} className="border rounded p-3 bg-gray-50">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium">{source.document}</span>
                            <span className="text-xs text-gray-500">Confidence: {(source.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-sm italic">"{source.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Evaluation Results</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center mb-1">
                          <AlertCircle className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-xs font-medium">Accuracy</span>
                        </div>
                        <p className="text-xl font-semibold">{(result.metrics.accuracy * 100).toFixed(0)}%</p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <div className="flex items-center mb-1">
                          <Clock className="h-4 w-4 text-purple-600 mr-1" />
                          <span className="text-xs font-medium">Latency</span>
                        </div>
                        <p className="text-xl font-semibold">{result.metrics.latency}ms</p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="flex items-center mb-1">
                          <CheckCircle2 className="h-4 w-4 text-amber-600 mr-1" />
                          <span className="text-xs font-medium">Tests Passed</span>
                        </div>
                        <p className="text-xl font-semibold">{result.metrics.testsPassed}/4</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestQueryInterface;