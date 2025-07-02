
export interface CommunityIssue {
  number: number;
  title: string;
  labels: string[];
  created_at: string;
  user: {
    login: string;
  };
}

export interface CommunityIssueDetail extends CommunityIssue {
  body: string;
  html_url: string;
}

export interface CommunityComment {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
  };
}

export interface CommunityVote {
  username: string;
  vote: '✅' | '🟡' | '❌';
  comment: string;
  date: string;
}

export interface CommunityProfile {
  issue: CommunityIssueDetail;
  gameName: string;
  gameVersion: string;
  emulator: string;
  process: string;
  pollInterval: number;
  description: string;
  memoryAddresses: CommunityMemoryAddress[];
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
}

export interface CommunityMemoryAddress {
  label: string;
  address: string;
  type: string;
  addressType: 'Module and Offset' | 'Absolute Address';
  notes: string;
  bitmask?: string;
  bitwiseOp?: string;
}

export interface CommunityProfileFilters {
  search: string;
  emulator: 'all' | string;
  sortBy: 'recent' | 'verified' | 'partial' | 'broken';
}

export interface CommunityProfileListOptions {
  page: number;
  per_page: number;
  labels: string;
  state: string;
  sort: string;
  direction: string;
}
