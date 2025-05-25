// Mock IDP data with Acura RDX automotive tables
export const mockIDPResults = {
  metadata: {
    documentType: "Automotive Specification Sheet",
    dateCreated: "2024-01-15",
    language: "English",
    pageCount: 18,
    author: "Acura Technical Documentation",
    department: "Product Engineering",
    confidentiality: "Public",
    version: "2025 Model Year",
    lastModified: "2024-01-14T16:30:00Z"
  },
  classification: ["automotive", "specification sheet", "technical data", "vehicle specifications"],
  extractedData: {
    tables: [
      {
        id: "drivetrain-specs",
        name: "Drivetrain Specifications",
        headers: ["Component", "Specification", "Details"],
        rows: [
          ["Transmission", "10-Speed Automatic", "10AT with paddle shifters"],
          ["Gear Ratios (1-5)", "1st: 4.710, 2nd: 3.094, 3rd: 2.050", "4th: 1.559, 5th: 1.197"],
          ["Gear Ratios (6-10)", "6th: 0.936, 7th: 0.748, 8th: 0.634", "9th: 0.529, 10th: 0.455"],
          ["Reverse Gear", "3.966", "Final Drive: 4.375"],
          ["Towing Capacity", "1,500 lbs", "When properly equipped"]
        ],
        confidence: 0.95,
        category: "drivetrain"
      },
      {
        id: "engine-specs",
        name: "Engine Specifications",
        headers: ["Specification", "Value", "Details"],
        rows: [
          ["Engine Type", "2.0L VTEC® Turbo", "4-cylinder, 16-valve, DOHC"],
          ["Displacement", "1996 cc", "121.8 cu in"],
          ["Bore x Stroke", "86.0 x 85.9 mm", "3.39 x 3.38 in"],
          ["Compression Ratio", "10.3:1", "Premium fuel recommended"],
          ["Max Horsepower", "272 hp @ 6500 rpm", "SAE net"],
          ["Max Torque", "280 lb-ft @ 1600-4500 rpm", "SAE net"],
          ["Fuel Injection", "Direct Injection", "High-pressure direct injection"],
          ["Turbocharger", "Single-scroll", "With electronic wastegate"],
          ["Valve Train", "VTEC®", "Variable Valve Timing & Lift Electronic Control"],
          ["Emissions Rating", "LEV3-SULEV30", "Super Ultra Low Emission Vehicle"]
        ],
        confidence: 0.95,
        category: "engine"
      },
      {
        id: "dimensions-capacities",
        name: "Dimensions & Capacities",
        headers: ["Dimension/Capacity", "Value", "Units"],
        rows: [
          ["Overall Length", "187.4", "inches"],
          ["Overall Width", "74.8", "inches"],
          ["Overall Height", "65.7", "inches"],
          ["Wheelbase", "108.5", "inches"],
          ["Track - Front", "64.2", "inches"],
          ["Track - Rear", "64.2", "inches"],
          ["Ground Clearance", "8.2", "inches (unladen)"],
          ["Passenger Volume", "103.5", "cubic feet"],
          ["Cargo Volume (behind 2nd row)", "29.5", "cubic feet"],
          ["Cargo Volume (behind 1st row)", "58.9", "cubic feet"],
          ["Fuel Tank Capacity", "17.1", "gallons"],
          ["Engine Oil Capacity", "4.4", "quarts (with filter)"],
          ["Coolant Capacity", "7.8", "quarts (including reserve)"],
          ["Curb Weight", "3859-3968", "lbs (depending on trim)"]
        ],
        confidence: 0.96,
        category: "dimensions"
      },
      {
        id: "standard-features",
        name: "Key Standard Features",
        headers: ["Category", "Feature", "Description"],
        rows: [
          ["Safety", "AcuraWatch®", "Suite of advanced safety and driver-assistive technologies"],
          ["Safety", "Collision Mitigation Braking", "CMBS™ with pedestrian detection"],
          ["Safety", "Road Departure Mitigation", "RDM with lane departure warning"],
          ["Safety", "Adaptive Cruise Control", "ACC with Low-Speed Follow"],
          ["Technology", "True Touchpad Interface™", "10.2-inch HD display with intuitive control"],
          ["Technology", "Wireless Apple CarPlay®", "Seamless smartphone integration"],
          ["Technology", "Wireless Android Auto™", "Google-based smartphone integration"],
          ["Technology", "Amazon Alexa Built-in", "Voice-activated assistance"],
          ["Audio", "ELS Studio® 3D Audio", "12 speakers, 710 watts"],
          ["Comfort", "Panoramic Moonroof", "One-touch power moonroof with tilt"],
          ["Comfort", "Heated Front Seats", "3-level heating adjustment"],
          ["Comfort", "Power Tailgate", "Hands-free access with programmable height"],
          ["Performance", "Drive Mode Selection", "Comfort, Normal, Sport, Snow modes"],
          ["Performance", "Active Damper System", "Available Adaptive Damper System"]
        ],
        confidence: 0.94,
        category: "features"
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