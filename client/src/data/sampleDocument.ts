import { MetadataField } from "@shared/schema";

// Financial CSV data example
export const financialCsvDocument = {
  title: "Financial Transactions 2024 (CSV)",
  pageCount: 1,
  content: `Transaction_ID,Date,Customer_ID,Product_ID,Category,Amount,Payment_Method,Status,Location,Notes
TX10045678,2024-01-15,CUST8821,PROD334,Electronics,1299.99,Credit Card,Completed,New York,"High-end laptop purchase"
TX10045679,2024-01-15,CUST4532,PROD112,Clothing,78.50,Debit Card,Completed,Chicago,"Winter sale items"
TX10045680,2024-01-16,CUST9012,PROD445,Home Goods,249.95,PayPal,Completed,San Francisco,"Kitchen appliance"
TX10045681,2024-01-16,CUST2345,PROD223,Electronics,899.00,Credit Card,Completed,Los Angeles,"Smartphone purchase"
TX10045682,2024-01-17,CUST7865,PROD556,Furniture,1845.75,Financing,Processing,Dallas,"Living room set"
TX10045683,2024-01-17,CUST3421,PROD667,Clothing,125.40,Gift Card,Completed,Miami,"Birthday present purchase"
TX10045684,2024-01-18,CUST5678,PROD778,Electronics,599.99,Credit Card,Completed,Seattle,"Gaming console"
TX10045685,2024-01-18,CUST8976,PROD889,Grocery,156.78,Debit Card,Completed,Boston,"Weekly groceries"
TX10045686,2024-01-19,CUST2468,PROD990,Home Goods,89.95,PayPal,Completed,Phoenix,"Home decor items"
TX10045687,2024-01-19,CUST1357,PROD112,Clothing,245.00,Credit Card,Refunded,Denver,"Return due to sizing issue"
TX10045688,2024-01-20,CUST9753,PROD334,Electronics,1799.99,Financing,Completed,Atlanta,"Premium TV purchase"
TX10045689,2024-01-20,CUST4681,PROD445,Home Goods,59.99,Debit Card,Completed,Portland,"Kitchen utensils"
TX10045690,2024-01-21,CUST3579,PROD223,Electronics,349.95,Credit Card,Completed,Houston,"Wireless headphones"
TX10045691,2024-01-21,CUST8024,PROD556,Furniture,499.00,Credit Card,Completed,Minneapolis,"Office chair"
TX10045692,2024-01-22,CUST1598,PROD667,Clothing,189.50,Gift Card,Completed,Philadelphia,"Premium jeans"
TX10045693,2024-01-22,CUST7531,PROD778,Electronics,2499.99,Financing,Processing,San Diego,"Home theater system"
TX10045694,2024-01-23,CUST4826,PROD889,Grocery,78.45,Debit Card,Completed,Detroit,"Organic produce"
TX10045695,2024-01-23,CUST9517,PROD990,Home Goods,129.99,PayPal,Completed,Austin,"Smart home device"
TX10045696,2024-01-24,CUST6284,PROD112,Clothing,67.50,Credit Card,Completed,Nashville,"Casual wear"
TX10045697,2024-01-24,CUST7103,PROD334,Electronics,129.99,Debit Card,Completed,Las Vegas,"Wireless earbuds"`
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

// Financial CSV data chunks - each column becomes a separate chunk
export const financialCsvChunks = [
  {
    id: 101,
    documentId: 2,
    title: "Transaction_ID Column",
    content: `Transaction_ID\nTX10045678\nTX10045679\nTX10045680\nTX10045681\nTX10045682\nTX10045683\nTX10045684\nTX10045685\nTX10045686\nTX10045687\nTX10045688\nTX10045689\nTX10045690\nTX10045691\nTX10045692\nTX10045693\nTX10045694\nTX10045695\nTX10045696\nTX10045697`,
    tokenCount: 25,
    chunkIndex: 1,
    tags: ["csv", "transaction", "id", "column"]
  },
  {
    id: 102,
    documentId: 2,
    title: "Date Column",
    content: `Date\n2024-01-15\n2024-01-15\n2024-01-16\n2024-01-16\n2024-01-17\n2024-01-17\n2024-01-18\n2024-01-18\n2024-01-19\n2024-01-19\n2024-01-20\n2024-01-20\n2024-01-21\n2024-01-21\n2024-01-22\n2024-01-22\n2024-01-23\n2024-01-23\n2024-01-24\n2024-01-24`,
    tokenCount: 22,
    chunkIndex: 2,
    tags: ["csv", "date", "column", "time"]
  },
  {
    id: 103,
    documentId: 2,
    title: "Customer_ID Column",
    content: `Customer_ID\nCUST8821\nCUST4532\nCUST9012\nCUST2345\nCUST7865\nCUST3421\nCUST5678\nCUST8976\nCUST2468\nCUST1357\nCUST9753\nCUST4681\nCUST3579\nCUST8024\nCUST1598\nCUST7531\nCUST4826\nCUST9517\nCUST6284\nCUST7103`,
    tokenCount: 25,
    chunkIndex: 3,
    tags: ["csv", "customer", "id", "column"]
  },
  {
    id: 104,
    documentId: 2,
    title: "Product_ID Column",
    content: `Product_ID\nPROD334\nPROD112\nPROD445\nPROD223\nPROD556\nPROD667\nPROD778\nPROD889\nPROD990\nPROD112\nPROD334\nPROD445\nPROD223\nPROD556\nPROD667\nPROD778\nPROD889\nPROD990\nPROD112\nPROD334`,
    tokenCount: 25,
    chunkIndex: 4,
    tags: ["csv", "product", "id", "column"]
  },
  {
    id: 105,
    documentId: 2,
    title: "Category Column",
    content: `Category\nElectronics\nClothing\nHome Goods\nElectronics\nFurniture\nClothing\nElectronics\nGrocery\nHome Goods\nClothing\nElectronics\nHome Goods\nElectronics\nFurniture\nClothing\nElectronics\nGrocery\nHome Goods\nClothing\nElectronics`,
    tokenCount: 30,
    chunkIndex: 5,
    tags: ["csv", "category", "product type", "column"]
  },
  {
    id: 106,
    documentId: 2,
    title: "Amount Column",
    content: `Amount\n1299.99\n78.50\n249.95\n899.00\n1845.75\n125.40\n599.99\n156.78\n89.95\n245.00\n1799.99\n59.99\n349.95\n499.00\n189.50\n2499.99\n78.45\n129.99\n67.50\n129.99`,
    tokenCount: 28,
    chunkIndex: 6,
    tags: ["csv", "amount", "price", "column", "financial"]
  },
  {
    id: 107,
    documentId: 2,
    title: "Payment_Method Column",
    content: `Payment_Method\nCredit Card\nDebit Card\nPayPal\nCredit Card\nFinancing\nGift Card\nCredit Card\nDebit Card\nPayPal\nCredit Card\nFinancing\nDebit Card\nCredit Card\nCredit Card\nGift Card\nFinancing\nDebit Card\nPayPal\nCredit Card\nDebit Card`,
    tokenCount: 32,
    chunkIndex: 7,
    tags: ["csv", "payment", "method", "column"]
  },
  {
    id: 108,
    documentId: 2,
    title: "Status Column",
    content: `Status\nCompleted\nCompleted\nCompleted\nCompleted\nProcessing\nCompleted\nCompleted\nCompleted\nCompleted\nRefunded\nCompleted\nCompleted\nCompleted\nCompleted\nCompleted\nProcessing\nCompleted\nCompleted\nCompleted\nCompleted`,
    tokenCount: 24,
    chunkIndex: 8,
    tags: ["csv", "status", "state", "column"]
  },
  {
    id: 109,
    documentId: 2,
    title: "Location Column",
    content: `Location\nNew York\nChicago\nSan Francisco\nLos Angeles\nDallas\nMiami\nSeattle\nBoston\nPhoenix\nDenver\nAtlanta\nPortland\nHouston\nMinneapolis\nPhiladelphia\nSan Diego\nDetroit\nAustin\nNashville\nLas Vegas`,
    tokenCount: 36,
    chunkIndex: 9,
    tags: ["csv", "location", "city", "column", "geography"]
  },
  {
    id: 110,
    documentId: 2,
    title: "Notes Column",
    content: `Notes\n"High-end laptop purchase"\n"Winter sale items"\n"Kitchen appliance"\n"Smartphone purchase"\n"Living room set"\n"Birthday present purchase"\n"Gaming console"\n"Weekly groceries"\n"Home decor items"\n"Return due to sizing issue"\n"Premium TV purchase"\n"Kitchen utensils"\n"Wireless headphones"\n"Office chair"\n"Premium jeans"\n"Home theater system"\n"Organic produce"\n"Smart home device"\n"Casual wear"\n"Wireless earbuds"`,
    tokenCount: 62,
    chunkIndex: 10,
    tags: ["csv", "notes", "description", "column"]
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