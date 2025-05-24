import { AutomotiveQuestion } from '@/hooks/useAutomotiveQA';

/**
 * Comprehensive validation test suite for Honda/Acura automotive platform
 * These tests validate Q&A accuracy, extraction capabilities, and performance
 */

export const hondaAccordValidationSuite: AutomotiveQuestion[] = [
  // Specifications Tests
  {
    id: 'val-spec-1',
    question: 'What is the engine oil capacity for 2025 Honda Accord with filter?',
    category: 'specifications',
    expectedAnswer: '4.4 quarts (4.2 liters)',
    keywords: ['oil', 'capacity', 'accord', '2025']
  },
  {
    id: 'val-spec-2',
    question: 'What type of engine oil is recommended for 2025 Honda Accord?',
    category: 'specifications',
    expectedAnswer: '0W-20',
    keywords: ['oil', 'type', 'grade', 'accord']
  },
  {
    id: 'val-spec-3',
    question: 'What is the torque specification for 2025 Accord cylinder head bolts?',
    category: 'specifications',
    expectedAnswer: 'Step 1: 29 lb-ft, Step 2: 90 degrees, Step 3: 90 degrees',
    keywords: ['torque', 'cylinder', 'head', 'bolts']
  },
  
  // Parts Tests
  {
    id: 'val-parts-1',
    question: 'What is the part number for 2025 Accord engine air filter?',
    category: 'parts',
    expectedAnswer: '17220-5BA-A00',
    keywords: ['part', 'number', 'air', 'filter']
  },
  {
    id: 'val-parts-2',
    question: 'Is part number 17220-5AA-A00 compatible with 2025 Accord?',
    category: 'parts',
    expectedAnswer: 'No, superseded by 17220-5BA-A00',
    keywords: ['compatible', 'superseded', 'part']
  },
  
  // Service Tests
  {
    id: 'val-service-1',
    question: 'What is the oil change interval for 2025 Honda Accord?',
    category: 'service',
    expectedAnswer: '7,500-10,000 miles or when oil life monitor indicates',
    keywords: ['oil', 'change', 'interval', 'maintenance']
  },
  {
    id: 'val-service-2',
    question: 'When should the timing belt be replaced on 2025 Accord?',
    category: 'service',
    expectedAnswer: 'Timing chain - no replacement interval',
    keywords: ['timing', 'belt', 'chain', 'replacement']
  },
  {
    id: 'val-service-3',
    question: 'What is the brake fluid service interval?',
    category: 'service',
    expectedAnswer: 'Every 3 years regardless of mileage',
    keywords: ['brake', 'fluid', 'service', 'interval']
  },
  
  // Diagnostics Tests
  {
    id: 'val-diag-1',
    question: 'What does DTC P0420 indicate on a Honda?',
    category: 'diagnostics',
    expectedAnswer: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    keywords: ['P0420', 'DTC', 'code', 'catalyst']
  },
  {
    id: 'val-diag-2',
    question: 'How do you reset the maintenance minder on 2025 Accord?',
    category: 'diagnostics',
    expectedAnswer: 'Hold TRIP button, turn ignition ON, hold until display resets',
    keywords: ['reset', 'maintenance', 'minder']
  }
];

export const acuraMDXValidationSuite: AutomotiveQuestion[] = [
  // Specifications Tests
  {
    id: 'val-mdx-spec-1',
    question: 'What is the towing capacity of 2025 Acura MDX?',
    category: 'specifications',
    expectedAnswer: '5,000 lbs with towing package',
    keywords: ['towing', 'capacity', 'mdx']
  },
  {
    id: 'val-mdx-spec-2',
    question: 'What type of transmission fluid does 2025 MDX use?',
    category: 'specifications',
    expectedAnswer: 'Acura ATF-TYPE 3.1',
    keywords: ['transmission', 'fluid', 'type', 'mdx']
  },
  
  // Parts Tests
  {
    id: 'val-mdx-parts-1',
    question: 'What is the cabin air filter part number for 2025 MDX?',
    category: 'parts',
    expectedAnswer: '80292-TZ5-A41',
    keywords: ['cabin', 'air', 'filter', 'part']
  },
  
  // Service Tests
  {
    id: 'val-mdx-service-1',
    question: 'What is the differential fluid change interval for 2025 MDX SH-AWD?',
    category: 'service',
    expectedAnswer: '40,000 miles under normal conditions, 20,000 miles severe conditions',
    keywords: ['differential', 'fluid', 'sh-awd', 'interval']
  }
];

