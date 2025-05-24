import { VehicleSpecification, PartNumber, ServiceInterval, TorqueSpecification } from './VehicleSpecificationExtractor';

export interface AutomotiveQuestion {
  id: string;
  question: string;
  type: QuestionType;
  entities: ExtractedEntity[];
  intent: QueryIntent;
  timestamp: Date;
}

export type QuestionType = 
  | 'specification'
  | 'part_lookup'
  | 'service_interval'
  | 'torque_spec'
  | 'compatibility'
  | 'diagnostic'
  | 'procedure'
  | 'comparison'
  | 'calculation'
  | 'general';

export type QueryIntent = 
  | 'find_value'
  | 'check_compatibility'
  | 'calculate_value'
  | 'compare_specs'
  | 'list_items'
  | 'explain_procedure'
  | 'diagnose_issue'
  | 'find_alternative';

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  normalizedValue?: string;
  confidence: number;
}

export type EntityType = 
  | 'vehicle_model'
  | 'vehicle_year'
  | 'component'
  | 'part_number'
  | 'specification_type'
  | 'unit'
  | 'value'
  | 'symptom';

export interface AutomotiveAnswer {
  answer: string;
  confidence: number;
  sources: AnswerSource[];
  relatedQuestions?: string[];
  warnings?: string[];
  calculations?: Calculation[];
}

export interface AnswerSource {
  type: 'specification' | 'part' | 'service_manual' | 'calculation';
  reference: string;
  excerpt?: string;
}

export interface Calculation {
  description: string;
  formula: string;
  values: Record<string, number>;
  result: number;
  unit: string;
}

export class AutomotiveQuestionProcessor {
  private static instance: AutomotiveQuestionProcessor;
  
  // Honda/Acura specific model mappings
  private modelAliases: Record<string, string[]> = {
    'accord': ['accord', 'accord sedan', 'accord hybrid'],
    'civic': ['civic', 'civic sedan', 'civic hatchback', 'civic si', 'civic type r'],
    'cr-v': ['crv', 'cr-v', 'cr v', 'crv hybrid'],
    'pilot': ['pilot', 'pilot trailsport'],
    'odyssey': ['odyssey', 'odyssey elite'],
    'ridgeline': ['ridgeline'],
    'hr-v': ['hrv', 'hr-v', 'hr v'],
    'passport': ['passport'],
    'fit': ['fit'],
    'mdx': ['mdx', 'mdx type s'],
    'rdx': ['rdx', 'rdx a-spec'],
    'tlx': ['tlx', 'tlx type s'],
    'integra': ['integra', 'integra type s'],
    'nsx': ['nsx']
  };
  
  // Common automotive specifications
  private specificationTypes = [
    'horsepower', 'hp', 'torque', 'displacement', 'compression',
    'wheelbase', 'length', 'width', 'height', 'weight',
    'fuel capacity', 'oil capacity', 'coolant capacity',
    'towing capacity', 'payload', 'mpg', 'fuel economy',
    'gear ratio', 'final drive', 'bore', 'stroke'
  ];
  
  // Unit conversions
  private unitConversions: Record<string, Record<string, number>> = {
    'torque': {
      'lb-ft_to_Nm': 1.35582,
      'Nm_to_lb-ft': 0.737562,
      'kg-m_to_Nm': 9.80665,
      'Nm_to_kg-m': 0.101972
    },
    'length': {
      'in_to_mm': 25.4,
      'mm_to_in': 0.0393701,
      'ft_to_m': 0.3048,
      'm_to_ft': 3.28084
    },
    'weight': {
      'lb_to_kg': 0.453592,
      'kg_to_lb': 2.20462
    },
    'volume': {
      'qt_to_L': 0.946353,
      'L_to_qt': 1.05669,
      'gal_to_L': 3.78541,
      'L_to_gal': 0.264172
    }
  };

  private constructor() {}

