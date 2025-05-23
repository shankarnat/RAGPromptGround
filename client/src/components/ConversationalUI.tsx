import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  User, 
  Bot, 
  Sparkles,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileSearch,
  Network,
  FileText,
  Wand2,
  Brain,
  Settings,
  Activity,
  Eye,
  Image,
  Camera,
  Headphones,
  TextCursor
} from 'lucide-react';
import { useConversation } from '@/hooks/useConversation';
import { DocumentCharacteristics } from '@/services/DocumentAnalyzer';
import { ConversationMessage } from '@/services/ConversationManager';
import { cn } from '@/lib/utils';

interface ConversationalUIProps {
  documentAnalysis: DocumentCharacteristics | null;
  onProcessingConfigured?: (config: any) => void;
  className?: string;
  compact?: boolean;
}

export const ConversationalUI: React.FC<ConversationalUIProps> = ({
  documentAnalysis,
  onProcessingConfigured,
  className = '',
  compact = false
}) => {
  const { state, sendMessage, handleAction, startConversation, getProcessingConfig } = useConversation(onProcessingConfigured);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Enhanced state type checking
  const enhancedState = state as any; // Type assertion for enhanced state

  // Start conversation when document analysis is available
  useEffect(() => {
    if (documentAnalysis && state.messages.length === 0) {
      startConversation(documentAnalysis);
    }
  }, [documentAnalysis, startConversation, state.messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Handle configuration completion
  useEffect(() => {
    if (state.isComplete && onProcessingConfigured) {
      const config = getProcessingConfig();
      if (config) {
        onProcessingConfigured(config);
      }
    }
  }, [state.isComplete, onProcessingConfigured, getProcessingConfig, handleAction]);

  // Override the handleAction to intercept start_processing, select_processing, and process_directly
  const handleActionWithConfig = (action: string, data?: any) => {
    // Special handling for "Yes, all entities" action
    if (action === 'process_directly' && data?.kgEnabled === true && data?.entityTypes === 'all') {
      console.log('"Yes, all entities" button clicked, adding delay before processing');
      
      // Handle the KG preferences first to ensure the KG checkbox is checked
      if (onProcessingConfigured) {
        const kgConfig = {
          kgEnabled: true,
          entityTypes: 'all',
          kgUpdate: true // Flag to mark this as a dedicated KG update
        };
        console.log('First sending KG config to update checkbox:', kgConfig);
        onProcessingConfigured(kgConfig);
        
        // Then process the IDP preferences with another delay
        setTimeout(() => {
          console.log('Now processing IDP preferences after KG delay');
          const idpConfig = {
            idpEnabled: data.idpEnabled,
            extractType: data.extractType
          };
          onProcessingConfigured(idpConfig);
          
          // After IDP is configured, complete the action with a final delay
          setTimeout(() => {
            console.log('Now processing the full action after all delays');
            handleAction(action, data);
            
            // Additional delay before highlighting the Process button
            setTimeout(() => {
              const highlightConfig = {
                highlightProcessButton: true
              };
              console.log('Now sending highlight config after all updates');
              onProcessingConfigured(highlightConfig);
            }, 800); // Delay before highlighting button
          }, 1000); // Delay before final processing
        }, 1000); // Delay before processing IDP
        
        return; // Skip further processing
      }
    }
    
    // Handle process_directly action to guide to Process Document button
    if (action === 'process_directly') {
      console.log('Processing process_directly action to guide to Process Document button', data);
      
      // Let the ConversationManager handle the message
      handleAction(action, data);
      
      // First update the IDP configuration IMMEDIATELY to ensure checkbox gets checked first
      if (onProcessingConfigured) {
        // Pass the IDP configuration first WITHOUT the highlight button flag
        const idpConfig = {
          idpEnabled: data.idpEnabled,
          extractType: data.extractType
        };
        console.log('DIRECT IDP UPDATE: First sending IDP config to update checkbox:', idpConfig);
        onProcessingConfigured(idpConfig);
        
        // Then request the highlight of the Process Document button with a delay
        // to ensure the IDP checkbox is checked first and message appears
        setTimeout(() => {
          const highlightConfig = {
            highlightProcessButton: true
          };
          console.log('DIRECT IDP UPDATE: Now sending highlight config after checkbox update');
          onProcessingConfigured(highlightConfig);
        }, 500); // Longer delay to ensure checkbox updates first
      }
      
      return; // Skip further processing
    }
    
    // Handle the direct button to highlight process button
    if (action === 'highlight_process_button') {
      console.log('Explicit request to highlight Process Document button');
      
      // Create a very noticeable highlight effect
      if (onProcessingConfigured) {
        const config = {
          highlightProcessButton: true,
          pulseEffect: true // Add special pulse effect for more attention
        };
        onProcessingConfigured(config);
        
        // Also display a toast notification pointing to the left panel
        if (window && window.document) {
          // Create a visual arrow effect using CSS animation
          const leftPanelHighlight = document.createElement('div');
          leftPanelHighlight.style.cssText = `
            position: fixed;
            top: 10%;
            left: 1%;
            width: 80px;
            height: 80px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse-left 1.5s infinite;
            pointer-events: none;
            z-index: 9999;
          `;
          
          // Add keyframe animation
          const style = document.createElement('style');
          style.textContent = `
            @keyframes pulse-left {
              0% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 0.8; }
              100% { transform: scale(0.8); opacity: 0.5; }
            }
          `;
          document.head.appendChild(style);
          document.body.appendChild(leftPanelHighlight);
          
          // Remove after 3 seconds
          setTimeout(() => {
            leftPanelHighlight.remove();
            style.remove();
          }, 3000);
        }
      }
      
      return; // Skip standard handling
    }
    
    // Handle highlighting the playground
    if (action === 'highlight_playground') {
      console.log('Explicit request to highlight playground area');
      
      // We'll also handle next step progression for the audio_check message
      handleAction('set_has_audio', { hasAudio: false, nextStep: data.nextStep });
      
      // Show a visual highlight for the playground
      if (window && window.document) {
        // Create a visual highlight effect for the playground area (30% from left, 20% from top)
        const playgroundHighlight = document.createElement('div');
        playgroundHighlight.style.cssText = `
          position: fixed;
          top: 20%;
          left: 30%;
          width: 80px;
          height: 80px;
          background: rgba(79, 70, 229, 0.4);
          border-radius: 50%;
          animation: pulse-playground 1.5s infinite;
          pointer-events: none;
          z-index: 9999;
        `;
        
        // Add keyframe animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse-playground {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(playgroundHighlight);
        
        // Remove after 3 seconds
        setTimeout(() => {
          playgroundHighlight.remove();
          style.remove();
        }, 3000);
      }
      
      return; // Skip further processing
    }
    
    // Handle highlighting the finalization panel
    if (action === 'highlight_finalize') {
      console.log('Explicit request to highlight finalization panel', data);
      
      // Show a visual highlight for the finalization panel
      if (window && window.document) {
        // Create a visual highlight effect for the finalization area (5% from left, 40% from top)
        const finalizeHighlight = document.createElement('div');
        finalizeHighlight.style.cssText = `
          position: fixed;
          top: 40%;
          left: 5%;
          width: 80px;
          height: 80px;
          background: rgba(16, 185, 129, 0.4);
          border-radius: 50%;
          animation: pulse-finalize 1.5s infinite;
          pointer-events: none;
          z-index: 9999;
        `;
        
        // Add keyframe animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse-finalize {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(finalizeHighlight);
        
        // Remove after 4 seconds (longer duration for emphasis)
        setTimeout(() => {
          finalizeHighlight.remove();
          style.remove();
        }, 4000);
      }
      
      // Handle the nextStep if provided - this will transition to step 12 (confirmation)
      if (data && data.nextStep) {
        console.log(`Finalization panel with nextStep: ${data.nextStep}`);
        setTimeout(() => {
          handleAction('next_step', { nextStep: data.nextStep });
        }, 1500); // Short delay to allow the highlight to be visible
      }
      
      return; // Skip further processing
    }
    // Direct path to recommendations step
    else if (action === 'direct_to_recommendations') {
      console.log('ConversationalUI: Direct path to recommendations step triggered');
      
      // First show user message selecting next steps
      sendMessage("Tell me about next steps for financial analysis");
      
      // Then force the transition to recommendations step
      setTimeout(() => {
        // Use the next_step action but with explicit nextStep value
        handleAction('next_step', { nextStep: 'recommendations' });
        
        // Also update the UI immediately with a temporary message
        const tempMessage = {
          id: `msg_${Date.now()}_temp`,
          type: 'assistant',
          content: 'Loading financial analysis recommendations...',
          timestamp: new Date()
        };
        
        // Force a state update to show the loading message while we transition
        enhancedState.messages.push(tempMessage);
        sendMessage('');
      }, 500);
      
      return; // Skip standard handling - important!
    }
    // Handle next_step action to ensure proper transition between conversation steps
    else if (action === 'next_step' && data?.nextStep) {
      console.log(`ConversationalUI: Handling next_step action to ${data.nextStep}`, data);
      
      // Create a direct action message to bypass pattern matching issues
      const actionMessage = `action:${JSON.stringify({ action, data })}`;
      console.log(`ConversationalUI: Sending direct action message: ${actionMessage}`);
      
      // Send the action directly to the conversation manager
      sendMessage(actionMessage);
      
      // Don't return here, let it fall through to also call handleAction directly
    }
    // Handle select_processing similar to an immediate process_document action
    else if (action === 'select_processing' && onProcessingConfigured) {
      console.log('Intercepting select_processing to trigger immediate processing', data);
      
      const config = {
        configuration: data.configuration,
        processingTypes: data.processingTypes,
        triggerType: 'conversation',
        intent: true,
        // Mark it for immediate processing
        processImmediately: true
      };
      
      onProcessingConfigured(config);
    }
    else if (action === 'start_processing' && onProcessingConfigured) {
      const config = getProcessingConfig();
      onProcessingConfigured(config);
    }
    
    // For all other actions, call the standard handler
    if (action !== 'process_directly') {
      handleAction(action, data);
    }
  };

  // Helper function to find best matching action based on text input
  const findBestMatchingAction = (text, actions) => {
    if (!actions || actions.length === 0) return null;

    // Dictionary of common patterns for different action types
    const actionPatterns = {
      'processing': {
        'rag': [
          // Original search terms
          'rag search', 'document search', 'search functionality', 'question answering', 
          'semantic search', 'information retrieval', 'search capability', 'find information', 
          'search document', 'query document', 'rag', 'search', 'retrieval', 'looking up',
          'vector search', 'text search', 'find answers', 'quick search', 'document qa',
          'question answer', 'return answers', 'document lookup', 'answer questions',
          'query answering', 'qa system', 'document querying', 'content search',
          'content lookup', 'content querying', 'content questions', 'search content',
          
          // Financial search terms
          'financial search', 'financial retrieval', 'financial data search', 'enable financial search',
          'find financial information', 'financial intelligence search', 'search financial data',
          'find financial answers', 'query financial data', 'financial document search',
          'financial information retrieval', 'financial search capability', 'search financial content',
          'financial question answering', 'financial insights search', 'financial document lookup',
          'search financial metrics', 'search financial statements', 'search financial reports'
        ],
        'idp': [
          // Original extraction terms
          'document processing', 'idp', 'intelligent document', 'data extraction',
          'extract data', 'form extraction', 'structured data', 'document extraction',
          'document analysis', 'document intelligence', 'document understanding',
          'form processing', 'field extraction', 'table extraction', 'data capture',
          'automated extraction', 'metadata extraction', 'information extraction',
          'document parsing', 'document ai', 'structured extraction', 'form recognition',
          'table recognition', 'document recognition', 'data recognition', 'extract fields',
          'extract tables', 'extract documents', 'extract content', 'document insights',
          
          // Financial extraction terms
          'financial data extraction', 'extract financial data', 'financial extraction',
          'financial tables extraction', 'financial metrics extraction', 'extract financial tables',
          'extract financial metrics', 'financial document extraction', 'financial data capture',
          'financial form extraction', 'financial table recognition', 'financial structured data',
          'extract financial statements', 'extract financial reports', 'financial field extraction',
          'financial information extraction', 'extract financial content', 'financial document processing',
          'enable financial data extraction', 'enable financial extraction', 'financial data processing'
        ],
        'kg': [
          // Original graph terms
          'knowledge graph', 'kg', 'graph analysis', 'entity extraction', 
          'relationship mapping', 'entity relationship', 'graph building',
          'semantic network', 'entity recognition', 'relation extraction',
          'network analysis', 'concept mapping', 'ontology', 'entity linking',
          'graph database', 'knowledge network', 'entity graph', 'knowledge extraction',
          'relationship extraction', 'entity detection', 'graph relationships',
          'entity connections', 'relationship detection', 'concept connections',
          'concept network', 'semantic mapping', 'topic mapping', 'entity map',
          
          // Financial relationship terms
          'financial relationship mapping', 'financial entity relationships', 'map financial relationships',
          'financial entity mapping', 'financial connections', 'financial network analysis',
          'map financial entities', 'financial relationship detection', 'financial knowledge graph',
          'financial entity extraction', 'financial entity recognition', 'financial relationship extraction',
          'map financial connections', 'financial entity network', 'enable financial relationship mapping',
          'financial entity graph', 'enable financial mapping', 'financial network'
        ],
        'all': [
          // Original comprehensive terms
          'all processing', 'all methods', 'everything', 'all of the above', 'comprehensive',
          'full processing', 'combined methods', 'all approaches', 'maximum processing',
          'complete analysis', 'all features', 'full suite', 'everything available',
          'every method', 'all options', 'full analysis', 'use everything', 'all tools',
          'all of them', 'do everything', 'use all', 'enable all', 'all capabilities',
          'full spectrum', 'maximum performance', 'all features', 'complete solution',
          'total processing', 'all processing types', 'use all methods', 'complete package',
          
          // Comprehensive financial terms
          'comprehensive financial analysis', 'complete financial intelligence', 'all financial analysis',
          'full financial processing', 'enable comprehensive financial', 'financial intelligence suite',
          'complete financial processing', 'all financial insights', 'full financial capabilities',
          'total financial analysis', 'financial 360', 'enable comprehensive financial analysis',
          'all financial processing methods', 'all financial approaches', 'maximum financial processing',
          'complete financial solution', 'total financial intelligence', 'financial full spectrum'
        ]
      },
      'role': {
        'sales_rep': [
          'sales rep', 'sales representative', 'seller', 'sales person', 'salesperson', 
          'sales associate', 'sales consultant', 'account executive', 'account rep', 
          'sales executive', 'sales agent', 'i sell', 'i am in sales', 'work in sales', 
          'sales team member', 'sales professional', 'business development rep', 'bdr',
          'client manager', 'account manager', 'client advisor', 'customer advisor',
          'relationship manager', 'business consultant', 'sales consultant', 'sales advisor',
          'client executive', 'sales', 'sales role', 'client facing', 'client representative',
          'territory manager', 'field sales', 'inside sales', 'selling', 'pipeline management'
        ],
        'sales_manager': [
          'sales manager', 'sales lead', 'sales director', 'sales boss', 'head of sales', 
          'sales supervisor', 'sales team lead', 'regional sales manager', 'district manager',
          'vp of sales', 'sales vp', 'senior sales', 'sales leadership', 'manage sales team',
          'sales management', 'director of sales', 'chief sales officer', 'cso', 'sales executive',
          'business unit manager', 'business development director', 'bd manager',
          'business development manager', 'commercial director', 'revenue manager',
          'revenue director', 'sales operations director', 'national sales manager',
          'channel manager', 'partner manager', 'head of business development'
        ],
        'service_agent': [
          'service agent', 'customer service', 'support agent', 'cs agent', 'help desk',
          'customer support', 'customer care', 'support rep', 'support representative',
          'customer success', 'client services', 'technical support', 'service desk',
          'service rep', 'customer advocate', 'service specialist', 'support specialist',
          'customer experience', 'cx', 'service professional', 'customer happiness',
          'helpdesk agent', 'client support', 'customer relations', 'client relations',
          'customer service representative', 'support technician', 'service consultant',
          'client advocate', 'cx specialist', 'account support', 'product support',
          'customer advisor', 'service delivery', 'client success manager'
        ],
        'marketing_specialist': [
          'marketing specialist', 'marketing expert', 'marketer', 'marketing professional',
          'digital marketer', 'content marketer', 'marketing coordinator', 'marketing associate',
          'brand specialist', 'communications specialist', 'marketing analyst', 'growth marketer',
          'marketing strategist', 'product marketer', 'marketing manager', 'marketing team',
          'pr specialist', 'marketing communications', 'marcom', 'social media specialist',
          'content creator', 'seo specialist', 'marketing technologist', 'marketing ops',
          'growth hacker', 'brand manager', 'digital marketing specialist', 'campaign manager',
          'demand generation', 'social media manager', 'community manager', 'content strategist',
          'email marketer', 'marketing automation', 'marketing', 'comms', 'creative'
        ],
        'business_analyst': [
          'business analyst', 'analyst', 'ba', 'business intelligence', 'data analyst',
          'financial analyst', 'operations analyst', 'research analyst', 'systems analyst',
          'business systems analyst', 'process analyst', 'requirements analyst', 'analytics',
          'intelligence specialist', 'insights specialist', 'data scientist', 'market research',
          'analytics professional', 'bi analyst', 'business analytics', 'data engineer',
          'reporting analyst', 'dashboard developer', 'performance analyst', 'metrics analyst',
          'product analyst', 'operations research', 'statistical analyst', 'data modeler',
          'insights manager', 'strategy analyst', 'competitive analyst', 'quantitative analyst',
          'management consultant', 'research', 'analysis', 'trends analyst', 'forecasting'
        ]
      },
      'department': {
        'sales': [
          'sales', 'business development', 'biz dev', 'selling', 'revenue', 'accounts',
          'business development', 'business growth', 'sales ops', 'sales operations',
          'commercial', 'revenue generation', 'deal team', 'deal desk', 'sales enablement',
          'enterprise sales', 'inside sales', 'field sales', 'direct sales', 'channel sales',
          'client acquisition', 'account management', 'solution selling', 'business expansion',
          'client relations', 'revenue operations', 'pipeline management', 'prospecting team',
          'new business', 'customer acquisition', 'relationship management', 'client management',
          'business development team', 'renewal team', 'commercial team', 'quota carriers',
          'potential buyers', 'potential customers', 'prospects', 'buyers', 'end buyers', 'clients'
        ],
        'service': [
          'service', 'support', 'customer service', 'help desk', 'customer support',
          'technical support', 'customer success', 'client services', 'service desk',
          'service operations', 'support operations', 'customer care', 'client care',
          'customer experience', 'cx team', 'customer happiness', 'customer advocacy',
          'support team', 'help center', 'customer relations', 'customer assistance',
          'client support', 'user support', 'account support', 'customer help',
          'service center', 'customer engagement', 'client engagement', 'implementation team',
          'onboarding team', 'client success team', 'technical assistance', 'customer helpdesk',
          'support agents', 'service specialists', 'assistance team', 'support staff', 'consumers'
        ],
        'marketing': [
          'marketing', 'communications', 'marcom', 'brand', 'advertising', 'pr',
          'digital marketing', 'content marketing', 'product marketing', 'growth',
          'demand generation', 'lead generation', 'social media', 'creative',
          'market research', 'marketing ops', 'marketing analytics', 'events',
          'communications', 'branding', 'promotion', 'public relations',
          'content strategy', 'content creation', 'community management', 'email marketing',
          'campaigns', 'brand strategy', 'digital presence', 'market awareness',
          'audience engagement', 'media relations', 'market positioning', 'customer acquisition',
          'customer communication', 'growth marketing', 'field marketing', 'marketing technology',
          'user acquisition', 'audience development', 'outreach', 'promotional teams', 'messaging team'
        ],
        'operations': [
          'operations', 'analytics', 'ops', 'data analysis', 'reporting', 'finance',
          'business operations', 'business intelligence', 'data science', 'bi',
          'strategy', 'planning', 'business strategy', 'strategic planning',
          'process improvement', 'operational excellence', 'performance analysis', 
          'systems', 'logistics', 'supply chain', 'procurement', 'administration',
          'research', 'quality assurance', 'qa', 'data operations', 'efficiency team',
          'continuous improvement', 'data insights', 'metrics', 'kpis', 'dashboard',
          'business efficiency', 'process optimization', 'analysis team', 'decision science',
          'operations research', 'workflow team', 'technical operations', 'internal team',
          'stakeholders', 'leadership', 'executive team', 'management', 'internal departments'
        ]
      },
      'goal': {
        'retrieval': [
          'quick information', 'quick info', 'fast search', 'find info', 'look up', 'search',
          'find answers', 'retrieve information', 'information retrieval', 'query', 'ask questions',
          'get answers', 'lookup', 'search for', 'rag', 'semantic search', 'locate information',
          'information access', 'find facts', 'data lookup', 'find specific', 'locate data'
        ],
        'extraction': [
          'extract data', 'structured data', 'pull data', 'get data', 'extract information',
          'extract fields', 'form extraction', 'document extraction', 'pull structured',
          'table extraction', 'extract tables', 'form fields', 'data extraction', 'idp',
          'intelligent document', 'structured extraction', 'field extraction', 'document processing',
          'automated extraction', 'pull out data', 'extract metadata', 'extract content'
        ],
        'relationships': [
          'relationships', 'connections', 'understand links', 'how things relate', 'network',
          'graph', 'knowledge graph', 'entity links', 'entity relationships', 'kg',
          'entity extraction', 'entity recognition', 'connected data', 'data connections',
          'related entities', 'entity relation', 'relation extraction', 'semantic network',
          'knowledge network', 'ontology', 'semantic relationships', 'concept map'
        ],
        'comprehensive': [
          'comprehensive', 'complete', 'thorough', 'full analysis', 'everything', 'all of it',
          'all processing', 'maximum detail', 'in-depth', 'detailed analysis', 'deep dive',
          'full processing', 'comprehensive overview', 'everything possible', 'combine all',
          'all methods', 'maximum processing', 'all available', 'all capabilities', 'full suite'
        ]
      },
      'multimodal': {
        'hasImages': [
          // Original image patterns
          'yes images', 'has images', 'with images', 'contains images', 'includes images', 'pictures',
          'yes', 'yeah', 'yep', 'yup', 'correct', 'affirmative', 'indeed', 'absolutely', 'sure',
          'it does', 'it has', 'there are', 'there is', 'contains pictures', 'has pictures',
          'has photos', 'contains photos', 'has diagrams', 'contains diagrams', 'has charts',
          'contains charts', 'visual content', 'visual elements', 'graphical content', 'it includes images',
          
          // Financial image patterns
          'analyze financial images', 'financial figures', 'charts and figures', 'analyze images',
          'extract from images', 'process financial charts', 'include financial visuals', 
          'analyze facts in images', 'extract data from figures', 'include image analysis',
          'yes analyze', 'process charts', 'analyze figures', 'financial charts', 'financial diagrams',
          'analyze visual elements', 'extract financial insights from images', 'include visuals',
          'facts and figures', 'financial visualizations', 'analyze with images'
        ],
        'noImages': [
          // Original no-image patterns
          'no images', 'without images', 'doesn\'t have images', 'no pictures', 'text only', 'just text',
          'no', 'nope', 'nah', 'negative', 'not at all', 'doesn\'t', 'does not', 'no pictures',
          'text-based', 'text based', 'only text', 'purely text', 'no visual', 'no visuals',
          'no photos', 'no diagrams', 'no charts', 'no graphical', 'no visual content', 'just words',
          'only words', 'nothing visual', 'no image content',
          
          // Financial text-only patterns
          'text content only', 'skip financial images', 'ignore visual elements', 'skip images',
          'text-based analysis only', 'no need for image analysis', 'process text only',
          'analyze text only', 'skip charts', 'skip figures', 'ignore charts', 'text data only',
          'no charts needed', 'no figures needed', 'skip visual elements', 'text analysis only',
          'focus on text', 'only process text', 'only analyze text', 'text extraction only'
        ]
      },
      'audio': {
        // The audio step is now about exploring financial insights rather than audio content
        'exploreFinancial': [
          'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'sounds good', 'proceed', 'continue',
          'let\'s explore', 'explore insights', 'explore financial', 'financial insights',
          'test search', 'analyze document', 'analyze structure', 'look at content',
          'explore content', 'check it out', 'test functionality', 'i\'ll explore',
          'proceed with analysis', 'continue to analysis', 'explore options', 'that sounds good',
          'ready to explore', 'let\'s continue', 'ready to proceed', 'go ahead', 'move forward'
        ]
      },
      'visual': {
        'hasVisual': [
          'yes analyze', 'analyze visuals', 'visual analysis', 'yes please', 'analyze images',
          'yes', 'yeah', 'yep', 'yup', 'correct', 'affirmative', 'indeed', 'absolutely', 'sure',
          'please do', 'i want that', 'that would be helpful', 'that would be useful', 'that\'s needed',
          'analyze charts', 'analyze diagrams', 'analyze graphs', 'include visual analysis',
          'please analyze', 'yes analyze', 'visual understanding', 'understand visuals',
          'need visual analysis', 'analyze the visuals'
        ],
        'noVisual': [
          'no analysis', 'no visual', 'skip visual', 'no need', 'don\'t analyze',
          'no', 'nope', 'nah', 'negative', 'not at all', 'not needed', 'unnecessary',
          'not required', 'skip it', 'don\'t need that', 'not important', 'pass', 'no thanks',
          'skip that part', 'unnecessary analysis', 'not worth it', 'skip the visuals',
          'ignore visuals', 'text is enough', 'just the text', 'don\'t worry about visuals'
        ]
      },
      'kg': {
        'allEntities': [
          'all entities', 'yes all', 'extract all', 'all of them', 'every entity',
          'yes', 'yeah', 'yep', 'yup', 'correct', 'affirmative', 'indeed', 'absolutely', 'sure',
          'extract everything', 'include all', 'recognize all', 'all entity types', 'don\'t limit',
          'extract all entities', 'identify all', 'detect all', 'map all', 'full entity extraction',
          'comprehensive entities', 'complete entity set', 'maximum entities', 'every possible entity',
          'all types of entities', 'everything', 'all'
        ],
        'specificEntities': [
          'specific entities', 'certain entities', 'particular entities', 'select entities',
          'specific types', 'certain types', 'selected entities', 'chosen entities', 'filter entities',
          'limited entities', 'specific categories', 'select types', 'particular types', 'target entities',
          'focused extraction', 'targeted entities', 'selective entities', 'specific only', 'just specific',
          'only certain', 'not all entities', 'limited selection', 'specific ones', 'particular ones'
        ],
        'noGraph': [
          'no graph', 'no kg', 'no knowledge graph', 'don\'t need graph', 'skip graph',
          'no', 'nope', 'nah', 'negative', 'not at all', 'not needed', 'unnecessary',
          'not required', 'skip it', 'don\'t need that', 'not important', 'pass', 'no thanks',
          'skip that part', 'unnecessary graph', 'not worth it', 'skip the graph',
          'ignore entities', 'skip entities', 'no entity extraction', 'no relationship mapping',
          'don\'t extract entities', 'don\'t map relationships', 'skip knowledge graph'
        ]
      },
      'idp': {
        'structured': [
          // Original patterns
          'structured data', 'structured', 'tables and forms', 'tables', 'forms',
          'table extraction', 'form extraction', 'structured fields', 'structured content',
          'form fields', 'tabular data', 'form data', 'table data', 'tables and charts',
          'structured format', 'data tables', 'extract tables', 'extract forms', 'form recognition',
          'table recognition', 'tabular content', 'structured information', 'extract structured fields',
          
          // Financial patterns
          'financial tables', 'financial metrics', 'financial statements', 'balance sheets',
          'income statements', 'cash flow statements', 'financial data tables',
          'structured financial data', 'extract financial tables', 'extract financial metrics',
          'financial figures', 'financial ratios', 'quarterly data', 'annual data',
          'financial performance metrics', 'key financial indicators', 'financial calculations',
          'extract financial statements', 'financial reporting data', 'earnings data'
        ],
        'metadata': [
          // Original patterns
          'metadata', 'meta', 'document properties', 'properties', 'attributes',
          'document attributes', 'meta information', 'metadata only', 'document metadata',
          'meta extraction', 'properties extraction', 'attribute extraction', 'document info',
          'file properties', 'document details', 'basic metadata', 'essential properties',
          'header information', 'document characteristics', 'document attributes',
          
          // Financial patterns
          'document summary', 'financial metadata', 'document profile', 'financial summary',
          'financial document properties', 'financial attributes', 'document classification',
          'financial document metadata', 'report metadata', 'financial report attributes',
          'document headers', 'financial report details', 'report properties', 
          'financial document info', 'document overview', 'financial document summary'
        ],
        'full': [
          // Original patterns
          'full processing', 'full', 'complete processing', 'everything', 'all processing',
          'comprehensive', 'complete', 'thorough', 'maximum processing', 'full extraction',
          'all features', 'all capabilities', 'complete package', 'comprehensive extraction',
          'extract everything', 'maximum extraction', 'full document processing', 'complete idp',
          'all document features', 'thorough processing', 'process everything', 'extract all',
          
          // Financial patterns
          'comprehensive financial', 'all financial data', 'complete financial extraction',
          'extract all financial data', 'full financial analysis', 'maximum financial extraction',
          'comprehensive financial intelligence', 'complete financial data extraction',
          'extract all financial information', 'deep financial extraction', 'thorough financial analysis',
          'full financial data processing', 'complete financial metrics', 'end-to-end financial extraction',
          'comprehensive financial data', 'all financial metrics and data'
        ],
        'none': [
          // Original patterns
          'no processing', 'none', 'skip processing', 'no idp', 'no extraction',
          'no', 'nope', 'nah', 'negative', 'not at all', 'not needed', 'unnecessary',
          'not required', 'skip it', 'don\'t need that', 'not important', 'pass', 'no thanks',
          'skip that part', 'unnecessary processing', 'not worth it', 'skip extraction',
          'don\'t process', 'skip document processing', 'no document extraction',
          
          // Financial patterns
          'skip financial extraction', 'no financial data', 'skip financial data',
          'no financial extraction', 'exclude financial extraction', 'skip financial metrics',
          'no financial tables', 'don\'t extract financial data', 'bypass financial extraction',
          'ignore financial data', 'exclude financial metrics', 'no financial processing',
          'skip financial tables', 'don\'t need financial extraction', 'skip financial information'
        ]
      },
      'intro': {
        'start': [
          'start', 'let\'s begin', 'proceed', 'get started', 'continue', 'go ahead', 'begin',
          'ready', 'yes', 'lets go', 'let\'s go', 'sure', 'ok', 'okay', 'sounds good', 'alright',
          'i\'m ready', 'ready to start', 'begin now', 'let\'s do it', 'move forward', 'next',
          'let\'s continue', 'continue now', 'i\'m good', 'proceed now', 'move on', 'let us start',
          'let\'s proceed', 'i\'m set', 'initiate', 'get going', 'kick off', 'launch', 'commence',
          'begin the process', 'let\'s get going', 'let\'s move on', 'let\'s start now'
        ]
      }
    };
    
    // Try to match each action based on its label and keywords
    for (const action of actions) {
      const actionLabel = action.label.toLowerCase();
      const actionType = action.action.toLowerCase();
      const actionData = action.data || {};
      
      // First check if the text directly contains the action label
      if (text.includes(actionLabel)) {
        console.log(`Direct match found: text "${text}" matches action label "${actionLabel}"`);
        return action;
      }
      
      // Special handling for role questions with more flexible matching
      if (actionType === 'set_role' && actionData.role) {
        const rolePatterns = actionPatterns.role[actionData.role] || [];
        
        // First check for direct pattern inclusion
        if (rolePatterns.some(pattern => text.includes(pattern))) {
          console.log(`Role match found: "${text}" matched with role "${actionData.role}"`);
          return action;
        }
        
        // Then check for word-by-word partial matches with the question "First, could you tell me about your role in the organization?"
        const roleQuestionPhrases = [
          "role in the organization", 
          "role in your organization",
          "your role", 
          "what do you do", 
          "job title", 
          "position",
          "what's your role",
          "what is your role"
        ];
        
        const isRoleQuestion = roleQuestionPhrases.some(phrase => {
          // Check if the latest assistant message is asking about role
          const latestAssistantMessages = state.messages.filter(m => m.type === 'assistant');
          if (latestAssistantMessages.length === 0) return false;
          
          const latestMessage = latestAssistantMessages[latestAssistantMessages.length - 1];
          return latestMessage.content.toLowerCase().includes(phrase);
        });
        
        if (isRoleQuestion) {
          // For role questions, do a more flexible word-level match
          const textWords = text.split(/\s+/);
          for (const pattern of rolePatterns) {
            const patternWords = pattern.split(/\s+/);
            // Check if any pattern word appears as a standalone word in the text
            for (const patternWord of patternWords) {
              if (patternWord.length > 3 && textWords.includes(patternWord)) { // Only match meaningful words (>3 chars)
                console.log(`Word-level role match found: "${text}" contains "${patternWord}" matching role "${actionData.role}"`);
                return action;
              }
            }
          }
          
          // Additional check for "I am a" or "I'm a" followed by role keywords
          const prefixes = ["i am a", "i'm a", "i work as a", "i work as", "my job is", "my role is"];
          for (const prefix of prefixes) {
            if (text.includes(prefix)) {
              const afterPrefix = text.split(prefix)[1]?.trim();
              if (afterPrefix) {
                for (const pattern of rolePatterns) {
                  // Check if any pattern appears after the prefix
                  if (pattern.length > 3 && afterPrefix.includes(pattern)) {
                    console.log(`Role prefix match found: "${text}" contains "${prefix}" followed by "${pattern}" matching role "${actionData.role}"`);
                    return action;
                  }
                }
              }
            }
          }
        }
      }
      
      // Check if the text contains department-specific patterns
      if (actionType === 'set_department' && actionData.department) {
        const deptPatterns = actionPatterns.department[actionData.department] || [];
        
        // First check for direct pattern inclusion
        if (deptPatterns.some(pattern => text.includes(pattern))) {
          console.log(`Department match found: "${text}" matched with department "${actionData.department}"`);
          return action;
        }
        
        // Then check for word-by-word partial matches with the question "Which department are you working with?"
        const deptQuestionPhrases = [
          "which department", 
          "what department",
          "department are you",
          "department do you",
          "team are you",
          "area are you",
          "group are you"
        ];
        
        const isDeptQuestion = deptQuestionPhrases.some(phrase => {
          // Check if the latest assistant message is asking about department
          const latestAssistantMessages = state.messages.filter(m => m.type === 'assistant');
          if (latestAssistantMessages.length === 0) return false;
          
          const latestMessage = latestAssistantMessages[latestAssistantMessages.length - 1];
          return latestMessage.content.toLowerCase().includes(phrase);
        });
        
        if (isDeptQuestion) {
          // For department questions, do a more flexible word-level match
          const textWords = text.split(/\s+/);
          for (const pattern of deptPatterns) {
            const patternWords = pattern.split(/\s+/);
            // Check if any pattern word appears as a standalone word in the text
            for (const patternWord of patternWords) {
              if (patternWord.length > 3 && textWords.includes(patternWord)) { // Only match meaningful words (>3 chars)
                console.log(`Word-level department match found: "${text}" contains "${patternWord}" matching department "${actionData.department}"`);
                return action;
              }
            }
          }
          
          // Additional check for "I work in" or "I'm in" followed by department keywords
          const prefixes = ["i work in", "i'm in", "i am in", "part of", "i'm part of", "i am part of", "i belong to"];
          for (const prefix of prefixes) {
            if (text.includes(prefix)) {
              const afterPrefix = text.split(prefix)[1]?.trim();
              if (afterPrefix) {
                for (const pattern of deptPatterns) {
                  // Check if any pattern appears after the prefix
                  if (pattern.length > 3 && afterPrefix.includes(pattern)) {
                    console.log(`Department prefix match found: "${text}" contains "${prefix}" followed by "${pattern}" matching department "${actionData.department}"`);
                    return action;
                  }
                }
              }
            }
          }
        }
      }
      
      // Check if the text contains goal-specific patterns
      if (actionType === 'set_goal' && actionData.goal) {
        const goalPatterns = actionPatterns.goal[actionData.goal] || [];
        
        // First check for direct pattern inclusion
        if (goalPatterns.some(pattern => text.includes(pattern))) {
          console.log(`Goal match found: "${text}" matched with goal "${actionData.goal}"`);
          return action;
        }
        
        // Then check for word-by-word partial matches with the goal question "What's your primary goal with this document?"
        const goalQuestionPhrases = [
          "primary goal", 
          "main goal",
          "what's your goal",
          "what is your goal",
          "what do you want to",
          "what are you trying to",
          "purpose",
          "objective"
        ];
        
        const isGoalQuestion = goalQuestionPhrases.some(phrase => {
          // Check if the latest assistant message is asking about goals
          const latestAssistantMessages = state.messages.filter(m => m.type === 'assistant');
          if (latestAssistantMessages.length === 0) return false;
          
          const latestMessage = latestAssistantMessages[latestAssistantMessages.length - 1];
          return latestMessage.content.toLowerCase().includes(phrase);
        });
        
        if (isGoalQuestion) {
          // For goal questions, do a more flexible word-level match
          const textWords = text.split(/\s+/);
          for (const pattern of goalPatterns) {
            const patternWords = pattern.split(/\s+/);
            // Check if any pattern word appears as a standalone word in the text
            for (const patternWord of patternWords) {
              if (patternWord.length > 3 && textWords.includes(patternWord)) { // Only match meaningful words (>3 chars)
                console.log(`Word-level goal match found: "${text}" contains "${patternWord}" matching goal "${actionData.goal}"`);
                return action;
              }
            }
          }
          
          // Additional goal-specific checks
          // Check for retrieval-related verbs and nouns
          if (actionData.goal === 'retrieval') {
            const retrievalVerbs = ['find', 'search', 'look', 'retrieve', 'get', 'query', 'ask'];
            const retrievalNouns = ['information', 'answers', 'questions', 'data', 'facts'];
            
            const hasRetrievalVerb = retrievalVerbs.some(verb => textWords.includes(verb));
            const hasRetrievalNoun = retrievalNouns.some(noun => text.includes(noun));
            
            if (hasRetrievalVerb && hasRetrievalNoun) {
              console.log(`Contextual retrieval goal match: "${text}" contains retrieval verbs and nouns`);
              return action;
            }
          }
          
          // Check for extraction-related verbs and nouns
          if (actionData.goal === 'extraction') {
            const extractionVerbs = ['extract', 'pull', 'get', 'obtain', 'capture', 'collect'];
            const extractionNouns = ['structured', 'tables', 'fields', 'forms', 'data', 'metadata'];
            
            const hasExtractionVerb = extractionVerbs.some(verb => textWords.includes(verb));
            const hasExtractionNoun = extractionNouns.some(noun => text.includes(noun));
            
            if (hasExtractionVerb && hasExtractionNoun) {
              console.log(`Contextual extraction goal match: "${text}" contains extraction verbs and nouns`);
              return action;
            }
          }
          
          // Check for relationship-related verbs and nouns
          if (actionData.goal === 'relationships') {
            const relationshipNouns = ['relationship', 'connection', 'link', 'graph', 'network', 'entity', 'relation'];
            const relationshipVerbs = ['connect', 'relate', 'link', 'associate', 'map'];
            
            const hasRelationshipNoun = relationshipNouns.some(noun => 
              text.includes(noun) || text.includes(noun + 's'));
            const hasRelationshipVerb = relationshipVerbs.some(verb => textWords.includes(verb));
            
            if (hasRelationshipNoun || (hasRelationshipVerb && text.includes('between'))) {
              console.log(`Contextual relationship goal match: "${text}" contains relationship terms`);
              return action;
            }
          }
          
          // Check for comprehensive analysis phrases
          if (actionData.goal === 'comprehensive') {
            const comprehensiveAdjectives = ['full', 'complete', 'comprehensive', 'thorough', 'detailed', 'in-depth', 'all'];
            const comprehensiveNouns = ['analysis', 'understanding', 'processing', 'overview'];
            
            const hasComprehensiveAdj = comprehensiveAdjectives.some(adj => textWords.includes(adj));
            const hasComprehensiveNoun = comprehensiveNouns.some(noun => text.includes(noun));
            
            if (hasComprehensiveAdj || (text.includes('everything') || text.includes('all of it'))) {
              console.log(`Contextual comprehensive goal match: "${text}" indicates comprehensive analysis`);
              return action;
            }
          }
        }
      }
      
      // Check for processing method selection patterns
      if (actionType === 'select_processing' && actionData.processingTypes) {
        // First check if this is the processing recommendation question - updated for financial terms
        const processingRecommendationPhrases = [
          // Original phrases
          "recommend the following", 
          "following processing methods",
          "based on your needs",
          "recommend these processing",
          "suggested processing",
          "recommended methods",
          
          // New financial phrases
          "financial analysis requirements",
          "specialized processing methods", 
          "financial intelligence index",
          "configuration look appropriate",
          "when you approve",
          "allows you to search",
          "extract insights",
          "based on your financial"
        ];
        
        const isProcessingQuestion = processingRecommendationPhrases.some(phrase => {
          // Check if the latest assistant message is asking about processing methods
          const latestAssistantMessages = state.messages.filter(m => m.type === 'assistant');
          if (latestAssistantMessages.length === 0) return false;
          
          const latestMessage = latestAssistantMessages[latestAssistantMessages.length - 1];
          const found = latestMessage.content.toLowerCase().includes(phrase);
          
          if (found) {
            console.log(`Processing question detected via phrase: "${phrase}" in message: "${latestMessage.content.substring(0, 50)}..."`);
          }
          
          return found;
        });
        
        // Enhanced logging
        if (!isProcessingQuestion) {
          console.log("Did not detect processing question in latest message. This might prevent matching financial terms.");
          console.log("Latest message:", state.messages[state.messages.length - 1]?.content?.substring(0, 100) + "...");
        }
        
        if (isProcessingQuestion) {
          // Enhanced logging
          console.log("Processing action matching for text:", text);
          
          // Check for RAG search - with improved pattern matching and logging
          const matchedRagPattern = actionPatterns.processing.rag.find(pattern => 
            text.toLowerCase().includes(pattern.toLowerCase())
          );
          
          if (actionData.processingTypes.includes('rag') && matchedRagPattern) {
            console.log(`Processing match found: "${text}" matched with "Financial Search & Retrieval" via pattern "${matchedRagPattern}"`);
            return action;
          }
          
          // Check for Knowledge Graph - with improved pattern matching and logging
          const matchedKgPattern = actionPatterns.processing.kg.find(pattern => 
            text.toLowerCase().includes(pattern.toLowerCase())
          );
          
          if (actionData.processingTypes.includes('kg') && matchedKgPattern) {
            console.log(`Processing match found: "${text}" matched with "Financial Relationship Mapping" via pattern "${matchedKgPattern}"`);
            return action;
          }
          
          // Check for Document Processing - with improved pattern matching and logging
          const matchedIdpPattern = actionPatterns.processing.idp.find(pattern => 
            text.toLowerCase().includes(pattern.toLowerCase())
          );
          
          if (actionData.processingTypes.includes('idp') && matchedIdpPattern) {
            console.log(`Processing match found: "${text}" matched with "Financial Data Extraction" via pattern "${matchedIdpPattern}"`);
            return action;
          }
          
          // Check for All Processing Methods - with improved pattern matching and logging
          const matchedAllPattern = actionPatterns.processing.all.find(pattern => 
            text.toLowerCase().includes(pattern.toLowerCase())
          );
          
          if (actionData.processingTypes.includes('rag') && 
              actionData.processingTypes.includes('kg') && 
              actionData.processingTypes.includes('idp') && 
              matchedAllPattern) {
            console.log(`Processing match found: "${text}" matched with "Comprehensive Financial Analysis" via pattern "${matchedAllPattern}"`);
            return action;
          }
          
          // Added special case for matching by processing method label - updated for financial terms
          if ((actionLabel.toLowerCase().includes('rag') || actionLabel.toLowerCase().includes('financial search') || actionLabel.toLowerCase().includes('financial retrieval')) && 
              (text.includes('rag') || text.includes('search') || text.includes('financial') || text.includes('retrieval'))) {
            console.log(`Label match found: "${text}" matched with Financial Search label: "${actionLabel}"`);
            return action;
          }
          
          if ((actionLabel.toLowerCase().includes('knowledge graph') || actionLabel.toLowerCase().includes('financial relationship') || actionLabel.toLowerCase().includes('financial entity')) && 
              (text.includes('kg') || text.includes('knowledge') || text.includes('graph') || text.includes('relationship') || text.includes('financial') || text.includes('mapping'))) {
            console.log(`Label match found: "${text}" matched with Financial Relationship label: "${actionLabel}"`);
            return action;
          }
          
          if ((actionLabel.toLowerCase().includes('document processing') || actionLabel.toLowerCase().includes('financial data extraction') || actionLabel.toLowerCase().includes('financial extraction')) && 
              (text.includes('idp') || text.includes('document') || text.includes('processing') || text.includes('extraction') || text.includes('financial data') || text.includes('financial'))) {
            console.log(`Label match found: "${text}" matched with Financial Extraction label: "${actionLabel}"`);
            return action;
          }
          
          if ((actionLabel.toLowerCase().includes('all') || actionLabel.toLowerCase().includes('comprehensive financial') || actionLabel.toLowerCase().includes('financial intelligence')) && 
              (text.includes('all') || text.includes('everything') || text.includes('all of them') || text.includes('comprehensive') || text.includes('complete') || text.includes('financial'))) {
            console.log(`Label match found: "${text}" matched with Comprehensive Financial label: "${actionLabel}"`);
            return action;
          }
          
          // Try to match numeric selections like "option 1", "number 2", "first one", etc.
          const numericPatterns = {
            1: ['1', 'one', 'first'],
            2: ['2', 'two', 'second'],
            3: ['3', 'three', 'third'],
            4: ['4', 'four', 'fourth']
          };
          
          // Find the position of this action in the list of actions
          const allActions = state.messages[state.messages.length - 1].actions || [];
          const actionPosition = allActions.findIndex(a => a.id === action.id);
          
          if (actionPosition >= 0) {
            const position = actionPosition + 1; // Convert to 1-based for user-friendly numbering
            const positionPatterns = numericPatterns[position] || [];
            
            for (const pattern of positionPatterns) {
              const numericRegex = new RegExp(`\\b${pattern}\\b|${pattern}[^\\w]|[^\\w]${pattern}\\b`);
              if (numericRegex.test(text)) {
                console.log(`Numeric match found: "${text}" matched position ${position} with pattern "${pattern}"`);
                return action;
              }
            }
          }
        }
      }
      
      // Check for "Let's get started" patterns
      if (actionType === 'next_step' && actionLabel.includes("let's get started")) {
        const startPatterns = actionPatterns.intro.start;
        if (startPatterns.some(pattern => text.includes(pattern))) {
          console.log(`Start match found: "${text}" matched with "Let's get started"`);
          return action;
        }
      }
      
      // Special case for configuration panel directions
      if (actionType === 'highlight_process_button') {
        // Check for phrases indicating interest in configuration panel
        const configPhrases = [
          'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'sounds good', 'show me', 'i\'ll check',
          'configuration', 'panel', 'settings', 'options', 'left panel', 'check it out', 'show configuration',
          'explore options', 'see settings', 'check settings', 'check options', 'i want to see', 'proceed',
          'continue', 'go ahead', 'that works', 'that\'s fine', 'agreed', 'left side', 'config panel'
        ];
        
        if (configPhrases.some(phrase => text.toLowerCase().includes(phrase.toLowerCase()))) {
          console.log(`Configuration panel interest detected: "${text}" contains phrases indicating interest in options`);
          return action;
        }
      }
      
      // Special case for playground highlight
      if (actionType === 'highlight_playground') {
        // Check for phrases indicating interest in playground exploration
        const playgroundPhrases = [
          'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'sounds good', 'show me', 'i\'ll explore',
          'playground', 'try it', 'test', 'explore', 'let me see', 'check it out', 'show playground',
          'financial insights', 'content understanding', 'search functionality', 'document structure',
          'hands-on', 'experience', 'i want to try', 'proceed', 'continue', 'go ahead', 'try out'
        ];
        
        if (playgroundPhrases.some(phrase => text.toLowerCase().includes(phrase.toLowerCase()))) {
          console.log(`Playground interest detected: "${text}" contains phrases indicating interest in exploring playground`);
          return action;
        }
      }
      
      // Special case for finalization panel highlight
      if (actionType === 'highlight_finalize') {
        // Check for phrases indicating interest in finalization
        const finalizePhrases = [
          'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'sounds good', 'show me', 'finalize',
          'finalization', 'complete', 'finish', 'done', 'ready', 'show finalize', 'show panel',
          'show me finalization', 'finalization panel', 'configuration panel', 'output', 'generate',
          'create outputs', 'create results', 'process document', 'process', 'run analysis', 
          'start processing', 'financial insights', 'financial analysis', 'insights'
        ];
        
        if (finalizePhrases.some(phrase => text.toLowerCase().includes(phrase.toLowerCase()))) {
          console.log(`Finalization panel interest detected: "${text}" contains phrases indicating interest in finalizing`);
          return action;
        }
      }
      
      // Check for multimodal preferences - Enhanced for financial images
      if (actionType === 'set_has_images') {
        // Enhanced pattern matching with better logging
        const matchedImagePattern = actionPatterns.multimodal.hasImages.find(pattern => 
          text.toLowerCase().includes(pattern.toLowerCase())
        );
        
        const matchedNoImagePattern = actionPatterns.multimodal.noImages.find(pattern => 
          text.toLowerCase().includes(pattern.toLowerCase())
        );
        
        // Log additional info for debugging
        console.log(`Checking image preferences for: "${text}"`);
        
        if (actionData.hasImages && matchedImagePattern) {
          console.log(`Financial image match found: "${text}" matched with "Analyze financial images" via pattern "${matchedImagePattern}"`);
          return action;
        } else if (!actionData.hasImages && matchedNoImagePattern) {
          console.log(`Text-only match found: "${text}" matched with "Process text content only" via pattern "${matchedNoImagePattern}"`);
          return action;
        }
      }
      
      // Check for financial exploration confirmation (replaces audio check)
      if (actionType === 'set_has_audio') {
        // Since we no longer have audio content check, but just a confirmation to explore
        const matchedExplorePattern = actionPatterns.audio.exploreFinancial.find(pattern => 
          text.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matchedExplorePattern) {
          console.log(`Financial exploration match found: "${text}" matched with pattern "${matchedExplorePattern}"`);
          return action;
        }
        
        // Default response for almost any input here since it's just a confirmation step
        console.log(`Defaulting to exploration confirmation for input: "${text}"`);
        return action;
      }
      
      // Check for visual analysis preferences
      if (actionType === 'set_visual_analysis') {
        if (actionData.visualAnalysis && actionPatterns.visual.hasVisual.some(pattern => text.includes(pattern))) {
          console.log(`Visual analysis match found: "${text}" matched with "Analyze visuals"`);
          return action;
        } else if (!actionData.visualAnalysis && actionPatterns.visual.noVisual.some(pattern => text.includes(pattern))) {
          console.log(`No visual analysis match found: "${text}" matched with "No visual analysis"`);
          return action;
        }
      }
      
      // Check for KG (Knowledge Graph) preferences
      if (actionType === 'process_directly' && actionData.kgEnabled !== undefined) {
        if (actionData.kgEnabled && actionData.entityTypes === 'all' && 
            actionPatterns.kg.allEntities.some(pattern => text.includes(pattern))) {
          console.log(`KG all entities match found: "${text}" matched with "All entities"`);
          return action;
        } else if (!actionData.kgEnabled && 
                  actionPatterns.kg.noGraph.some(pattern => text.includes(pattern))) {
          console.log(`No KG match found: "${text}" matched with "No graph needed"`);
          return action;
        }
      } else if (actionType === 'set_kg_preferences') {
        if (actionData.kgEnabled && actionData.entityTypes === 'specific' && 
            actionPatterns.kg.specificEntities.some(pattern => text.includes(pattern))) {
          console.log(`KG specific entities match found: "${text}" matched with "Specific entities"`);
          return action;
        }
      }
      
      // Check for IDP (Intelligent Document Processing) preferences
      if (actionType === 'set_idp_preferences' && actionData.extractType) {
        const extractType = actionData.extractType;
        
        // Enhanced logging
        console.log(`Checking IDP preferences for extractType "${extractType}" with text: "${text}"`);
        
        // Find exact pattern match using case-insensitive comparison
        const matchedPattern = actionPatterns.idp[extractType]?.find(pattern => 
          text.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matchedPattern) {
          console.log(`IDP match found: "${text}" matched with "${extractType} processing" via pattern "${matchedPattern}"`);
          return action;
        }
        
        // Special case handling for financial-specific terms
        if (extractType === 'structured' && 
            (text.includes('tables') || text.includes('metrics') || text.includes('figures') || text.includes('financial data')) &&
            text.includes('financial')) {
          console.log(`Financial structured data match found: "${text}" contains tables/metrics/figures and financial terms`);
          return action;
        }
        
        if (extractType === 'metadata' && 
            (text.includes('summary') || text.includes('overview') || text.includes('document info')) &&
            text.includes('financial')) {
          console.log(`Financial metadata match found: "${text}" contains summary/overview and financial terms`);
          return action;
        }
        
        if (extractType === 'full' && 
            (text.includes('all') || text.includes('comprehensive') || text.includes('complete') || text.includes('everything')) &&
            text.includes('financial')) {
          console.log(`Financial full processing match found: "${text}" contains comprehensive terms and financial reference`);
          return action;
        }
        
        if (extractType === 'none' && 
            (text.includes('skip') || text.includes('no') || text.includes('don\'t') || text.includes('exclude')) &&
            text.includes('financial')) {
          console.log(`Skip financial extraction match found: "${text}" contains skip/no terms and financial reference`);
          return action;
        }
      }
    }
    
    // No match found
    return null;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim().toLowerCase();
    
    // *** SPECIAL HANDLING FOR "TELL ME MORE ON NEXT STEPS" ***
    // This needs to be first in the order to prevent other patterns from catching it
    
    // These are very specific patterns that should only match "Tell me more on next steps" requests
    const exactNextStepsPatterns = [
      'tell me more on next steps',
      'what are the next steps',
      'how do i finalize this',
      'how do i complete the process',
      'show me the finalization options',
      'how to finalize this document',
      'next steps'
    ];
    
    // Exact match check (to prevent false positives with intro pattern)
    const hasExactNextStepsMatch = exactNextStepsPatterns.some(pattern => 
      text.toLowerCase() === pattern.toLowerCase() || 
      text.toLowerCase().trim() === pattern.toLowerCase().trim()
    );
    
    // More general pattern check - make sure these only match when the phrase is central to the message
    const nextStepsPatterns = [
      'tell me more on next steps',
      'what next', 
      'what should i do next',
      'what now', 
      'what\'s next', 
      'how do i proceed', 
      'finalization', 
      'finalize process', 
      'complete setup',
      'how do i finalize',
      'show finalization',
      'finish process'
    ];
    
    // Enhanced check to avoid false positives - check for substring containment
    // Only match if the pattern is a significant part of the message
    const includesNextStepsPattern = 
      nextStepsPatterns.some(pattern => {
        const idx = text.toLowerCase().indexOf(pattern.toLowerCase());
        // Only match if the pattern is found AND it's not just a small part of a longer text
        return idx >= 0 && 
               (pattern.length >= 8 || // Short patterns must be standalone
                pattern.length / text.length > 0.4); // Pattern must be a significant portion of message
      });
    
    // Log current conversation step for debugging
    console.log(`Next steps check: Exact match: ${hasExactNextStepsMatch}, Pattern includes: ${includesNextStepsPattern}, Text: "${text}"`);
    
    // Trigger the special handling if we have a next steps match
    // This MUST come before other pattern handling
    if (hasExactNextStepsMatch || includesNextStepsPattern) {
      console.log(`Triggering "Tell me more on next steps" guidance`);
      
      // First show the user message
      sendMessage(inputValue);
      setInputValue('');
      
      // Then send a message about finalization with the configuration panel
      setTimeout(() => {
        const finalizationMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: 'You\'ve now configured financial intelligence extraction for your document. To generate financial insights, please visit the configuration panel on the left side. Click the "Finalize" button to process your document with the selected financial settings and generate actionable financial metrics, analysis, and insights that you can query and explore.',
          timestamp: new Date(),
          actions: [{
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            label: 'Show me the finalization panel',
            action: 'highlight_finalize',
            data: { nextStep: 'confirmation' }
          }]
        };
        
        // Add the message to the state
        state.messages.push(finalizationMessage);
        
        // Force a re-render
        // Use empty flag to avoid processing the empty message
        enhancedState.suppressProcessing = true;
        sendMessage('');
        enhancedState.suppressProcessing = false;
        
        // Show a highlight for the finalization panel
        if (window && window.document) {
          // Create a visual highlight effect for the finalization area (5% from left, 40% from top)
          const finalizeHighlight = document.createElement('div');
          finalizeHighlight.style.cssText = `
            position: fixed;
            top: 40%;
            left: 5%;
            width: 80px;
            height: 80px;
            background: rgba(16, 185, 129, 0.4);
            border-radius: 50%;
            animation: pulse-finalize 1.5s infinite;
            pointer-events: none;
            z-index: 9999;
          `;
          
          // Add keyframe animation
          const style = document.createElement('style');
          style.textContent = `
            @keyframes pulse-finalize {
              0% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 0.8; }
              100% { transform: scale(0.8); opacity: 0.5; }
            }
          `;
          document.head.appendChild(style);
          document.body.appendChild(finalizeHighlight);
          
          // Remove after 4 seconds (longer duration for emphasis)
          setTimeout(() => {
            finalizeHighlight.remove();
            style.remove();
          }, 4000);
          
          // Also transition to the confirmation step after a delay
          setTimeout(() => {
            console.log('Transitioning to confirmation step from Tell me more on next steps');
            handleAction('next_step', { nextStep: 'confirmation' });
          }, 2500); // Longer delay to give time to read the message
        }
      }, 500);
      
      return;
    }
    
    // *** STANDARD MESSAGE HANDLING GOES AFTER THE SPECIAL CASE ***
    const latestAssistantMessage = state.messages[state.messages.length - 1];
    
    // Only try to match text input with actions if the latest message is from the assistant and has actions
    if (latestAssistantMessage && 
        latestAssistantMessage.type === 'assistant' && 
        latestAssistantMessage.actions && 
        latestAssistantMessage.actions.length > 0) {
      
      // First check for the contract document intro message specifically (for backward compatibility)
      // Make this check more specific to prevent false matches with "Tell me more on next steps"
      if (latestAssistantMessage.content.includes("I've identified this as a contract document") &&
          latestAssistantMessage.actions.some(a => a.label.includes("Let's get started"))) {
        
        // Create a specific list of patterns that ONLY indicate "get started" intent
        const startPatterns = [
          'start', 'begin', 'let\'s start', 'let\'s begin', 
          'get started', 'proceed', 'continue', 'go ahead'
        ];
        
        // Check for exact matches to prevent false positives
        const hasStartPattern = startPatterns.some(pattern => 
          text === pattern || 
          text.includes(` ${pattern} `) || 
          text.startsWith(`${pattern} `) || 
          text.endsWith(` ${pattern}`)
        );
        
        if (hasStartPattern) {
          console.log('Text input matched specific "start" pattern - triggering Let\'s get started button');
          
          // Find the "Let's get started" action
          const startAction = latestAssistantMessage.actions.find(a => 
            a.label.includes("Let's get started")
          );
          
          if (startAction) {
            // Show the user's message first
            sendMessage(inputValue);
            setInputValue('');
            setIsTyping(true);
            
            // Then trigger the action after a short delay
            setTimeout(() => {
              handleActionWithConfig(startAction.action, startAction.data);
              setIsTyping(false);
            }, 500);
            
            return;
          }
        }
      } 
      // For all other questions, try to find a matching action based on text patterns
      else {
        const matchingAction = findBestMatchingAction(text, latestAssistantMessage.actions);
        
        if (matchingAction) {
          console.log('Found matching action for text input:', matchingAction.label);
          
          // Show the user's message first
          sendMessage(inputValue);
          setInputValue('');
          setIsTyping(true);
          
          // Then trigger the action after a short delay
          setTimeout(() => {
            handleActionWithConfig(matchingAction.action, matchingAction.data);
            setIsTyping(false);
          }, 500);
          
          return;
        }
      }
    }
    
    // Default handling for messages that don't match any action
    sendMessage(inputValue);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ConversationMessage) => {
    const isUser = message.type === 'user';
    
    // Simple markdown renderer for bold text
    const renderContent = (content: string) => {
      // Replace **text** with bold text
      const parts = content.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index}>{part}</strong>;
        }
        return part;
      });
    };
    
    // Function to get icon based on action type or content
    const getActionIcon = (action: string) => {
      switch (action) {
        case 'configure_rag':
        case 'enable_rag':
          return <FileSearch className="h-3 w-3" />;
        case 'configure_kg':
        case 'enable_kg':
          return <Network className="h-3 w-3" />;
        case 'configure_idp':
        case 'enable_idp':
          return <FileText className="h-3 w-3" />;
        case 'image_caption':
          return <Camera className="h-3 w-3" />;
        case 'transcription':
          return <Headphones className="h-3 w-3" />;
        case 'ocr':
          return <TextCursor className="h-3 w-3" />;
        case 'visual_analysis':
          return <Eye className="h-3 w-3" />;
        default:
          return <Settings className="h-3 w-3" />;
      }
    };
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 mb-4 w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <div className="flex-shrink-0">
            <Avatar className="h-9 w-9 ring-2 ring-gray-300">
              <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300">
                <Brain className="h-5 w-5 text-gray-600" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className={cn(
          "max-w-[75%] rounded-xl shadow-sm overflow-hidden",
          isUser 
            ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4" 
            : "bg-gray-50 border border-gray-300 p-4"
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {renderContent(message.content)}
          </div>
          
          {/* "Other (manual input)" section has been hidden */}
          
          {/* Render action buttons if available */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-4 w-full">
              {/* Added max-h-60 and overflow-y-auto for scrollable container */}
              <div className="max-h-60 overflow-y-auto pr-1">
                {message.actions.map(action => (
                  <Button
                    key={action.id}
                    variant={isUser ? "secondary" : "outline"}
                    size="sm"
                    className="w-full justify-start gap-2 transition-all hover:scale-[1.02] overflow-hidden mb-2"
                    onClick={() => handleActionWithConfig(action.action, action.data)}
                    title={action.label} // Add title for tooltip on hover
                  >
                    {getActionIcon(action.action)}
                    <span className="truncate">{action.label}</span>
                  </Button>
                ))}
              </div>
              {/* "Other (manual input)" section has been hidden */}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0">
            <Avatar className="h-9 w-9 ring-2 ring-gray-300">
              <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-400">
                <User className="h-5 w-5 text-gray-600" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    );
  };

  if (!documentAnalysis) {
    return (
      <Card className={cn("bg-gradient-to-br from-gray-200 to-gray-300", className)}>
        <CardContent className="p-8 text-center">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-md">
            <MessageSquare className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Document Selected</h3>
          <p className="text-gray-600">Upload a document to start the conversation</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Configuration Assistant
            </div>
            {state.isComplete && (
              <div className="flex items-center gap-2">
                {enhancedState.selectedFeatures?.includes('rag') && (
                  <Badge variant="secondary" className="text-xs">
                    <FileSearch className="h-3 w-3 mr-1" />
                    RAG
                  </Badge>
                )}
                {enhancedState.selectedFeatures?.includes('kg') && (
                  <Badge variant="secondary" className="text-xs">
                    <Network className="h-3 w-3 mr-1" />
                    KG
                  </Badge>
                )}
                {enhancedState.selectedFeatures?.includes('idp') && (
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    IDP
                  </Badge>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.messages.slice(-2).map(renderMessage)}
            {state.isComplete && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Configuration complete! Processing with {enhancedState.selectedFeatures?.join(', ') || 'selected'} methods.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      {documentAnalysis && (
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">
              Document Type: <Badge variant="secondary" className="ml-2">{documentAnalysis.documentType}</Badge>
            </p>
            <Badge variant="outline" className="bg-gray-100">
              <Activity className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      )}
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-100 to-gray-200">
          <div className="space-y-4 flex flex-col w-full">
            {state.messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex gap-3 justify-start w-full">
                <div className="flex-shrink-0">
                  <Avatar className="h-9 w-9 ring-2 ring-gray-300">
                    <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300">
                      <Brain className="h-5 w-5 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="max-w-[75%] bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="border-t bg-gray-200 px-4 py-3">
        {!state.isComplete ? (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your Prompt..."
              className="flex-1 bg-gray-100 border-gray-300"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Configuration complete! Your document will be processed with the selected settings.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default ConversationalUI;