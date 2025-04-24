import { MetadataField } from "@shared/schema";

export const sampleDocument = {
  title: "Financial Report Q4 2024",
  pageCount: 23,
  content: `# Financial Report Q4 2024

## Executive Summary

The fourth quarter of 2024 showed strong performance across all business units. Revenue increased by 12% year-over-year, reaching $128.5 million, while operating margins improved to 28.3% from 26.7% in the same period last year. The company's strategic investments in artificial intelligence and machine learning capabilities have begun to yield results, with efficiency improvements noted across several operational metrics.

## Revenue Breakdown

| Business Segment | Q4 2024 ($M) | Q4 2023 ($M) | YoY Change |
|------------------|--------------|--------------|------------|
| Enterprise Solutions | 58.2 | 51.8 | +12.4% |
| Consumer Products | 42.3 | 39.7 | +6.5% |
| Emerging Markets | 28.0 | 22.6 | +23.9% |
| **Total** | **128.5** | **114.1** | **+12.6%** |

## Key Performance Indicators

- Customer acquisition cost decreased by 8.2%
- Customer lifetime value increased by 14.5%
- Net Promoter Score improved from 68 to 72
- Monthly recurring revenue growth rate: 2.8%

## Regional Performance

North America continues to be our strongest market, accounting for 62% of total revenue. However, we've seen accelerated growth in the APAC region, which grew by 31% year-over-year and now represents 18% of our global revenue.

## Risk Factors

While performance has been strong, we note several risk factors that require ongoing monitoring:

1. Increasing competitive pressure in the Enterprise Solutions segment
2. Regulatory changes in European markets affecting data privacy compliance costs
3. Foreign exchange volatility impacting international revenue
4. Supply chain constraints affecting hardware component availability

## Outlook for 2025

We maintain our positive outlook for fiscal year 2025, with projected revenue growth of 15-18% and further margin expansion expected. Key growth initiatives include:

- Expansion of AI-powered solutions across our product portfolio
- Deeper penetration in healthcare and financial services verticals
- Launch of next-generation platform scheduled for Q2 2025
- Strategic acquisitions to enhance technological capabilities

## Conclusion

The strong Q4 2024 results provide momentum as we enter the new fiscal year. Our focus on innovation, operational excellence, and strategic expansion positions us well for continued growth despite macroeconomic uncertainties.`
};

export const sampleChunks = [
  {
    id: 1,
    documentId: 1,
    title: "Executive Summary",
    content: "The fourth quarter of 2024 showed strong performance across all business units. Revenue increased by 12% year-over-year, reaching $128.5 million, while operating margins improved to 28.3% from 26.7% in the same period last year.",
    tokenCount: 42,
    chunkIndex: 1,
    tags: ["summary", "performance", "revenue"]
  },
  {
    id: 2,
    documentId: 1,
    title: "Executive Summary (continued)",
    content: "The company's strategic investments in artificial intelligence and machine learning capabilities have begun to yield results, with efficiency improvements noted across several operational metrics.",
    tokenCount: 29,
    chunkIndex: 2,
    tags: ["summary", "AI", "machine learning", "efficiency"]
  },
  {
    id: 3,
    documentId: 1,
    title: "Revenue Breakdown",
    content: "| Business Segment | Q4 2024 ($M) | Q4 2023 ($M) | YoY Change |\n|------------------|--------------|--------------|------------|\n| Enterprise Solutions | 58.2 | 51.8 | +12.4% |\n| Consumer Products | 42.3 | 39.7 | +6.5% |\n| Emerging Markets | 28.0 | 22.6 | +23.9% |\n| **Total** | **128.5** | **114.1** | **+12.6%** |",
    tokenCount: 56,
    chunkIndex: 3,
    tags: ["revenue", "breakdown", "segments", "table"]
  },
  {
    id: 4,
    documentId: 1,
    title: "Key Performance Indicators",
    content: "- Customer acquisition cost decreased by 8.2%\n- Customer lifetime value increased by 14.5%\n- Net Promoter Score improved from 68 to 72\n- Monthly recurring revenue growth rate: 2.8%",
    tokenCount: 34,
    chunkIndex: 4,
    tags: ["KPI", "metrics", "customer", "revenue"]
  },
  {
    id: 5,
    documentId: 1,
    title: "Regional Performance",
    content: "North America continues to be our strongest market, accounting for 62% of total revenue. However, we've seen accelerated growth in the APAC region, which grew by 31% year-over-year and now represents 18% of our global revenue.",
    tokenCount: 40,
    chunkIndex: 5,
    tags: ["regional", "north america", "APAC", "growth"]
  },
  {
    id: 6,
    documentId: 1,
    title: "Risk Factors",
    content: "While performance has been strong, we note several risk factors that require ongoing monitoring:\n\n1. Increasing competitive pressure in the Enterprise Solutions segment\n2. Regulatory changes in European markets affecting data privacy compliance costs\n3. Foreign exchange volatility impacting international revenue\n4. Supply chain constraints affecting hardware component availability",
    tokenCount: 57,
    chunkIndex: 6,
    tags: ["risk", "competition", "regulation", "supply chain"]
  },
  {
    id: 7,
    documentId: 1,
    title: "Outlook for 2025",
    content: "We maintain our positive outlook for fiscal year 2025, with projected revenue growth of 15-18% and further margin expansion expected. Key growth initiatives include:\n\n- Expansion of AI-powered solutions across our product portfolio\n- Deeper penetration in healthcare and financial services verticals\n- Launch of next-generation platform scheduled for Q2 2025\n- Strategic acquisitions to enhance technological capabilities",
    tokenCount: 69,
    chunkIndex: 7,
    tags: ["outlook", "growth", "initiatives", "expansion"]
  },
  {
    id: 8,
    documentId: 1,
    title: "Conclusion",
    content: "The strong Q4 2024 results provide momentum as we enter the new fiscal year. Our focus on innovation, operational excellence, and strategic expansion positions us well for continued growth despite macroeconomic uncertainties.",
    tokenCount: 35,
    chunkIndex: 8,
    tags: ["conclusion", "growth", "strategy"]
  }
];

