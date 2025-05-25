import { AutomotiveTable, acuraRDXTables } from '@/data/acuraTableData';

export interface TableExtractionOptions {
  extractVIN?: boolean;
  extractPartNumbers?: boolean;
  extractTorqueSpecs?: boolean;
  extractServiceIntervals?: boolean;
  extractAll?: boolean;
}

export interface ExtractedTableData {
  tables: AutomotiveTable[];
  summary: {
    totalTables: number;
    categories: string[];
    hasVINData: boolean;
    hasPartNumbers: boolean;
    hasTorqueSpecs: boolean;
    hasServiceIntervals: boolean;
  };
  metadata: {
    extractionDate: Date;
    documentName: string;
    documentType: string;
  };
}

class TableExtractor {
  private static instance: TableExtractor;

  private constructor() {}

  static getInstance(): TableExtractor {
    if (!TableExtractor.instance) {
      TableExtractor.instance = new TableExtractor();
    }
    return TableExtractor.instance;
  }

  async extractTablesFromDocument(
    documentName: string,
    documentType: string,
    options: TableExtractionOptions
  ): Promise<ExtractedTableData> {
    console.log('TableExtractor: Extracting tables with options:', options);

    // Simulate async PDF processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter tables based on extraction options
    let filteredTables = [...acuraRDXTables];

    if (!options.extractAll) {
      filteredTables = this.filterTablesByOptions(filteredTables, options);
    }

    // Analyze extracted content
    const hasVINData = this.checkForVINData(filteredTables);
    const hasPartNumbers = this.checkForPartNumbers(filteredTables);
    const hasTorqueSpecs = this.checkForTorqueSpecs(filteredTables);
    const hasServiceIntervals = this.checkForServiceIntervals(filteredTables);

    const categories = [...new Set(filteredTables.map(t => t.category))];

    return {
      tables: filteredTables,
      summary: {
        totalTables: filteredTables.length,
        categories,
        hasVINData,
        hasPartNumbers,
        hasTorqueSpecs,
        hasServiceIntervals
      },
      metadata: {
        extractionDate: new Date(),
        documentName,
        documentType
      }
    };
  }

  private filterTablesByOptions(
    tables: AutomotiveTable[],
    options: TableExtractionOptions
  ): AutomotiveTable[] {
    return tables.filter(table => {
      const content = this.getTableContent(table);

      if (options.extractVIN && this.containsVINInfo(content)) {
        return true;
      }

      if (options.extractPartNumbers && this.containsPartNumbers(content)) {
        return true;
      }

      if (options.extractTorqueSpecs && this.containsTorqueSpecs(content)) {
        return true;
      }

      if (options.extractServiceIntervals && this.containsServiceIntervals(content)) {
        return true;
      }

      // Always include drivetrain table as it's specifically requested
      if (table.id === 'drivetrain-specs') {
        return true;
      }

      return false;
    });
  }

  private getTableContent(table: AutomotiveTable): string {
    const headerContent = table.headers.join(' ');
    const rowContent = table.rows.map(row => row.join(' ')).join(' ');
    return `${table.title} ${headerContent} ${rowContent}`.toLowerCase();
  }

  private containsVINInfo(content: string): boolean {
    return content.includes('vin') || content.includes('vehicle identification');
  }

  private containsPartNumbers(content: string): boolean {
    return content.includes('part') || content.includes('p/n') || 
           /\d{5}-[a-z0-9]{3}-[a-z0-9]{3}/i.test(content);
  }

  private containsTorqueSpecs(content: string): boolean {
    return content.includes('torque') || content.includes('lb-ft') || 
           content.includes('nm') || content.includes('tightening');
  }

  private containsServiceIntervals(content: string): boolean {
    return content.includes('service') || content.includes('maintenance') || 
           content.includes('interval') || content.includes('schedule');
  }

  private checkForVINData(tables: AutomotiveTable[]): boolean {
    return tables.some(table => 
      this.containsVINInfo(this.getTableContent(table))
    );
  }

  private checkForPartNumbers(tables: AutomotiveTable[]): boolean {
    return tables.some(table => 
      this.containsPartNumbers(this.getTableContent(table))
    );
  }

  private checkForTorqueSpecs(tables: AutomotiveTable[]): boolean {
    return tables.some(table => 
      this.containsTorqueSpecs(this.getTableContent(table))
    );
  }

  private checkForServiceIntervals(tables: AutomotiveTable[]): boolean {
    return tables.some(table => 
      this.containsServiceIntervals(this.getTableContent(table))
    );
  }

  // Method to search within extracted tables
  searchInTables(tables: AutomotiveTable[], searchTerm: string): AutomotiveTable[] {
    const term = searchTerm.toLowerCase();
    return tables.filter(table => {
      const content = this.getTableContent(table);
      return content.includes(term);
    });
  }

  // Method to export tables to CSV format
  exportToCSV(table: AutomotiveTable): string {
    const headers = table.headers.join(',');
    const rows = table.rows.map(row => row.join(',')).join('\n');
    return `${table.title}\n${headers}\n${rows}`;
  }
}

export default TableExtractor.getInstance();