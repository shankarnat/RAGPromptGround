import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DocumentIntelligence from "@/pages/DocumentIntelligence";
import DocumentUpload from "@/pages/DocumentUpload";
import ConfigureIndex from "@/pages/ConfigureIndex";
import Vectorization from "@/pages/Vectorization";
import TestAndResults from "@/pages/TestAndResults";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";

// Knowledge Graph pages
import TemplateSelection from "@/pages/kg/TemplateSelection";
import EKGSetup from "@/pages/kg/EKGSetup";
import Mapping from "@/pages/kg/Mapping";
import AnalyticsConfiguration from "@/pages/kg/AnalyticsConfig";

function Router() {
  const [location] = useLocation();
  const { state } = useDocumentProcessing();
  
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/upload" />
      </Route>
      <Route path="/upload" component={DocumentUpload} />
      <Route path="/parse-chunk" component={DocumentIntelligence} />
      <Route path="/configure-index">
        <ConfigureIndex />
      </Route>
      <Route path="/configure-index/fields">
        <ConfigureIndex />
      </Route>
      <Route path="/configure-index/other">
        <ConfigureIndex />
      </Route>
      <Route path="/vectorization" component={Vectorization} />
      <Route path="/test" component={TestAndResults} />
      <Route path="/deploy" component={TestAndResults} />
      
      {/* Knowledge Graph routes */}
      <Route path="/kg/template" component={TemplateSelection} />
      <Route path="/kg/dmo" component={EKGSetup} />
      <Route path="/kg/edge">
        <Redirect to="/kg/dmo" />
      </Route>
      <Route path="/kg/analytics" component={AnalyticsConfiguration} />
      <Route path="/kg/mapping" component={Mapping} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