export const performanceValidationTests = [
  {
    name: 'Simple Query Response Time',
    test: async (submitQuestion: Function) => {
      const start = Date.now();
      await submitQuestion('What is the oil capacity?', 'specifications');
      const duration = Date.now() - start;
      return {
        passed: duration < 1000,
        duration,
        threshold: 1000,
        message: `Response time: ${duration}ms (threshold: 1000ms)`
      };
    }
  },
  {
    name: 'Complex Query Response Time',
    test: async (submitQuestion: Function) => {
      const start = Date.now();
      await submitQuestion(
        'What are all the torque specifications for cylinder head, connecting rod, and main bearing bolts?',
        'specifications'
      );
      const duration = Date.now() - start;
      return {
        passed: duration < 3000,
        duration,
        threshold: 3000,
        message: `Response time: ${duration}ms (threshold: 3000ms)`
      };
    }
  },
  {
    name: 'Batch Processing Performance',
    test: async (executeTestSuite: Function) => {
      const start = Date.now();
      let progress = 0;
      
      await executeTestSuite('perf-test-suite', {
        batchSize: 10,
        onProgress: (p: number) => { progress = p; }
      });
      
      const duration = Date.now() - start;
      const questionsPerSecond = 10 / (duration / 1000);
      
      return {
        passed: questionsPerSecond > 2,
        duration,
        questionsPerSecond,
        message: `Processed ${questionsPerSecond.toFixed(2)} questions/second (threshold: 2/sec)`
      };
    }
  }
];

export const accuracyValidationMetrics = {
  specifications: {
    minConfidence: 0.85,
    minAccuracy: 0.90,
    criticalFields: ['torque', 'capacity', 'interval']
  },
  parts: {
    minConfidence: 0.90,
    minAccuracy: 0.95,
    criticalFields: ['partNumber', 'compatibility', 'supersession']
  },
  service: {
    minConfidence: 0.80,
    minAccuracy: 0.85,
    criticalFields: ['interval', 'procedure', 'fluid']
  },
  diagnostics: {
    minConfidence: 0.75,
    minAccuracy: 0.80,
    criticalFields: ['dtc', 'symptom', 'procedure']
  }
};

export const edgeCaseTests: AutomotiveQuestion[] = [
  {
    id: 'edge-1',
    question: 'What is the part number for 06421-XYZ-999?', // Invalid format
    category: 'parts',
    expectedAnswer: 'Invalid Honda/Acura part number format',
    keywords: ['invalid', 'part', 'number']
  },
  {
    id: 'edge-2',
    question: 'JHMCM565ABC123456', // Invalid VIN
    category: 'general',
    expectedAnswer: 'Invalid VIN format - Honda/Acura VINs should match pattern',
    keywords: ['vin', 'invalid']
  },
  {
    id: 'edge-3',
    question: 'What is the torque spec in Nm for a component specified only in lb-ft?',
    category: 'specifications',
    expectedAnswer: 'Conversion provided with both units',
    keywords: ['torque', 'conversion', 'units']
  },
  {
    id: 'edge-4',
    question: 'What oil to use for 1985 Honda?', // Out of scope year
    category: 'specifications',
    expectedAnswer: 'Information not available for vehicles before 2000',
    keywords: ['old', 'vintage', 'out of scope']
  }
];

export const userAcceptanceScenarios = [
  {
    name: 'Service Technician Workflow',
    persona: 'service_technician',
    steps: [
      {
        action: 'Enter VIN',
        input: 'JHMCM56557C404453',
        expectedResult: 'Vehicle identified as 2007 Honda Accord'
      },
      {
        action: 'Ask for torque spec',
        input: 'What is the wheel lug nut torque?',
        expectedResult: '80 lb-ft (108 Nm)'
      },
      {
        action: 'Validate answer',
        input: 'thumbs up',
        expectedResult: 'Answer marked as correct'
      }
    ]
  },
  {
    name: 'Parts Manager Workflow',
    persona: 'parts_manager',
    steps: [
      {
        action: 'Search part compatibility',
        input: 'Is 17220-RNA-A00 compatible with 2010-2015 Accord?',
        expectedResult: 'Yes, compatible with 2008-2012 Accord 2.4L'
      },
      {
        action: 'Check supersession',
        input: 'Has this part been superseded?',
        expectedResult: 'Current part, no supersession'
      }
    ]
  }
];

// Export test runner utilities
export async function runValidationSuite(
  suite: AutomotiveQuestion[],
  submitQuestion: Function,
  validateAnswer: Function
): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  accuracy: number;
  averageConfidence: number;
  results: Array<{
    question: AutomotiveQuestion;
    answer: any;
    passed: boolean;
    confidence: number;
  }>;
}> {
  const results = [];
  let passed = 0;
  let totalConfidence = 0;
  
  for (const question of suite) {
    try {
      const answer = await submitQuestion(question.question, question.category);
      const isCorrect = answer.answer.toLowerCase().includes(
        question.expectedAnswer?.toLowerCase() || ''
      );
      
      if (isCorrect) passed++;
      totalConfidence += answer.confidence;
      
      results.push({
        question,
        answer,
        passed: isCorrect,
        confidence: answer.confidence
      });
      
      // Validate the answer
      validateAnswer(answer.questionId, isCorrect);
      
    } catch (error) {
      results.push({
        question,
        answer: { error: error.message },
        passed: false,
        confidence: 0
      });
    }
  }
  
  return {
    totalTests: suite.length,
    passed,
    failed: suite.length - passed,
    accuracy: passed / suite.length,
    averageConfidence: totalConfidence / suite.length,
    results
  };
}