export const sampleFields = [
  {
    id: 1,
    name: "title",
    documentId: 1,
    retrievable: true,
    filterable: true,
    typehead: true
  },
  {
    id: 2,
    name: "content",
    documentId: 1,
    retrievable: true,
    filterable: false,
    typehead: false
  },
  {
    id: 3,
    name: "chunk_title",
    documentId: 1,
    retrievable: true,
    filterable: true,
    typehead: true
  },
  {
    id: 4,
    name: "chunk_content",
    documentId: 1,
    retrievable: true,
    filterable: false,
    typehead: false
  },
  {
    id: 5,
    name: "tags",
    documentId: 1,
    retrievable: true,
    filterable: true,
    typehead: true
  },
  {
    id: 6,
    name: "token_count",
    documentId: 1,
    retrievable: true,
    filterable: false,
    typehead: false
  },
  {
    id: 7,
    name: "chunk_index",
    documentId: 1,
    retrievable: true,
    filterable: true,
    typehead: false
  }
];

// Sample metadata fields for document record-level indexing
export const sampleMetadataFields: MetadataField[] = [
  {
    id: 1,
    name: "author",
    value: "Finance Department",
    included: true,
    confidence: 0.95
  },
  {
    id: 2,
    name: "creationDate",
    value: "2025-01-15",
    included: true,
    confidence: 1.0
  },
  {
    id: 3,
    name: "lastModified",
    value: "2025-01-20",
    included: true,
    confidence: 1.0
  },
  {
    id: 4,
    name: "title",
    value: "Financial Report Q4 2024",
    included: true,
    confidence: 0.98
  },
  {
    id: 5,
    name: "fileSize",
    value: "1284KB",
    included: false,
    confidence: 1.0
  },
  {
    id: 6,
    name: "fileType",
    value: "PDF",
    included: true,
    confidence: 1.0
  },
  {
    id: 7,
    name: "sourceLocation",
    value: "Finance Repository/Q4Reports/",
    included: false,
    confidence: 0.85
  },
  {
    id: 8,
    name: "department",
    value: "Finance",
    included: true,
    confidence: 0.92
  },
  {
    id: 9,
    name: "quarter",
    value: "Q4",
    included: true,
    confidence: 0.97
  },
  {
    id: 10,
    name: "year",
    value: "2024",
    included: true,
    confidence: 0.99
  },
  {
    id: 11,
    name: "reportType",
    value: "Financial",
    included: true,
    confidence: 0.96
  },
  {
    id: 12,
    name: "confidentialityLevel",
    value: "Internal",
    included: false,
    confidence: 0.75
  },
  {
    id: 13,
    name: "totalPages",
    value: "23",
    included: true,
    confidence: 1.0
  },
  {
    id: 14,
    name: "language",
    value: "English",
    included: false,
    confidence: 1.0
  }
];