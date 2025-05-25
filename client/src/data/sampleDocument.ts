import { MetadataField } from "@shared/schema";

// Financial CSV data example - formatted as a table
export const financialCsvDocument = {
  title: "Honda_Acura_Parts_Inventory_2025 (CSV)",
  pageCount: 1,
  content: `<table class="w-full border-collapse">
  <thead class="bg-slate-100">
    <tr>
      <th class="border border-slate-300 p-2 text-left">Part_Number</th>
      <th class="border border-slate-300 p-2 text-left">Date_Added</th>
      <th class="border border-slate-300 p-2 text-left">Vehicle_Model</th>
      <th class="border border-slate-300 p-2 text-left">Part_Name</th>
      <th class="border border-slate-300 p-2 text-left">Category</th>
      <th class="border border-slate-300 p-2 text-left">Price</th>
      <th class="border border-slate-300 p-2 text-left">Availability</th>
      <th class="border border-slate-300 p-2 text-left">Status</th>
      <th class="border border-slate-300 p-2 text-left">Location</th>
      <th class="border border-slate-300 p-2 text-left">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-slate-300 p-2">17220-5PH-A01</td>
      <td class="border border-slate-300 p-2">2025-01-15</td>
      <td class="border border-slate-300 p-2">Accord 2024</td>
      <td class="border border-slate-300 p-2">Air Filter</td>
      <td class="border border-slate-300 p-2">Engine</td>
      <td class="border border-slate-300 p-2">34.99</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse A</td>
      <td class="border border-slate-300 p-2">OEM replacement part</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">51300-TZ5-A03</td>
      <td class="border border-slate-300 p-2">2025-01-15</td>
      <td class="border border-slate-300 p-2">MDX 2025</td>
      <td class="border border-slate-300 p-2">Front Shock Absorber</td>
      <td class="border border-slate-300 p-2">Suspension</td>
      <td class="border border-slate-300 p-2">189.50</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse B</td>
      <td class="border border-slate-300 p-2">Premium damping technology</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">45251-STK-A01</td>
      <td class="border border-slate-300 p-2">2025-01-16</td>
      <td class="border border-slate-300 p-2">Civic 2025</td>
      <td class="border border-slate-300 p-2">Brake Pad Set</td>
      <td class="border border-slate-300 p-2">Brakes</td>
      <td class="border border-slate-300 p-2">67.95</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse A</td>
      <td class="border border-slate-300 p-2">Ceramic compound</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">19200-5J6-A05</td>
      <td class="border border-slate-300 p-2">2025-01-16</td>
      <td class="border border-slate-300 p-2">TLX 2024</td>
      <td class="border border-slate-300 p-2">Water Pump</td>
      <td class="border border-slate-300 p-2">Cooling</td>
      <td class="border border-slate-300 p-2">142.00</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse C</td>
      <td class="border border-slate-300 p-2">High-flow design</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">15400-PLM-A02</td>
      <td class="border border-slate-300 p-2">2025-01-17</td>
      <td class="border border-slate-300 p-2">CR-V 2025</td>
      <td class="border border-slate-300 p-2">Oil Filter</td>
      <td class="border border-slate-300 p-2">Engine</td>
      <td class="border border-slate-300 p-2">12.75</td>
      <td class="border border-slate-300 p-2">Low Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse A</td>
      <td class="border border-slate-300 p-2">Genuine Honda part</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">42700-T2A-A93</td>
      <td class="border border-slate-300 p-2">2025-01-17</td>
      <td class="border border-slate-300 p-2">Pilot 2024</td>
      <td class="border border-slate-300 p-2">Wheel Hub Assembly</td>
      <td class="border border-slate-300 p-2">Wheels</td>
      <td class="border border-slate-300 p-2">225.40</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse B</td>
      <td class="border border-slate-300 p-2">With ABS sensor</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">12251-R70-A01</td>
      <td class="border border-slate-300 p-2">2025-01-18</td>
      <td class="border border-slate-300 p-2">RDX 2025</td>
      <td class="border border-slate-300 p-2">Cylinder Head Gasket</td>
      <td class="border border-slate-300 p-2">Engine</td>
      <td class="border border-slate-300 p-2">89.99</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse C</td>
      <td class="border border-slate-300 p-2">Multi-layer steel</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">76250-TK8-A01</td>
      <td class="border border-slate-300 p-2">2025-01-18</td>
      <td class="border border-slate-300 p-2">Odyssey 2025</td>
      <td class="border border-slate-300 p-2">Windshield Wiper</td>
      <td class="border border-slate-300 p-2">Body</td>
      <td class="border border-slate-300 p-2">28.78</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse A</td>
      <td class="border border-slate-300 p-2">All-weather blade</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">31110-5G0-A03</td>
      <td class="border border-slate-300 p-2">2025-01-19</td>
      <td class="border border-slate-300 p-2">HR-V 2025</td>
      <td class="border border-slate-300 p-2">Alternator</td>
      <td class="border border-slate-300 p-2">Electrical</td>
      <td class="border border-slate-300 p-2">389.95</td>
      <td class="border border-slate-300 p-2">On Order</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse B</td>
      <td class="border border-slate-300 p-2">150A output</td>
    </tr>
    <tr>
      <td class="border border-slate-300 p-2">22205-5BA-A03</td>
      <td class="border border-slate-300 p-2">2025-01-19</td>
      <td class="border border-slate-300 p-2">Integra 2024</td>
      <td class="border border-slate-300 p-2">Clutch Kit</td>
      <td class="border border-slate-300 p-2">Transmission</td>
      <td class="border border-slate-300 p-2">445.00</td>
      <td class="border border-slate-300 p-2">In Stock</td>
      <td class="border border-slate-300 p-2">Active</td>
      <td class="border border-slate-300 p-2">Warehouse C</td>
      <td class="border border-slate-300 p-2">Performance upgrade</td>
    </tr>
  </tbody>
</table>`
};

