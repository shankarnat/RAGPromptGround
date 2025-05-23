export interface TestQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'parts' | 'maintenance' | 'safety' | 'diagnostic';
  difficulty: 'easy' | 'medium' | 'hard';
  documentReference?: string;
}

export const automotiveTestQuestions: TestQuestion[] = [
  // Service Manual Questions
  {
    id: 'sm-1',
    question: 'What is the recommended oil change interval for 2025 Honda Accord with the oil life monitor?',
    expectedAnswer: '7,500-10,000 miles based on oil life monitor',
    category: 'maintenance',
    difficulty: 'easy',
    documentReference: 'Service Intervals & Maintenance'
  },
  {
    id: 'sm-2',
    question: 'Which transmission types are available for the 2025 Honda CR-V?',
    expectedAnswer: 'CVT (Continuously Variable Transmission)',
    category: 'technical',
    difficulty: 'easy',
    documentReference: 'Vehicle Model Coverage'
  },
  {
    id: 'sm-3',
    question: 'What safety precautions must be observed when servicing hybrid models?',
    expectedAnswer: 'High-voltage safety procedures for hybrid/electric models must be followed',
    category: 'safety',
    difficulty: 'medium',
    documentReference: 'Safety Precautions'
  },
  {
    id: 'sm-4',
    question: 'What diagnostic equipment is required for ADAS calibration?',
    expectedAnswer: 'Honda Diagnostic System (HDS) or i-HDS tablet, ADAS calibration targets and alignment equipment',
    category: 'diagnostic',
    difficulty: 'hard',
    documentReference: 'Diagnostic Equipment Requirements'
  },
  {
    id: 'sm-5',
    question: 'When should brake fluid be replaced according to the service manual?',
    expectedAnswer: 'Every 3 years',
    category: 'maintenance',
    difficulty: 'easy',
    documentReference: 'Service Intervals & Maintenance'
  },

  // Parts Catalog Questions
  {
    id: 'pc-1',
    question: 'What is the part number for the 2025 Honda Accord air filter?',
    expectedAnswer: '17220-5PH-A01',
    category: 'parts',
    difficulty: 'medium',
    documentReference: 'Honda_Acura_Parts_Inventory_2025'
  },
  {
    id: 'pc-2',
    question: 'What type of brake pad compound is used in part number 45251-STK-A01?',
    expectedAnswer: 'Ceramic compound',
    category: 'parts',
    difficulty: 'medium',
    documentReference: 'Honda_Acura_Parts_Inventory_2025'
  },
  {
    id: 'pc-3',
    question: 'Which warehouse location stocks the MDX 2025 front shock absorber?',
    expectedAnswer: 'Warehouse B',
    category: 'parts',
    difficulty: 'easy',
    documentReference: 'Honda_Acura_Parts_Inventory_2025'
  },
  {
    id: 'pc-4',
    question: 'What is the price of the water pump for the 2024 Acura TLX (part 19200-5J6-A05)?',
    expectedAnswer: '$142.00',
    category: 'parts',
    difficulty: 'easy',
    documentReference: 'Honda_Acura_Parts_Inventory_2025'
  },
  {
    id: 'pc-5',
    question: 'Which part is showing low stock status in the inventory?',
    expectedAnswer: 'Oil Filter (15400-PLM-A02) for CR-V 2025',
    category: 'parts',
    difficulty: 'medium',
    documentReference: 'Honda_Acura_Parts_Inventory_2025'
  },

  // Technical Questions
  {
    id: 'tech-1',
    question: 'What are the engine options available for the 2025 Acura MDX?',
    expectedAnswer: '3.0L Turbo and Type S 3.0L',
    category: 'technical',
    difficulty: 'medium',
    documentReference: 'Vehicle Model Coverage'
  },
  {
    id: 'tech-2',
    question: 'Which refrigerant handling procedures are required for the R-1234yf systems?',
    expectedAnswer: 'Proper refrigerant handling procedures for R-1234yf systems must be followed',
    category: 'technical',
    difficulty: 'hard',
    documentReference: 'Safety Precautions'
  },
  {
    id: 'tech-3',
    question: 'What is included in the Honda SENSING® suite?',
    expectedAnswer: 'Honda SENSING® suite includes standard safety features (specific features listed in technical specifications)',
    category: 'technical',
    difficulty: 'medium',
    documentReference: 'Technical Specifications Overview'
  },
  {
    id: 'tech-4',
    question: 'How many total Honda and Acura models are covered in the 2025 service manual?',
    expectedAnswer: '15 models',
    category: 'technical',
    difficulty: 'easy',
    documentReference: 'Vehicle Model Coverage'
  },
  {
    id: 'tech-5',
    question: 'What output does the alternator for the 2025 HR-V provide?',
    expectedAnswer: '150A output',
    category: 'technical',
    difficulty: 'hard',
    documentReference: 'Honda_Acura_Parts_Inventory_2025'
  },

  // Maintenance & Service Questions
  {
    id: 'maint-1',
    question: 'What is the transmission fluid service interval range for Honda vehicles?',
    expectedAnswer: '30,000-60,000 miles (varies by model)',
    category: 'maintenance',
    difficulty: 'medium',
    documentReference: 'Service Intervals & Maintenance'
  },
  {
    id: 'maint-2',
    question: 'When should the engine air filter be replaced?',
    expectedAnswer: '30,000 miles',
    category: 'maintenance',
    difficulty: 'easy',
    documentReference: 'Service Intervals & Maintenance'
  },
  {
    id: 'maint-3',
    question: 'What service procedures are included in the manual for hybrid vehicles?',
    expectedAnswer: 'Hybrid battery system maintenance',
    category: 'maintenance',
    difficulty: 'medium',
    documentReference: 'Common Service Procedures'
  },
  {
    id: 'maint-4',
    question: 'What is the cabin air filter replacement interval?',
    expectedAnswer: '15,000-20,000 miles',
    category: 'maintenance',
    difficulty: 'easy',
    documentReference: 'Service Intervals & Maintenance'
  },
  {
    id: 'maint-5',
    question: 'Which service procedure is required after windshield replacement?',
    expectedAnswer: 'ADAS sensor calibration',
    category: 'maintenance',
    difficulty: 'hard',
    documentReference: 'Safety Precautions'
  },

  // Diagnostic Questions
  {
    id: 'diag-1',
    question: 'What diagnostic tool is required for Honda vehicles?',
    expectedAnswer: 'Honda Diagnostic System (HDS) or i-HDS tablet',
    category: 'diagnostic',
    difficulty: 'easy',
    documentReference: 'Diagnostic Equipment Requirements'
  },
  {
    id: 'diag-2',
    question: 'Which common service procedures are listed for diagnostics?',
    expectedAnswer: 'Engine diagnostics and trouble code reading',
    category: 'diagnostic',
    difficulty: 'medium',
    documentReference: 'Common Service Procedures'
  },
  {
    id: 'diag-3',
    question: 'What type of multimeter is required for hybrid vehicle diagnostics?',
    expectedAnswer: 'Digital multimeter with high-voltage capabilities',
    category: 'diagnostic',
    difficulty: 'medium',
    documentReference: 'Diagnostic Equipment Requirements'
  },
  {
    id: 'diag-4',
    question: 'How are technical updates provided to service technicians?',
    expectedAnswer: 'Through the Honda Service Express system',
    category: 'diagnostic',
    difficulty: 'hard',
    documentReference: 'Conclusion'
  },
  {
    id: 'diag-5',
    question: 'What equipment is needed for refrigerant service?',
    expectedAnswer: 'Refrigerant recovery and recycling equipment',
    category: 'diagnostic',
    difficulty: 'medium',
    documentReference: 'Diagnostic Equipment Requirements'
  }
];

// Helper function to get questions by category
export function getQuestionsByCategory(category: TestQuestion['category']): TestQuestion[] {
  return automotiveTestQuestions.filter(q => q.category === category);
}

// Helper function to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: TestQuestion['difficulty']): TestQuestion[] {
  return automotiveTestQuestions.filter(q => q.difficulty === difficulty);
}

// Helper function to get random questions
export function getRandomQuestions(count: number): TestQuestion[] {
  const shuffled = [...automotiveTestQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to validate answer (with fuzzy matching)
export function validateAnswer(userAnswer: string, expectedAnswer: string): boolean {
  const normalizedUser = userAnswer.toLowerCase().trim();
  const normalizedExpected = expectedAnswer.toLowerCase().trim();
  
  // Exact match
  if (normalizedUser === normalizedExpected) return true;
  
  // Contains key parts of the answer
  const keyWords = normalizedExpected.split(' ').filter(word => word.length > 3);
  const matchedWords = keyWords.filter(word => normalizedUser.includes(word));
  
  // If 70% of key words are matched, consider it correct
  return matchedWords.length / keyWords.length >= 0.7;
}