import { FC, useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ConversationPanelProps {
  documentName: string;
  onProcessingRequest?: (type: 'rag' | 'kg' | 'idp') => void;
}

const ConversationPanel: FC<ConversationPanelProps> = ({ 
  documentName,
  onProcessingRequest 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation with welcome message
    const welcomeMessage: Message = {
      id: '1',
      content: `Hi! I've loaded "${documentName}". I can help you understand this document or process it in different ways. What would you like to do?`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [documentName]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate processing based on user input
    setTimeout(() => {
      let responseContent = "";
      
      // Check for processing intents
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('extract') || lowerInput.includes('form')) {
        responseContent = "I can help extract form fields from this document. Would you like me to start the IDP (Intelligent Document Processing) extraction?";
        if (onProcessingRequest) {
          setTimeout(() => onProcessingRequest('idp'), 1000);
        }
      } else if (lowerInput.includes('search') || lowerInput.includes('find')) {
        responseContent = "I can set up this document for semantic search using RAG (Retrieval-Augmented Generation). This will allow you to ask questions and find specific information. Shall I proceed?";
        if (onProcessingRequest) {
          setTimeout(() => onProcessingRequest('rag'), 1000);
        }
      } else if (lowerInput.includes('relationship') || lowerInput.includes('entity') || lowerInput.includes('knowledge')) {
        responseContent = "I can create a knowledge graph to visualize relationships and entities in this document. Would you like me to start the knowledge graph extraction?";
        if (onProcessingRequest) {
          setTimeout(() => onProcessingRequest('kg'), 1000);
        }
      } else if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
        responseContent = `"${documentName}" appears to be a financial document. Here's what I can help you with:\n\n1. Extract key financial terms and figures\n2. Set up semantic search for specific data points\n3. Create a knowledge graph of financial relationships\n\nWhat would you like to explore first?`;
      } else {
        responseContent = `I understand you want to: "${input}". Based on "${documentName}", I can help you with:\n\n• Form field extraction (IDP)\n• Semantic search setup (RAG)\n• Knowledge graph creation (KG)\n\nWhich would be most helpful for your use case?`;
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">Document Assistant</h3>
            <p className="text-xs text-gray-500">Discussing: {documentName}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this document..."
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPanel;