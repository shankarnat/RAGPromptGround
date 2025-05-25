import { UploadedDocument, DataModel } from "@shared/schema";

export const recentDocuments: UploadedDocument[] = [
  {
    id: 9,
    name: "Acura_2025_RDX_Fact Sheet.pdf",
    type: "application/pdf",
    size: 3367495, // 3.4 MB
    uploadDate: "2025-05-24T21:12:00Z"
  },
  {
    id: 5,
    name: "Honda_Acura_2025_Service_Manual.pdf",
    type: "application/pdf",
    size: 45200000, // 45.2 MB
    uploadDate: "2025-05-20T11:05:00Z"
  },
  {
    id: 1,
    name: "Honda_CR-V_2025_Specifications.pdf",
    type: "application/pdf",
    size: 8250000, // 8.25 MB
    uploadDate: "2025-05-19T14:30:00Z"
  },
  {
    id: 2,
    name: "Acura_MDX_2025_Parts_Catalog.pdf",
    type: "application/pdf",
    size: 32500000, // 32.5 MB
    uploadDate: "2025-05-18T10:15:00Z"
  },
  {
    id: 3,
    name: "Honda_Accord_2025_Diagnostic_Guide.pdf",
    type: "application/pdf",
    size: 15750000, // 15.75 MB
    uploadDate: "2025-05-17T09:45:00Z"
  },
  {
    id: 4,
    name: "Acura_TLX_2025_Wiring_Diagrams.pdf",
    type: "application/pdf",
    size: 28500000, // 28.5 MB
    uploadDate: "2025-05-16T16:20:00Z"
  },
  {
    id: 6,
    name: "Honda_Civic_2025_ADAS_Calibration.pdf",
    type: "application/pdf",
    size: 12300000, // 12.3 MB
    uploadDate: "2025-05-15T08:30:00Z"
  },
  {
    id: 7,
    name: "Honda_Pilot_2025_Maintenance_Schedule.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 2100000, // 2.1 MB
    uploadDate: "2025-05-14T13:45:00Z"
  },
  {
    id: 8,
    name: "Acura_NSX_2025_Technical_Bulletins.pdf",
    type: "application/pdf",
    size: 9800000, // 9.8 MB
    uploadDate: "2025-05-13T11:00:00Z"
  }
];

export const dataModels: DataModel[] = [
  {
    id: 1,
    name: "Vehicle Service Record",
    apiName: "vehicle_service_record__c"
  },
  {
    id: 2,
    name: "Vehicle Model",
    apiName: "vehicle_model__c"
  },
  {
    id: 3,
    name: "Dealership",
    apiName: "dealership__c"
  },
  {
    id: 4,
    name: "Service Appointment",
    apiName: "service_appointment__c"
  },
  {
    id: 5,
    name: "Parts Inventory",
    apiName: "parts_inventory__c"
  },
  {
    id: 6,
    name: "Warranty Claim",
    apiName: "warranty_claim__c"
  },
  {
    id: 7,
    name: "Technical Bulletin",
    apiName: "technical_bulletin__c"
  },
  {
    id: 8,
    name: "Customer Vehicle",
    apiName: "customer_vehicle__c"
  },
  {
    id: 9,
    name: "Service Technician",
    apiName: "service_technician__c"
  },
  {
    id: 10,
    name: "Recall Notice",
    apiName: "recall_notice__c"
  },
  {
    id: 11,
    name: "Diagnostic Report",
    apiName: "diagnostic_report__c"
  },
  {
    id: 12,
    name: "Parts Order",
    apiName: "parts_order__c"
  },
  {
    id: 13,
    name: "Service Manual",
    apiName: "service_manual__c"
  },
  {
    id: 14,
    name: "VIN Registry",
    apiName: "vin_registry__c"
  },
  {
    id: 15,
    name: "ADAS Calibration",
    apiName: "adas_calibration__c"
  }
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}