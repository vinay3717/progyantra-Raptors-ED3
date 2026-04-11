export type VectorDoc = {
  id: string;
  text: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type VectorSearchResult = {
  id: string;
  score: number;
  text: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export interface VectorStore {
  upsert(docs: VectorDoc[]): Promise<void>;
  query(queryText: string, topK: number): Promise<VectorSearchResult[]>;
}

export function createNoopVectorStore(): VectorStore {
  return {
    async upsert() {},
    async query() {
      return [];
    },
  };
}

