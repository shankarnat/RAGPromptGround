import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckIcon, CopyIcon, FilterIcon, SearchIcon, Wand2Icon } from "lucide-react";

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

interface TestQueryInterfaceProps {
  fields: {
    id: number;
    name: string;
    retrievable: boolean;
    filterable: boolean;
    typehead?: boolean;
  }[];
}

const TestQueryInterface: FC<TestQueryInterfaceProps> = ({ fields }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [enableRag, setEnableRag] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [activeTab, setActiveTab] = useState("query");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestQueryResult | null>(null);

  // Get filterable fields
  const filterableFields = fields.filter(field => field.filterable);

  // Mock executing a query
  const executeQuery = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock response
      const mockResult: TestQueryResult = {
        answer: "The document indicates that the insurance policy covers flood damage up to $50,000 with a deductible of $2,500. Coverage is subject to the property being in a zone classified as 'moderate flood risk' and having proper flood barriers installed.",
        sources: [
          {
            text: "Flood damage coverage extends to $50,000 maximum with a standard deductible of $2,500. Properties must be in zone B or C (moderate to minimal flood risk).",
            document: "Insurance_Policy_2023.pdf",
            confidence: 0.92
          },
          {
            text: "All properties with flood coverage must have approved flood barriers installed and maintained according to local building codes.",
            document: "Policy_Requirements.pdf",
            confidence: 0.87
          },
          {
            text: "Claims for flood damage require documentation of water levels and evidence that water entered the property from external sources.",
            document: "Claims_Process.pdf",
            confidence: 0.78
          }
        ],
        metrics: {
          accuracy: 0.86,
          latency: 1.43,
          testsPassed: 4
        }
      };
      
      setResult(mockResult);
      setIsLoading(false);
    }, 2000);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeQuery();
    }
  };

  // Display confidence as a colored badge
  const renderConfidenceBadge = (confidence: number) => {
    let color = "bg-red-100 text-red-800";
    if (confidence >= 0.9) {
      color = "bg-green-100 text-green-800";
    } else if (confidence >= 0.7) {
      color = "bg-yellow-100 text-yellow-800";
    }
    
    return (
      <Badge variant="outline" className={`${color} ml-2`}>
        {(confidence * 100).toFixed(0)}% confidence
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Test Query Interface</h2>
        <p className="text-gray-600">
          Test your document's search and retrieval capabilities with different queries and filters.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="query">
            <SearchIcon className="h-4 w-4 mr-2" />
            Query
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Wand2Icon className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="query">Query</Label>
                <Textarea
                  id="query"
                  placeholder="Enter your search query or question here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-24"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showFilters"
                  checked={showFilters}
                  onCheckedChange={setShowFilters}
                />
                <Label htmlFor="showFilters">
                  <div className="flex items-center">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Add Filters
                  </div>
                </Label>
              </div>

              {showFilters && (
                <div className="p-4 border rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium mb-3">Filterable Fields</h3>
                  
                  {filterableFields.length > 0 ? (
                    <div className="space-y-3">
                      {filterableFields.map(field => (
                        <div key={field.id}>
                          <Label htmlFor={`filter-${field.id}`}>{field.name}</Label>
                          <Input
                            id={`filter-${field.id}`}
                            placeholder={`Filter by ${field.name}...`}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No filterable fields configured. Set fields as filterable in the configuration panel.
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-sm font-medium mb-3">Query Options</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRag"
                      checked={enableRag}
                      onCheckedChange={setEnableRag}
                    />
                    <Label htmlFor="enableRag">Retrieval Augmented Generation</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Execute Query"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="metrics">
          {result ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Answer</CardTitle>
                  <CardDescription>Generated response based on your documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800">{result.answer}</p>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" className="text-xs">
                      <CopyIcon className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sources</CardTitle>
                  <CardDescription>Document chunks used to generate the answer</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-4">
                      {result.sources.map((source, idx) => (
                        <div key={idx} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {source.document}
                            </span>
                            {renderConfidenceBadge(source.confidence)}
                          </div>
                          <p className="text-sm text-gray-600">{source.text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{(result.metrics.accuracy * 100).toFixed(0)}%</p>
                      <p className="text-sm text-gray-500">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{result.metrics.latency.toFixed(2)}s</p>
                      <p className="text-sm text-gray-500">Latency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{result.metrics.testsPassed}/5</p>
                      <p className="text-sm text-gray-500">Tests Passed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-10 border rounded-md bg-gray-50">
              <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Results Yet</h3>
              <p className="text-gray-500 mb-6">Execute a query to see results and metrics here.</p>
              <Button onClick={() => setActiveTab("query")}>Go to Query Tab</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestQueryInterface;