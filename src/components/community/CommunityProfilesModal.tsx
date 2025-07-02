
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CommunityProfilesList } from './CommunityProfilesList';
import { MemoryProfile } from '@/types/memoryProfiles';
import { profileStorage } from '@/lib/profileStorage';
import { toast } from 'sonner';

interface CommunityProfilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileImport: (profile: MemoryProfile) => Promise<void>;
}

export const CommunityProfilesModal: React.FC<CommunityProfilesModalProps> = ({
  open,
  onOpenChange,
  onProfileImport
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Save scroll position when modal opens
  useEffect(() => {
    if (open) {
      setScrollPosition(window.scrollY);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position and allow body scroll when modal closes
      document.body.style.overflow = 'unset';
      window.scrollTo(0, scrollPosition);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, scrollPosition]);

  const handleProfileImport = async (profile: MemoryProfile) => {
    try {
      // Generate a unique filename to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFileName = profile.fileName.replace('.json', '');
      const newFileName = `${baseFileName}-community-${timestamp}.json`;
      
      // Create the community profile with updated metadata
      const communityProfile: MemoryProfile = {
        ...profile,
        id: newFileName,
        fileName: newFileName,
        memoryProfileType: 'community',
        lastModified: Date.now(),
        outputCount: profile.outputs.length
      };

      // Save to community profiles directory
      const result = await profileStorage.saveMemoryProfile(newFileName, communityProfile);
      
      if (result.success) {
        // Import into current session
        await onProfileImport(communityProfile);
        
        toast.success(`Community profile imported as: ${newFileName}`);
      } else {
        throw new Error(result.error || 'Failed to save community profile');
      }
    } catch (error) {
      console.error('Error importing community profile:', error);
      toast.error('Failed to import community profile');
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen m-0 p-0 rounded-none border-none bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h2 className="text-2xl font-bold">Community Memory Profiles</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <CommunityProfilesList onProfileImport={handleProfileImport} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
