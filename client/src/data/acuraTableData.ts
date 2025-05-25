export interface AutomotiveTable {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  page: number;
  category: 'drivetrain' | 'engine' | 'dimensions' | 'features' | 'specifications';
}

export const acuraRDXTables: AutomotiveTable[] = [
  {
    id: 'drivetrain-specs',
    title: 'Drivetrain Specifications',
    headers: ['Component', 'Specification', 'Type/Value'],
    rows: [
      ['Drivetrain Type', 'SH-AWD®', 'Super Handling All-Wheel Drive™'],
      ['Transmission', '10-Speed Automatic', '10AT with Shift-by-Wire'],
      ['Gear Ratios', '1st: 4.710', '2nd: 3.094, 3rd: 2.050'],
      ['Gear Ratios cont.', '4th: 1.559', '5th: 1.197, 6th: 0.936'],
      ['Gear Ratios cont.', '7th: 0.748', '8th: 0.634, 9th: 0.529'],
      ['Gear Ratios cont.', '10th: 0.455', 'Reverse: 3.966'],
      ['Final Drive Ratio', '4.375', 'Front and Rear'],
      ['Torque Distribution', 'Variable', 'Up to 70% rear, 100% to either rear wheel'],
      ['Differential Type', 'Electronic', 'Electromagnetic clutch system']
    ],
    page: 8,
    category: 'drivetrain'
  },
  {
    id: 'engine-specs',
    title: 'Engine Specifications',
    headers: ['Specification', 'Value', 'Details'],
    rows: [
      ['Engine Type', '2.0L VTEC® Turbo', '4-cylinder, 16-valve, DOHC'],
      ['Displacement', '1996 cc', '121.8 cu in'],
      ['Bore x Stroke', '86.0 x 85.9 mm', '3.39 x 3.38 in'],
      ['Compression Ratio', '10.3:1', 'Premium fuel recommended'],
      ['Max Horsepower', '272 hp @ 6500 rpm', 'SAE net'],
      ['Max Torque', '280 lb-ft @ 1600-4500 rpm', 'SAE net'],
      ['Fuel Injection', 'Direct Injection', 'High-pressure direct injection'],
      ['Turbocharger', 'Single-scroll', 'With electronic wastegate'],
      ['Valve Train', 'VTEC®', 'Variable Valve Timing & Lift Electronic Control'],
      ['Emissions Rating', 'LEV3-SULEV30', 'Super Ultra Low Emission Vehicle']
    ],
    page: 5,
    category: 'engine'
  },
  {
    id: 'dimensions-capacities',
    title: 'Dimensions & Capacities',
    headers: ['Dimension/Capacity', 'Value', 'Units'],
    rows: [
      ['Overall Length', '187.4', 'inches'],
      ['Overall Width', '74.8', 'inches'],
      ['Overall Height', '65.7', 'inches'],
      ['Wheelbase', '108.5', 'inches'],
      ['Track - Front', '64.2', 'inches'],
      ['Track - Rear', '64.2', 'inches'],
      ['Ground Clearance', '8.2', 'inches (unladen)'],
      ['Passenger Volume', '103.5', 'cubic feet'],
      ['Cargo Volume (behind 2nd row)', '29.5', 'cubic feet'],
      ['Cargo Volume (behind 1st row)', '58.9', 'cubic feet'],
      ['Fuel Tank Capacity', '17.1', 'gallons'],
      ['Engine Oil Capacity', '4.4', 'quarts (with filter)'],
      ['Coolant Capacity', '7.8', 'quarts (including reserve)'],
      ['Curb Weight', '3859-3968', 'lbs (depending on trim)']
    ],
    page: 12,
    category: 'dimensions'
  },
  {
    id: 'standard-features',
    title: 'Key Standard Features',
    headers: ['Category', 'Feature', 'Description'],
    rows: [
      ['Safety', 'AcuraWatch®', 'Suite of advanced safety and driver-assistive technologies'],
      ['Safety', 'Collision Mitigation Braking', 'CMBS™ with pedestrian detection'],
      ['Safety', 'Road Departure Mitigation', 'RDM with lane departure warning'],
      ['Safety', 'Adaptive Cruise Control', 'ACC with Low-Speed Follow'],
      ['Technology', 'True Touchpad Interface™', '10.2-inch HD display with intuitive control'],
      ['Technology', 'Wireless Apple CarPlay®', 'Seamless smartphone integration'],
      ['Technology', 'Wireless Android Auto™', 'Google-based smartphone integration'],
      ['Technology', 'Amazon Alexa Built-in', 'Voice-activated assistance'],
      ['Audio', 'ELS Studio® 3D Audio', '12 speakers, 710 watts'],
      ['Comfort', 'Panoramic Moonroof', 'One-touch power moonroof with tilt'],
      ['Comfort', 'Heated Front Seats', '3-level heating adjustment'],
      ['Comfort', 'Power Tailgate', 'Hands-free access with programmable height'],
      ['Performance', 'Drive Mode Selection', 'Comfort, Normal, Sport, Snow modes'],
      ['Performance', 'Active Damper System', 'Available Adaptive Damper System']
    ],
    page: 15,
    category: 'features'
  }
];

export function getTablesByCategory(category: AutomotiveTable['category']): AutomotiveTable[] {
  return acuraRDXTables.filter(table => table.category === category);
}

export function getTableById(id: string): AutomotiveTable | undefined {
  return acuraRDXTables.find(table => table.id === id);
}

export function searchTablesContent(searchTerm: string): AutomotiveTable[] {
  const term = searchTerm.toLowerCase();
  return acuraRDXTables.filter(table => {
    const inTitle = table.title.toLowerCase().includes(term);
    const inHeaders = table.headers.some(h => h.toLowerCase().includes(term));
    const inRows = table.rows.some(row => 
      row.some(cell => cell.toLowerCase().includes(term))
    );
    return inTitle || inHeaders || inRows;
  });
}