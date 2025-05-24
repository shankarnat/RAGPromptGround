import { Switch, Route, useLocation, Redirect, useSearch } from "wouter";
import { queryClient, getMemoryUsage } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, Suspense, lazy } from "react";
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
import { performanceMonitor } from "@/services/PerformanceMonitor";
import { Loader2, Car } from "lucide-react";

// Knowledge Graph pages
import TemplateSelection from "@/pages/kg/TemplateSelection";
import EKGSetup from "@/pages/kg/EKGSetup";
import EdgeConfiguration from "@/pages/kg/EdgeConfiguration";
import Mapping from "@/pages/kg/Mapping";
import AnalyticsConfiguration from "@/pages/kg/AnalyticsConfig";
import Playground from "@/pages/kg/Playground";
import Share from "@/pages/kg/Share";

// Lazy load heavy components for better performance
const AutomotiveQASession = lazy(() => import("./pages/AutomotiveQASession"));

// Loading component for automotive features
function AutomotiveLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        <Car className="h-16 w-16 mx-auto text-blue-600 animate-pulse" />
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-600" />
        <p className="text-lg text-gray-700">Loading Automotive Intelligence...</p>
      </div>
    </div>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const { state, updateState } = useDocumentProcessing();
  
  // Parse automotive-specific URL parameters
  const urlParams = new URLSearchParams(search);
  const vin = urlParams.get('vin');
  const model = urlParams.get('model');
  const year = urlParams.get('year');
  const make = urlParams.get('make');
  const sessionId = urlParams.get('session');
  const testSuiteId = urlParams.get('test');
  
  // Handle automotive parameters in state
  useEffect(() => {
    if (vin || model || year || make) {
      updateState({
        vehicleInfo: {
          vin: vin || state.vehicleInfo?.vin,
          model: model || state.vehicleInfo?.model,
          year: year || state.vehicleInfo?.year,
          make: make || state.vehicleInfo?.make
        }
      });
      
      // Track automotive URL access
      performanceMonitor.trackUserInteraction('automotive_url_access', 'navigation', {
        hasVin: !!vin,
        hasModel: !!model,
        hasYear: !!year,
        hasMake: !!make
      });
    }
  }, [vin, model, year, make]);
  
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/unified" />
      </Route>
      
      {/* Main automotive dashboard with URL parameter support */}
      <Route path="/unified">
        <ErrorBoundary>
          <DocumentAnalysisProvider>
            <UnifiedDashboard 
              initialVehicleInfo={{
                vin: vin || undefined,
                model: model || undefined,
                year: year || undefined,
                make: make || undefined
              }}
            />
          </DocumentAnalysisProvider>
        </ErrorBoundary>
      </Route>
      
      {/* Automotive Q&A session with deep linking */}
      <Route path="/qa/:sessionId?">
        <ErrorBoundary>
          <Suspense fallback={<AutomotiveLoader />}>
            <AutomotiveQASession 
              sessionId={sessionId || undefined}
              testSuiteId={testSuiteId || undefined}
              vehicleInfo={{
                vin: vin || undefined,
                model: model || undefined,
                year: year || undefined,
                make: make || undefined
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </Route>
      
      {/* Document processing routes */}
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
      <Route path="/kg/ekg" component={EKGSetup} />
      <Route path="/kg/edge" component={EdgeConfiguration} />
      <Route path="/kg/analytics" component={AnalyticsConfiguration} />
      <Route path="/kg/mapping" component={Mapping} />
      <Route path="/kg/playground" component={Playground} />
      <Route path="/kg/share" component={Share} />
      
      {/* Automotive-specific routes */}
      <Route path="/automotive/manual/:documentId">
        <ErrorBoundary>
          <UnifiedDashboard 
            defaultView="manual"
            documentId={location.match(/\/automotive\/manual\/(.+)/)?.[1]}
          />
        </ErrorBoundary>
      </Route>
      
      <Route path="/automotive/diagnostics">
        <ErrorBoundary>
          <UnifiedDashboard 
            defaultView="diagnostics"
            vehicleInfo={{
              vin: vin || undefined,
              model: model || undefined,
              year: year || undefined,
              make: make || undefined
            }}
          />
        </ErrorBoundary>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showWelcomePanel, setShowWelcomePanel] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [memoryWarning, setMemoryWarning] = useState(false);
  
  // Monitor online/offline status for automotive field use
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performanceMonitor.trackUserInteraction('connection_restored', 'navigation');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      performanceMonitor.trackUserInteraction('connection_lost', 'navigation');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Monitor memory usage for large automotive documents
  useEffect(() => {
    const checkMemory = setInterval(() => {
      const usage = getMemoryUsage();
      if (usage.utilization > 0.8 && !memoryWarning) {
        setMemoryWarning(true);
        performanceMonitor.trackUserInteraction('memory_warning', 'navigation', {
          utilization: usage.utilization,
          totalSize: usage.totalSize
        });
      } else if (usage.utilization < 0.7 && memoryWarning) {
        setMemoryWarning(false);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(checkMemory);
  }, [memoryWarning]);

  // Welcome panel is disabled for automotive use
  useEffect(() => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcomePanel(false);
  }, []);

  const handleCloseWelcomePanel = () => {
    setShowWelcomePanel(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleToggleWelcomePanel = () => {
    setShowWelcomePanel(!showWelcomePanel);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DocumentAnalysisProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Offline indicator for field technicians */}
            {!isOnline && (
              <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
                <p className="text-sm font-medium">
                  Offline Mode - Some features may be limited
                </p>
              </div>
            )}
            
            {/* Memory warning for large documents */}
            {memoryWarning && (
              <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                <p className="text-sm font-medium">
                  High memory usage detected. Consider closing unused documents.
                </p>
              </div>
            )}
            
            <Router />
            
            <WelcomeSlideout 
              isOpen={showWelcomePanel} 
              onClose={handleCloseWelcomePanel}
              onToggle={handleToggleWelcomePanel}
            />
          </div>
          
          <Toaster />
        </TooltipProvider>
      </DocumentAnalysisProvider>
    </QueryClientProvider>
  );
}

export default App;
