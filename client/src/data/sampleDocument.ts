const sampleDocument = {
  title: "Financial_Report_Q1_2025.pdf",
  pageCount: 24,
  content: `FINANCIAL REPORT: Q1 2025
Submitted: April 15, 2025

EXECUTIVE SUMMARY
The first quarter of 2025 showed strong performance across all business units. 
Total revenue reached $245M, representing a 12% increase year-over-year. 
EBITDA margin improved to 28%, up from 26% in Q4 2024.

KEY FINANCIAL HIGHLIGHTS
• Revenue: $245M (+12% YoY)
• Operating Expenses: $172M (+8% YoY)
• EBITDA: $68.6M (+21% YoY)
• Operating Cash Flow: $52M (+15% YoY)
• Cash Position: $138M (as of March 31, 2025)

SEGMENT PERFORMANCE
Enterprise Solutions
Revenue: $112M (+18% YoY)
Operating Margin: 34%
New Customers: 28
Customer Retention: 94%

Consumer Products
Revenue: $87M (+8% YoY)
Operating Margin: 29%
Units Sold: 1.4M
Average Selling Price: $62

Digital Services
Revenue: $46M (+7% YoY)
Operating Margin: 22%
Monthly Active Users: 3.8M (+12% YoY)
Subscription Growth: 16% YoY

GEOGRAPHIC BREAKDOWN
• North America: $135M (55% of total)
• Europe: $62M (25% of total)
• Asia-Pacific: $34M (14% of total)
• Rest of World: $14M (6% of total)

OUTLOOK FOR Q2 2025
We anticipate continued growth in Q2 with projected revenue between $255-270M.
Operating margin is expected to remain stable at 28-30%.`
};

const sampleChunks = [
  {
    id: 1,
    documentId: 1,
    title: "Document Header",
    content: "FINANCIAL REPORT: Q1 2025\nSubmitted: April 15, 2025",
    tokenCount: 58,
    chunkIndex: 1,
    tags: ["Report", "Financial", "Q1 2025"]
  },
  {
    id: 2,
    documentId: 1,
    title: "Executive Summary",
    content: "EXECUTIVE SUMMARY\nThe first quarter of 2025 showed strong performance across all business units. Total revenue reached $245M, representing a 12% increase year-over-year. EBITDA margin improved to 28%, up from 26% in Q4 2024.",
    tokenCount: 112,
    chunkIndex: 2,
    tags: ["EBITDA", "Revenue", "YoY"]
  },
  {
    id: 3,
    documentId: 1,
    title: "Financial Highlights",
    content: "KEY FINANCIAL HIGHLIGHTS\n• Revenue: $245M (+12% YoY)\n• Operating Expenses: $172M (+8% YoY)\n• EBITDA: $68.6M (+21% YoY)\n• Operating Cash Flow: $52M (+15% YoY)\n• Cash Position: $138M (as of March 31, 2025)",
    tokenCount: 146,
    chunkIndex: 3,
    tags: ["Cash Flow", "Expenses", "Financial"]
  },
  {
    id: 4,
    documentId: 1,
    title: "Enterprise Solutions",
    content: "SEGMENT PERFORMANCE\nEnterprise Solutions\nRevenue: $112M (+18% YoY)\nOperating Margin: 34%\nNew Customers: 28\nCustomer Retention: 94%",
    tokenCount: 98,
    chunkIndex: 4,
    tags: ["Enterprise", "Retention", "Segment"]
  },
  {
    id: 5,
    documentId: 1,
    title: "Consumer Products",
    content: "Consumer Products\nRevenue: $87M (+8% YoY)\nOperating Margin: 29%\nUnits Sold: 1.4M\nAverage Selling Price: $62",
    tokenCount: 87,
    chunkIndex: 5,
    tags: ["Consumer", "Products", "ASP"]
  },
  {
    id: 6,
    documentId: 1,
    title: "Digital Services",
    content: "Digital Services\nRevenue: $46M (+7% YoY)\nOperating Margin: 22%\nMonthly Active Users: 3.8M (+12% YoY)\nSubscription Growth: 16% YoY",
    tokenCount: 92,
    chunkIndex: 6,
    tags: ["Digital", "Subscription", "Users"]
  },
  {
    id: 7,
    documentId: 1,
    title: "Geographic Breakdown",
    content: "GEOGRAPHIC BREAKDOWN\n• North America: $135M (55% of total)\n• Europe: $62M (25% of total)\n• Asia-Pacific: $34M (14% of total)\n• Rest of World: $14M (6% of total)",
    tokenCount: 123,
    chunkIndex: 7,
    tags: ["Geography", "Regional", "Markets"]
  },
  {
    id: 8,
    documentId: 1,
    title: "Future Outlook",
    content: "OUTLOOK FOR Q2 2025\nWe anticipate continued growth in Q2 with projected revenue between $255-270M. Operating margin is expected to remain stable at 28-30%.",
    tokenCount: 105,
    chunkIndex: 8,
    tags: ["Forecast", "Growth", "Margin"]
  }
];

const sampleFields = [
  {
    id: 1,
    name: "Revenue",
    documentId: 1,
    retrievable: true,
    filterable: true
  },
  {
    id: 2,
    name: "EBITDA",
    documentId: 1,
    retrievable: true,
    filterable: false
  },
  {
    id: 3,
    name: "Business Segment",
    documentId: 1,
    retrievable: true,
    filterable: true
  },
  {
    id: 4,
    name: "Geographic Region",
    documentId: 1,
    retrievable: false,
    filterable: true
  }
];

export { sampleDocument, sampleChunks, sampleFields };
