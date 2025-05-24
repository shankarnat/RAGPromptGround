# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev`: Start development server with hot reloading
- `npm run build`: Build production app and server
- `npm run start`: Start production server
- `npm run check`: Run TypeScript type checking
- `npm run db:push`: Push database schema changes (requires DATABASE_URL)

### Docker Development
- `make dev`: Start development environment with Docker
- `make prod`: Start production environment
- `make stop`: Stop all containers
- `make clean`: Stop containers and remove volumes
- `make migrate`: Run database migrations in Docker
- `make build`: Build all containers
- `make shell`: Open shell in app container
- `make db-shell`: Open PostgreSQL shell

## Project Architecture

This is a full-stack document intelligence and analysis platform built with:

### Frontend (React + TypeScript + Vite)
- **Main App**: `client/src/App.tsx` - Router with document processing workflow and knowledge graph pages
- **Core Dashboard**: `client/src/components/UnifiedDashboard.tsx` - Main application interface
- **Document Processing Pipeline**: Upload → Parse/Chunk → Configure Index → Vectorization → Test/Results
- **Knowledge Graph Workflow**: Template Selection → EKG Setup → Edge Configuration → Mapping → Analytics → Playground → Share

### Backend (Express + TypeScript)
- **Server**: `server/index.ts` - Express server with Vite integration
- **API Routes**: `server/routes/` - RESTful endpoints for document analysis
- **Database**: PostgreSQL with Drizzle ORM, schema in `shared/schema.ts`

### State Management
- **Document Processing**: `hooks/useDocumentProcessing.ts` - Main workflow state
- **Document Analysis**: `context/DocumentAnalysisContext.tsx` - AI-powered document analysis
- **Multimodal Config**: `hooks/useMultimodalConfig.ts` - OCR, transcription, image captioning settings
- **Conversation System**: `hooks/useConversation.ts` - Chat-based document interaction

### Key Processing Types
- **RAG**: Retrieval-Augmented Generation with chunking, vectorization, and indexing
- **Knowledge Graph (KG)**: Entity extraction, relationship mapping, graph building
- **Intelligent Document Processing (IDP)**: Text extraction, classification, metadata extraction

### Component Organization
- **UI Components**: `components/ui/` - Reusable shadcn/ui components
- **Feature Components**: `components/` - Application-specific components
- **Pages**: `pages/` - Route-level components including `/kg/` knowledge graph pages
- **Services**: `services/` - Business logic and processing pipelines

### Data Flow
1. Documents uploaded via `UploadPanel`
2. Analyzed by `DocumentAnalyzer` service for processing recommendations
3. Processed through selected pipeline (RAG/KG/IDP) with configurable options
4. Results displayed in `UnifiedResultsEnhanced` with conversational interface
5. Knowledge graphs visualized in dedicated KG workflow pages

### Key Configuration
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` to `shared/`
- **Database**: Uses Drizzle ORM with PostgreSQL, migrations via `drizzle-kit push`
- **Build**: Vite for frontend, esbuild for server bundling
- **Styling**: Tailwind CSS with shadcn/ui component system

### Document Analysis Intelligence
The system includes an AI-powered document analyzer that:
- Detects document types (forms, reports, contracts, invoices)
- Analyzes structure (tables, forms, images, charts)
- Generates processing recommendations with confidence scores
- Automatically configures appropriate processing pipelines