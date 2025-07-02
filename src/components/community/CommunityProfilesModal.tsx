
import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CommunityProfilesList } from './CommunityProfilesList';
import { MemoryProfile } from '@/types/memoryProfiles';
import { profileStorage } from '@/lib/profileStorage';
import { toast } from 'sonner';

interface CommunityProfilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileImport?: (profile: MemoryProfile) => void;
}

export function CommunityProfilesModal({ 
  open, 
  onOpenChange, 
  onProfileImport 
}: CommunityProfilesModalProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Save scroll position when closing
  useEffect(() => {
    if (!open && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [open, scrollPosition]);

  // Save scroll position when opening
  useEffect(() => {
    if (open) {
      setScrollPosition(window.scrollY);
    }
  }, [open]);

  const handleProfileImport = async (profile: MemoryProfile) => {
    try {
      // Generate filename with date suffix for conflict resolution
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let fileName = profile.fileName;
      
      // Check if file exists and add timestamp suffix if needed
      const existingProfile = await profileStorage.getMemoryProfile(fileName);
      if (existingProfile) {
        const nameWithoutExt = fileName.replace('.json', '');
        fileName = `${nameWithoutExt}_${timestamp}.json`;
      }

      // Create the profile object with required properties
      const profileToSave = {
        ...profile,
        id: fileName,
        fileName,
        lastModified: Date.now(),
        outputCount: profile.outputs.length,
        memoryProfileType: 'community' as const
      };

      // Save to community profiles directory
      const result = await profileStorage.saveMemoryProfile(fileName, profileToSave);
      
      if (result.success) {
        toast.success(`Community profile "${profile.fileName}" imported successfully${fileName !== profile.fileName ? ` as "${fileName}"` : ''}`);
        onProfileImport?.(profileToSave);
        onOpenChange(false);
      } else {
        toast.error(`Failed to import profile: ${result.error}`);
      }
    } catch (error) {
      console.error('Error importing community profile:', error);
      toast.error('Failed to import community profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div>
              <h2 className="text-2xl font-bold">Community Memory Profiles</h2>
              <p className="text-muted-foreground mt-1">
                Browse and import memory profiles created by the community
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <CommunityProfilesList 
              onProfileImport={handleProfileImport}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
