import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pageCount: integer("page_count").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const chunks = pgTable("chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  tags: text("tags").array(),
  title: text("title"),
});

export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  documentId: integer("document_id").notNull(),
  retrievable: boolean("retrievable").default(true),
  filterable: boolean("filterable").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  pageCount: true,
  userId: true,
  createdAt: true,
});

export const insertChunkSchema = createInsertSchema(chunks).pick({
  documentId: true,
  content: true,
  tokenCount: true,
  chunkIndex: true,
  tags: true,
  title: true,
});

export const insertFieldSchema = createInsertSchema(fields).pick({
  name: true,
  documentId: true,
  retrievable: true,
  filterable: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertChunk = z.infer<typeof insertChunkSchema>;
export type Chunk = typeof chunks.$inferSelect;

export type InsertField = z.infer<typeof insertFieldSchema>;
export type Field = typeof fields.$inferSelect;

export type ChunkingMethod = "semantic" | "fixed" | "header";

export type ProcessingMode = "standard" | "idp" | "kg";

export type TabView = "split" | "document" | "chunks" | "fieldIndex";

export interface UploadedDocument {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

export interface DataModel {
  id: number;
  name: string;
  apiName: string;
}

export interface IndexStatistics {
  totalFieldsIndexed: number;
  retrievableFields: number;
  filterableFields: number;
  averageChunkSize: number;
  totalVectorDimensions: number;
}

export interface IndexField {
  id: number;
  name: string;
  apiName: string;
  dataType: string;
  isRetrievable: boolean;
  isFilterable: boolean;
  isTypehead: boolean;
  chunkingStrategy?: string;
  vectorEmbedding?: boolean;
}

export interface IndexConfiguration {
  name: string;
  fieldLevelIndexing: boolean;
  recordLevelIndexing: boolean;
  createVectorEmbedding: boolean;
  fields: IndexField[];
  statistics: IndexStatistics;
}