  static getInstance(): AutomotiveQuestionProcessor {
    if (!AutomotiveQuestionProcessor.instance) {
      AutomotiveQuestionProcessor.instance = new AutomotiveQuestionProcessor();
    }
    return AutomotiveQuestionProcessor.instance;
  }

  async processQuestion(
    question: string, 
    vehicleData: VehicleSpecification,
    additionalData?: Record<string, any>
  ): Promise<AutomotiveAnswer> {
    // Parse the question
    const parsedQuestion = this.parseQuestion(question);
    
    // Process based on question type and intent
    let answer: AutomotiveAnswer;
    
    switch (parsedQuestion.type) {
      case 'specification':
        answer = await this.handleSpecificationQuery(parsedQuestion, vehicleData);
        break;
      case 'part_lookup':
        answer = await this.handlePartLookup(parsedQuestion, vehicleData);
        break;
      case 'service_interval':
        answer = await this.handleServiceInterval(parsedQuestion, vehicleData);
        break;
      case 'torque_spec':
        answer = await this.handleTorqueSpec(parsedQuestion, vehicleData);
        break;
      case 'compatibility':
        answer = await this.handleCompatibility(parsedQuestion, vehicleData);
        break;
      case 'calculation':
        answer = await this.handleCalculation(parsedQuestion, vehicleData);
        break;
      default:
        answer = await this.handleGeneralQuery(parsedQuestion, vehicleData, additionalData);
    }
    
    // Add related questions
    answer.relatedQuestions = this.generateRelatedQuestions(parsedQuestion, vehicleData);
    
    return answer;
  }

  parseQuestion(question: string): AutomotiveQuestion {
    const lowerQuestion = question.toLowerCase();
    const entities = this.extractEntities(question);
    const type = this.detectQuestionType(lowerQuestion, entities);
    const intent = this.detectQueryIntent(lowerQuestion, type);
    
    return {
      id: this.generateId(),
      question,
      type,
      entities,
      intent,
      timestamp: new Date()
    };
  }

  private extractEntities(question: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lowerQuestion = question.toLowerCase();
    
    // Extract vehicle models
    for (const [canonical, aliases] of Object.entries(this.modelAliases)) {
      for (const alias of aliases) {
        if (lowerQuestion.includes(alias)) {
          entities.push({
            type: 'vehicle_model',
            value: alias,
            normalizedValue: canonical,
            confidence: 0.9
          });
          break;
        }
      }
    }
    
    // Extract years
    const yearPattern = /\b(19|20)\d{2}\b/g;
    const yearMatches = question.matchAll(yearPattern);
    for (const match of yearMatches) {
      entities.push({
        type: 'vehicle_year',
        value: match[0],
        confidence: 0.95
      });
    }
    
    // Extract part numbers
    const partPattern = /\b\d{5}-[A-Z0-9]{3}-[A-Z0-9]{3}\b/g;
    const partMatches = question.matchAll(partPattern);
    for (const match of partMatches) {
      entities.push({
        type: 'part_number',
        value: match[0],
        confidence: 1.0
      });
    }
    
    // Extract specification types
    for (const specType of this.specificationTypes) {
      if (lowerQuestion.includes(specType)) {
        entities.push({
          type: 'specification_type',
          value: specType,
          confidence: 0.85
        });
      }
    }
    
    // Extract numeric values with units
    const valuePattern = /\b(\d+(?:\.\d+)?)\s*(hp|lb-?ft|nm|kg-?m|psi|bar|mph|km\/h|mpg|L|gal|qt)\b/gi;
    const valueMatches = question.matchAll(valuePattern);
    for (const match of valueMatches) {
      entities.push({
        type: 'value',
        value: match[1],
        confidence: 0.9
      });
      entities.push({
        type: 'unit',
        value: match[2],
        confidence: 0.9
      });
    }
    
    return entities;
  }

  private detectQuestionType(question: string, entities: ExtractedEntity[]): QuestionType {
    // Check for specific patterns
    if (entities.some(e => e.type === 'part_number') || question.includes('part number')) {
      return 'part_lookup';
    }
    
    if (question.includes('torque') && (question.includes('spec') || question.includes('tighten'))) {
      return 'torque_spec';
    }
    
    if (question.includes('service') || question.includes('maintenance') || question.includes('interval')) {
      return 'service_interval';
    }
    
    if (question.includes('compatible') || question.includes('fit') || question.includes('work with')) {
      return 'compatibility';
    }
    
    if (question.includes('calculate') || question.includes('convert') || question.includes('how many')) {
      return 'calculation';
    }
    
    if (entities.some(e => e.type === 'specification_type')) {
      return 'specification';
    }
    
    if (question.includes('diagnose') || question.includes('troubleshoot') || question.includes('problem')) {
      return 'diagnostic';
    }
    
    if (question.includes('how to') || question.includes('procedure') || question.includes('steps')) {
      return 'procedure';
    }
    
    if (question.includes('compare') || question.includes('difference') || question.includes('vs')) {
      return 'comparison';
    }
    
    return 'general';
  }

  private detectQueryIntent(question: string, type: QuestionType): QueryIntent {
    switch (type) {
      case 'specification':
        return 'find_value';
      case 'part_lookup':
        return question.includes('alternative') ? 'find_alternative' : 'find_value';
      case 'compatibility':
        return 'check_compatibility';
      case 'calculation':
        return 'calculate_value';
      case 'comparison':
        return 'compare_specs';
      case 'diagnostic':
        return 'diagnose_issue';
      case 'procedure':
        return 'explain_procedure';
      case 'service_interval':
        return 'find_value';
      default:
        if (question.includes('list') || question.includes('all')) {
          return 'list_items';
        }
        return 'find_value';
    }
  }

  private async handleSpecificationQuery(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): Promise<AutomotiveAnswer> {
    const specType = question.entities.find(e => e.type === 'specification_type');
    
    if (!specType) {
      return {
        answer: "I couldn't identify which specification you're looking for. Please specify what information you need.",
        confidence: 0.3,
        sources: []
      };
    }
    
    // Map specification type to vehicle data
    let value: any;
    let unit = '';
    const sources: AnswerSource[] = [];
    
    switch (specType.value.toLowerCase()) {
      case 'horsepower':
      case 'hp':
        value = vehicleData.engine?.horsepower;
        unit = 'hp';
        sources.push({ type: 'specification', reference: 'Engine Specifications' });
        break;
      case 'torque':
        value = vehicleData.engine?.torque;
        unit = 'lb-ft';
        sources.push({ type: 'specification', reference: 'Engine Specifications' });
        break;
      case 'displacement':
        value = vehicleData.engine?.displacement;
        sources.push({ type: 'specification', reference: 'Engine Specifications' });
        break;
      case 'fuel capacity':
        value = vehicleData.capacities?.fuelTank;
        sources.push({ type: 'specification', reference: 'Vehicle Capacities' });
        break;
      case 'oil capacity':
        value = vehicleData.capacities?.engineOil;
        sources.push({ type: 'specification', reference: 'Vehicle Capacities' });
        break;
      // Add more mappings as needed
    }
    
    if (value !== undefined) {
      const modelInfo = vehicleData.year ? `${vehicleData.year} ` : '';
      const vehicleInfo = `${modelInfo}${vehicleData.make} ${vehicleData.model}`;
      
      return {
        answer: `The ${specType.value} for the ${vehicleInfo} is ${value}${unit ? ' ' + unit : ''}.`,
        confidence: 0.9,
        sources,
        warnings: value === null ? ['This value may vary by trim level or configuration.'] : undefined
      };
    }
    
    return {
      answer: `I don't have ${specType.value} information for this vehicle in my current data.`,
      confidence: 0.4,
      sources: []
    };
  }

  private async handlePartLookup(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): Promise<AutomotiveAnswer> {
    const partNumberEntity = question.entities.find(e => e.type === 'part_number');
    
    if (!partNumberEntity || !vehicleData.partNumbers) {
      return {
        answer: "I couldn't find a part number in your question. Please provide a valid Honda/Acura part number.",
        confidence: 0.3,
        sources: []
      };
    }
    
    const part = vehicleData.partNumbers.find(p => p.number === partNumberEntity.value);
    
    if (part) {
      let answer = `Part number ${part.number} is a ${part.description} in the ${part.category} category.`;
      
      if (part.price) {
        answer += ` The price is $${part.price}.`;
      }
      
      if (part.availability) {
        answer += ` Current availability: ${part.availability}.`;
      }
      
      if (part.superseded && part.superseded.length > 0) {
        answer += ` This part has been superseded by: ${part.superseded.join(', ')}.`;
      }
      
      return {
        answer,
        confidence: 0.95,
        sources: [{
          type: 'part',
          reference: 'Parts Catalog',
          excerpt: part.description
        }],
        warnings: part.superseded ? ['This part has been superseded. Consider using the newer part number.'] : undefined
      };
    }
    
    // Look for similar parts
    const category = this.categorizePartNumber(partNumberEntity.value);
    const similarParts = vehicleData.partNumbers.filter(p => p.category === category);
    
    if (similarParts.length > 0) {
      return {
        answer: `I couldn't find part ${partNumberEntity.value}, but here are similar ${category} parts: ${
          similarParts.slice(0, 3).map(p => `${p.number} (${p.description})`).join(', ')
        }`,
        confidence: 0.6,
        sources: [{
          type: 'part',
          reference: 'Parts Catalog'
        }]
      };
    }
    
    return {
      answer: `Part number ${partNumberEntity.value} was not found in the current catalog.`,
      confidence: 0.8,
      sources: []
    };
  }

  private categorizePartNumber(partNumber: string): string {
    // Use same logic as VehicleSpecificationExtractor
    const prefix = partNumber.substring(0, 2);
    const categoryMap: Record<string, string> = {
      '04': 'Body/Frame',
      '15': 'Oil System',
      '17': 'Air Intake',
      '19': 'Cooling System',
      '45': 'Brake System',
      '51': 'Suspension'
      // ... etc
    };
    return categoryMap[prefix] || 'General';
  }

  private async handleServiceInterval(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): Promise<AutomotiveAnswer> {
    if (!vehicleData.serviceIntervals) {
      return {
        answer: "I don't have service interval information for this vehicle.",
        confidence: 0.3,
        sources: []
      };
    }
    
    // Look for component in question
    const questionLower = question.question.toLowerCase();
    const relevantIntervals = vehicleData.serviceIntervals.filter(interval => 
      questionLower.includes(interval.component.toLowerCase())
    );
    
    if (relevantIntervals.length > 0) {
      const interval = relevantIntervals[0];
      let answer = `The ${interval.component} should be serviced ${interval.interval}.`;
      
      if (interval.miles && interval.months) {
        answer = `The ${interval.component} should be serviced every ${interval.miles.toLocaleString()} miles or ${interval.months} months, whichever comes first.`;
      }
      
      if (interval.notes) {
        answer += ` Note: ${interval.notes}`;
      }
      
      return {
        answer,
        confidence: 0.9,
        sources: [{
          type: 'service_manual',
          reference: 'Service Intervals',
          excerpt: interval.interval
        }]
      };
    }
    
    // Return general service intervals
    const generalIntervals = vehicleData.serviceIntervals.slice(0, 5);
    return {
      answer: `Here are some service intervals for this vehicle: ${
        generalIntervals.map(i => `${i.component} - ${i.interval}`).join('; ')
      }`,
      confidence: 0.7,
      sources: [{
        type: 'service_manual',
        reference: 'Service Intervals'
      }]
    };
  }

  private async handleTorqueSpec(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): Promise<AutomotiveAnswer> {
    if (!vehicleData.torqueSpecifications) {
      return {
        answer: "I don't have torque specification information for this vehicle.",
        confidence: 0.3,
        sources: []
      };
    }
    
    // Look for component in question
    const questionLower = question.question.toLowerCase();
    const relevantSpecs = vehicleData.torqueSpecifications.filter(spec => 
      questionLower.includes(spec.component.toLowerCase())
    );
    
    if (relevantSpecs.length > 0) {
      const spec = relevantSpecs[0];
      let answer = `The torque specification for ${spec.component} is ${spec.specification} ${spec.unit}.`;
      
      if (spec.pattern) {
        answer += ` Tightening pattern: ${spec.pattern}.`;
      }
      
      if (spec.notes) {
        answer += ` ${spec.notes}`;
      }
      
      // Check if conversion is requested
      const requestedUnit = question.entities.find(e => e.type === 'unit' && e.value !== spec.unit);
      if (requestedUnit) {
        const converted = this.convertTorque(spec.specification, spec.unit, requestedUnit.value);
        if (converted) {
          answer += ` (${converted.result} ${converted.unit})`;
        }
      }
      
      return {
        answer,
        confidence: 0.95,
        sources: [{
          type: 'service_manual',
          reference: 'Torque Specifications',
          excerpt: spec.specification
        }],
        warnings: spec.pattern ? [`Follow the specified tightening pattern: ${spec.pattern}`] : undefined
      };
    }
    
    return {
      answer: "I couldn't find torque specifications for that component. Please check the service manual.",
      confidence: 0.4,
      sources: []
    };
  }

  private convertTorque(value: string, fromUnit: string, toUnit: string): Calculation | null {
    // Extract numeric value
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    
    const numValue = parseFloat(match[1]);
    const conversionKey = `${fromUnit}_to_${toUnit}`;
    const factor = this.unitConversions.torque[conversionKey];
    
    if (!factor) return null;
    
    const result = numValue * factor;
    
    return {
      description: `Convert ${fromUnit} to ${toUnit}`,
      formula: `${numValue} × ${factor}`,
      values: { input: numValue, factor },
      result: Math.round(result * 10) / 10,
      unit: toUnit
    };
  }

  private async handleCompatibility(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): Promise<AutomotiveAnswer> {
    const partNumber = question.entities.find(e => e.type === 'part_number');
    const targetModel = question.entities.find(e => e.type === 'vehicle_model');
    const targetYear = question.entities.find(e => e.type === 'vehicle_year');
    
    if (partNumber && vehicleData.partNumbers) {
      const part = vehicleData.partNumbers.find(p => p.number === partNumber.value);
      
      if (part && part.compatibility) {
        const isCompatible = part.compatibility.some(compat => {
          if (targetModel && !compat.toLowerCase().includes(targetModel.normalizedValue || targetModel.value)) {
            return false;
          }
          if (targetYear && !compat.includes(targetYear.value)) {
            return false;
          }
          return true;
        });
        
        const vehicleDesc = `${targetYear?.value || ''} ${targetModel?.value || 'vehicle'}`.trim();
        
        return {
          answer: isCompatible 
            ? `Yes, part ${part.number} (${part.description}) is compatible with the ${vehicleDesc}.`
            : `No, part ${part.number} is not listed as compatible with the ${vehicleDesc}.`,
          confidence: 0.85,
          sources: [{
            type: 'part',
            reference: 'Parts Compatibility Database'
          }],
          warnings: !isCompatible ? ['Always verify compatibility with your dealer before ordering.'] : undefined
        };
      }
    }
    
    return {
      answer: "I need more information to check compatibility. Please provide the part number and vehicle details.",
      confidence: 0.3,
      sources: []
    };
  }

  private async handleCalculation(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): Promise<AutomotiveAnswer> {
    const calculations: Calculation[] = [];
    let answer = '';
    
    // Unit conversion calculations
    if (question.question.toLowerCase().includes('convert')) {
      const valueEntity = question.entities.find(e => e.type === 'value');
      const units = question.entities.filter(e => e.type === 'unit');
      
      if (valueEntity && units.length >= 2) {
        const fromUnit = units[0].value;
        const toUnit = units[1].value;
        const value = parseFloat(valueEntity.value);
        
        // Find appropriate conversion
        for (const [category, conversions] of Object.entries(this.unitConversions)) {
          const conversionKey = `${fromUnit}_to_${toUnit}`;
          if (conversions[conversionKey]) {
            const result = value * conversions[conversionKey];
            calculations.push({
              description: `Convert ${category}`,
              formula: `${value} ${fromUnit} × ${conversions[conversionKey]} = ${result} ${toUnit}`,
              values: { input: value, factor: conversions[conversionKey] },
              result: Math.round(result * 100) / 100,
              unit: toUnit
            });
            
            answer = `${value} ${fromUnit} equals ${calculations[0].result} ${toUnit}.`;
            break;
          }
        }
      }
    }
    
    // Fuel economy calculations
    if (question.question.toLowerCase().includes('fuel') && question.question.toLowerCase().includes('cost')) {
      // Example: "How much will it cost to drive 500 miles if gas is $3.50/gallon?"
      const distanceMatch = question.question.match(/(\d+)\s*miles?/i);
      const priceMatch = question.question.match(/\$(\d+(?:\.\d+)?)/);
      
      if (distanceMatch && priceMatch && vehicleData.engine) {
        const distance = parseFloat(distanceMatch[1]);
        const gasPrice = parseFloat(priceMatch[1]);
        const mpg = 30; // Default MPG, should come from vehicle data
        
        const gallonsNeeded = distance / mpg;
        const cost = gallonsNeeded * gasPrice;
        
        calculations.push({
          description: 'Fuel cost calculation',
          formula: `(${distance} miles ÷ ${mpg} mpg) × $${gasPrice}/gal`,
          values: { distance, mpg, gasPrice },
          result: Math.round(cost * 100) / 100,
          unit: 'USD'
        });
        
        answer = `Driving ${distance} miles will require ${gallonsNeeded.toFixed(1)} gallons and cost approximately $${cost.toFixed(2)}.`;
      }
    }
    
    if (calculations.length > 0) {
      return {
        answer,
        confidence: 0.9,
        sources: [{
          type: 'calculation',
          reference: 'Calculated value'
        }],
        calculations
      };
    }
    
    return {
      answer: "I couldn't perform the requested calculation. Please provide more details.",
      confidence: 0.3,
      sources: []
    };
  }

  private async handleGeneralQuery(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification,
    additionalData?: Record<string, any>
  ): Promise<AutomotiveAnswer> {
    // Search through all available data
    const searchTerms = question.question.toLowerCase().split(' ')
      .filter(word => word.length > 3 && !['what', 'when', 'where', 'how', 'the', 'for'].includes(word));
    
    let bestMatch = '';
    let confidence = 0;
    const sources: AnswerSource[] = [];
    
    // Search in vehicle specifications
    const vehicleDataStr = JSON.stringify(vehicleData).toLowerCase();
    const matchCount = searchTerms.filter(term => vehicleDataStr.includes(term)).length;
    
    if (matchCount > 0) {
      confidence = matchCount / searchTerms.length;
      
      // Try to find relevant information
      if (vehicleData.make && vehicleData.model) {
        bestMatch = `I found information about the ${vehicleData.year || ''} ${vehicleData.make} ${vehicleData.model}. `;
        sources.push({ type: 'specification', reference: 'Vehicle Data' });
      }
    }
    
    // Search in additional data if provided
    if (additionalData) {
      const additionalDataStr = JSON.stringify(additionalData).toLowerCase();
      const additionalMatchCount = searchTerms.filter(term => additionalDataStr.includes(term)).length;
      
      if (additionalMatchCount > matchCount) {
        confidence = additionalMatchCount / searchTerms.length;
        bestMatch = "I found relevant information in the documentation. ";
        sources.push({ type: 'service_manual', reference: 'Documentation' });
      }
    }
    
    if (confidence > 0.5) {
      return {
        answer: bestMatch + "Please ask a more specific question for detailed information.",
        confidence,
        sources
      };
    }
    
    return {
      answer: "I couldn't find specific information about that. Please try rephrasing your question or provide more details.",
      confidence: 0.2,
      sources: []
    };
  }

