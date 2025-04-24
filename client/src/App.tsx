import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DocumentIntelligence from "@/pages/DocumentIntelligence";
import DocumentUpload from "@/pages/DocumentUpload";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";

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
        <Redirect to="/configure-index/fields" />
      </Route>
      <Route path="/configure-index/fields" component={() => <div>Configure Index Fields</div>} />
      <Route path="/configure-index/other" component={() => <div>Other Configurations</div>} />
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
