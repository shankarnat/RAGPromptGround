import { EmbeddingModel } from "@/components/EmbeddingModelCard";

export const embeddingModels: EmbeddingModel[] = [
  {
    id: "openai-text-embedding-3-large",
    name: "text-embedding-3-large",
    provider: "OpenAI",
    dimensions: 3072,
    languages: ["English", "Multilingual"],
    maxTokens: 8191,
    speed: "medium",
    quality: "high",
    description: "OpenAI's most capable embedding model for semantic search, text similarity, and code search. Offers 3,072 dimensions for maximum information capture.",
    isRecommended: true
  },
  {
    id: "openai-text-embedding-3-small",
    name: "text-embedding-3-small",
    provider: "OpenAI",
    dimensions: 1536,
    languages: ["English", "Multilingual"],
    maxTokens: 8191,
    speed: "fast",
    quality: "high",
    description: "A smaller and more cost-effective embedding model from OpenAI, offering a good balance between performance and cost."
  },
  {
    id: "openai-text-embedding-ada-002",
    name: "text-embedding-ada-002",
    provider: "OpenAI",
    dimensions: 1536,
    languages: ["English", "Multilingual"],
    maxTokens: 8191,
    speed: "fast",
    quality: "medium",
    description: "An older but reliable embedding model from OpenAI, offering good performance for general text embedding tasks."
  },
  {
    id: "cohere-embed-english-v3.0",
    name: "embed-english-v3.0",
    provider: "Cohere",
    dimensions: 1024,
    languages: ["English"],
    maxTokens: 2048,
    speed: "fast",
    quality: "high",
    description: "Cohere's specialized English embedding model designed for high-quality semantic search and text similarity."
  },
  {
    id: "cohere-embed-multilingual-v3.0",
    name: "embed-multilingual-v3.0",
    provider: "Cohere",
    dimensions: 1024,
    languages: ["English", "Spanish", "German", "French", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean"],
    maxTokens: 2048,
    speed: "medium",
    quality: "high",
    description: "Cohere's multilingual embedding model supporting 100+ languages with strong cross-lingual similarity capabilities."
  },
  {
    id: "e5-large",
    name: "E5-large",
    provider: "E5",
    dimensions: 1024,
    languages: ["English", "Multilingual"],
    maxTokens: 4096,
    speed: "medium",
    quality: "high",
    description: "The largest E5 embedding model offering high-quality text embeddings that excel in retrieval tasks and semantic search applications.",
    isRecommended: true
  },
  {
    id: "e5-base",
    name: "E5-base",
    provider: "E5",
    dimensions: 768,
    languages: ["English", "Multilingual"],
    maxTokens: 4096,
    speed: "fast",
    quality: "medium",
    description: "A balanced E5 embedding model offering good performance with moderate computational requirements."
  },
  {
    id: "e5-small",
    name: "E5-small",
    provider: "E5",
    dimensions: 384,
    languages: ["English", "Multilingual"],
    maxTokens: 4096,
    speed: "fast",
    quality: "medium",
    description: "The smallest E5 embedding model designed for low-latency applications where speed is prioritized over maximum quality."
  },
  {
    id: "bert-all-MiniLM-L6-v2",
    name: "all-MiniLM-L6-v2",
    provider: "BERT",
    dimensions: 384,
    languages: ["English"],
    maxTokens: 512,
    speed: "fast",
    quality: "medium",
    description: "A compact BERT-based embedding model that offers good performance with very low computational requirements."
  },
  {
    id: "bert-all-mpnet-base-v2",
    name: "all-mpnet-base-v2",
    provider: "BERT",
    dimensions: 768,
    languages: ["English"],
    maxTokens: 512,
    speed: "medium",
    quality: "medium",
    description: "A powerful BERT-based model using MPNet architecture for improved embedding quality, especially for sentence similarity tasks."
  },
  {
    id: "sentence-t5-xxl",
    name: "sentence-t5-xxl",
    provider: "Sentence Transformers",
    dimensions: 768,
    languages: ["English", "Multilingual"],
    maxTokens: 512,
    speed: "slow",
    quality: "high",
    description: "A large T5-based sentence transformer model that produces high-quality embeddings, especially for semantic textual similarity tasks."
  }
];

export const defaultAdvancedOptions = {
  normalizeEmbeddings: true,
  poolingStrategy: 'mean' as 'mean' | 'max' | 'cls',
  truncationMethod: 'tail' as 'head' | 'tail' | 'middle',
  batchSize: 32,
  enableCaching: true
};