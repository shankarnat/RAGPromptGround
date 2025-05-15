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
import WelcomeModal from "@/components/WelcomeModal";

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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Show welcome modal on app launch
  useEffect(() => {
    // Check if user has dismissed the modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // Save to localStorage so it doesn't show on every visit
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <WelcomeModal 
          isOpen={showWelcomeModal} 
          onClose={handleCloseWelcomeModal} 
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
