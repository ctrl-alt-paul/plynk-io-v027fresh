
import { MemoryProfile } from '@/types/memoryProfiles';
import { toast } from '@/hooks/use-toast';

export class CommunityProfileImporter {
  static async importProfile(profile: MemoryProfile, originalGameName: string): Promise<{
    success: boolean;
    fileName?: string;
    error?: string;
  }> {
    try {
      if (!window.electron) {
        throw new Error('Electron API not available');
      }

      // Generate filename based on game name
      const baseFileName = this.sanitizeFileName(originalGameName);
      let fileName = `${baseFileName}.json`;

      // Check if file exists and add date suffix if needed
      const existingProfiles = await window.electron.listMemoryProfiles();
      
      if (existingProfiles.success && existingProfiles.profiles) {
        const communityProfiles = existingProfiles.profiles.filter(p => 
          p.startsWith(baseFileName)
        );

        if (communityProfiles.length > 0) {
          const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          fileName = `${baseFileName}-${dateString}.json`;
        }
      }

      // Prepare profile data for saving
      const profileData = {
        ...profile,
        fileName,
        id: fileName,
        memoryProfileType: 'community' as const,
        lastModified: Date.now()
      };

      // Save to community profiles directory
      const result = await window.electron.saveMemoryProfile(
        `community/${fileName}`,
        profileData
      );

      if (result.success) {
        toast({
          title: "Profile Imported",
          description: `Community profile "${originalGameName}" has been imported as "${fileName}"`
        });

        return {
          success: true,
          fileName
        };
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error importing community profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private static sanitizeFileName(name: string): string {
    // Remove invalid characters and replace with underscores
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/-+/g, '_')
      .toLowerCase();
  }

  static async createCommunityProfilesDirectory(): Promise<void> {
    try {
      if (!window.electron) return;

      // Try to list community profiles to ensure directory exists
      await window.electron.listMemoryProfiles();
    } catch (error) {
      console.error('Error creating community profiles directory:', error);
    }
  }
}