  calculateConfidence(
    question: AutomotiveQuestion,
    answer: string,
    sources: AnswerSource[]
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on sources
    confidence += sources.length * 0.1;
    
    // Increase confidence if entities were found
    confidence += question.entities.length * 0.05;
    
    // Increase confidence for specific question types
    if (['part_lookup', 'torque_spec', 'specification'].includes(question.type)) {
      confidence += 0.1;
    }
    
    // Decrease confidence for vague questions
    if (question.type === 'general') {
      confidence -= 0.2;
    }
    
    // Cap confidence at 0.95
    return Math.min(confidence, 0.95);
  }

  private generateRelatedQuestions(
    question: AutomotiveQuestion,
    vehicleData: VehicleSpecification
  ): string[] {
    const related: string[] = [];
    
    switch (question.type) {
      case 'specification':
        related.push(
          `What are all the engine specifications for the ${vehicleData.model}?`,
          `How does this compare to the previous model year?`,
          `What is the fuel economy for this specification?`
        );
        break;
        
      case 'part_lookup':
        const partNumber = question.entities.find(e => e.type === 'part_number');
        if (partNumber) {
          related.push(
            `What vehicles is part ${partNumber.value} compatible with?`,
            `Are there any alternative parts for ${partNumber.value}?`,
            `What is the installation procedure for this part?`
          );
        }
        break;
        
      case 'service_interval':
        related.push(
          `What are all the maintenance items due at this interval?`,
          `What is the cost estimate for this service?`,
          `Can I perform this service myself?`
        );
        break;
        
      case 'torque_spec':
        related.push(
          `What is the tightening sequence for this component?`,
          `What type of thread locker should I use?`,
          `What are the torque specs for related components?`
        );
        break;
    }
    
    return related.slice(0, 3); // Return max 3 related questions
  }

  private generateId(): string {
    return `aq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility method to search JSON data
  searchJSONData(data: any, searchPath: string): any {
    const parts = searchPath.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        // Handle array index
        if (part.includes('[') && part.includes(']')) {
          const [arrayName, indexStr] = part.split('[');
          const index = parseInt(indexStr.replace(']', ''));
          current = current[arrayName]?.[index];
        } else {
          current = current[part];
        }
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // Method to find best answer from multiple sources
  findBestAnswer(
    question: AutomotiveQuestion,
    sources: Array<{ data: any; confidence: number; type: string }>
  ): AutomotiveAnswer {
    let bestAnswer: AutomotiveAnswer = {
      answer: "I couldn't find an answer to your question.",
      confidence: 0,
      sources: []
    };
    
    for (const source of sources) {
      const answer = this.extractAnswerFromSource(question, source.data, source.type);
      if (answer && answer.confidence > bestAnswer.confidence) {
        bestAnswer = answer;
        bestAnswer.sources.push({
          type: source.type as any,
          reference: `Source: ${source.type}`
        });
      }
    }
    
    return bestAnswer;
  }

  private extractAnswerFromSource(question: AutomotiveQuestion, data: any, sourceType: string): AutomotiveAnswer | null {
    // Implementation would extract answer based on question type and data structure
    // This is a simplified version
    return {
      answer: `Found information in ${sourceType}`,
      confidence: 0.7,
      sources: []
    };
  }
}

export default AutomotiveQuestionProcessor.getInstance();