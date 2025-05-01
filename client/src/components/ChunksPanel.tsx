import { FC, useState, useEffect } from "react";
import { RefreshCw, Clock, Zap, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Chunk {
  id: number;
  title: string;
  content: string;
  tokenCount: number;
  chunkIndex: number;
  tags: string[];
  overlapWithPrevious?: number; // New property to track overlap
  processingTime?: number; // New property to track processing time
}

interface ChunksPanelProps {
  chunks: Chunk[];
  selectedChunk: number | null;
  onChunkSelect: (chunkId: number) => void;
  chunkingMethod?: "semantic" | "fixed" | "header";
  chunkSize?: number;
  chunkOverlap?: number;
}

const ChunksPanel: FC<ChunksPanelProps> = ({ 
  chunks, 
  selectedChunk, 
  onChunkSelect,
  chunkingMethod = "semantic",
  chunkSize = 150,
  chunkOverlap = 20
}) => {
  const [displayedChunks, setDisplayedChunks] = useState<Chunk[]>(chunks);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [semanticScores, setSemanticScores] = useState<{[key: number]: number}>({});
  
  // Effect to simulate dynamic rechunking when parameters change
  useEffect(() => {
    setIsProcessing(true);
    const startTime = performance.now();
    
    // Simulate processing delay (200-400ms)
    const processingDelay = Math.random() * 200 + 200;
    
    const timer = setTimeout(() => {
      // Generate semantic coherence scores if needed
      if (chunkingMethod === "semantic") {
        const newScores: {[key: number]: number} = {};
        chunks.forEach(chunk => {
          // Generate a score between 0.65 and 0.95
          newScores[chunk.id] = Math.random() * 0.3 + 0.65;
        });
        setSemanticScores(newScores);
      }
      
      // Calculate new chunk information based on parameters
      const newChunks = chunks.map((chunk, index) => {
        // Calculate overlap with previous chunk
        const overlap = index > 0 ? 
          Math.min(Math.floor(chunkOverlap / (chunks.length - 1) * 100) / 100, 0.5) : 0;
        
        // Adjust token count based on chunk size parameter
        const adjustedTokenCount = Math.floor(chunk.tokenCount * (chunkSize / 150));
        
        // Simulate processing time (10-50ms per chunk)
        const chunkProcessingTime = Math.random() * 40 + 10;
        
        return {
          ...chunk,
          tokenCount: adjustedTokenCount,
          overlapWithPrevious: index > 0 ? Math.floor(chunkOverlap * 0.7) : 0,
          processingTime: chunkProcessingTime
        } as Chunk;
      });
      
      // Show warning if we have too many or too few chunks
      setShowWarning(chunkSize < 100 || chunkSize > 500);
      
      // Update displayed chunks and processing time
      setDisplayedChunks(newChunks);
      setProcessingTime(performance.now() - startTime);
      setIsProcessing(false);
    }, processingDelay);
    
    return () => clearTimeout(timer);
  }, [chunks, chunkingMethod, chunkSize, chunkOverlap]);
  
  // Function to get chunk style based on chunking method
  const getChunkStyle = (chunk: Chunk) => {
    switch (chunkingMethod) {
      case "semantic":
        return {
          borderColor: semanticScores[chunk.id] > 0.85 ? "rgb(74, 222, 128)" : 
                      semanticScores[chunk.id] > 0.75 ? "rgb(250, 204, 21)" : 
                      "rgb(248, 113, 113)",
          boxShadow: selectedChunk === chunk.id ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none"
        };
      case "header":
        return {
          borderStyle: chunk.title.includes("heading") || 
                      chunk.title.includes("section") || 
                      chunk.title.includes("title") ? 
                      "solid" : "dashed",
          borderWidth: chunk.title.includes("heading") ? "2px" : "1px",
          boxShadow: selectedChunk === chunk.id ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none"
        };
      case "fixed":
      default:
        return {
          borderColor: "rgb(203, 213, 225)",
          boxShadow: selectedChunk === chunk.id ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none"
        };
    }
  };
  
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Generated Chunks</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{displayedChunks.length} chunks</span>
          {isProcessing ? (
            <div className="text-xs flex items-center text-blue-500">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            <div className="text-xs flex items-center text-green-600">
              <Clock className="h-3 w-3 mr-1" />
              {processingTime.toFixed(1)}ms
            </div>
          )}
        </div>
      </div>
      
      {showWarning && (
        <div className="bg-amber-50 px-4 py-2 flex items-center text-amber-600 text-xs border-b border-amber-200">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {chunkSize < 100 ? 
            "Small chunk sizes may create too many chunks and reduce context quality." : 
            "Large chunk sizes may reduce retrieval precision."}
        </div>
      )}
      
      <div className="h-[calc(100vh-280px)] overflow-auto p-4 bg-white relative">
        {/* Performance metrics */}
        <div className="absolute top-2 right-3 bg-white/80 backdrop-blur-sm rounded-md p-2 z-10 border border-gray-100 shadow-sm">
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Avg Size:</span>
              <span className="font-medium">{Math.floor(displayedChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / displayedChunks.length)} tokens</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium">{displayedChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)} tokens</span>
            </div>
            {chunkingMethod === "semantic" && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Coherence:</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ 
                      width: `${Object.values(semanticScores).reduce((sum, score) => sum + score, 0) / 
                              Math.max(1, Object.values(semanticScores).length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {displayedChunks.map((chunk, chunkIndex) => (
            <motion.div 
              key={chunk.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: chunkIndex * 0.05 }}
              className={`mb-4 border rounded-md p-4 cursor-pointer relative ${
                selectedChunk === chunk.id 
                  ? "bg-gray-50" 
                  : "hover:bg-gray-50"
              }`}
              style={getChunkStyle(chunk)}
              onClick={() => onChunkSelect(chunk.id)}
            >
              {/* Overlap visualization */}
              {chunk.overlapWithPrevious !== undefined && chunk.overlapWithPrevious > 0 && chunkIndex > 0 && (
                <div className="absolute -top-2 left-0 w-full flex justify-center">
                  <div className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {chunk.overlapWithPrevious} token overlap
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Chunk #{chunk.chunkIndex} • {chunk.title}
                </span>
                <div className="flex items-center gap-2">
                  {chunk.processingTime && (
                    <span className="text-xs text-gray-400">
                      <Zap className="inline h-3 w-3 mr-0.5" />
                      {chunk.processingTime.toFixed(1)}ms
                    </span>
                  )}
                  <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-1">
                    {chunk.tokenCount} tokens
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-800 leading-relaxed font-mono">
                {/* Show content based on chunking method */}
                {chunkingMethod === "semantic" && semanticScores[chunk.id] && (
                  <div className="mb-2 flex items-center">
                    <div className="text-xs mr-2">Semantic coherence:</div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          semanticScores[chunk.id] > 0.85 ? "bg-green-500" : 
                          semanticScores[chunk.id] > 0.75 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} 
                        style={{ width: `${semanticScores[chunk.id] * 100}%` }}
                      ></div>
                    </div>
                    <div className="ml-2 text-xs font-medium">
                      {(semanticScores[chunk.id] * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
                
                {chunk.content.split("\n").map((line, index) => {
                  if (line.toUpperCase() === line && line.trim() !== "") {
                    return (
                      <p key={index} className="mb-2">
                        <span className="font-semibold">{line}</span>
                      </p>
                    );
                  } else if (line.startsWith("•")) {
                    return <p key={index} className="mb-1">{line}</p>;
                  } else if (line.includes(":")) {
                    return (
                      <p key={index} className="mb-1">
                        {line.includes("Submitted") ? (
                          <span className="text-gray-500">{line}</span>
                        ) : (
                          line
                        )}
                      </p>
                    );
                  } else {
                    return line.trim() === "" ? (
                      <br key={index} />
                    ) : (
                      <p key={index} className="mb-2">{line}</p>
                    );
                  }
                })}
              </div>
              
              {chunk.tags.length > 0 && (
                <div className="mt-3 text-xs flex flex-wrap gap-2">
                  {chunk.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Visual ruler to show token count */}
              <div className="mt-3 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400" 
                  style={{ width: `${(chunk.tokenCount / chunkSize) * 100}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChunksPanel;
