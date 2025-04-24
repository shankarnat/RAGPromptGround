import { FC } from "react";
import { DataModel } from "@shared/schema";

interface DataModelPanelProps {
  dataModels: DataModel[];
  selectedDataModel: DataModel | null;
  onSelectDataModel: (model: DataModel) => void;
}

const DataModelPanel: FC<DataModelPanelProps> = ({
  dataModels,
  selectedDataModel,
  onSelectDataModel
}) => {
  return (
    <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">Data Model Selection</h3>
      </div>
      <div className="p-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <p className="text-sm text-gray-500 mb-4">
          Select the data model that best represents this document's structure.
        </p>
        
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Model Object
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Object API Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataModels.map((model, index) => (
                <tr 
                  key={model.id} 
                  className={`${
                    selectedDataModel?.id === model.id 
                      ? "bg-primary-50" 
                      : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 cursor-pointer transition-colors`}
                  onClick={() => onSelectDataModel(model)}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedDataModel?.id === model.id}
                        onChange={() => onSelectDataModel(model)}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{model.name}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{model.apiName}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataModelPanel;