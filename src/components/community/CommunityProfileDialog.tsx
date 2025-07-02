
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, ExternalLink, User, Calendar, Clock, Cpu } from 'lucide-react';
import { CommunityProfile } from '@/types/communityProfiles';

interface CommunityProfileDialogProps {
  profile: CommunityProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  isImporting?: boolean;
}

export const CommunityProfileDialog: React.FC<CommunityProfileDialogProps> = ({
  profile,
  isOpen,
  onClose,
  onImport,
  isImporting = false
}) => {
  if (!profile) return null;

  const handleExternalLink = () => {
    if (window.electron && profile.issue.html_url) {
      window.electron.openExternal(profile.issue.html_url);
    }
  };

  const getTotalVotes = () => {
    return profile.voteCounts.verified + profile.voteCounts.partiallyWorking + profile.voteCounts.notWorking;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl pr-8">
              {profile.gameName}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExternalLink}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                GitHub
              </Button>
              <Button
                onClick={onImport}
                disabled={isImporting}
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                {isImporting ? 'Importing...' : 'Import Profile'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Game Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Game Version</p>
                <p className="text-sm">{profile.gameVersion}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Emulator</p>
                <p className="text-sm">{profile.emulator}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Process</p>
                <p className="text-sm">{profile.process}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Poll Interval</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <p className="text-sm">{profile.pollInterval}ms</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Submission Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Submitted by {profile.issue.user.login}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{new Date(profile.issue.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Vote Summary */}
            {getTotalVotes() > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Community Feedback ({getTotalVotes()} votes)</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">✅ Verified ({profile.voteCounts.verified})</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">🟡 Partially Working ({profile.voteCounts.partiallyWorking})</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">❌ Not Working ({profile.voteCounts.notWorking})</Badge>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {profile.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              </>
            )}

            {/* Memory Addresses */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <h4 className="font-medium">Memory Addresses ({profile.memoryAddresses.length})</h4>
              </div>
              
              {profile.memoryAddresses.length > 0 ? (
                <div className="space-y-2">
                  {profile.memoryAddresses.map((addr, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{addr.label}</h5>
                        <Badge variant="outline" className="text-xs">
                          {addr.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Address:</span> {addr.address}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {addr.addressType}
                        </div>
                      </div>
                      {addr.notes && (
                        <p className="text-xs text-muted-foreground">{addr.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No memory addresses defined.</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
