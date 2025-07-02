
import { MemoryStick, CpuIcon, Gamepad2, Activity, FileText, MessageSquare, Info, Github } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AboutDialog } from "@/components/AboutDialog";
import { useState } from "react";
import { useMessageAttachment } from "@/contexts/MessageAttachmentContext";
import { useGitHubAuth } from "@/state/githubAuthStore";
import { cn } from "@/lib/utils";

export function MainNav() {
  const [showAbout, setShowAbout] = useState(false);
  const { isGameProfileActive } = useMessageAttachment();
  const location = useLocation();
  const { 
    isAuthenticated, 
    user, 
    error
  } = useGitHubAuth();

  // Handle external links
  const handleExternalLink = (url: string) => {
    if (window.electron?.openExternal) {
      window.electron.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Check if a route is currently active
  const isActiveRoute = (href: string) => {
    const currentPath = location.pathname;
    
    // Handle root route - both "/" and "/dashboard" should highlight Dashboard
    if (href === "/") {
      return currentPath === "/" || currentPath === "/dashboard";
    }
    
    return currentPath === href;
  };

  // Dynamic icon path based on game profile state
  const iconPath = isGameProfileActive ? "/icon2.png" : "/icon.png";

  // GitHub icon color based on connection status
  const getGitHubIconColor = () => {
    if (isAuthenticated) return "text-green-500";
    if (error) return "text-red-500";
    return "text-gray-400";
  };

  const handleViewRepositories = () => {
    if (user) {
      handleExternalLink(`https://github.com/${user.login}?tab=repositories`);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: Activity },
    { name: "Memory Manager", path: "/memory-manager", icon: MemoryStick },
    { name: "Game Manager", path: "/game-manager", icon: Gamepad2 },
    { name: "Message Monitor", path: "/message-monitor", icon: MessageSquare },
    { name: "Device Manager", path: "/device-manager", icon: CpuIcon },
    { name: "WLED Manager", path: "/wled-manager", icon: Activity },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-2 flex items-center">
          <AboutDialog
            trigger={
              <img 
                src={iconPath}
                alt="PLYNK-IO" 
                className="h-10 w-10 hover:drop-shadow-lg transition-all duration-200 cursor-pointer hover:scale-110"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
                }}
              />
            }
          />
        </div>
        <NavigationMenu className="flex-1">
          <NavigationMenuList>
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              return (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink asChild>
                    <Link 
                      to={item.path}
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-50",
                        isActive 
                          ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600" 
                          : navigationMenuTriggerStyle()
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="ml-auto flex items-center space-x-2">
          <img 
            src="/beer.png" 
            alt="Buy me a beer" 
            className="h-10 w-10 hover:drop-shadow-lg transition-all duration-200 cursor-pointer hover:scale-110 object-contain"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.3))'
            }}
            onClick={() => handleExternalLink('https://buymeacoffee.com/ctrl_alt_paul')}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Github 
                className={cn(
                  "h-10 w-10 p-2 hover:drop-shadow-lg transition-all duration-200 cursor-pointer hover:scale-110",
                  getGitHubIconColor()
                )}
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
                }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg">
              {!isAuthenticated ? (
                <DropdownMenuItem className="cursor-pointer">
                  <Github className="mr-2 h-4 w-4" />
                  Connect GitHub
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={handleViewRepositories}
                    className="cursor-pointer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View My Repositories
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                    Disconnect GitHub
                  </DropdownMenuItem>
                  {user && (
                    <div className="px-2 py-1 text-xs text-gray-500 border-t">
                      Connected as {user.login}
                    </div>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            onClick={() => setShowAbout(true)}
            className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))'
            }}
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
        </div>
      </div>
      
      <AboutDialog
        trigger={<div />}
        open={showAbout}
        onOpenChange={setShowAbout}
      />
    </div>
  );
}
