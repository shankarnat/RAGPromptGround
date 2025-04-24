import { UploadedDocument, DataModel } from "@shared/schema";

export const recentDocuments: UploadedDocument[] = [
  {
    id: 1,
    name: "contract_agreement.pdf",
    type: "application/pdf",
    size: 1250000,
    uploadDate: "2023-04-20T14:30:00Z"
  },
  {
    id: 2,
    name: "user_manual.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 2500000,
    uploadDate: "2023-04-19T10:15:00Z"
  },
  {
    id: 3,
    name: "research_paper.pdf",
    type: "application/pdf",
    size: 3750000,
    uploadDate: "2023-04-18T09:45:00Z"
  },
  {
    id: 4,
    name: "meeting_notes.txt",
    type: "text/plain",
    size: 500000,
    uploadDate: "2023-04-17T16:20:00Z"
  },
  {
    id: 5,
    name: "financial_report.pdf",
    type: "application/pdf",
    size: 4200000,
    uploadDate: "2023-04-16T11:05:00Z"
  }
];

export const dataModels: DataModel[] = [
  {
    id: 1,
    name: "Chat Transcript",
    apiName: "chat_transcript__c"
  },
  {
    id: 2,
    name: "Contact",
    apiName: "contact"
  },
  {
    id: 3,
    name: "Account",
    apiName: "account"
  },
  {
    id: 4,
    name: "Invoice",
    apiName: "invoice__c"
  },
  {
    id: 5,
    name: "Product",
    apiName: "product2"
  },
  {
    id: 6,
    name: "Customer Support Case",
    apiName: "case"
  },
  {
    id: 7,
    name: "Legal Contract",
    apiName: "contract"
  },
  {
    id: 8,
    name: "Opportunity",
    apiName: "opportunity"
  },
  {
    id: 9,
    name: "Employee",
    apiName: "employee__c"
  },
  {
    id: 10,
    name: "Service Request",
    apiName: "service_request__c"
  },
  {
    id: 11,
    name: "Task",
    apiName: "task"
  },
  {
    id: 12,
    name: "Event",
    apiName: "event"
  },
  {
    id: 13,
    name: "Knowledge Article",
    apiName: "knowledge__kav"
  },
  {
    id: 14,
    name: "Lead",
    apiName: "lead"
  },
  {
    id: 15,
    name: "Campaign",
    apiName: "campaign"
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