
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { TagSelector } from "@/components/TagSelector";
import { GitHubSubmissionService } from '@/services/githubSubmission';
import { MemoryProfile } from '@/types/memoryProfiles';

interface MemoryProfileSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: MemoryProfile;
  process?: string;
  pollInterval: number;
  userOutputs: any[];
}

export function MemoryProfileSubmissionDialog({
  open,
  onOpenChange,
  profile,
  process,
  pollInterval,
  userOutputs
}: MemoryProfileSubmissionDialogProps) {
  const [title, setTitle] = useState(profile?.fileName || '');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!title) {
      toast.error('Title is required');
      return false;
    }
    if (!description) {
      toast.error('Description is required');
      return false;
    }
    if (selectedTags.length === 0) {
      toast.error('At least one tag must be selected');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Create a complete MemoryProfile object with all required properties
      const profileToSubmit: MemoryProfile = profile || {
        id: `${title.replace(/\s+/g, '_')}.json`,
        fileName: `${title.replace(/\s+/g, '_')}.json`,
        process: process || '',
        pollInterval: pollInterval,
        outputs: userOutputs.map(output => ({
          ...output,
          source: 'user' as const
        })),
        lastModified: Date.now(),
        outputCount: userOutputs.length,
        memoryProfileType: 'user' as const
      };

      const result = await GitHubSubmissionService.submitProfile({
        title,
        description,
        profile: profileToSubmit,
        tags: selectedTags
      });

      if (result.success) {
        toast.success('Memory profile submitted successfully!');
        onOpenChange(false);
        
        // Reset form
        setTitle('');
        setDescription('');
        setSelectedTags([]);
      } else {
        toast.error(result.error || 'Failed to submit profile');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit to Community</DialogTitle>
          <DialogDescription>
            Share your memory profile with the community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagSelector onChange={setSelectedTags} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
