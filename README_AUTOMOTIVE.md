# Honda/Acura Automotive Document Intelligence Platform

## Overview

The Automotive Document Intelligence Platform is a specialized fork of the document processing system, optimized for Honda and Acura service documentation, technical manuals, and automotive Q&A capabilities.

## Key Features

### 🚗 Automotive-Specific Processing
- **VIN Decoding**: Automatic extraction and decoding of Honda/Acura VINs
- **Part Number Recognition**: Intelligent parsing of Honda part number formats (XXXXX-XXX-XXX)
- **Technical Specifications**: Extraction of torque specs, fluid capacities, and service intervals
- **Diagnostic Code Processing**: DTC interpretation and troubleshooting guidance

### 🔍 Advanced Q&A System
- Natural language queries about vehicle specifications
- Real-time confidence scoring for answers
- Source attribution to specific manual pages
- Batch testing capabilities for validation

### 📊 Performance Monitoring
- Response time tracking with percentile analysis
- Memory usage optimization for large manuals
- Cache management for frequent queries
- Real-time performance alerts

### 📱 Field Technician Optimized
- Offline mode support for shop environments
- Mobile-responsive design for tablet use
- High-contrast UI for industrial settings
- Quick access to common procedures

## Quick Start

### URL Parameters

Access the platform with vehicle-specific context:

```
# Direct vehicle access
https://platform.example.com/unified?vin=JHMCM56557C404453

# Model-specific access
https://platform.example.com/unified?year=2025&make=Honda&model=Accord

# Q&A session deep linking
https://platform.example.com/qa/session-123?vin=JHMCM56557C404453

# Direct manual access
https://platform.example.com/automotive/manual/2025-accord-service
```

### Basic Usage

1. **Upload Documents**
   - Service manuals (PDF)
   - Technical bulletins
   - Parts catalogs
   - Wiring diagrams

2. **Configure Processing**
   - Select RAG for Q&A capabilities
   - Enable IDP for parts/specs extraction
   - Use Knowledge Graph for component relationships

3. **Start Q&A Session**
   - Enter vehicle information
   - Ask technical questions
   - Validate answers for accuracy

## API Documentation

### Q&A Endpoints

#### Submit Question
```typescript
POST /api/qa/submit
Content-Type: application/json

{
  "question": {
    "id": "q_123",
    "question": "What is the oil capacity for 2025 Accord?",
    "category": "specifications",
    "keywords": ["oil", "capacity", "accord"]
  },
  "options": {
    "vehicleInfo": {
      "year": "2025",
      "make": "Honda",
      "model": "Accord"
    },
    "priority": "normal",
    "timeout": 30000
  }
}

Response:
{
  "questionId": "q_123",
  "answer": "The 2025 Honda Accord has an engine oil capacity of 4.4 quarts (4.2 liters) with filter change.",
  "confidence": 0.95,
  "sources": [
    "Service Manual Page 3-15",
    "Maintenance Schedule Section 5"
  ],
  "relatedQuestions": [
    "What type of oil is recommended?",
    "What is the oil change interval?"
  ],
  "timestamp": "2024-01-24T10:30:00Z"
}
```

#### Batch Test Execution
```typescript
POST /api/qa/test/execute
Content-Type: application/json

{
  "suiteId": "suite_123",
  "options": {
    "batchSize": 10,
    "vehicleInfo": {
      "vin": "JHMCM56557C404453"
    }
  }
}

Response:
{
  "executionId": "exec_456",
  "status": "running",
  "progress": 0.0,
  "estimatedTime": 300000
}
```

#### Get Performance Analytics
```typescript
GET /api/qa/analytics?timeRange=24h

Response:
{
  "qa": {
    "totalQuestions": 1250,
    "averageResponseTime": 850,
    "successRate": 0.96,
    "responseTimePercentiles": {
      "p50": 650,
      "p90": 1200,
      "p99": 2500
    }
  },
  "system": {
    "memoryUsage": {
      "current": 245,
      "peak": 380
    },
    "cacheHitRate": 0.78
  }
}
```

### Document Processing Endpoints

