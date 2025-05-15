import { MetadataField } from "@shared/schema";

// Financial CSV data example - formatted as a table
export const financialCsvDocument = {
  title: "Financial Transactions 2024 (CSV)",
  pageCount: 1,
  content: `<table class="w-full border-collapse">
  <thead class="bg-slate-100">
    <tr>
      <th class="border border-slate-300 p-2 text-left">Transaction_ID</th>
      <th class="border border-slate-300 p-2 text-left">Date</th>
      <th class="border border-slate-300 p-2 text-left">Customer_ID</th>
      <th class="border border-slate-300 p-2 text-left">Product_ID</th>
      <th class="border border-slate-300 p-2 text-left">Category</th>
      <th class="border border-slate-300 p-2 text-left">Amount</th>
      <th class="border border-slate-300 p-2 text-left">Payment_Method</th>
      <th class="border border-slate-300 p-2 text-left">Status</th>
      <th class="border border-slate-300 p-2 text-left">Location</th>
      <th class="border border-slate-300 p-2 text-left">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-slate-300 p-2">TX10045678</td>
      <td class="border border-slate-300 p-2">2024-01-15</td>
      <td class="border border-slate-300 p-2">CUST8821</td>
      <td class="border border-slate-300 p-2">PROD334</td>
      <td class="border border-slate-300 p-2">Electronics</td>
      <td class="border border-slate-300 p-2">1299.99</td>
      <td class="border border-slate-300 p-2">Credit Card</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">New York</td>
      <td class="border border-slate-300 p-2">High-end laptop purchase</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045679</td>
      <td class="border border-slate-300 p-2">2024-01-15</td>
      <td class="border border-slate-300 p-2">CUST4532</td>
      <td class="border border-slate-300 p-2">PROD112</td>
      <td class="border border-slate-300 p-2">Clothing</td>
      <td class="border border-slate-300 p-2">78.50</td>
      <td class="border border-slate-300 p-2">Debit Card</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">Chicago</td>
      <td class="border border-slate-300 p-2">Winter sale items</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045680</td>
      <td class="border border-slate-300 p-2">2024-01-16</td>
      <td class="border border-slate-300 p-2">CUST9012</td>
      <td class="border border-slate-300 p-2">PROD445</td>
      <td class="border border-slate-300 p-2">Home Goods</td>
      <td class="border border-slate-300 p-2">249.95</td>
      <td class="border border-slate-300 p-2">PayPal</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">San Francisco</td>
      <td class="border border-slate-300 p-2">Kitchen appliance</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045681</td>
      <td class="border border-slate-300 p-2">2024-01-16</td>
      <td class="border border-slate-300 p-2">CUST2345</td>
      <td class="border border-slate-300 p-2">PROD223</td>
      <td class="border border-slate-300 p-2">Electronics</td>
      <td class="border border-slate-300 p-2">899.00</td>
      <td class="border border-slate-300 p-2">Credit Card</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">Los Angeles</td>
      <td class="border border-slate-300 p-2">Smartphone purchase</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045682</td>
      <td class="border border-slate-300 p-2">2024-01-17</td>
      <td class="border border-slate-300 p-2">CUST7865</td>
      <td class="border border-slate-300 p-2">PROD556</td>
      <td class="border border-slate-300 p-2">Furniture</td>
      <td class="border border-slate-300 p-2">1845.75</td>
      <td class="border border-slate-300 p-2">Financing</td>
      <td class="border border-slate-300 p-2">Processing</td>
      <td class="border border-slate-300 p-2">Dallas</td>
      <td class="border border-slate-300 p-2">Living room set</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045683</td>
      <td class="border border-slate-300 p-2">2024-01-17</td>
      <td class="border border-slate-300 p-2">CUST3421</td>
      <td class="border border-slate-300 p-2">PROD667</td>
      <td class="border border-slate-300 p-2">Clothing</td>
      <td class="border border-slate-300 p-2">125.40</td>
      <td class="border border-slate-300 p-2">Gift Card</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">Miami</td>
      <td class="border border-slate-300 p-2">Birthday present purchase</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045684</td>
      <td class="border border-slate-300 p-2">2024-01-18</td>
      <td class="border border-slate-300 p-2">CUST5678</td>
      <td class="border border-slate-300 p-2">PROD778</td>
      <td class="border border-slate-300 p-2">Electronics</td>
      <td class="border border-slate-300 p-2">599.99</td>
      <td class="border border-slate-300 p-2">Credit Card</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">Seattle</td>
      <td class="border border-slate-300 p-2">Gaming console</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045685</td>
      <td class="border border-slate-300 p-2">2024-01-18</td>
      <td class="border border-slate-300 p-2">CUST8976</td>
      <td class="border border-slate-300 p-2">PROD889</td>
      <td class="border border-slate-300 p-2">Grocery</td>
      <td class="border border-slate-300 p-2">156.78</td>
      <td class="border border-slate-300 p-2">Debit Card</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">Boston</td>
      <td class="border border-slate-300 p-2">Weekly groceries</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045686</td>
      <td class="border border-slate-300 p-2">2024-01-19</td>
      <td class="border border-slate-300 p-2">CUST2468</td>
      <td class="border border-slate-300 p-2">PROD990</td>
      <td class="border border-slate-300 p-2">Home Goods</td>
      <td class="border border-slate-300 p-2">89.95</td>
      <td class="border border-slate-300 p-2">PayPal</td>
      <td class="border border-slate-300 p-2">Completed</td>
      <td class="border border-slate-300 p-2">Phoenix</td>
      <td class="border border-slate-300 p-2">Home decor items</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">TX10045687</td>
      <td class="border border-slate-300 p-2">2024-01-19</td>
      <td class="border border-slate-300 p-2">CUST1357</td>
      <td class="border border-slate-300 p-2">PROD112</td>
      <td class="border border-slate-300 p-2">Clothing</td>
      <td class="border border-slate-300 p-2">245.00</td>
      <td class="border border-slate-300 p-2">Credit Card</td>
      <td class="border border-slate-300 p-2">Refunded</td>
      <td class="border border-slate-300 p-2">Denver</td>
      <td class="border border-slate-300 p-2">Return due to sizing issue</td>
    </tr>
  </tbody>
</table>`
};

