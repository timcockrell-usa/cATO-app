import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Shield, 
  Target, 
  Workflow, 
  AlertTriangle, 
  Download 
} from "lucide-react";

const navigation = [
  { name: "Executive Dashboard", href: "/", icon: BarChart3 },
  { name: "NIST 800-53", href: "/nist", icon: Shield },
  { name: "Zero Trust", href: "/zta", icon: Target },
  { name: "Execution Enablers", href: "/execution", icon: Workflow },
  { name: "POA&M", href: "/poam", icon: AlertTriangle },
  { name: "Export Package", href: "/export", icon: Download },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border shadow-card">
      <div className="flex flex-col h-screen">
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p>Last Updated: {new Date().toLocaleTimeString()}</p>
            <p className="mt-1">Classification: IL5</p>
          </div>
        </div>
      </div>
    </div>
  );
}