// Automotive Parts CSV data example - formatted as a table
export const automotivePartsDocument = financialCsvDocument;

// Honda/Acura Service Manual example
export const sampleDocument = {
  title: "Acura_2025_RDX_Fact Sheet.pdf",
  pageCount: 18,
  content: `# 2025 Acura RDX Fact Sheet

## Executive Summary

The 2025 Acura RDX represents the pinnacle of luxury compact SUV engineering, featuring the exclusive Super Handling All-Wheel Drive™ (SH-AWD®) system, a powerful 2.0L VTEC® Turbo engine, and comprehensive AcuraWatch® safety technologies. This fact sheet provides complete technical specifications, features, and capabilities of the 2025 RDX.

## Vehicle Model Coverage

| Model | Platform | Engine Options | Transmission |
|-------|----------|----------------|-------------|
| Accord | Mid-Size Sedan | 1.5L Turbo, 2.0L Hybrid | CVT, 10AT |
| CR-V | Compact SUV | 1.5L Turbo, 2.0L Hybrid | CVT |
| Pilot | 3-Row SUV | 3.5L V6, 2.0L Turbo Hybrid | 10AT |
| MDX | Luxury SUV | 3.0L Turbo, Type S 3.0L | 10AT |
| TLX | Sport Sedan | 2.0L Turbo, 3.0L Type S | 10AT |
| **Total Models** | **15** | **22 Variants** | **4 Types** |

## Service Intervals & Maintenance

- Engine Oil Change: 7,500-10,000 miles (based on oil life monitor)
- Transmission Fluid: 30,000-60,000 miles (varies by model)
- Brake Fluid Replacement: Every 3 years
- Engine Air Filter: 30,000 miles
- Cabin Air Filter: 15,000-20,000 miles

## Technical Specifications Overview

All 2025 models feature enhanced safety systems including:

1. Honda SENSING® / AcuraWatch™ suite standard
2. Blind Spot Information System with Cross Traffic Monitor
3. Traffic Jam Assist (selected models)
4. Wireless Apple CarPlay® and Android Auto™ compatibility

## Common Service Procedures

This manual includes step-by-step procedures for:

1. Engine diagnostics and trouble code reading
2. Brake system inspection and service
3. Suspension component replacement
4. ADAS calibration procedures
5. Hybrid battery system maintenance
6. Infotainment system updates and troubleshooting

## Safety Precautions

When servicing 2025 Honda/Acura vehicles, technicians must observe:

- High-voltage safety procedures for hybrid/electric models
- Proper SRS (airbag) system handling protocols
- ADAS sensor calibration requirements after windshield replacement
- Refrigerant handling procedures for R-1234yf systems

## Diagnostic Equipment Requirements

- Honda Diagnostic System (HDS) or i-HDS tablet
- ADAS calibration targets and alignment equipment
- Digital multimeter with high-voltage capabilities
- Refrigerant recovery and recycling equipment

## Conclusion

This service manual provides comprehensive guidance for maintaining and repairing 2025 Honda and Acura vehicles. Regular updates will be provided through the Honda Service Express system to ensure technicians have access to the latest procedures and specifications.`
};

