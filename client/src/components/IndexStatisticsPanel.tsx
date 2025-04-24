import { FC } from "react";
import { Database, Server, Layers, BarChart } from "lucide-react";
import { IndexStatistics } from "@shared/schema";

interface IndexStatisticsPanelProps {
  statistics: IndexStatistics;
}

const IndexStatisticsPanel: FC<IndexStatisticsPanelProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Fields</p>
          <p className="text-2xl font-semibold">{statistics.totalFieldsIndexed}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
          <Layers className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Retrievable</p>
          <p className="text-2xl font-semibold">{statistics.retrievableFields}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
          <BarChart className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Filterable</p>
          <p className="text-2xl font-semibold">{statistics.filterableFields}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
        <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
          <Layers className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg. Chunk Size</p>
          <p className="text-2xl font-semibold">{statistics.averageChunkSize}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
        <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mr-4">
          <Server className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Vector Dims</p>
          <p className="text-2xl font-semibold">{statistics.totalVectorDimensions}</p>
        </div>
      </div>
    </div>
  );
};

export default IndexStatisticsPanel;