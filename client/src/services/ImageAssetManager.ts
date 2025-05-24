export interface ImageAsset {
  id: string;
  filename: string;
  originalName: string;
  documentId: string;
  pageNumber: number;
  category: ImageCategory;
  subCategory?: string;
  metadata: ImageMetadata;
  extractedAt: Date;
  processed: boolean;
  tags: string[];
  relatedComponents?: string[];
  ocrText?: string;
  caption?: string;
}

export type ImageCategory = 
  | 'diagram'
  | 'schematic'
  | 'parts'
  | 'procedure'
  | 'specification'
  | 'warning'
  | 'table'
  | 'chart'
  | 'photo'
  | 'illustration'
  | 'logo'
  | 'unknown';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  fileSize: number;
  colorSpace?: string;
  resolution?: number;
  hasText: boolean;
  dominantColors?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface FolderStructure {
  rootPath: string;
  documentFolder: string;
  categories: Record<ImageCategory, string>;
  manifestPath: string;
}

export interface ImageManifest {
  documentId: string;
  documentName: string;
  extractionDate: Date;
  totalImages: number;
  categories: Record<ImageCategory, number>;
  images: ImageAsset[];
}

export interface ExtractionOptions {
  minWidth?: number;
  minHeight?: number;
  excludeLogos?: boolean;
  extractTables?: boolean;
  performOCR?: boolean;
  generateCaptions?: boolean;
  categorizeAutomatically?: boolean;
}

export interface ImageAnalysisResult {
  category: ImageCategory;
  confidence: number;
  features: ImageFeatures;
  suggestedTags: string[];
  relatedComponents?: string[];
}

export interface ImageFeatures {
  hasText: boolean;
  textDensity?: number;
  hasLines: boolean;
  hasArrows: boolean;
  hasCallouts: boolean;
  hasTable: boolean;
  hasChart: boolean;
  isPhotographic: boolean;
  isDiagram: boolean;
  componentCount?: number;
}

export class ImageAssetManager {
  private static instance: ImageAssetManager;
  private manifests: Map<string, ImageManifest> = new Map();
  
  // Honda/Acura specific patterns
  private componentPatterns = [
    // Engine components
    /engine|motor|cylinder|piston|valve|camshaft|crankshaft|block/i,
    // Transmission
    /transmission|gearbox|clutch|gear|shaft|synchronizer/i,
    // Suspension
    /suspension|shock|strut|spring|control arm|bushing|sway bar/i,
    // Brakes
    /brake|caliper|rotor|disc|pad|master cylinder|abs/i,
    // Electrical
    /battery|alternator|starter|fuse|relay|wire|harness|connector/i,
    // Body
    /door|hood|trunk|fender|bumper|grille|mirror|glass|windshield/i,
    // Interior
    /seat|dashboard|console|airbag|steering|pedal|carpet/i
  ];
  
  // Warning/caution patterns
  private warningPatterns = [
    /warning|caution|danger|attention|important|notice/i,
    /⚠|⛔|❗|🔺/
  ];
  
  // Diagram indicators
  private diagramIndicators = [
    'exploded view', 'assembly', 'cross section', 'cutaway',
    'schematic', 'wiring diagram', 'circuit', 'flow chart'
  ];

  private constructor() {}

  static getInstance(): ImageAssetManager {
    if (!ImageAssetManager.instance) {
      ImageAssetManager.instance = new ImageAssetManager();
    }
    return ImageAssetManager.instance;
  }

  async extractImagesFromDocument(
    documentId: string,
    documentName: string,
    documentContent: any, // This would be the parsed document object
    options: ExtractionOptions = {}
  ): Promise<ImageManifest> {
    const defaultOptions: ExtractionOptions = {
      minWidth: 100,
      minHeight: 100,
      excludeLogos: true,
      extractTables: true,
      performOCR: true,
      generateCaptions: true,
      categorizeAutomatically: true,
      ...options
    };
    
    const manifest: ImageManifest = {
      documentId,
      documentName,
      extractionDate: new Date(),
      totalImages: 0,
      categories: this.initializeCategoryCount(),
      images: []
    };
    
    // Extract images (this is a mock implementation)
    const extractedImages = await this.performExtraction(documentContent, defaultOptions);
    
    // Process each image
    for (const imageData of extractedImages) {
      const image = await this.processImage(imageData, documentId, defaultOptions);
      if (image) {
        manifest.images.push(image);
        manifest.categories[image.category]++;
        manifest.totalImages++;
      }
    }
    
    // Save manifest
    this.manifests.set(documentId, manifest);
    
    // Organize files
    await this.organizeImageFiles(manifest);
    
    return manifest;
  }

  private async performExtraction(documentContent: any, options: ExtractionOptions): Promise<any[]> {
    // Mock implementation - in reality, this would use PDF.js or similar
    // to extract images from the document
    const mockImages = [
      {
        data: 'mock-image-data-1',
        pageNumber: 5,
        bounds: { x: 100, y: 200, width: 400, height: 300 }
      },
      {
        data: 'mock-image-data-2',
        pageNumber: 12,
        bounds: { x: 50, y: 100, width: 500, height: 400 }
      }
    ];
    
    return mockImages;
  }

  private async processImage(
    imageData: any,
    documentId: string,
    options: ExtractionOptions
  ): Promise<ImageAsset | null> {
    // Create basic image asset
    const image: ImageAsset = {
      id: this.generateId(),
      filename: `${documentId}_p${imageData.pageNumber}_${Date.now()}.png`,
      originalName: `Page ${imageData.pageNumber} Image`,
      documentId,
      pageNumber: imageData.pageNumber,
      category: 'unknown',
      metadata: await this.extractImageMetadata(imageData),
      extractedAt: new Date(),
      processed: false,
      tags: []
    };
    
    // Check size requirements
    if (image.metadata.width < (options.minWidth || 0) || 
        image.metadata.height < (options.minHeight || 0)) {
      return null;
    }
    
    // Categorize image
    if (options.categorizeAutomatically) {
      const analysis = await this.analyzeImage(imageData, options);
      image.category = analysis.category;
      image.tags = analysis.suggestedTags;
      image.relatedComponents = analysis.relatedComponents;
    }
    
    // Perform OCR if requested
    if (options.performOCR && image.metadata.hasText) {
      image.ocrText = await this.performOCR(imageData);
    }
    
    // Generate caption if requested
    if (options.generateCaptions) {
      image.caption = await this.generateCaption(image);
    }
    
    image.processed = true;
    return image;
  }

  private async extractImageMetadata(imageData: any): Promise<ImageMetadata> {
    // Mock implementation
    return {
      width: imageData.bounds?.width || 500,
      height: imageData.bounds?.height || 400,
      format: 'png',
      fileSize: 150000,
      colorSpace: 'RGB',
      resolution: 300,
      hasText: Math.random() > 0.5,
      dominantColors: ['#000000', '#FFFFFF', '#FF0000'],
      complexity: 'moderate',
      orientation: imageData.bounds?.width > imageData.bounds?.height ? 'landscape' : 'portrait'
    };
  }

  async analyzeImage(imageData: any, options: ExtractionOptions): Promise<ImageAnalysisResult> {
    const features = await this.detectImageFeatures(imageData);
    const category = this.categorizeBasedOnFeatures(features, imageData);
    const tags = this.generateTags(features, category);
    const components = this.detectRelatedComponents(imageData, features);
    
    return {
      category,
      confidence: 0.85, // Mock confidence
      features,
      suggestedTags: tags,
      relatedComponents: components
    };
  }

  private async detectImageFeatures(imageData: any): Promise<ImageFeatures> {
    // Mock feature detection - in production would use computer vision
    return {
      hasText: true,
      textDensity: 0.3,
      hasLines: true,
      hasArrows: true,
      hasCallouts: true,
      hasTable: false,
      hasChart: false,
      isPhotographic: false,
      isDiagram: true,
      componentCount: 5
    };
  }

  private categorizeBasedOnFeatures(features: ImageFeatures, imageData: any): ImageCategory {
    // Decision tree for categorization
    
    // Check for warnings first (highest priority)
    if (this.containsWarningIndicators(imageData)) {
      return 'warning';
    }
    
    // Tables
    if (features.hasTable) {
      return 'table';
    }
    
    // Charts
    if (features.hasChart) {
      return 'chart';
    }
    
    // Diagrams vs Schematics
    if (features.isDiagram) {
      if (features.hasLines && features.hasArrows) {
        return features.componentCount && features.componentCount > 10 ? 'schematic' : 'diagram';
      }
      return 'diagram';
    }
    
    // Photographic content
    if (features.isPhotographic) {
      return features.componentCount && features.componentCount > 0 ? 'parts' : 'photo';
    }
    
    // Procedures (has numbered steps or callouts)
    if (features.hasCallouts && features.hasText && features.textDensity && features.textDensity > 0.4) {
      return 'procedure';
    }
    
    // Specifications (mostly text)
    if (features.hasText && features.textDensity && features.textDensity > 0.7) {
      return 'specification';
    }
    
    // Parts (if components detected but not a full diagram)
    if (features.componentCount && features.componentCount > 0) {
      return 'parts';
    }
    
    return 'unknown';
  }

  private containsWarningIndicators(imageData: any): boolean {
    // Check for warning patterns in any OCR text or metadata
    const textToCheck = imageData.ocrText || imageData.caption || '';
    return this.warningPatterns.some(pattern => pattern.test(textToCheck));
  }

  private generateTags(features: ImageFeatures, category: ImageCategory): string[] {
    const tags: string[] = [category];
    
    if (features.hasText) tags.push('contains-text');
    if (features.isDiagram) tags.push('technical-diagram');
    if (features.isPhotographic) tags.push('photo');
    if (features.hasArrows) tags.push('directional');
    if (features.hasCallouts) tags.push('annotated');
    if (features.componentCount && features.componentCount > 5) tags.push('multi-component');
    
    // Add orientation
    tags.push(features.hasLines ? 'technical' : 'illustrative');
    
    return tags;
  }

  private detectRelatedComponents(imageData: any, features: ImageFeatures): string[] {
    const components: string[] = [];
    const textToAnalyze = (imageData.ocrText || '') + ' ' + (imageData.caption || '');
    
    // Check against component patterns
    for (const pattern of this.componentPatterns) {
      const matches = textToAnalyze.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const component = match.toLowerCase().trim();
          if (!components.includes(component)) {
            components.push(component);
          }
        });
      }
    }
    
    return components.slice(0, 5); // Limit to 5 components
  }

  private async performOCR(imageData: any): Promise<string> {
    // Mock OCR - in production would use Tesseract.js or cloud service
    return "Mock OCR text: This is a diagram showing the engine assembly procedure.";
  }

  private async generateCaption(image: ImageAsset): Promise<string> {
    // Generate descriptive caption based on category and metadata
    const categoryDescriptions: Record<ImageCategory, string> = {
      'diagram': 'Technical diagram',
      'schematic': 'Schematic drawing',
      'parts': 'Parts illustration',
      'procedure': 'Service procedure',
      'specification': 'Specification sheet',
      'warning': 'Warning/Caution notice',
      'table': 'Data table',
      'chart': 'Chart/Graph',
      'photo': 'Photograph',
      'illustration': 'Illustration',
      'logo': 'Logo/Branding',
      'unknown': 'Image'
    };
    
    let caption = `${categoryDescriptions[image.category]} from page ${image.pageNumber}`;
    
    if (image.relatedComponents && image.relatedComponents.length > 0) {
      caption += ` showing ${image.relatedComponents.join(', ')}`;
    }
    
    if (image.ocrText && image.ocrText.length > 20) {
      const preview = image.ocrText.substring(0, 50) + '...';
      caption += `. Text: "${preview}"`;
    }
    
    return caption;
  }

  async organizeImageFiles(manifest: ImageManifest): Promise<FolderStructure> {
    const structure: FolderStructure = {
      rootPath: `/extracted_images/${manifest.documentId}`,
      documentFolder: manifest.documentName.replace(/[^a-zA-Z0-9]/g, '_'),
      categories: this.createCategoryFolders(),
      manifestPath: `/extracted_images/${manifest.documentId}/manifest.json`
    };
    
    // In a real implementation, this would:
    // 1. Create the folder structure
    // 2. Move/copy images to appropriate folders
    // 3. Create thumbnail versions
    // 4. Save the manifest file
    
    return structure;
  }

  private createCategoryFolders(): Record<ImageCategory, string> {
    return {
      'diagram': 'diagrams',
      'schematic': 'schematics',
      'parts': 'parts',
      'procedure': 'procedures',
      'specification': 'specifications',
      'warning': 'warnings',
      'table': 'tables',
      'chart': 'charts',
      'photo': 'photos',
      'illustration': 'illustrations',
      'logo': 'logos',
      'unknown': 'uncategorized'
    };
  }

  private initializeCategoryCount(): Record<ImageCategory, number> {
    const categories: ImageCategory[] = [
      'diagram', 'schematic', 'parts', 'procedure', 'specification',
      'warning', 'table', 'chart', 'photo', 'illustration', 'logo', 'unknown'
    ];
    
    const count: Partial<Record<ImageCategory, number>> = {};
    categories.forEach(cat => count[cat] = 0);
    
    return count as Record<ImageCategory, number>;
  }

  // Search and retrieval methods
  async findImagesByCategory(documentId: string, category: ImageCategory): Promise<ImageAsset[]> {
    const manifest = this.manifests.get(documentId);
    if (!manifest) return [];
    
    return manifest.images.filter(img => img.category === category);
  }

  async findImagesByComponent(documentId: string, component: string): Promise<ImageAsset[]> {
    const manifest = this.manifests.get(documentId);
    if (!manifest) return [];
    
    const componentLower = component.toLowerCase();
    return manifest.images.filter(img => 
      img.relatedComponents?.some(c => c.toLowerCase().includes(componentLower)) ||
      img.ocrText?.toLowerCase().includes(componentLower) ||
      img.caption?.toLowerCase().includes(componentLower)
    );
  }

  async findImagesByPage(documentId: string, pageNumber: number): Promise<ImageAsset[]> {
    const manifest = this.manifests.get(documentId);
    if (!manifest) return [];
    
    return manifest.images.filter(img => img.pageNumber === pageNumber);
  }

  async searchImages(documentId: string, query: string): Promise<ImageAsset[]> {
    const manifest = this.manifests.get(documentId);
    if (!manifest) return [];
    
    const queryLower = query.toLowerCase();
    return manifest.images.filter(img => 
      img.tags.some(tag => tag.includes(queryLower)) ||
      img.caption?.toLowerCase().includes(queryLower) ||
      img.ocrText?.toLowerCase().includes(queryLower) ||
      img.relatedComponents?.some(c => c.toLowerCase().includes(queryLower))
    );
  }

  // Metadata management
  async updateImageMetadata(imageId: string, updates: Partial<ImageAsset>): Promise<ImageAsset | null> {
    for (const manifest of Array.from(this.manifests.values())) {
      const image = manifest.images.find((img: ImageAsset) => img.id === imageId);
      if (image) {
        Object.assign(image, updates);
        return image;
      }
    }
    return null;
  }

  async addTagsToImage(imageId: string, tags: string[]): Promise<boolean> {
    for (const manifest of Array.from(this.manifests.values())) {
      const image = manifest.images.find((img: ImageAsset) => img.id === imageId);
      if (image) {
        const uniqueTags = new Set([...image.tags, ...tags]);
        image.tags = Array.from(uniqueTags);
        return true;
      }
    }
    return false;
  }

  // Export and reporting
  async exportManifest(documentId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const manifest = this.manifests.get(documentId);
    if (!manifest) return '';
    
    if (format === 'json') {
      return JSON.stringify(manifest, null, 2);
    } else {
      // CSV export
      const headers = ['ID', 'Filename', 'Page', 'Category', 'Tags', 'Components', 'Caption'];
      const rows = manifest.images.map(img => [
        img.id,
        img.filename,
        img.pageNumber.toString(),
        img.category,
        img.tags.join(';'),
        (img.relatedComponents || []).join(';'),
        img.caption || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  async generateImageReport(documentId: string): Promise<string> {
    const manifest = this.manifests.get(documentId);
    if (!manifest) return 'No images found for document';
    
    let report = `Image Extraction Report\n`;
    report += `Document: ${manifest.documentName}\n`;
    report += `Extraction Date: ${manifest.extractionDate.toISOString()}\n`;
    report += `Total Images: ${manifest.totalImages}\n\n`;
    
    report += `Images by Category:\n`;
    for (const [category, count] of Object.entries(manifest.categories)) {
      if (count > 0) {
        report += `  ${category}: ${count}\n`;
      }
    }
    
    report += `\nDetailed Image List:\n`;
    manifest.images.forEach((img, index) => {
      report += `\n${index + 1}. ${img.filename}\n`;
      report += `   Page: ${img.pageNumber}\n`;
      report += `   Category: ${img.category}\n`;
      if (img.relatedComponents && img.relatedComponents.length > 0) {
        report += `   Components: ${img.relatedComponents.join(', ')}\n`;
      }
      if (img.caption) {
        report += `   Caption: ${img.caption}\n`;
      }
    });
    
    return report;
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup methods
  async cleanupDocument(documentId: string): Promise<boolean> {
    return this.manifests.delete(documentId);
  }

  async cleanupOldExtractions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let cleaned = 0;
    for (const [documentId, manifest] of Array.from(this.manifests.entries())) {
      if (manifest.extractionDate < cutoffDate) {
        this.manifests.delete(documentId);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

export default ImageAssetManager.getInstance();