// Financial CSV data chunks - for each row, text field becomes a separate chunk
export const financialCsvChunks = [
  // Row 1 - Text field chunks
  {
    id: 101,
    documentId: 2,
    title: "Row 1: Category",
    content: "Engine",
    tokenCount: 1,
    chunkIndex: 1,
    tags: ["row-1", "category", "engine"]
  },
  {
    id: 102,
    documentId: 2,
    title: "Row 1: Part Name",
    content: "Air Filter",
    tokenCount: 2,
    chunkIndex: 2,
    tags: ["row-1", "part", "air-filter"]
  },
  {
    id: 103,
    documentId: 2,
    title: "Row 1: Status",
    content: "Active",
    tokenCount: 1,
    chunkIndex: 3,
    tags: ["row-1", "status", "active"]
  },
  {
    id: 104,
    documentId: 2,
    title: "Row 1: Location",
    content: "Warehouse A",
    tokenCount: 2, 
    chunkIndex: 4,
    tags: ["row-1", "location", "warehouse-a"]
  },
  {
    id: 105,
    documentId: 2,
    title: "Row 1: Notes",
    content: "OEM replacement part",
    tokenCount: 3,
    chunkIndex: 5,
    tags: ["row-1", "notes", "oem", "replacement"]
  },
  
  // Row 2 - Text field chunks
  {
    id: 106,
    documentId: 2,
    title: "Row 2: Category",
    content: "Suspension",
    tokenCount: 1,
    chunkIndex: 6,
    tags: ["row-2", "category", "suspension"]
  },
  {
    id: 107,
    documentId: 2,
    title: "Row 2: Part Name",
    content: "Front Shock Absorber",
    tokenCount: 3,
    chunkIndex: 7,
    tags: ["row-2", "part", "shock-absorber"]
  },
  {
    id: 108,
    documentId: 2,
    title: "Row 2: Status",
    content: "Active",
    tokenCount: 1,
    chunkIndex: 8,
    tags: ["row-2", "status", "active"]
  },
  {
    id: 109,
    documentId: 2,
    title: "Row 2: Location",
    content: "Warehouse B",
    tokenCount: 2,
    chunkIndex: 9,
    tags: ["row-2", "location", "warehouse-b"]
  },
  {
    id: 110,
    documentId: 2,
    title: "Row 2: Notes",
    content: "Premium damping technology",
    tokenCount: 3,
    chunkIndex: 10,
    tags: ["row-2", "notes", "premium", "technology"]
  },
  
  // Row 3 - Text field chunks
  {
    id: 111,
    documentId: 2,
    title: "Row 3: Category",
    content: "Brakes",
    tokenCount: 1,
    chunkIndex: 11,
    tags: ["row-3", "category", "brakes"]
  },
  {
    id: 112,
    documentId: 2,
    title: "Row 3: Part Name",
    content: "Brake Pad Set",
    tokenCount: 3,
    chunkIndex: 12,
    tags: ["row-3", "part", "brake-pads"]
  },
  {
    id: 113,
    documentId: 2,
    title: "Row 3: Status",
    content: "Active",
    tokenCount: 1,
    chunkIndex: 13,
    tags: ["row-3", "status", "active"]
  },
  {
    id: 114,
    documentId: 2,
    title: "Row 3: Location",
    content: "Warehouse A",
    tokenCount: 2,
    chunkIndex: 14,
    tags: ["row-3", "location", "warehouse-a"]
  },
  {
    id: 115,
    documentId: 2,
    title: "Row 3: Notes",
    content: "Ceramic compound",
    tokenCount: 2,
    chunkIndex: 15,
    tags: ["row-3", "notes", "ceramic", "compound"]
  },
  
  // Row 4 - Text field chunks
  {
    id: 116,
    documentId: 2,
    title: "Row 4: Category",
    content: "Cooling",
    tokenCount: 1,
    chunkIndex: 16,
    tags: ["row-4", "category", "cooling"]
  },
  {
    id: 117,
    documentId: 2,
    title: "Row 4: Part Name",
    content: "Water Pump",
    tokenCount: 2,
    chunkIndex: 17,
    tags: ["row-4", "part", "water-pump"]
  },
  {
    id: 118,
    documentId: 2,
    title: "Row 4: Status",
    content: "Active",
    tokenCount: 1,
    chunkIndex: 18,
    tags: ["row-4", "status", "active"]
  },
  {
    id: 119,
    documentId: 2,
    title: "Row 4: Location",
    content: "Warehouse C",
    tokenCount: 2,
    chunkIndex: 19,
    tags: ["row-4", "location", "warehouse-c"]
  },
  {
    id: 120,
    documentId: 2,
    title: "Row 4: Notes",
    content: "High-flow design",
    tokenCount: 3,
    chunkIndex: 20,
    tags: ["row-4", "notes", "high-flow", "design"]
  },
  
  // Row 5 - Text field chunks
  {
    id: 121,
    documentId: 2,
    title: "Row 5: Category",
    content: "Engine",
    tokenCount: 1,
    chunkIndex: 21,
    tags: ["row-5", "category", "engine"]
  },
  {
    id: 122,
    documentId: 2,
    title: "Row 5: Part Name",
    content: "Oil Filter",
    tokenCount: 2,
    chunkIndex: 22,
    tags: ["row-5", "part", "oil-filter"]
  },
  {
    id: 123,
    documentId: 2,
    title: "Row 5: Status",
    content: "Active",
    tokenCount: 1,
    chunkIndex: 23,
    tags: ["row-5", "status", "active"]
  },
  {
    id: 124,
    documentId: 2,
    title: "Row 5: Location",
    content: "Warehouse A",
    tokenCount: 2,
    chunkIndex: 24,
    tags: ["row-5", "location", "warehouse-a"]
  },
  {
    id: 125,
    documentId: 2,
    title: "Row 5: Notes",
    content: "Genuine Honda part",
    tokenCount: 3,
    chunkIndex: 25,
    tags: ["row-5", "notes", "genuine", "honda"]
  }
];

