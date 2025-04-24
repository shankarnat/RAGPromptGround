import { FC } from "react";
import { ExternalLink } from "lucide-react";

const IndexFAQPanel: FC = () => {
  return (
    <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">Frequently Asked Questions</h3>
      </div>
      <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {/* Field Level Indexing */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Field Level Indexing</h4>
          <p className="text-xs text-gray-600 mb-3">
            Field level indexing creates separate indices for each field in your document.
            This enables more precise searching and filtering on specific field content.
          </p>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about field level indexing</span>
          </div>
        </div>

        {/* Record Level Indexing */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Record Level Indexing</h4>
          <p className="text-xs text-gray-600 mb-3">
            Record level indexing creates an index for the entire document as a single unit.
            This is useful for semantic search across all fields and natural language queries.
          </p>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about record level indexing</span>
          </div>
        </div>

        {/* Chunk Format Column */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Chunk Format Column</h4>
          <p className="text-xs text-gray-600 mb-3">
            The chunk format determines how your document is divided into searchable pieces.
            Different formats are optimized for different types of content and search needs.
          </p>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about chunk formats</span>
          </div>
        </div>

        {/* Retrievable Fields */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Retrievable Fields</h4>
          <p className="text-xs text-gray-600 mb-3">
            Retrievable fields are returned in search results. They contain the content that users
            see after performing a search. Mark fields as retrievable if they contain information
            you want to display to users.
          </p>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about retrievable fields</span>
          </div>
        </div>

        {/* Typehead Fields */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Typehead Fields</h4>
          <p className="text-xs text-gray-600 mb-3">
            Typehead fields are used for autocomplete and suggestion features. They help users
            find information while typing by showing relevant options in real-time. These fields
            should contain short, identifiable text.
          </p>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about typehead fields</span>
          </div>
        </div>

        {/* Filtering Fields */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Filtering Fields</h4>
          <p className="text-xs text-gray-600 mb-3">
            Filtering fields allow users to narrow down search results based on specific criteria.
            Common examples include date ranges, categories, or status values. Mark fields as
            filterable if users will need to refine their searches based on them.
          </p>
          <div className="text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Learn more about filtering fields</span>
          </div>
        </div>

        {/* Examples */}
        <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
          <h4 className="text-sm font-semibold mb-2">Examples</h4>
          <div className="text-xs text-gray-600 space-y-2">
            <p>
              <span className="font-medium">Product Catalog:</span> Make name and description retrievable,
              categories and tags filterable, and product names typehead-enabled.
            </p>
            <p>
              <span className="font-medium">Customer Information:</span> Make contact details retrievable,
              account status and location filterable, and email/phone typehead-enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexFAQPanel;