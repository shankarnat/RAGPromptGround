import { IndexConfiguration, IndexField, IndexStatistics } from "@shared/schema";

// Sample statistics
export const sampleIndexStatistics: IndexStatistics = {
  totalFieldsIndexed: 8,
  retrievableFields: 5,
  filterableFields: 3,
  averageChunkSize: 256,
  totalVectorDimensions: 1536
};

// Sample fields for indexing
export const sampleIndexFields: IndexField[] = [
  {
    id: 1,
    name: "First Name",
    apiName: "firstName",
    dataType: "String",
    isRetrievable: true,
    isFilterable: true,
    isTypehead: false
  },
  {
    id: 2,
    name: "Last Name",
    apiName: "lastName",
    dataType: "String",
    isRetrievable: true,
    isFilterable: true,
    isTypehead: false
  },
  {
    id: 3,
    name: "Email",
    apiName: "email",
    dataType: "Email",
    isRetrievable: true,
    isFilterable: false,
    isTypehead: true
  },
  {
    id: 4,
    name: "Phone",
    apiName: "phone",
    dataType: "Phone",
    isRetrievable: true,
    isFilterable: false,
    isTypehead: false
  },
  {
    id: 5,
    name: "Address",
    apiName: "address",
    dataType: "Text",
    isRetrievable: true,
    isFilterable: false,
    isTypehead: false
  },
  {
    id: 6,
    name: "Account ID",
    apiName: "accountId",
    dataType: "ID",
    isRetrievable: false,
    isFilterable: true,
    isTypehead: false
  },
  {
    id: 7,
    name: "Created Date",
    apiName: "createdDate",
    dataType: "DateTime",
    isRetrievable: false,
    isFilterable: false,
    isTypehead: false
  },
  {
    id: 8,
    name: "Status",
    apiName: "status",
    dataType: "Picklist",
    isRetrievable: false,
    isFilterable: false,
    isTypehead: true
  }
];

// Sample JSON representation of indexed document
export const sampleIndexedDocument = {
  id: "doc_123456",
  fields: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, CA 94321",
    accountId: "ACC-987654",
    createdDate: "2023-04-15T10:30:00Z",
    status: "Active"
  },
  chunks: [
    {
      id: "chunk_1",
      content: "John Doe is a customer with email john.doe@example.com.",
      tokens: 245,
      embedding: "[0.1, 0.2, 0.3, ...]",
      fields: ["firstName", "lastName", "email"]
    },
    {
      id: "chunk_2",
      content: "Contact information includes phone +1 (555) 123-4567 and address 123 Main St, Anytown, CA 94321.",
      tokens: 267,
      embedding: "[0.4, 0.5, 0.6, ...]",
      fields: ["phone", "address"]
    }
  ]
};

// Sample index configuration
export const sampleIndexConfiguration: IndexConfiguration = {
  name: "Contact Information Index",
  fieldLevelIndexing: true,
  recordLevelIndexing: true,
  createVectorEmbedding: true,
  fields: sampleIndexFields,
  statistics: sampleIndexStatistics
};