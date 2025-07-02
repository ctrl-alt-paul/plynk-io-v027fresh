
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { MainNav } from "./components/MainNav";
import { LoadingSpinner } from "./components/LoadingSpinner";
import MemoryManager from "./renderer/pages/MemoryManager";
import DeviceManager from "./renderer/pages/DeviceManager";
import GameManager from "./renderer/pages/GameManager";
import Dashboard from "./renderer/pages/Dashboard";
import MessageProfileBuilder from "./renderer/pages/MessageProfileBuilder";
import Log from "./renderer/pages/Log";
import MessageMonitor from "./renderer/pages/MessageMonitor";
import WLEDManager from "./renderer/pages/WLEDManager";
import { useForceRepaint } from "./hooks/useForceRepaint";
import { ProfileNavigationProvider } from "./hooks/useProfileNavigation";
import WLEDProfiles from "./renderer/pages/WLEDProfiles";
import { DevToolsLogListener } from "./components/DevToolsLogListener";
import { LogProvider } from "./contexts/LogContext";
import { MonitorControlsProvider } from "./contexts/MonitorControlsContext";
import { MessageAttachmentProvider } from "./contexts/MessageAttachmentContext";

function App() {
  useForceRepaint();

  return (
    <TooltipProvider>
      <LogProvider>
        <MonitorControlsProvider>
          <MessageAttachmentProvider>
            <ProfileNavigationProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <MainNav />
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/memory-manager" element={<MemoryManager />} />
                      <Route path="/game-manager" element={<GameManager />} />
                      <Route path="/message-monitor" element={<MessageMonitor />} />
                      <Route path="/device-manager" element={<DeviceManager />} />
                      <Route path="/wled-manager" element={<WLEDManager />} />
                      <Route path="/message-profile-builder" element={<MessageProfileBuilder />} />
                      <Route path="/wled-profiles" element={<WLEDProfiles />} />
                      <Route path="/log" element={<Log />} />
                    </Routes>
                  </Suspense>
                  <DevToolsLogListener />
                </div>
              </BrowserRouter>
            </ProfileNavigationProvider>
          </MessageAttachmentProvider>
        </MonitorControlsProvider>
      </LogProvider>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App;
