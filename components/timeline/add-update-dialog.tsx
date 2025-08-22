'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/upload/file-upload';
import { Loader2 } from 'lucide-react';
import type { ProjectPhase } from '@/lib/models/Project';
import type { UploadedFile } from '@/components/upload/file-upload';

interface AddUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  phase: ProjectPhase;
  onUpdateAdded: () => void;
}

export function AddUpdateDialog({
  isOpen,
  onOpenChange,
  projectId,
  phase,
  onUpdateAdded,
}: AddUpdateDialogProps) {
  const [message, setMessage] = useState('');
  const [phaseStatus, setPhaseStatus] = useState(phase.status);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Allow submission if there's a message OR if status has changed
    const hasMessage = message.trim().length > 0;
    const statusChanged = phaseStatus !== phase.status;

    if (!hasMessage && !statusChanged) {
      setError('Please provide an update message or change the phase status');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          phaseId: phase._id || '',
          phaseStatus: phaseStatus, // Fix: use phaseStatus instead of status
          images: uploadedFiles, // Send the already uploaded files
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add update');
      }

      setMessage('');
      setUploadedFiles([]);
      setPhaseStatus(phase.status);
      onOpenChange(false);
      onUpdateAdded();
    } catch (error) {
      console.error('Error adding update:', error);
      setError(error instanceof Error ? error.message : 'Failed to add update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Progress Update</DialogTitle>
          <DialogDescription>
            Add an update for the &quot;{phase.name}&quot; phase
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Phase Status</Label>
            <Select
              value={phaseStatus}
              onValueChange={(
                val: 'pending' | 'in-progress' | 'completed' | 'delayed'
              ) => setPhaseStatus(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Update Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the progress, issues, or completion status... (optional if just changing status)"
              rows={3}
              className="min-h-[80px] max-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Images (optional)</Label>
            <div className="max-h-[200px] overflow-y-auto">
              <FileUpload
                onUpload={setUploadedFiles}
                maxFiles={5}
                accept="image"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Update...
                </>
              ) : (
                'Add Update'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
