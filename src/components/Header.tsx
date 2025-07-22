import { Bell, Settings, User, Shield, Sun, Moon, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout, hasRole } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (roles: string[]) => {
    if (roles.includes('SystemAdmin')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (roles.includes('AO')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (roles.includes('ComplianceOfficer')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (roles.includes('SecurityAnalyst')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (roles.includes('Auditor')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getHighestRole = (roles: string[]) => {
    const roleHierarchy = ['SystemAdmin', 'AO', 'ComplianceOfficer', 'SecurityAnalyst', 'Auditor', 'Viewer'];
    for (const role of roleHierarchy) {
      if (roles.includes(role)) return role;
    }
    return 'Viewer';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!mounted) return null;

  return (
    <header className="h-16 border-b border-border bg-card shadow-card">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">cATO Dashboard</h1>
              <p className="text-sm text-muted-foreground">Continuous Authority to Operate</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-status-compliant/10 text-status-compliant border-status-compliant/20">
            IL5 ACTIVE
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search controls, activities, or POA&Ms..."
              className="pl-10 bg-background/50"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Classification Badge */}
          <Badge variant="outline" className="bg-status-partial/10 text-status-partial border-status-partial/20">
            CUI
          </Badge>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-destructive">
              3
            </Badge>
          </Button>

          {/* Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>Customize your dashboard preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="theme-toggle">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      id="theme-toggle"
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Current theme: <span className="font-medium">{theme}</span>
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.displayName || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user ? getInitials(user.displayName) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  {user?.jobTitle && (
                    <p className="text-xs leading-none text-muted-foreground">{user.jobTitle}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Role Information */}
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <span className="text-xs text-muted-foreground">Current Role:</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs w-fit ${getRoleColor(user?.roles || [])}`}
                  >
                    {getHighestRole(user?.roles || [])}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}