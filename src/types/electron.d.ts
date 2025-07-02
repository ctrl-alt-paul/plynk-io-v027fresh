
export interface Process {
  name: string;
  pid: number;
  cmd: string;
}

declare global {
  interface Window {
    electron?: {
      openExternal?: (url: string) => void;
      closeAllWindows?: () => void;
      minimizeAllWindows?: () => void;
      unmaximizeAllWindows?: () => void;
      maximizeAllWindows?: () => void;
      restoreAllWindows?: () => void;
      isAnyWindowMaximized?: () => boolean;
      getAppVersion?: () => string;
      selectFolder?: () => Promise<string | undefined>;
      showContextMenu?: (menuItems: any[]) => void;
      getScreenDimensions?: () => { width: number; height: number };
      readMemory?: (processName: string, address: string, type: string, useModuleOffset: boolean, moduleName: string, offset: string, customSize?: number) => Promise<number | null>;
      openProfileFile?: () => Promise<any>;
      saveProfileFile?: (profileData: any) => Promise<void>;
      openMessageProfileFile?: () => Promise<any>;
      saveMessageProfileFile?: (profileData: any) => Promise<void>;
      startDeviceListener?: (profileName: string) => Promise<any>;
      stopDeviceListener?: () => Promise<any>;
      listSerialPorts?: () => Promise<any>;
      sendMessageToPort?: (portName: string, message: string) => Promise<any>;
      getProcesses?: () => Promise<Process[]>;
      githubStartDeviceFlow?: () => Promise<{ success: boolean; data?: any; error?: string }>;
      githubPollForToken?: (deviceCode: string) => Promise<{ success: boolean; token?: string; error?: string; pending?: boolean }>;
      githubValidateToken?: (token: string) => Promise<{ success: boolean; user?: any; error?: string }>;
      githubCreateIssue?: (owner: string, repo: string, issueData: any, token: string) => Promise<{ success: boolean; issueUrl?: string; issueNumber?: number; error?: string }>;
      githubValidateLabels?: (owner: string, repo: string, labels: string[], token: string) => Promise<{ success: boolean; error?: string; missingLabels?: string[] }>;
      
      // Device methods
      getPacDriveStatus?: () => Promise<any>;
      listHidDevices?: () => Promise<any[]>;
      getWLEDDeviceInfo?: (ipAddress: string) => Promise<any>;
      getWLEDDeviceState?: (ipAddress: string) => Promise<any>;
      testOutputDispatch?: (output: any) => Promise<{ success: boolean; error?: string }>;
      
      // Profile methods
      getGameProfile?: (profileName: string) => Promise<{ success: boolean; profile?: any; error?: string }>;
      getGameProfiles?: () => Promise<{ success: boolean; profiles?: string[]; error?: string }>;
      getMemoryProfile?: (fileName: string) => Promise<{ success: boolean; profile?: any; error?: string }>;
      
      // Logging methods
      getMasterLoggingConfig?: () => Promise<any>;
      
      // Platform property
      platform?: NodeJS.Platform;
      
      // IPC Renderer for direct IPC communication
      ipcRenderer?: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        removeListener: (channel: string, listener: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

export {};
