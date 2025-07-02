
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CommunityProfileCard } from './CommunityProfileCard';
import { CommunityProfileDialog } from './CommunityProfileDialog';
import { Search, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GitHubCommunityService } from '@/services/githubCommunityService';
import { CommunityProfileImporter } from '@/lib/communityProfileImporter';
import {
  CommunityIssue,
  CommunityProfile,
  CommunityProfileFilters
} from '@/types/communityProfiles';

export const CommunityProfilesList: React.FC = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<CommunityIssue[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<CommunityIssue[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CommunityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  const [filters, setFilters] = useState<CommunityProfileFilters>({
    search: '',
    emulator: 'all',
    sortBy: 'recent'
  });

  // Check GitHub connection status
  useEffect(() => {
    const checkConnection = () => {
      const token = localStorage.getItem('github_auth_token');
      setIsConnected(!!token);
    };

    checkConnection();
    
    // Listen for storage changes to detect auth status changes
    const handleStorageChange = () => checkConnection();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load profiles on mount and when connected
  useEffect(() => {
    if (isConnected) {
      loadProfiles();
    }
  }, [isConnected]);

  // Apply filters whenever profiles or filters change
  useEffect(() => {
    let filtered = GitHubCommunityService.filterProfiles(profiles, filters);
    filtered = GitHubCommunityService.sortProfiles(filtered, filters.sortBy);
    setFilteredProfiles(filtered);
  }, [profiles, filters]);

  const loadProfiles = async (page = 1, append = false) => {
    if (!isConnected) {
      toast({
        title: "GitHub Connection Required",
        description: "Please connect to GitHub to access community profiles.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await GitHubCommunityService.listCommunityProfiles({
        page,
        per_page: 20,
        labels: 'memory-profile',
        state: 'open',
        sort: 'created',
        direction: 'desc'
      });

      if (result.success && result.issues) {
        if (append) {
          setProfiles(prev => [...prev, ...result.issues!]);
        } else {
          setProfiles(result.issues);
        }
        setHasMorePages(result.issues.length === 20);
        setCurrentPage(page);
      } else {
        throw new Error(result.error || 'Failed to load community profiles');
      }
    } catch (error) {
      console.error('Error loading community profiles:', error);
      toast({
        title: "Error Loading Profiles",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = async (issueNumber: number) => {
    setIsLoading(true);
    try {
      const result = await GitHubCommunityService.getCommunityProfile(issueNumber);
      
      if (result.success && result.profile) {
        setSelectedProfile(result.profile);
        setShowDialog(true);
      } else {
        throw new Error(result.error || 'Failed to load profile details');
      }
    } catch (error) {
      console.error('Error loading profile details:', error);
      toast({
        title: "Error Loading Profile",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProfile = async (issueNumber?: number) => {
    if (!selectedProfile && !issueNumber) return;

    setIsImporting(true);
    try {
      let profileToImport: CommunityProfile;

      if (issueNumber && !selectedProfile) {
        // Load profile first if importing directly from card
        const result = await GitHubCommunityService.getCommunityProfile(issueNumber);
        if (!result.success || !result.profile) {
          throw new Error(result.error || 'Failed to load profile');
        }
        profileToImport = result.profile;
      } else {
        profileToImport = selectedProfile!;
      }

      // Extract and import the profile
      const profileJson = GitHubCommunityService.extractProfileJson(profileToImport.issue.body);
      
      if (!profileJson) {
        throw new Error('No valid profile data found in this submission');
      }

      const result = await CommunityProfileImporter.importProfile(
        profileJson,
        profileToImport.gameName
      );

      if (result.success) {
        toast({
          title: "Profile Imported",
          description: `"${profileToImport.gameName}" has been imported successfully.`
        });
        setShowDialog(false);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing profile:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMorePages && !isLoading) {
      loadProfiles(currentPage + 1, true);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">GitHub Connection Required</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect to GitHub to browse and import community memory profiles.
          </p>
          <Button onClick={() => window.location.reload()}>
            Check Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-500" />
          <h2 className="text-2xl font-bold">Community Profiles</h2>
          <Badge variant="secondary">{profiles.length} profiles</Badge>
        </div>
        <Button
          onClick={() => loadProfiles(1)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.emulator}
              onValueChange={(value) => setFilters(prev => ({ ...prev, emulator: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Emulator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emulators</SelectItem>
                <SelectItem value="mame">MAME</SelectItem>
                <SelectItem value="model3">Model 3</SelectItem>
                <SelectItem value="supermodel">Supermodel</SelectItem>
                <SelectItem value="teknoparrot">TeknoParrot</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="verified">Most Verified</SelectItem>
                <SelectItem value="partial">Partially Working</SelectItem>
                <SelectItem value="broken">Reported Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      {isLoading && profiles.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProfiles.map((issue) => (
            <CommunityProfileCard
              key={issue.number}
              issue={issue}
              onView={handleViewProfile}
              onImport={(issueNumber) => handleImportProfile(issueNumber)}
              isLoading={isLoading}
            />
          ))}

          {filteredProfiles.length === 0 && profiles.length > 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No profiles match your current filters.</p>
              </CardContent>
            </Card>
          )}

          {hasMorePages && (
            <div className="flex justify-center py-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Profile Detail Dialog */}
      <CommunityProfileDialog
        profile={selectedProfile}
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
          setSelectedProfile(null);
        }}
        onImport={() => handleImportProfile()}
        isImporting={isImporting}
      />
    </div>
  );
};
