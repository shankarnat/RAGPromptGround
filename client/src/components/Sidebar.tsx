import { FC, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Upload, 
  AlignJustify, 
  Zap, 
  FileText, 
  Network, 
  Scale, 
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  activePage: string;
}

const Sidebar: FC<SidebarProps> = ({ activePage }) => {
  const [location, navigate] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["configure-index"]);

  const toggleSubnav = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Sidebar navigation items
  const navItems = [
    { 
      name: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "dashboard",
      href: "/dashboard"
    },
    { 
      name: "Upload Document", 
      icon: <Upload className={`h-5 w-5 mr-3 ${activePage === "upload" ? "text-primary-500" : "text-gray-500"}`} />, 
      id: "upload",
      href: "/upload",
      completed: activePage !== "upload"
    },
    { 
      name: "Parse & Chunk", 
      icon: <AlignJustify className={`h-5 w-5 mr-3 ${activePage === "parse-chunk" ? "text-primary-500" : "text-gray-500"}`} />, 
      id: "parse-chunk",
      href: "/parse-chunk",
      completed: activePage !== "parse-chunk" && activePage !== "upload"
    },
    /* Disabled Select Search Type
    { 
      name: "Select Search Type", 
      icon: <Zap className={`h-5 w-5 mr-3 ${activePage === "search-type" ? "text-primary-500" : "text-gray-500"}`} />, 
      id: "search-type",
      href: "/search-type",
      completed: activePage === "configure-index" || activePage === "vectorization"
    },
    */
    { 
      name: "Vectorization", 
      icon: <FileText className={`h-5 w-5 mr-3 ${activePage === "vectorization" ? "text-primary-500" : "text-gray-500"}`} />, 
      id: "vectorization",
      href: "/vectorization",
      completed: activePage === "configure-index"
    },
    { 
      name: "Configure Index", 
      icon: <Network className={`h-5 w-5 mr-3 ${activePage === "configure-index" ? "text-primary-500" : "text-gray-500"}`} />, 
      id: "configure-index",
      href: "/configure-index",
      subnav: [
        { name: "Fields", id: "fields", href: "/configure-index/fields" },
        { name: "Other Configurations", id: "other-config", href: "/configure-index/other" }
      ]
    },
    /* Disabled IDP Extraction
    { 
      name: "IDP Extraction", 
      icon: <FileText className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "idp", 
      optional: true,
      href: "/idp"
    },
    */
    /* Disabled Knowledge Graph
    { 
      name: "Knowledge Graph", 
      icon: <Network className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "kg", 
      optional: true,
      href: "/kg"
    },
    */
    /* Disabled Build Pipeline
    { 
      name: "Build Pipeline", 
      icon: <Scale className="h-5 w-5 mr-3 text-gray-500" />, 
      id: "pipeline",
      href: "/pipeline"
    },
    */
    { 
      name: "Test & Deploy", 
      icon: <ShieldCheck className={`h-5 w-5 mr-3 ${activePage === "deploy" ? "text-primary-500" : "text-gray-500"}`} />, 
      id: "deploy",
      href: "/deploy"
    }
  ];

  const handleNavigation = (path: string, id: string) => {
    if (id === "upload" || id === "parse-chunk" || id === "vectorization" || id === "configure-index" || id === "fields" || id === "other-config" || id === "deploy") {
      navigate(path);
    }
  };

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
                <div className="flex flex-col">
                  <a 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.subnav) {
                        toggleSubnav(item.id);
                      } else {
                        handleNavigation(item.href, item.id);
                      }
                    }}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      item.id === activePage
                        ? "text-primary-600 bg-primary-50 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.name}</span>
                    
                    {item.completed && (
                      <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center mr-1">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                    
                    {item.optional && (
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                        Optional
                      </span>
                    )}
                    
                    {item.subnav && (
                      expandedItems.includes(item.id) 
                        ? <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                        : <ChevronRight className="h-4 w-4 ml-2 text-gray-500" />
                    )}
                  </a>
                  
                  {/* Sub navigation items */}
                  {item.subnav && expandedItems.includes(item.id) && (
                    <ul className="pl-10 mt-1 space-y-1">
                      {item.subnav.map((subItem) => (
                        <li key={subItem.id}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(subItem.href, subItem.id);
                            }}
                            className={`block px-3 py-1.5 text-sm rounded-md ${
                              subItem.id === activePage
                                ? "text-primary-600 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {subItem.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
