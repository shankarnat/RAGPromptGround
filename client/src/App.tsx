import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import DocumentIntelligence from "@/pages/DocumentIntelligence";
import DocumentUpload from "@/pages/DocumentUpload";
import ConfigureIndex from "@/pages/ConfigureIndex";
import Vectorization from "@/pages/Vectorization";
import TestAndResults from "@/pages/TestAndResults";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import WelcomeSlideout from "@/components/WelcomeSlideout";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import { DocumentAnalysisProvider } from "@/context/DocumentAnalysisContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SimpleTest from "@/components/SimpleTest";

// Knowledge Graph pages
import TemplateSelection from "@/pages/kg/TemplateSelection";
import EKGSetup from "@/pages/kg/EKGSetup";
import EdgeConfiguration from "@/pages/kg/EdgeConfiguration";
import Mapping from "@/pages/kg/Mapping";
import AnalyticsConfiguration from "@/pages/kg/AnalyticsConfig";
import Playground from "@/pages/kg/Playground";
import Share from "@/pages/kg/Share";

function Router() {
  const [location] = useLocation();
  const { state } = useDocumentProcessing();
  
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/unified" />
      </Route>
      <Route path="/unified">
        <ErrorBoundary>
          <DocumentAnalysisProvider>
            <UnifiedDashboard />
          </DocumentAnalysisProvider>
        </ErrorBoundary>
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
      <Route path="/kg/ekg" component={EKGSetup} /> {/* Alias for EKGSetup page */}
      <Route path="/kg/edge" component={EdgeConfiguration} />
      <Route path="/kg/analytics" component={AnalyticsConfiguration} />
      <Route path="/kg/mapping" component={Mapping} />
      <Route path="/kg/playground" component={Playground} />
      <Route path="/kg/share" component={Share} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showWelcomePanel, setShowWelcomePanel] = useState(false);

  // Show welcome panel on app launch
  useEffect(() => {
    // Check if user has dismissed the panel before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomePanel(true);
    }
  }, []);

  const handleCloseWelcomePanel = () => {
    setShowWelcomePanel(false);
    // Save to localStorage so the expanded panel doesn't show on every visit
    // But the toggle button will always be available
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleToggleWelcomePanel = () => {
    setShowWelcomePanel(!showWelcomePanel);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DocumentAnalysisProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <WelcomeSlideout 
            isOpen={showWelcomePanel} 
            onClose={handleCloseWelcomePanel}
            onToggle={handleToggleWelcomePanel}
          />
        </TooltipProvider>
      </DocumentAnalysisProvider>
    </QueryClientProvider>
  );
}

export default App;
