import { FC, useState, useEffect } from "react";
import { Braces } from "lucide-react";

interface EmbeddingDimensionVisualizerProps {
  dimensions: number;
  modelName: string;
}

const generateRandomVector = (dimensions: number): number[] => {
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const EmbeddingDimensionVisualizer: FC<EmbeddingDimensionVisualizerProps> = ({ 
  dimensions,
  modelName
}) => {
  const [exampleVector, setExampleVector] = useState<number[]>([]);
  const [similarity, setSimilarity] = useState<number>(0);
  
  useEffect(() => {
    // Generate a random vector when dimensions change
    const vector = generateRandomVector(dimensions);
    setExampleVector(vector);
    
    // Generate another random vector to calculate similarity
    const compareVector = generateRandomVector(dimensions);
    setSimilarity(cosineSimilarity(vector, compareVector));
  }, [dimensions]);
  
  // Set the number of dimensions to display (maximum 10)
  const displayDimensions = Math.min(10, dimensions);
  const displayVector = exampleVector.slice(0, displayDimensions);
  
  // Calculate visualization stats
  const percentVisualizing = ((displayDimensions / dimensions) * 100).toFixed(1);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b bg-gray-50 flex items-center">
        <Braces className="h-5 w-5 text-primary-500 mr-2" />
        <h3 className="text-base font-medium">Embedding Visualization</h3>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium">{modelName} Sample Vector</h4>
          <span className="text-xs text-gray-500">
            {dimensions} dimensions
          </span>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border mb-4 font-mono text-xs overflow-x-auto">
          <span className="text-gray-500">[</span>
          {displayVector.map((value, index) => (
            <span key={index}>
              <span className="text-blue-600">{value.toFixed(4)}</span>
              {index < displayDimensions - 1 && <span className="text-gray-500">, </span>}
            </span>
          ))}
          {dimensions > displayDimensions && (
            <span className="text-gray-500"> ... {dimensions - displayDimensions} more</span>
          )}
          <span className="text-gray-500">]</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h5 className="text-xs font-medium">Vector Magnitude</h5>
              <span className="text-xs text-gray-600">
                Showing {displayDimensions} of {dimensions} dimensions ({percentVisualizing}%)
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
              <div className="grid grid-cols-10 h-full">
                {displayVector.map((value, index) => (
                  <div
                    key={index}
                    className={`h-full ${index % 2 === 0 ? 'bg-blue-100' : 'bg-blue-200'}`}
                    style={{ opacity: Math.abs(value) * 0.5 + 0.5 }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-xs font-medium mb-1">Similarity Example</h5>
            <div className="bg-gray-50 p-3 rounded-md border text-xs">
              <div className="flex justify-between items-center">
                <span>Cosine similarity with random vector:</span>
                <span className="font-medium">{similarity.toFixed(4)}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${(similarity + 1) / 2 * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>Different (-1.0)</span>
                <span>Unrelated (0.0)</span>
                <span>Similar (+1.0)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 border-t">
        <p className="text-xs text-gray-600">
          Higher dimensional embeddings generally capture more semantic information, but require more storage and processing time.
        </p>
      </div>
    </div>
  );
};

export default EmbeddingDimensionVisualizer;