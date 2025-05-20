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
  
  // Check for semantic chunking messages and enable RAG checkbox
  useEffect(() => {
    // Look for the specific message about semantic chunking
    const semanticChunkingMessage = state.messages.find(msg => 
      msg.type === 'assistant' && 
      (msg.content.includes("Semantic chunking is enabled") || 
       msg.content.includes("semantic chunking"))
    );
    
    // If the message is found and we have a handler for processing configuration
    if (semanticChunkingMessage && onProcessingConfigured) {
      console.log('Found semantic chunking message, enabling RAG checkbox');
      
      // Check if the message mentions 'floor plans', 'drawings', or similar visual terms
      const hasVisualElements = semanticChunkingMessage.content.toLowerCase().includes('floor plan') || 
                                semanticChunkingMessage.content.toLowerCase().includes('drawing') ||
                                semanticChunkingMessage.content.toLowerCase().includes('visual') ||
                                semanticChunkingMessage.content.toLowerCase().includes('diagram');
      
      // Enable RAG with proper multimodal settings
      const config = {
        ragEnabled: true, // This will enable the RAG checkbox
        checked: true,    // Explicitly mark the checkbox as checked
        forceCheck: true, // Force check the checkbox
        active: true,     // Indicate the feature is active
        multimodal: {
          imageCaption: hasVisualElements,
          ocr: hasVisualElements
        }
      };
      
      // Configure RAG
      onProcessingConfigured(config);
      
      // Send a second update after a small delay to ensure the UI updates
      setTimeout(() => {
        console.log('Sending secondary RAG checkbox update');
        onProcessingConfigured({
          ragEnabled: true,
          checked: true,
          state: 'checked', // Set the data-state attribute
          refreshUI: true   // Signal to refresh the UI
        });
        
        // Direct DOM manipulation for maximum reliability
        if (window && window.document) {
          try {
            console.log('Attempting direct checkbox manipulation');
            // Find the RAG Search checkbox by its role and nearby text content
            const allCheckboxes = document.querySelectorAll('button[role="checkbox"]');
            let ragCheckbox = null;
            
            // Find the checkbox next to "RAG Search" text
            for (let i = 0; i < allCheckboxes.length; i++) {
              const checkbox = allCheckboxes[i];
              // Check if there's nearby text containing "RAG Search"
              const parent = checkbox.closest('.flex.items-start.space-x-3');
              if (parent && parent.textContent.includes('RAG Search')) {
                ragCheckbox = checkbox;
                break;
              }
            }
            
            if (ragCheckbox) {
              console.log('Found RAG Search checkbox, setting attributes');
              // Set all the attributes that might control the checked state
              ragCheckbox.setAttribute('aria-checked', 'true');
              ragCheckbox.setAttribute('data-state', 'checked');
              ragCheckbox.classList.add('data-[state=checked]:bg-primary');
              ragCheckbox.classList.add('data-[state=checked]:text-primary-foreground');
              
              // Also directly set background color
              ragCheckbox.style.backgroundColor = 'hsl(var(--primary))';
              ragCheckbox.style.color = 'hsl(var(--primary-foreground))';
              
              // Add a checkmark icon inside
              const checkIcon = document.createElement('svg');
              checkIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              checkIcon.setAttribute('width', '15');
              checkIcon.setAttribute('height', '15');
              checkIcon.setAttribute('viewBox', '0 0 15 15');
              checkIcon.setAttribute('fill', 'none');
              checkIcon.innerHTML = '<path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>';
              
              ragCheckbox.innerHTML = '';
              ragCheckbox.appendChild(checkIcon);
              
              console.log('Direct checkbox manipulation complete');
            } else {
              console.log('Could not find RAG Search checkbox');
            }
          } catch (error) {
            console.error('Error during direct checkbox manipulation:', error);
          }
        }
      }, 300);
      
      // No follow-up message for RAG
    }
  }, [state.messages, onProcessingConfigured]);
  
  // Check for knowledge graph ready messages and enable KG checkbox
  useEffect(() => {
    // Look for the specific message about knowledge graph being ready
    const knowledgeGraphMessage = state.messages.find(msg => 
      msg.type === 'assistant' && 
      msg.content.includes("Knowledge graph is ready")
    );
    
    // If the message is found and we have a handler for processing configuration
    if (knowledgeGraphMessage && onProcessingConfigured) {
      console.log('Found knowledge graph ready message, enabling KG checkbox');
      
      // Enable KG with entities
      const config = {
        kgEnabled: true, // This will enable the KG checkbox
        entityTypes: 'all', // Default to all entity types
        kgUpdate: true // Flag to mark this as a dedicated KG update
      };
      
      // Configure KG
      onProcessingConfigured(config);
      
      // After a 2-second delay, send a follow-up message
      setTimeout(() => {
        // Add a message to the conversation
        sendMessage("I have now enabled Knowledge Graph processing, what else would you like to do?");
      }, 2000);
    }
  }, [state.messages, onProcessingConfigured, sendMessage]);
  
  // Check for document processing available messages and enable IDP checkbox
  useEffect(() => {
    // Look for the specific message about document processing being available
    const documentProcessingMessage = state.messages.find(msg => 
      msg.type === 'assistant' && 
      msg.content.includes("Document processing is available")
    );
    
    // If the message is found and we have a handler for processing configuration
    if (documentProcessingMessage && onProcessingConfigured) {
      console.log('Found document processing message, enabling IDP checkbox');
      
      // Enable IDP with default settings
      const config = {
        idpEnabled: true, // This will enable the IDP checkbox
        extractType: 'full', // Default to full extraction
      };
      
      // Configure IDP
      onProcessingConfigured(config);
      
      // After a 2-second delay, send a follow-up message
      setTimeout(() => {
        // Add a message to the conversation
        sendMessage("I have now enabled Document Processing, what else would you like to do?");
      }, 2000);
    }
  }, [state.messages, onProcessingConfigured, sendMessage]);

  // Override the handleAction to intercept start_processing, select_processing, and process_directly
  const handleActionWithConfig = (action: string, data?: any) => {
    // Special handling for custom contract flow actions
    if (action === 'custom_contract_flow') {
      console.log('Custom contract flow action triggered:', data);
      
      // Create a direct user message instead of using sendMessage
      // This ensures it appears immediately in the conversation
      if (data?.userResponse) {
        const userMessage: ConversationMessage = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'user',
          content: data.userResponse,
          timestamp: new Date()
        };
        
        // Directly add to state instead of using sendMessage
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, userMessage]
        }));
        
        // Add a small delay before proceeding to ensure user message is visible
        setTimeout(() => {
          // If we've reached the confirmation step with semantic chunking, ensure RAG is enabled
          if (data?.step === 'processing_confirmation') {
            console.log('Processing confirmation step - enabling RAG checkbox');
            
            if (onProcessingConfigured) {
              const config = {
                ragEnabled: true,
                checked: true,    // Explicitly mark the checkbox as checked
                forceCheck: true, // Force check the checkbox
                active: true,     // Indicate the feature is active
                state: 'checked', // Set the data-state attribute
                multimodal: {
                  imageCaption: !data.skipImages,
                  ocr: !data.skipImages,
                  visualAnalysis: !data.skipImages
                }
              };
              console.log('Sending RAG config to update checkbox:', config);
              onProcessingConfigured(config);
              
              // Send a second update after a small delay to ensure the UI updates
              setTimeout(() => {
                console.log('Sending secondary RAG checkbox update');
                onProcessingConfigured({
                  ragEnabled: true,
                  checked: true,
                  state: 'checked',
                  refreshUI: true // Signal to refresh the UI
                });
                
                // Direct DOM manipulation for maximum reliability
                if (window && window.document) {
                  try {
                    console.log('Attempting direct checkbox manipulation');
                    // Find the RAG Search checkbox by its role and nearby text content
                    const allCheckboxes = document.querySelectorAll('button[role="checkbox"]');
                    let ragCheckbox = null;
                    
                    // Find the checkbox next to "RAG Search" text
                    for (let i = 0; i < allCheckboxes.length; i++) {
                      const checkbox = allCheckboxes[i];
                      // Check if there's nearby text containing "RAG Search"
                      const parent = checkbox.closest('.flex.items-start.space-x-3');
                      if (parent && parent.textContent.includes('RAG Search')) {
                        ragCheckbox = checkbox;
                        break;
                      }
                    }
                    
                    if (ragCheckbox) {
                      console.log('Found RAG Search checkbox, setting attributes');
                      // Set all the attributes that might control the checked state
                      ragCheckbox.setAttribute('aria-checked', 'true');
                      ragCheckbox.setAttribute('data-state', 'checked');
                      ragCheckbox.classList.add('data-[state=checked]:bg-primary');
                      ragCheckbox.classList.add('data-[state=checked]:text-primary-foreground');
                      
                      // Also directly set background color
                      ragCheckbox.style.backgroundColor = 'hsl(var(--primary))';
                      ragCheckbox.style.color = 'hsl(var(--primary-foreground))';
                      
                      // Add a checkmark icon inside
                      const checkIcon = document.createElement('svg');
                      checkIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                      checkIcon.setAttribute('width', '15');
                      checkIcon.setAttribute('height', '15');
                      checkIcon.setAttribute('viewBox', '0 0 15 15');
                      checkIcon.setAttribute('fill', 'none');
                      checkIcon.innerHTML = '<path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>';
                      
                      ragCheckbox.innerHTML = '';
                      ragCheckbox.appendChild(checkIcon);
                      
                      console.log('Direct checkbox manipulation complete');
                    } else {
                      console.log('Could not find RAG Search checkbox');
                    }
                  } catch (error) {
                    console.error('Error during direct checkbox manipulation:', error);
                  }
                }
              }, 300);
            }
          }
          
          // Then continue with the standard action handling
          handleAction(action, data);
        }, 100);
      } else {
        // If no user response, just handle the action directly
        if (data?.step === 'processing_confirmation' && onProcessingConfigured) {
          const config = {
            ragEnabled: true,
            checked: true,    // Explicitly mark the checkbox as checked
            forceCheck: true, // Force check the checkbox
            active: true,     // Indicate the feature is active
            state: 'checked', // Set the data-state attribute
            multimodal: {
              imageCaption: !data.skipImages,
              ocr: !data.skipImages,
              visualAnalysis: !data.skipImages
            }
          };
          onProcessingConfigured(config);
          
          // Send a second update after a small delay to ensure the UI updates
          setTimeout(() => {
            console.log('Sending secondary RAG checkbox update');
            onProcessingConfigured({
              ragEnabled: true,
              checked: true,
              state: 'checked',
              refreshUI: true // Signal to refresh the UI
            });
            
            // Direct DOM manipulation for maximum reliability
            if (window && window.document) {
              try {
                console.log('Attempting direct checkbox manipulation');
                // Find the RAG Search checkbox by its role and nearby text content
                const allCheckboxes = document.querySelectorAll('button[role="checkbox"]');
                let ragCheckbox = null;
                
                // Find the checkbox next to "RAG Search" text
                for (let i = 0; i < allCheckboxes.length; i++) {
                  const checkbox = allCheckboxes[i];
                  // Check if there's nearby text containing "RAG Search"
                  const parent = checkbox.closest('.flex.items-start.space-x-3');
                  if (parent && parent.textContent.includes('RAG Search')) {
                    ragCheckbox = checkbox;
                    break;
                  }
                }
                
                if (ragCheckbox) {
                  console.log('Found RAG Search checkbox, setting attributes');
                  // Set all the attributes that might control the checked state
                  ragCheckbox.setAttribute('aria-checked', 'true');
                  ragCheckbox.setAttribute('data-state', 'checked');
                  ragCheckbox.classList.add('data-[state=checked]:bg-primary');
                  ragCheckbox.classList.add('data-[state=checked]:text-primary-foreground');
                  
                  // Also directly set background color
                  ragCheckbox.style.backgroundColor = 'hsl(var(--primary))';
                  ragCheckbox.style.color = 'hsl(var(--primary-foreground))';
                  
                  // Add a checkmark icon inside
                  const checkIcon = document.createElement('svg');
                  checkIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                  checkIcon.setAttribute('width', '15');
                  checkIcon.setAttribute('height', '15');
                  checkIcon.setAttribute('viewBox', '0 0 15 15');
                  checkIcon.setAttribute('fill', 'none');
                  checkIcon.innerHTML = '<path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>';
                  
                  ragCheckbox.innerHTML = '';
                  ragCheckbox.appendChild(checkIcon);
                  
                  console.log('Direct checkbox manipulation complete');
                } else {
                  console.log('Could not find RAG Search checkbox');
                }
              } catch (error) {
                console.error('Error during direct checkbox manipulation:', error);
              }
            }
          }, 300);
        }
        
        handleAction(action, data);
      }
      return;
    }
  
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
            top: 50%;
            left: 30%;
            transform: translateY(-50%);
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
              0% { transform: translateY(-50%) scale(0.8); opacity: 0.5; }
              50% { transform: translateY(-50%) scale(1.2); opacity: 0.8; }
              100% { transform: translateY(-50%) scale(0.8); opacity: 0.5; }
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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

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
            <Avatar className="h-9 w-9 ring-2 ring-purple-100">
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100">
                <Brain className="h-5 w-5 text-purple-600" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className={cn(
          "max-w-[75%] rounded-xl shadow-sm overflow-hidden",
          isUser 
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4" 
            : "bg-white border border-gray-200 p-4"
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {renderContent(message.content)}
          </div>
          
          {/* Add "Other" option for AI messages without action buttons */}
          {!isUser && (!message.actions || message.actions.length === 0) && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-500 font-medium mb-1">Other (manual input):</div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your custom response..."
                  className="text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        sendMessage(target.value);
                        target.value = '';
                      }
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                    if (input && input.value.trim()) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Render action buttons if available */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-4 space-y-2 w-full">
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
              
              {/* Add "Other" option with text input for AI responses */}
              {!isUser && (
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-gray-500 font-medium mb-1">Other (manual input):</div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter your custom response..."
                      className="text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            sendMessage(target.value);
                            target.value = '';
                          }
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input && input.value.trim()) {
                          sendMessage(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0">
            <Avatar className="h-9 w-9 ring-2 ring-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100">
                <User className="h-5 w-5 text-blue-600" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    );
  };

  if (!documentAnalysis) {
    return (
      <Card className={cn("bg-gradient-to-br from-gray-50 to-gray-100", className)}>
        <CardContent className="p-8 text-center">
          <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-md">
            <MessageSquare className="h-8 w-8 text-gray-400" />
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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">
              Document Type: <Badge variant="secondary" className="ml-2">{documentAnalysis.documentType}</Badge>
            </p>
            <Badge variant="outline" className="bg-white">
              <Activity className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      )}
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-white to-gray-50">
          <div className="space-y-4 flex flex-col w-full">
            {state.messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex gap-3 justify-start w-full">
                <div className="flex-shrink-0">
                  <Avatar className="h-9 w-9 ring-2 ring-purple-100">
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100">
                      <Brain className="h-5 w-5 text-purple-600" />
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
      
      <div className="border-t bg-white px-4 py-3">
        {!state.isComplete ? (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what you'd like to do with this document..."
              className="flex-1 bg-gray-50 border-gray-200"
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