import { FC } from "react";
import { TabView } from "@shared/schema";

interface TabNavigationProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

const TabNavigation: FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabView; label: string }[] = [
    { id: "split", label: "Split View" },
    { id: "document", label: "Document" },
    { id: "chunks", label: "Chunks" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange(tab.id);
              }}
              className={`${
                activeTab === tab.id
                  ? "text-primary-600 border-primary-500 border-b-2"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent border-b-2"
              } py-4 px-6 text-sm font-medium`}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
