
import { format } from 'date-fns';
import { 
  CommunityProfile, 
  CommunityIssue, 
  CommunityIssueDetail, 
  CommunityComment, 
  CommunityVote,
  CommunityProfileFilters,
  CommunityProfileListOptions,
  CommunityMemoryAddress
} from '@/types/communityProfiles';
import { MemoryProfile } from '@/types/memoryProfiles';

// GitHub repository configuration
const GITHUB_OWNER = 'ctrl-alt-paul';
const GITHUB_REPO = 'plynk-io-v027fresh';

export class GitHubCommunityService {
  private static getStoredToken(): string | null {
    const encrypted = localStorage.getItem('github_auth_token');
    if (!encrypted) return null;
    
    try {
      const decoded = atob(encrypted);
      return decoded.replace('_plynk_salt', '');
    } catch {
      return null;
    }
  }

  static async listCommunityProfiles(options: CommunityProfileListOptions): Promise<{
    success: boolean;
    issues?: CommunityIssue[];
    error?: string;
  }> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        throw new Error('No GitHub token found. Please connect to GitHub.');
      }

      if (!window.electron) {
        throw new Error('Electron API not available');
      }

      const result = await window.electron.githubListIssues(
        GITHUB_OWNER, 
        GITHUB_REPO, 
        options, 
        token
      );

      return result;
    } catch (error) {
      console.error('Error listing community profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getCommunityProfile(issueNumber: number): Promise<{
    success: boolean;
    profile?: CommunityProfile;
    error?: string;
  }> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        throw new Error('No GitHub token found. Please connect to GitHub.');
      }

      if (!window.electron) {
        throw new Error('Electron API not available');
      }

      // Get issue details
      const issueResult = await window.electron.githubGetIssue(
        GITHUB_OWNER,
        GITHUB_REPO,
        issueNumber,
        token
      );

      if (!issueResult.success || !issueResult.issue) {
        return {
          success: false,
          error: issueResult.error || 'Failed to fetch issue'
        };
      }

      // Get issue comments for votes
      const commentsResult = await window.electron.githubListComments(
        GITHUB_OWNER,
        GITHUB_REPO,
        issueNumber,
        token
      );

      if (!commentsResult.success) {
        return {
          success: false,
          error: commentsResult.error || 'Failed to fetch comments'
        };
      }

      // Parse the issue body to extract profile data
      const profileData = this.parseIssueBody(issueResult.issue.body);
      const votes = this.parseVotes(commentsResult.comments || []);

      const profile: CommunityProfile = {
        issue: issueResult.issue,
        gameName: profileData.gameName,
        gameVersion: profileData.gameVersion,
        emulator: profileData.emulator,
        process: profileData.process,
        pollInterval: profileData.pollInterval,
        description: profileData.description,
        memoryAddresses: profileData.memoryAddresses,
        votes: votes.votes,
        voteCounts: votes.voteCounts
      };

      return {
        success: true,
        profile
      };
    } catch (error) {
      console.error('Error getting community profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private static parseIssueBody(body: string): {
    gameName: string;
    gameVersion: string;
    emulator: string;
    process: string;
    pollInterval: number;
    description: string;
    memoryAddresses: CommunityMemoryAddress[];
  } {
    // Extract game information from markdown
    const gameNameMatch = body.match(/\*\*Game Name:\*\* (.+)/);
    const gameVersionMatch = body.match(/\*\*Game Version:\*\* (.+)/);
    const emulatorMatch = body.match(/\*\*Emulator:\*\* (.+)/);
    const processMatch = body.match(/\*\*Process:\*\* (.+)/);
    const pollIntervalMatch = body.match(/\*\*Poll Interval:\*\* (\d+)ms/);
    const descriptionMatch = body.match(/## Description\n(.+?)\n\n## Memory Addresses/s);

    // Extract JSON profile
    const jsonMatch = body.match(/```json\n([\s\S]+?)\n```/);
    let memoryAddresses: CommunityMemoryAddress[] = [];
    
    if (jsonMatch) {
      try {
        const profileJson = JSON.parse(jsonMatch[1]);
        memoryAddresses = profileJson.outputs?.map((output: any) => ({
          label: output.label,
          address: output.useModuleOffset ? `${output.moduleName} + ${output.offset}` : output.address,
          type: output.type,
          addressType: output.useModuleOffset ? 'Module and Offset' : 'Absolute Address',
          notes: output.notes || '',
          bitmask: output.bitmask,
          bitwiseOp: output.bitwiseOp
        })) || [];
      } catch (error) {
        console.error('Error parsing profile JSON:', error);
      }
    }

    return {
      gameName: gameNameMatch?.[1] || 'Unknown Game',
      gameVersion: gameVersionMatch?.[1] || 'N/A',
      emulator: emulatorMatch?.[1] || 'Unknown',
      process: processMatch?.[1] || 'Unknown',
      pollInterval: parseInt(pollIntervalMatch?.[1] || '16'),
      description: descriptionMatch?.[1]?.trim() || 'No description provided.',
      memoryAddresses
    };
  }

  private static parseVotes(comments: CommunityComment[]): {
    votes: {
      verified: CommunityVote[];
      partiallyWorking: CommunityVote[];
      notWorking: CommunityVote[];
    };
    voteCounts: {
      verified: number;
      partiallyWorking: number;
      notWorking: number;
    };
  } {
    const userVotes = new Map<string, CommunityVote>();

    // Process comments to find votes (only latest vote per user counts)
    comments.forEach(comment => {
      const voteMatch = comment.body.match(/^(✅|🟡|❌)/);
      if (voteMatch) {
        const vote = voteMatch[1] as '✅' | '🟡' | '❌';
        userVotes.set(comment.user.login, {
          username: comment.user.login,
          vote,
          comment: comment.body,
          date: format(new Date(comment.created_at), 'dd MMMM yyyy')
        });
      }
    });

    const votes = Array.from(userVotes.values());
    const verified = votes.filter(v => v.vote === '✅');
    const partiallyWorking = votes.filter(v => v.vote === '🟡');
    const notWorking = votes.filter(v => v.vote === '❌');

    return {
      votes: {
        verified,
        partiallyWorking,
        notWorking
      },
      voteCounts: {
        verified: verified.length,
        partiallyWorking: partiallyWorking.length,
        notWorking: notWorking.length
      }
    };
  }

  static extractProfileJson(issueBody: string): MemoryProfile | null {
    try {
      const jsonMatch = issueBody.match(/```json\n([\s\S]+?)\n```/);
      if (!jsonMatch) return null;

      const profileData = JSON.parse(jsonMatch[1]);
      
      // Convert community profile format to local memory profile format
      return {
        id: `community-${Date.now()}`,
        fileName: `${profileData.process || 'unknown'}.json`,
        process: profileData.process,
        pollInterval: profileData.pollInterval || 16,
        outputs: profileData.outputs || [],
        lastModified: Date.now(),
        outputCount: profileData.outputs?.length || 0,
        memoryProfileType: 'community' as const
      };
    } catch (error) {
      console.error('Error extracting profile JSON:', error);
      return null;
    }
  }

  static formatSubmissionDate(dateString: string): string {
    return format(new Date(dateString), 'dd MMMM yyyy');
  }

  static filterProfiles(profiles: CommunityIssue[], filters: CommunityProfileFilters): CommunityIssue[] {
    let filtered = [...profiles];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.title.toLowerCase().includes(searchTerm)
      );
    }

    // Emulator filter
    if (filters.emulator !== 'all') {
      filtered = filtered.filter(profile => 
        profile.labels.some(label => 
          label.toLowerCase() === filters.emulator.toLowerCase()
        )
      );
    }

    return filtered;
  }

  static sortProfiles(profiles: CommunityIssue[], sortBy: CommunityProfileFilters['sortBy']): CommunityIssue[] {
    const sorted = [...profiles];

    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'verified':
      case 'partial':
      case 'broken':
        // For now, sort by date since we don't have vote counts in the list
        // Vote counts will be loaded when profile details are fetched
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return sorted;
    }
  }
}