// Financial report example (original)
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

// Financial CSV data chunks - for each row, text field becomes a separate chunk
export const financialCsvChunks = [
  // Row 1 - Text field chunks
  {
    id: 101,
    documentId: 2,
    title: "Row 1: Category",
    content: "Electronics",
    tokenCount: 1,
    chunkIndex: 1,
    tags: ["row-1", "category", "electronics"]
  },
  {
    id: 102,
    documentId: 2,
    title: "Row 1: Payment Method",
    content: "Credit Card",
    tokenCount: 2,
    chunkIndex: 2,
    tags: ["row-1", "payment", "credit-card"]
  },
  {
    id: 103,
    documentId: 2,
    title: "Row 1: Status",
    content: "Completed",
    tokenCount: 1,
    chunkIndex: 3,
    tags: ["row-1", "status", "completed"]
  },
  {
    id: 104,
    documentId: 2,
    title: "Row 1: Location",
    content: "New York",
    tokenCount: 2, 
    chunkIndex: 4,
    tags: ["row-1", "location", "new-york"]
  },
  {
    id: 105,
    documentId: 2,
    title: "Row 1: Notes",
    content: "High-end laptop purchase",
    tokenCount: 4,
    chunkIndex: 5,
    tags: ["row-1", "notes", "purchase", "electronics"]
  },
  
  // Row 2 - Text field chunks
  {
    id: 106,
    documentId: 2,
    title: "Row 2: Category",
    content: "Clothing",
    tokenCount: 1,
    chunkIndex: 6,
    tags: ["row-2", "category", "clothing"]
  },
  {
    id: 107,
    documentId: 2,
    title: "Row 2: Payment Method",
    content: "Debit Card",
    tokenCount: 2,
    chunkIndex: 7,
    tags: ["row-2", "payment", "debit-card"]
  },
  {
    id: 108,
    documentId: 2,
    title: "Row 2: Status",
    content: "Completed",
    tokenCount: 1,
    chunkIndex: 8,
    tags: ["row-2", "status", "completed"]
  },
  {
    id: 109,
    documentId: 2,
    title: "Row 2: Location",
    content: "Chicago",
    tokenCount: 1,
    chunkIndex: 9,
    tags: ["row-2", "location", "chicago"]
  },
  {
    id: 110,
    documentId: 2,
    title: "Row 2: Notes",
    content: "Winter sale items",
    tokenCount: 3,
    chunkIndex: 10,
    tags: ["row-2", "notes", "sale", "winter"]
  },
  
  // Row 3 - Text field chunks
  {
    id: 111,
    documentId: 2,
    title: "Row 3: Category",
    content: "Home Goods",
    tokenCount: 2,
    chunkIndex: 11,
    tags: ["row-3", "category", "home-goods"]
  },
  {
    id: 112,
    documentId: 2,
    title: "Row 3: Payment Method",
    content: "PayPal",
    tokenCount: 1,
    chunkIndex: 12,
    tags: ["row-3", "payment", "paypal"]
  },
  {
    id: 113,
    documentId: 2,
    title: "Row 3: Status",
    content: "Completed",
    tokenCount: 1,
    chunkIndex: 13,
    tags: ["row-3", "status", "completed"]
  },
  {
    id: 114,
    documentId: 2,
    title: "Row 3: Location",
    content: "San Francisco",
    tokenCount: 2,
    chunkIndex: 14,
    tags: ["row-3", "location", "san-francisco"]
  },
  {
    id: 115,
    documentId: 2,
    title: "Row 3: Notes",
    content: "Kitchen appliance",
    tokenCount: 2,
    chunkIndex: 15,
    tags: ["row-3", "notes", "kitchen", "appliance"]
  },
  
  // Row 4 - Text field chunks
  {
    id: 116,
    documentId: 2,
    title: "Row 4: Category",
    content: "Electronics",
    tokenCount: 1,
    chunkIndex: 16,
    tags: ["row-4", "category", "electronics"]
  },
  {
    id: 117,
    documentId: 2,
    title: "Row 4: Payment Method",
    content: "Credit Card",
    tokenCount: 2,
    chunkIndex: 17,
    tags: ["row-4", "payment", "credit-card"]
  },
  {
    id: 118,
    documentId: 2,
    title: "Row 4: Status",
    content: "Completed",
    tokenCount: 1,
    chunkIndex: 18,
    tags: ["row-4", "status", "completed"]
  },
  {
    id: 119,
    documentId: 2,
    title: "Row 4: Location",
    content: "Los Angeles",
    tokenCount: 2,
    chunkIndex: 19,
    tags: ["row-4", "location", "los-angeles"]
  },
  {
    id: 120,
    documentId: 2,
    title: "Row 4: Notes",
    content: "Smartphone purchase",
    tokenCount: 2,
    chunkIndex: 20,
    tags: ["row-4", "notes", "smartphone", "purchase"]
  },
  
  // Row 5 - Text field chunks
  {
    id: 121,
    documentId: 2,
    title: "Row 5: Category",
    content: "Furniture",
    tokenCount: 1,
    chunkIndex: 21,
    tags: ["row-5", "category", "furniture"]
  },
  {
    id: 122,
    documentId: 2,
    title: "Row 5: Payment Method",
    content: "Financing",
    tokenCount: 1,
    chunkIndex: 22,
    tags: ["row-5", "payment", "financing"]
  },
  {
    id: 123,
    documentId: 2,
    title: "Row 5: Status",
    content: "Processing",
    tokenCount: 1,
    chunkIndex: 23,
    tags: ["row-5", "status", "processing"]
  },
  {
    id: 124,
    documentId: 2,
    title: "Row 5: Location",
    content: "Dallas",
    tokenCount: 1,
    chunkIndex: 24,
    tags: ["row-5", "location", "dallas"]
  },
  {
    id: 125,
    documentId: 2,
    title: "Row 5: Notes",
    content: "Living room set",
    tokenCount: 3,
    chunkIndex: 25,
    tags: ["row-5", "notes", "furniture", "living-room"]
  }
];

// Original financial report chunks
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

// CSV document metadata fields for structured data
export const financialCsvMetadataFields: MetadataField[] = [
  {
    id: 101,
    name: "title",
    value: "Financial Transactions 2024",
    included: true,
    confidence: 1.0
  },
  {
    id: 102,
    name: "source",
    value: "Enterprise Resource Planning (ERP) System",
    included: true,
    confidence: 1.0
  },
  {
    id: 103,
    name: "recordCount",
    value: "20",
    included: true,
    confidence: 1.0
  },
  {
    id: 104,
    name: "exportDate",
    value: "2024-01-28",
    included: true, 
    confidence: 1.0
  },
  {
    id: 105,
    name: "fileType",
    value: "CSV",
    included: true,
    confidence: 1.0
  },
  {
    id: 106,
    name: "department",
    value: "Sales",
    included: true,
    confidence: 0.95
  },
  {
    id: 107,
    name: "hasHeader",
    value: "true",
    included: true,
    confidence: 1.0
  },
  {
    id: 108,
    name: "delimiter",
    value: ",",
    included: true,
    confidence: 1.0
  },
  {
    id: 109, 
    name: "columns",
    value: "Transaction_ID,Date,Customer_ID,Product_ID,Category,Amount,Payment_Method,Status,Location,Notes",
    included: true,
    confidence: 1.0
  },
  {
    id: 110,
    name: "dataOwner",
    value: "Finance Department",
    included: true,
    confidence: 0.9
  },
  {
    id: 111,
    name: "sensitivityLevel",
    value: "Confidential",
    included: false,
    confidence: 0.85
  },
  {
    id: 112,
    name: "totalAmount",
    value: "$11,495.02",
    included: true,
    confidence: 1.0
  },
  {
    id: 113,
    name: "dateRange",
    value: "2024-01-15 to 2024-01-24",
    included: true,
    confidence: 1.0
  },
  {
    id: 114,
    name: "uniqueCustomers",
    value: "20",
    included: true,
    confidence: 1.0
  },
  {
    id: 115,
    name: "uniqueProducts",
    value: "9", 
    included: true,
    confidence: 1.0
  }
];

// Sample metadata fields for document record-level indexing (original)
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