#### Extract Vehicle Specifications
```typescript
POST /api/automotive/extract/specifications
Content-Type: application/json

{
  "documentId": "doc_789",
  "vehicleInfo": {
    "year": "2025",
    "make": "Honda",
    "model": "CR-V"
  }
}

Response:
{
  "specifications": {
    "engine": {
      "displacement": "1.5L",
      "configuration": "Turbocharged 4-cylinder",
      "horsepower": "190 @ 5,600 rpm",
      "torque": "179 lb-ft @ 2,000-5,000 rpm"
    },
    "fluids": {
      "engineOil": "0W-20",
      "coolant": "Honda Type 2",
      "transmission": "Honda ATF DW-1"
    },
    "capacities": {
      "fuel": "14.0 gallons",
      "engineOil": "3.7 quarts",
      "coolant": "5.9 quarts"
    }
  },
  "confidence": 0.92,
  "extractedFrom": ["pages 2-5", "pages 8-12"]
}
```

## Data Formats

### Vehicle Information Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "vin": {
      "type": "string",
      "pattern": "^[JH][A-Z0-9]{2}[A-Z0-9]{6}[0-9]{6}$",
      "description": "Honda/Acura VIN format"
    },
    "year": {
      "type": "string",
      "pattern": "^20[0-9]{2}$"
    },
    "make": {
      "type": "string",
      "enum": ["Honda", "Acura"]
    },
    "model": {
      "type": "string"
    },
    "trim": {
      "type": "string"
    },
    "engine": {
      "type": "string"
    }
  },
  "required": ["year", "make", "model"]
}
```

### Part Number Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "partNumber": {
      "type": "string",
      "pattern": "^[0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{3}$"
    },
    "description": {
      "type": "string"
    },
    "supersededBy": {
      "type": "string",
      "pattern": "^[0-9]{5}-[A-Z0-9]{3}-[A-Z0-9]{3}$"
    },
    "compatibility": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "model": { "type": "string" },
          "years": { "type": "string" },
          "notes": { "type": "string" }
        }
      }
    }
  }
}
```

### Test Question Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "question": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["parts", "specifications", "service", "diagnostics", "general"]
    },
    "expectedAnswer": { "type": "string" },
    "acceptableVariations": {
      "type": "array",
      "items": { "type": "string" }
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["id", "question", "category"]
}
```

## User Guide

### For Service Technicians

1. **Quick Part Lookup**
   - Navigate to unified dashboard
   - Enter part number in Q&A interface
   - Get compatibility and supersession info

2. **Torque Specifications**
   - Ask: "What is the torque spec for [component]?"
   - System provides spec with confidence score
   - Always verify critical specifications

3. **Diagnostic Procedures**
   - Enter DTC code for interpretation
   - Follow step-by-step troubleshooting
   - Access related technical bulletins

### For Parts Managers

1. **Inventory Cross-Reference**
   - Upload parts catalog
   - Enable IDP extraction
   - Query superseded parts

2. **Compatibility Checking**
   - Enter VIN for exact match
   - Review model/year compatibility
   - Export results for ordering

### For Technical Writers

1. **Manual Validation**
   - Create test suites from specifications
   - Run batch validation
   - Track accuracy metrics

2. **Content Updates**
   - Compare extracted data
   - Identify inconsistencies
   - Generate revision reports

## Performance Guidelines

### Document Processing

- **Small Manuals (<50MB)**: Real-time processing
- **Large Manuals (50-200MB)**: Progressive loading with progress indicator
- **Service Bulletins**: Batch processing recommended
- **Wiring Diagrams**: Enable image extraction for best results

### Q&A Optimization

- **Simple Queries**: <1 second response time
- **Complex Queries**: 1-3 seconds with confidence scoring
- **Batch Testing**: Process in groups of 10-20 questions
- **Cache Warmup**: Pre-load common specifications

### Memory Management

- Automatic cleanup at 90% utilization
- Image cache separate from text cache
- Background cleanup every 24 hours
- Manual cache clear available

## Troubleshooting

### Common Issues

1. **Slow Q&A Response**
   - Check memory usage in performance tab
   - Clear cache if over 80% utilized
   - Reduce batch size for testing

2. **Part Number Not Found**
   - Verify format (XXXXX-XXX-XXX)
   - Check for supersession
   - Enable fuzzy matching

3. **Low Confidence Scores**
   - Verify document quality
   - Check for OCR errors
   - Validate extraction settings

### Debug Mode

Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('automotive_debug', 'true');
performanceMonitor.on('qa:complete', console.log);
```

## Security & Compliance

- All data processed locally
- No external API calls for sensitive data
- VIN validation without transmission
- Audit logging for all queries

## Support

For technical support:
- GitHub Issues: [Project Repository]
- Documentation: [This README]
- Performance Monitoring: Built-in analytics dashboard

## License

This automotive-specific implementation is provided under the same license as the base platform, with additional provisions for automotive industry use.