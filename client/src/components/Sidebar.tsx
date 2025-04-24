import { FC } from "react";
import { 
  LayoutDashboard, 
  Upload, 
  AlignJustify, 
  Zap, 
  FileText, 
  Network, 
  Scale, 
  ShieldCheck 
} from "lucide-react";

interface SidebarProps {
  activePage: string;
}

const Sidebar: FC<SidebarProps> = ({ activePage }) => {
  // Sidebar navigation items
  const navItems = [
    { 
      name: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "dashboard" 
    },
    { 
      name: "Upload Document", 
      icon: <Upload className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "upload" 
    },
    { 
      name: "Parse & Chunk", 
      icon: <AlignJustify className="h-5 w-5 mr-3 text-primary-500" />, 
      id: "parse-chunk", 
      active: true 
    },
    { 
      name: "Embed Vectors", 
      icon: <Zap className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "embed" 
    },
    { 
      name: "IDP Extraction", 
      icon: <FileText className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "idp", 
      optional: true 
    },
    { 
      name: "Knowledge Graph", 
      icon: <Network className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "kg", 
      optional: true 
    },
    { 
      name: "Build Pipeline", 
      icon: <Scale className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "pipeline" 
    },
    { 
      name: "Test & Deploy", 
      icon: <ShieldCheck className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "deploy" 
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-gray-200 z-10">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Document Intelligence</h1>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md ${
                    item.id === activePage
                      ? "text-primary-600 bg-primary-50 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.name}
                  {item.optional && (
                    <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                      Optional
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
              JD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
