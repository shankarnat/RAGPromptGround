export interface VehicleSpecification {
  vin?: string;
  make: string;
  model: string;
  year: number;
  engine?: EngineSpecification;
  transmission?: TransmissionSpecification;
  dimensions?: VehicleDimensions;
  weights?: VehicleWeights;
  capacities?: VehicleCapacities;
  serviceIntervals?: ServiceInterval[];
  torqueSpecifications?: TorqueSpecification[];
  partNumbers?: PartNumber[];
}

export interface EngineSpecification {
  type: string;
  displacement: string;
  horsepower: number;
  torque: number;
  cylinders: number;
  configuration: string;
  fuelType: string;
  compression?: string;
}

export interface TransmissionSpecification {
  type: string;
  gears: number;
  driveType: string;
}

export interface VehicleDimensions {
  length: string;
  width: string;
  height: string;
  wheelbase: string;
  groundClearance?: string;
}

export interface VehicleWeights {
  curb: string;
  gross: string;
  payload?: string;
  towing?: string;
}

export interface VehicleCapacities {
  fuelTank: string;
  engineOil: string;
  coolant?: string;
  transmissionFluid?: string;
  brakeFluid?: string;
  powerSteering?: string;
}

export interface ServiceInterval {
  component: string;
  interval: string;
  miles?: number;
  months?: number;
  notes?: string;
}

export interface TorqueSpecification {
  component: string;
  specification: string;
  unit: 'lb-ft' | 'Nm' | 'kg-m';
  pattern?: string;
  notes?: string;
}

export interface PartNumber {
  number: string;
  description: string;
  category: string;
  superseded?: string[];
  compatibility?: string[];
  price?: number;
  availability?: string;
}

export interface ExtractedTable {
  headers: string[];
  rows: string[][];
  type?: 'specification' | 'parts' | 'service' | 'torque' | 'unknown';
  metadata?: Record<string, any>;
}

export class VehicleSpecificationExtractor {
  private static instance: VehicleSpecificationExtractor;
  
  // VIN pattern for Honda/Acura vehicles
  private vinPattern = /\b[JH][A-Z0-9]{2}[A-Z0-9]{6}[0-9]{6}\b/g;
  
  // Honda/Acura part number patterns
  private partNumberPatterns = [
    /\b\d{5}-[A-Z0-9]{3}-[A-Z0-9]{3}\b/g,  // 12345-ABC-123
    /\b\d{5}-[A-Z0-9]{3}-[A-Z]\d{2}\b/g,   // 12345-ABC-A01
    /\b\d{5}-[A-Z0-9]{4}-\d{3}\b/g,        // 12345-ABCD-123
    /\b\d{5}-[A-Z0-9]{2}-[A-Z0-9]{4}\b/g   // 12345-AB-1234
  ];
  
  // Torque specification patterns
  private torquePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:to\s*)?(\d+(?:\.\d+)?)\s*(lb[- ]?ft|Nm|kg[- ]?m)/gi,
    /(\d+(?:\.\d+)?)\s*(lb[- ]?ft|Nm|kg[- ]?m)/gi
  ];
  
  // Service interval patterns
  private serviceIntervalPatterns = [
    /every\s*(\d+,?\d*)\s*miles/gi,
    /(\d+,?\d*)\s*miles?\s*(?:or|\/)\s*(\d+)\s*months?/gi,
    /replace\s*(?:every|at)\s*(\d+,?\d*)\s*miles/gi
  ];

  private constructor() {}

  static getInstance(): VehicleSpecificationExtractor {
    if (!VehicleSpecificationExtractor.instance) {
      VehicleSpecificationExtractor.instance = new VehicleSpecificationExtractor();
    }
    return VehicleSpecificationExtractor.instance;
  }

  async extractFromDocument(content: string): Promise<Partial<VehicleSpecification>> {
    const specification: Partial<VehicleSpecification> = {};
    
    // Extract VIN
    const vin = this.extractVIN(content);
    if (vin) {
      specification.vin = vin;
      const vehicleInfo = this.decodeVIN(vin);
      Object.assign(specification, vehicleInfo);
    }
    
    // Extract part numbers
    specification.partNumbers = this.extractPartNumbers(content);
    
    // Extract torque specifications
    specification.torqueSpecifications = this.extractTorqueSpecs(content);
    
    // Extract service intervals
    specification.serviceIntervals = this.extractServiceIntervals(content);
    
    // Extract tables and parse structured data
    const tables = this.extractTables(content);
    this.parseTablesIntoSpecification(tables, specification);
    
    return specification;
  }

  extractVIN(content: string): string | null {
    const matches = content.match(this.vinPattern);
    return matches ? matches[0] : null;
  }

  decodeVIN(vin: string): Partial<VehicleSpecification> {
    // Honda/Acura VIN decoding logic
    const specification: Partial<VehicleSpecification> = {};
    
    // First character: Country (J = Japan)
    // Second character: Manufacturer (H = Honda, N = Acura)
    const make = vin[1] === 'H' ? 'Honda' : 'Acura';
    specification.make = make;
    
    // VIN position 10 is model year
    const yearCode = vin[9];
    const modelYear = this.decodeModelYear(yearCode);
    if (modelYear) {
      specification.year = modelYear;
    }
    
    // Positions 4-8 contain model and body style info
    const modelCode = vin.substring(3, 8);
    specification.model = this.decodeModel(modelCode, make);
    
    return specification;
  }

  private decodeModelYear(code: string): number | null {
    const yearMap: Record<string, number> = {
      'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026,
      'V': 2027, 'W': 2028, 'X': 2029, 'Y': 2030
    };
    return yearMap[code] || null;
  }

  private decodeModel(code: string, make: string): string {
    // Simplified model decoding - in production, this would use comprehensive VIN tables
    const modelMap: Record<string, string> = {
      // Honda models
      'DE1': 'Civic Sedan', 'DE2': 'Civic Hatchback', 'DE3': 'Civic Si',
      'YF1': 'Accord', 'YF2': 'Accord Hybrid', 'YF3': 'Accord Sport',
      'RW1': 'CR-V', 'RW2': 'CR-V Hybrid',
      'YF4': 'Pilot', 'YF5': 'Pilot TrailSport',
      'RL5': 'Odyssey', 'RL6': 'Odyssey Elite',
      'YK3': 'Ridgeline',
      // Acura models
      'DC5': 'Integra', 'DC6': 'Integra Type S',
      'UA7': 'TLX', 'UA8': 'TLX Type S',
      'YD3': 'MDX', 'YD4': 'MDX Type S',
      'TC1': 'RDX', 'TC2': 'RDX A-Spec'
    };
    
    // Check first 3 characters of model code
    const modelKey = code.substring(0, 3);
    return modelMap[modelKey] || 'Unknown Model';
  }

  extractPartNumbers(content: string): PartNumber[] {
    const partNumbers: PartNumber[] = [];
    const foundNumbers = new Set<string>();
    
    for (const pattern of this.partNumberPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const partNumber = match[0];
        if (!foundNumbers.has(partNumber)) {
          foundNumbers.add(partNumber);
          
          // Extract context around part number for description
          const startIndex = Math.max(0, match.index! - 50);
          const endIndex = Math.min(content.length, match.index! + partNumber.length + 50);
          const context = content.substring(startIndex, endIndex);
          
          partNumbers.push({
            number: partNumber,
            description: this.extractPartDescription(context, partNumber),
            category: this.categorizePartNumber(partNumber),
            compatibility: this.extractCompatibility(context)
          });
        }
      }
    }
    
    return partNumbers;
  }

  private extractPartDescription(context: string, partNumber: string): string {
    // Remove the part number and clean up the context
    const cleaned = context.replace(partNumber, '').trim();
    
    // Look for common description patterns
    const descPatterns = [
      /(?:for|-)?\s*([A-Za-z\s]+?)(?:\s*-|\s*,|\s*\(|$)/,
      /:\s*([A-Za-z\s]+?)(?:\s*-|\s*,|$)/
    ];
    
    for (const pattern of descPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Fallback: return first few words
    const words = cleaned.split(/\s+/).slice(0, 5).join(' ');
    return words || 'Part';
  }

  private categorizePartNumber(partNumber: string): string {
    // Honda/Acura part number categorization based on prefix
    const prefix = partNumber.substring(0, 5);
    const firstTwo = prefix.substring(0, 2);
    
    const categoryMap: Record<string, string> = {
      '04': 'Body/Frame',
      '06': 'Exhaust',
      '08': 'Body Electrical',
      '11': 'Engine Block',
      '12': 'Cylinder Head',
      '13': 'Piston/Connecting Rod',
      '14': 'Camshaft/Valve',
      '15': 'Oil Pump/Filter',
      '16': 'Fuel System',
      '17': 'Air Intake',
      '18': 'Exhaust Manifold',
      '19': 'Cooling System',
      '22': 'Clutch',
      '23': 'Transmission',
      '31': 'Alternator/Starter',
      '32': 'Battery/Ignition',
      '35': 'Switches/Sensors',
      '36': 'Lighting',
      '38': 'Instrumentation',
      '39': 'Audio/Navigation',
      '42': 'Wheels/Tires',
      '43': 'Brake System',
      '44': 'Steering',
      '45': 'Front Brake',
      '46': 'Rear Brake',
      '50': 'Front Suspension',
      '51': 'Shock Absorber',
      '52': 'Rear Suspension',
      '53': 'Front Drive Shaft',
      '71': 'Front Bumper',
      '72': 'Interior Trim',
      '73': 'Hood/Grille',
      '74': 'Doors',
      '76': 'Windshield/Glass',
      '77': 'Seats',
      '78': 'Seat Belts',
      '79': 'Air Conditioning',
      '80': 'Climate Control',
      '81': 'Interior Accessories',
      '82': 'Floor Mats',
      '83': 'Seat Covers',
      '84': 'Exterior Accessories',
      '90': 'Tools/Manuals',
      '91': 'Labels/Emblems'
    };
    
    return categoryMap[firstTwo] || 'General';
  }

  private extractCompatibility(context: string): string[] {
    const compatibility: string[] = [];
    
    // Look for year ranges
    const yearPattern = /\b(20\d{2})\s*-\s*(20\d{2})\b/g;
    const yearMatches = context.matchAll(yearPattern);
    for (const match of yearMatches) {
      compatibility.push(`${match[1]}-${match[2]}`);
    }
    
    // Look for model names
    const models = ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline', 
                   'MDX', 'RDX', 'TLX', 'Integra', 'HR-V', 'Passport'];
    for (const model of models) {
      if (context.includes(model)) {
        compatibility.push(model);
      }
    }
    
    return compatibility;
  }

  extractTorqueSpecs(content: string): TorqueSpecification[] {
    const specs: TorqueSpecification[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for torque values in the line
      for (const pattern of this.torquePatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const component = this.extractComponentName(line, match.index!);
          if (component) {
            specs.push({
              component,
              specification: match[0],
              unit: this.normalizeUnit(match[match.length - 1]) as any,
              notes: this.extractTorqueNotes(line)
            });
          }
        }
      }
    }
    
    return specs;
  }

  private extractComponentName(line: string, torqueIndex: number): string {
    // Get the part before the torque specification
    const beforeTorque = line.substring(0, torqueIndex).trim();
    
    // Common patterns for component names
    const patterns = [
      /(?:^|\s)([A-Za-z\s]+(?:bolt|nut|screw|stud|bearing|shaft|cover|pan|housing|bracket|mount)s?)\s*:?\s*$/i,
      /(?:^|\s)([A-Za-z\s]+)\s*:?\s*$/
    ];
    
    for (const pattern of patterns) {
      const match = beforeTorque.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Fallback: use last few words before torque
    const words = beforeTorque.split(/\s+/);
    return words.slice(-3).join(' ');
  }

  private normalizeUnit(unit: string): string {
    const normalized = unit.toLowerCase().replace(/[- ]/g, '');
    if (normalized.includes('lb') && normalized.includes('ft')) return 'lb-ft';
    if (normalized === 'nm') return 'Nm';
    if (normalized.includes('kg') && normalized.includes('m')) return 'kg-m';
    return unit;
  }

  private extractTorqueNotes(line: string): string | undefined {
    // Look for common torque notes patterns
    const notePatterns = [
      /\(([^)]+)\)/,  // Text in parentheses
      /\+\s*(\d+°)/,  // Additional rotation angle
      /in\s+sequence/i,
      /cross\s+pattern/i,
      /final\s+torque/i
    ];
    
    for (const pattern of notePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return undefined;
  }

  extractServiceIntervals(content: string): ServiceInterval[] {
    const intervals: ServiceInterval[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Check each pattern
      for (const pattern of this.serviceIntervalPatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const component = this.extractServiceComponent(line, match.index!);
          if (component) {
            const interval: ServiceInterval = {
              component,
              interval: match[0]
            };
            
            // Extract miles
            if (match[1]) {
              interval.miles = parseInt(match[1].replace(/,/g, ''));
            }
            
            // Extract months if present
            if (match[2]) {
              interval.months = parseInt(match[2]);
            }
            
            intervals.push(interval);
          }
        }
      }
    }
    
    return intervals;
  }

  private extractServiceComponent(line: string, intervalIndex: number): string {
    const beforeInterval = line.substring(0, intervalIndex).trim();
    
    // Common service components
    const components = [
      'engine oil', 'oil filter', 'air filter', 'cabin air filter',
      'transmission fluid', 'brake fluid', 'coolant', 'spark plugs',
      'drive belt', 'timing belt', 'brake pads', 'brake rotors',
      'battery', 'tires', 'differential fluid', 'transfer case fluid'
    ];
    
    // Check if line contains any known component
    const lowerLine = beforeInterval.toLowerCase();
    for (const component of components) {
      if (lowerLine.includes(component)) {
        return component;
      }
    }
    
    // Fallback: use words before interval
    const words = beforeInterval.split(/\s+/);
    return words.slice(-3).join(' ');
  }

  extractTables(content: string): ExtractedTable[] {
    const tables: ExtractedTable[] = [];
    
    // Simple table detection - looks for patterns of pipes or tabs
    const lines = content.split('\n');
    let inTable = false;
    let currentTable: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isPipeSeparated = line.includes('|') && line.split('|').length > 2;
      const isTabSeparated = line.includes('\t') && line.split('\t').length > 2;
      
      if (isPipeSeparated || isTabSeparated) {
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        currentTable.push(line);
      } else if (inTable && line.trim() === '') {
        // End of table
        if (currentTable.length > 1) {
          tables.push(this.parseTable(currentTable));
        }
        inTable = false;
        currentTable = [];
      }
    }
    
    // Handle table at end of content
    if (inTable && currentTable.length > 1) {
      tables.push(this.parseTable(currentTable));
    }
    
    return tables;
  }

  private parseTable(lines: string[]): ExtractedTable {
    const separator = lines[0].includes('|') ? '|' : '\t';
    
    // Parse headers (first line)
    const headers = lines[0].split(separator)
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    // Parse rows
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Skip separator lines (like |---|---|)
      if (line.match(/^[\s\-|]+$/)) continue;
      
      const row = line.split(separator)
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      if (row.length > 0) {
        rows.push(row);
      }
    }
    
    // Determine table type based on headers
    const type = this.classifyTable(headers, rows);
    
    return {
      headers,
      rows,
      type
    };
  }

  private classifyTable(headers: string[], rows: string[][]): ExtractedTable['type'] {
    const headerText = headers.join(' ').toLowerCase();
    
    if (headerText.includes('torque') || headerText.includes('nm') || headerText.includes('lb-ft')) {
      return 'torque';
    }
    if (headerText.includes('part') && headerText.includes('number')) {
      return 'parts';
    }
    if (headerText.includes('service') || headerText.includes('maintenance') || headerText.includes('interval')) {
      return 'service';
    }
    if (headerText.includes('specification') || headerText.includes('spec')) {
      return 'specification';
    }
    
    return 'unknown';
  }

  private parseTablesIntoSpecification(tables: ExtractedTable[], spec: Partial<VehicleSpecification>): void {
    for (const table of tables) {
      switch (table.type) {
        case 'specification':
          this.parseSpecificationTable(table, spec);
          break;
        case 'torque':
          this.parseTorqueTable(table, spec);
          break;
        case 'service':
          this.parseServiceTable(table, spec);
          break;
        case 'parts':
          this.parsePartsTable(table, spec);
          break;
      }
    }
  }

  private parseSpecificationTable(table: ExtractedTable, spec: Partial<VehicleSpecification>): void {
    // Look for engine specifications
    for (const row of table.rows) {
      const key = row[0]?.toLowerCase() || '';
      const value = row[1] || '';
      
      if (key.includes('displacement')) {
        spec.engine = spec.engine || {} as EngineSpecification;
        spec.engine.displacement = value;
      }
      if (key.includes('horsepower') || key.includes('hp')) {
        spec.engine = spec.engine || {} as EngineSpecification;
        spec.engine.horsepower = parseInt(value) || 0;
      }
      if (key.includes('torque') && !key.includes('specification')) {
        spec.engine = spec.engine || {} as EngineSpecification;
        spec.engine.torque = parseInt(value) || 0;
      }
      if (key.includes('transmission')) {
        spec.transmission = spec.transmission || {} as TransmissionSpecification;
        spec.transmission.type = value;
      }
    }
  }

  private parseTorqueTable(table: ExtractedTable, spec: Partial<VehicleSpecification>): void {
    if (!spec.torqueSpecifications) {
      spec.torqueSpecifications = [];
    }
    
    for (const row of table.rows) {
      if (row.length >= 2) {
        spec.torqueSpecifications.push({
          component: row[0],
          specification: row[1],
          unit: this.detectTorqueUnit(row[1]) as any,
          notes: row[2]
        });
      }
    }
  }

  private detectTorqueUnit(value: string): string {
    if (value.toLowerCase().includes('nm')) return 'Nm';
    if (value.toLowerCase().includes('lb') && value.toLowerCase().includes('ft')) return 'lb-ft';
    if (value.toLowerCase().includes('kg') && value.toLowerCase().includes('m')) return 'kg-m';
    return 'lb-ft'; // Default
  }

  private parseServiceTable(table: ExtractedTable, spec: Partial<VehicleSpecification>): void {
    if (!spec.serviceIntervals) {
      spec.serviceIntervals = [];
    }
    
    for (const row of table.rows) {
      if (row.length >= 2) {
        const interval: ServiceInterval = {
          component: row[0],
          interval: row[1]
        };
        
        // Try to extract miles from interval
        const milesMatch = row[1].match(/(\d+,?\d*)\s*miles?/i);
        if (milesMatch) {
          interval.miles = parseInt(milesMatch[1].replace(/,/g, ''));
        }
        
        spec.serviceIntervals.push(interval);
      }
    }
  }

  private parsePartsTable(table: ExtractedTable, spec: Partial<VehicleSpecification>): void {
    if (!spec.partNumbers) {
      spec.partNumbers = [];
    }
    
    // Find column indices
    const partNumberIndex = table.headers.findIndex(h => 
      h.toLowerCase().includes('part') && h.toLowerCase().includes('number')
    );
    const descriptionIndex = table.headers.findIndex(h => 
      h.toLowerCase().includes('description') || h.toLowerCase().includes('name')
    );
    
    for (const row of table.rows) {
      if (partNumberIndex >= 0 && row[partNumberIndex]) {
        spec.partNumbers.push({
          number: row[partNumberIndex],
          description: descriptionIndex >= 0 ? row[descriptionIndex] : '',
          category: this.categorizePartNumber(row[partNumberIndex])
        });
      }
    }
  }

  convertTableToJSON(table: ExtractedTable): Record<string, any>[] {
    const jsonData: Record<string, any>[] = [];
    
    for (const row of table.rows) {
      const rowData: Record<string, any> = {};
      for (let i = 0; i < table.headers.length && i < row.length; i++) {
        const header = table.headers[i].toLowerCase().replace(/\s+/g, '_');
        rowData[header] = this.parseValue(row[i]);
      }
      jsonData.push(rowData);
    }
    
    return jsonData;
  }

  private parseValue(value: string): any {
    // Try to parse as number
    const num = parseFloat(value.replace(/,/g, ''));
    if (!isNaN(num) && value.match(/^\s*[\d,.-]+\s*$/)) {
      return num;
    }
    
    // Check for boolean
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'yes') return true;
    if (lower === 'false' || lower === 'no') return false;
    
    // Return as string
    return value;
  }
}

export default VehicleSpecificationExtractor.getInstance();