// Automotive Parts CSV data chunks
export const automotivePartsCsvChunks = financialCsvChunks;

// Acura RDX chunks with malformed table extraction
export const sampleChunks = [
  {
    id: 1,
    documentId: 1,
    title: "Executive Summary",
    content: "The 2025 Acura RDX represents the pinnacle of luxury compact SUV engineering featuring the exclusive Super Handling All-Wheel Drive™ SH-AWD® system powerful 2.0L VTEC® Turbo engine comprehensive AcuraWatch® safety technologies This fact sheet provides complete technical specifications features capabilities",
    tokenCount: 42,
    chunkIndex: 1,
    tags: ["summary", "RDX", "2025", "acura"]
  },
  {
    id: 2,
    documentId: 1,
    title: "Drivetrain Specifications (Malformed Table)",
    content: "Drivetrain Type SH-AWD® Super Handling All-Wheel Drive™ Transmission 10-Speed Automatic 10AT with paddle shifters Gear Ratios (1-5) 1st: 4.710, 2nd: 3.094, 3rd: 2.050 4th: 1.559, 5th: 1.197 Gear Ratios (6-10) 6th: 0.936, 7th: 0.748, 8th: 0.634 9th: 0.529, 10th: 0.455 Reverse Gear 3.966 Final Drive: 4.375 Towing Capacity 1,500 lbs When properly equipped",
    tokenCount: 68,
    chunkIndex: 2,
    tags: ["drivetrain", "transmission", "specifications", "malformed"]
  },
  {
    id: 3,
    documentId: 1,
    title: "Engine Specifications (Poor Extraction)",
    content: "Engine Specifications Specification Value Details Engine Type 2.0L VTEC® Turbo 4-cylinder, 16-valve, DOHC Displacement 1996 cc 121.8 cu in Bore x Stroke 86.0 x 85.9 mm 3.39 x 3.38 in Compression Ratio 10.3:1 Premium fuel recommended Max Horsepower 272 hp @ 6500 rpm SAE net Max Torque 280 lb-ft @ 1600-4500 rpm SAE net",
    tokenCount: 58,
    chunkIndex: 3,
    tags: ["engine", "specifications", "power", "malformed"]
  },
  {
    id: 4,
    documentId: 1,
    title: "Dimensions & Capacities (Broken Format)",
    content: "Dimension/Capacity Value Units Overall Length 187.4 inches Overall Width 74.8 inches Overall Height 65.7 inches Wheelbase 108.5 inches Track - Front 64.2 inches Track - Rear 64.2 inches Ground Clearance 8.2 inches (unladen) Passenger Volume 103.5 cubic feet Cargo Volume (behind 2nd row) 29.5 cubic feet",
    tokenCount: 52,
    chunkIndex: 4,
    tags: ["dimensions", "capacities", "measurements", "malformed"]
  },
  {
    id: 5,
    documentId: 1,
    title: "Safety Features (Mixed Format)",
    content: "Key Standard Features Category Feature Description Safety AcuraWatch® Suite of advanced safety and driver-assistive technologies Collision Mitigation Braking CMBS™ with pedestrian detection Road Departure Mitigation RDM with lane departure warning Adaptive Cruise Control ACC with Low-Speed Follow",
    tokenCount: 43,
    chunkIndex: 5,
    tags: ["safety", "features", "AcuraWatch", "malformed"]
  },
  {
    id: 6,
    documentId: 1,
    title: "Technology Features (Line Break Issues)",
    content: "Technology True Touchpad Interface™ 10.2-inch HD display with intuitive control\nWireless Apple CarPlay® Seamless smartphone integration Wireless\nAndroid Auto™ Google-based smartphone integration Amazon Alexa\nBuilt-in Voice-activated assistance",
    tokenCount: 35,
    chunkIndex: 6,
    tags: ["technology", "infotainment", "connectivity", "malformed"]
  },
  {
    id: 7,
    documentId: 1,
    title: "Interior Features (Missing Delimiters)",
    content: "Audio ELS Studio® 3D Audio 12 speakers, 710 watts Comfort Panoramic Moonroof One-touch power moonroof with tilt Heated Front Seats 3-level heating adjustment Power Tailgate Hands-free access with programmable height Performance Drive Mode Selection Comfort, Normal, Sport, Snow modes",
    tokenCount: 46,
    chunkIndex: 7,
    tags: ["interior", "comfort", "audio", "malformed"]
  },
  {
    id: 8,
    documentId: 1,
    title: "Fuel Economy & Performance Data",
    content: "Fuel Economy City/Highway/Combined 22/28/24 mpg Performance 0-60 mph 6.6 seconds Top Speed 124 mph electronically limited Fuel Tank Capacity 17.1 gallons Premium unleaded required Engine Oil Capacity 4.4 quarts with filter Coolant Capacity 7.8 quarts including reserve tank",
    tokenCount: 48,
    chunkIndex: 8,
    tags: ["performance", "fuel", "economy", "malformed"]
  },
  {
    id: 9,
    documentId: 1,
    title: "Warranty & Price Information (Fragmented)",
    content: "Limited Warranty 4 years/50,000 miles Powertrain Limited\nWarranty 6 years/70,000 miles Starting MSRP $44,700\nA-Spec $47,900 A-Spec Advance $51,000\nType S $54,900 Destination Charge $1,350",
    tokenCount: 42,
    chunkIndex: 9,
    tags: ["warranty", "pricing", "MSRP", "malformed"]
  },
  {
    id: 10,
    documentId: 1,
    title: "Additional Equipment (Run-on Text)",
    content: "Available accessories include roof rails cross bars cargo organizer all-season floor mats splash guards door visors rear bumper applique illuminated door sill trim remote engine starter wheel locks parking sensors trailer hitch",
    tokenCount: 32,
    chunkIndex: 10,
    tags: ["accessories", "equipment", "options", "malformed"]
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
    value: "Honda/Acura Parts Inventory 2025",
    included: true,
    confidence: 1.0
  },
  {
    id: 102,
    name: "source",
    value: "Honda Parts Management System",
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
    value: "Parts & Service",
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
    value: "Part_Number,Date_Added,Vehicle_Model,Part_Name,Category,Price,Availability,Status,Location,Notes",
    included: true,
    confidence: 1.0
  },
  {
    id: 110,
    name: "dataOwner",
    value: "Parts Department",
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
    name: "totalValue",
    value: "$1,874.52",
    included: true,
    confidence: 1.0
  },
  {
    id: 113,
    name: "dateRange",
    value: "2025-01-15 to 2025-01-19",
    included: true,
    confidence: 1.0
  },
  {
    id: 114,
    name: "uniqueModels",
    value: "10",
    included: true,
    confidence: 1.0
  },
  {
    id: 115,
    name: "uniqueParts",
    value: "10", 
    included: true,
    confidence: 1.0
  }
];

// Automotive Parts CSV metadata fields
export const automotivePartsCsvMetadataFields: MetadataField[] = financialCsvMetadataFields;

// Sample metadata fields for document record-level indexing
export const sampleMetadataFields: MetadataField[] = [
  {
    id: 1,
    name: "author",
    value: "Honda Technical Publications",
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
    value: "Honda_Acura_2025_Manual.PDF",
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
    value: "Technical Library/Service Manuals/",
    included: false,
    confidence: 0.85
  },
  {
    id: 8,
    name: "department",
    value: "Service & Parts",
    included: true,
    confidence: 0.92
  },
  {
    id: 9,
    name: "modelYear",
    value: "2025",
    included: true,
    confidence: 0.97
  },
  {
    id: 10,
    name: "year",
    value: "2025",
    included: true,
    confidence: 0.99
  },
  {
    id: 11,
    name: "documentType",
    value: "Service Manual",
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
    value: "156",
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