import { FC } from "react";
import { RefreshCw } from "lucide-react";

interface Chunk {
  id: number;
  title: string;
  content: string;
  tokenCount: number;
  chunkIndex: number;
  tags: string[];
}

interface ChunksPanelProps {
  chunks: Chunk[];
  selectedChunk: number | null;
  onChunkSelect: (chunkId: number) => void;
}

const ChunksPanel: FC<ChunksPanelProps> = ({ chunks, selectedChunk, onChunkSelect }) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Generated Chunks</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{chunks.length} chunks</span>
          <button className="p-1 text-gray-500 hover:text-gray-700 rounded">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="h-[calc(100vh-280px)] overflow-auto p-4 bg-white">
        {chunks.map((chunk) => (
          <div 
            key={chunk.id}
            className={`mb-4 border rounded-md p-4 cursor-pointer ${
              selectedChunk === chunk.id 
                ? "bg-gray-50 border-primary-200" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onChunkSelect(chunk.id)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-gray-500">
                Chunk #{chunk.chunkIndex} • {chunk.title}
              </span>
              <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-1">
                {chunk.tokenCount} tokens
              </span>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed font-mono">
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
                  const [label, value] = line.split(":");
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChunksPanel;
