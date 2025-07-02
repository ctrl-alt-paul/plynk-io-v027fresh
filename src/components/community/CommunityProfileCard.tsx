
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, User, Calendar } from 'lucide-react';
import { CommunityIssue } from '@/types/communityProfiles';

interface CommunityProfileCardProps {
  issue: CommunityIssue;
  onView: (issueNumber: number) => void;
  onImport: (issueNumber: number) => void;
  isLoading?: boolean;
}

export const CommunityProfileCard: React.FC<CommunityProfileCardProps> = ({
  issue,
  onView,
  onImport,
  isLoading = false
}) => {
  const getEmulator = () => {
    const emulatorLabels = ['mame', 'model3', 'supermodel', 'teknoparrot', 'demul'];
    return issue.labels.find(label => 
      emulatorLabels.some(emu => label.toLowerCase().includes(emu))
    ) || 'Unknown';
  };

  const getStatus = () => {
    if (issue.labels.includes('verified')) return { label: 'Verified', variant: 'default' as const };
    if (issue.labels.includes('pending-verify')) return { label: 'Pending', variant: 'secondary' as const };
    return { label: 'Unknown', variant: 'outline' as const };
  };

  const status = getStatus();
  const emulator = getEmulator();

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {issue.title}
          </CardTitle>
          <div className="flex gap-2 ml-4">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant="outline">{emulator}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{issue.user.login}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(issue.number)}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onImport(issue.number)}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-1" />
              Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
