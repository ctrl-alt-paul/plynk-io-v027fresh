
import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommunityProfilesList } from '@/components/community/CommunityProfilesList';
import { CommunityProfileDialog } from '@/components/community/CommunityProfileDialog';
import { GitHubCommunityService } from '@/services/githubCommunityService';
import { useGitHubAuth } from '@/state/githubAuthStore';
import { toast } from 'sonner';
import { 
  CommunityIssue, 
  CommunityProfile, 
  CommunityProfileFilters 
} from '@/types/communityProfiles';

export default function CommunityProfiles() {
  const { isAuthenticated } = useGitHubAuth();
  const [profiles, setProfiles] = useState<CommunityIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CommunityProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const [filters, setFilters] = useState<CommunityProfileFilters>({
    search: '',
    emulator: 'all',
    sortBy: 'recent'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated]);

  const loadProfiles = async () => {
    if (!isAuthenticated) {
      toast.error('Please connect to GitHub to view community profiles');
      return;
    }

    setLoading(true);
    try {
      const result = await GitHubCommunityService.listCommunityProfiles({
        page: 1,
        per_page: 50,
        labels: 'memory-profile',
        state: 'open',
        sort: 'created',
        direction: 'desc'
      });

      if (result.success && result.issues) {
        setProfiles(result.issues);
      } else {
        toast.error(result.error || 'Failed to load community profiles');
      }
    } catch (error) {
      console.error('Error loading community profiles:', error);
      toast.error('Failed to load community profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (issueNumber: number) => {
    setLoading(true);
    try {
      const result = await GitHubCommunityService.getCommunityProfile(issueNumber);
      
      if (result.success && result.profile) {
        setSelectedProfile(result.profile);
        setShowProfileDialog(true);
      } else {
        toast.error(result.error || 'Failed to load profile details');
      }
    } catch (error) {
      console.error('Error loading profile details:', error);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = GitHubCommunityService.filterProfiles(profiles, filters);
  const sortedProfiles = GitHubCommunityService.sortProfiles(filteredProfiles, filters.sortBy);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Community Profiles</h1>
          <p className="text-muted-foreground mb-6">
            Connect to GitHub to access community-shared memory profiles
          </p>
          <Button onClick={() => toast.info('Use the GitHub button in the top navigation to connect')}>
            Connect to GitHub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Community Profiles
          </h1>
          <p className="text-muted-foreground">
            Browse and download memory profiles shared by the community
          </p>
        </div>
        
        <Button onClick={loadProfiles} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search profiles..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-sm"
          />
        </div>
        
        <Select 
          value={filters.emulator} 
          onValueChange={(value) => setFilters({ ...filters, emulator: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emulators</SelectItem>
            <SelectItem value="teknoparrot">Teknoparrot</SelectItem>
            <SelectItem value="mame">MAME</SelectItem>
            <SelectItem value="model2">Model 2</SelectItem>
            <SelectItem value="supermodel3">Supermodel 3</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.sortBy} 
          onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="verified">Most Verified</SelectItem>
            <SelectItem value="partial">Partially Working</SelectItem>
            <SelectItem value="broken">Needs Fixes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Profiles List */}
      <CommunityProfilesList
        profiles={sortedProfiles}
        loading={loading}
        onProfileSelect={handleProfileSelect}
      />

      {/* Profile Detail Dialog */}
      {selectedProfile && (
        <CommunityProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          profile={selectedProfile}
        />
      )}
    </div>
  );
}
