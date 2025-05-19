// Mock IDP data with proper table structures
export const mockIDPResults = {
  metadata: {
    documentType: "Business Report",
    dateCreated: "2024-01-15",
    language: "English",
    pageCount: 25,
    author: "Analytics Team",
    department: "Finance",
    confidentiality: "Internal Use",
    version: "1.2",
    lastModified: "2024-01-14T16:30:00Z"
  },
  classification: ["financial", "quarterly report", "analysis", "business metrics"],
  extractedData: {
    tables: [
      {
        id: "table1",
        name: "Q4 2023 Revenue Summary by Region",
        headers: ["Region", "Q3 2023", "Q4 2023", "Change ($)", "Change (%)", "YoY Growth"],
        rows: [
          ["North America", "$45.2M", "$52.1M", "+$6.9M", "+15.3%", "+22.1%"],
          ["Europe", "$32.8M", "$35.4M", "+$2.6M", "+7.9%", "+18.5%"],
          ["Asia Pacific", "$28.5M", "$31.2M", "+$2.7M", "+9.5%", "+24.3%"],
          ["Latin America", "$12.1M", "$13.8M", "+$1.7M", "+14.0%", "+19.2%"],
          ["Middle East & Africa", "$8.9M", "$9.8M", "+$0.9M", "+10.1%", "+15.6%"],
          ["Total", "$127.5M", "$142.3M", "+$14.8M", "+11.6%", "+20.5%"]
        ],
        confidence: 0.94
      },
      {
        id: "table2",
        name: "Product Performance Metrics",
        headers: ["Product Line", "Units Sold", "Revenue", "Gross Margin", "Market Share", "Customer Satisfaction"],
        rows: [
          ["Enterprise Suite", "1,234", "$78.5M", "42%", "28.3%", "4.6/5.0"],
          ["Professional", "3,456", "$41.2M", "38%", "22.1%", "4.4/5.0"],
          ["Small Business", "8,901", "$12.8M", "31%", "15.4%", "4.7/5.0"],
          ["Custom Solutions", "567", "$23.5M", "48%", "12.2%", "4.8/5.0"],
          ["Cloud Services", "12,345", "$34.3M", "56%", "18.9%", "4.5/5.0"]
        ],
        confidence: 0.91
      },
      {
        id: "table3",
        name: "Key Financial Metrics Comparison",
        headers: ["Metric", "Q4 2023", "Q3 2023", "Q4 2022", "Target", "Status"],
        rows: [
          ["Revenue", "$142.3M", "$127.5M", "$118.2M", "$140.0M", "✓ Exceeded"],
          ["Gross Profit", "$84.1M", "$74.5M", "$67.4M", "$80.0M", "✓ Exceeded"],
          ["Operating Income", "$35.6M", "$31.2M", "$27.1M", "$33.0M", "✓ Exceeded"],
          ["Net Income", "$27.3M", "$23.8M", "$20.6M", "$25.0M", "✓ Exceeded"],
          ["EPS", "$1.37", "$1.19", "$1.03", "$1.25", "✓ Exceeded"],
          ["Operating Margin", "25.0%", "24.5%", "22.9%", "23.5%", "✓ Exceeded"]
        ],
        confidence: 0.96
      },
      {
        id: "table4",
        name: "Customer Acquisition Cost Analysis",
        headers: ["Channel", "New Customers", "CAC", "LTV", "LTV:CAC Ratio", "ROI"],
        rows: [
          ["Direct Sales", "142", "$8,250", "$42,000", "5.1:1", "234%"],
          ["Partners", "256", "$4,100", "$38,500", "9.4:1", "389%"],
          ["Digital Marketing", "892", "$850", "$28,000", "32.9:1", "567%"],
          ["Events", "67", "$12,500", "$45,000", "3.6:1", "187%"],
          ["Referrals", "234", "$500", "$52,000", "104:1", "892%"]
        ],
        confidence: 0.89
      }
    ],
    images: [
      {
        id: "img1",
        url: "/api/documents/images/revenue-chart.png",
        caption: "Revenue Growth Trend 2021-2023",
        metadata: { page: 5, type: "chart", dimensions: "800x600" }
      },
      {
        id: "img2",
        url: "/api/documents/images/market-share.png",
        caption: "Market Share by Product Category",
        metadata: { page: 8, type: "pie-chart", dimensions: "600x600" }
      },
      {
        id: "img3",
        url: "/api/documents/images/customer-growth.png",
        caption: "Customer Base Growth Over Time",
        metadata: { page: 12, type: "line-chart", dimensions: "800x400" }
      }
    ],
    formFields: {
      "Report Period": { value: "Q4 2023", type: "text", confidence: 0.99 },
      "Company Name": { value: "TechCorp Inc.", type: "text", confidence: 0.98 },
      "Report Type": { value: "Quarterly Financial Report", type: "text", confidence: 0.97 },
      "Fiscal Year": { value: "2023", type: "number", confidence: 0.99 },
      "Total Revenue": { value: 142300000, type: "currency", confidence: 0.95 },
      "Total Employees": { value: 8456, type: "number", confidence: 0.93 },
      "Markets Served": { value: 42, type: "number", confidence: 0.91 },
      "CEO": { value: "Jane Smith", type: "text", confidence: 0.96 },
      "CFO": { value: "John Doe", type: "text", confidence: 0.96 },
      "Auditor": { value: "KPMG LLP", type: "text", confidence: 0.98 },
      "Stock Symbol": { value: "TECH", type: "text", confidence: 0.99 },
      "Exchange": { value: "NASDAQ", type: "text", confidence: 0.99 },
      "Headquarters": { value: "San Francisco, CA", type: "text", confidence: 0.94 },
      "Founded": { value: "1995", type: "text", confidence: 0.97 },
      "Website": { value: "www.techcorp.com", type: "url", confidence: 0.99 }
    }
  }
};