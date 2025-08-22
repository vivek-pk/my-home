'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ProjectUpdate } from '@/lib/models/Project';

interface UpdatesHistoryProps {
  projectId: string;
  showPhaseInfo?: boolean;
  maxUpdates?: number;
  className?: string;
  refreshTrigger?: number; // Add refresh trigger prop
  currentUser?: { id: string; role: string; name: string } | null; // Add user prop
}

interface UpdateWithPhase extends ProjectUpdate {
  phaseId?: string;
  phaseName?: string;
}

export function UpdatesHistory({
  projectId,
  showPhaseInfo = true,
  maxUpdates,
  className = '',
  refreshTrigger, // Add refresh trigger prop
  currentUser, // Add current user prop
}: UpdatesHistoryProps) {
  const [updates, setUpdates] = useState<UpdateWithPhase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [deletingUpdate, setDeletingUpdate] = useState<string | null>(null);

  const fetchUpdates = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/updates`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch updates');
      }

      const displayUpdates = maxUpdates
        ? data.updates.slice(0, maxUpdates)
        : data.updates;

      setUpdates(displayUpdates);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load updates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUpdates = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/projects/${projectId}/updates`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch updates');
        }

        const displayUpdates = maxUpdates
          ? data.updates.slice(0, maxUpdates)
          : data.updates;

        setUpdates(displayUpdates);
        setLastRefresh(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load updates');
      } finally {
        setIsLoading(false);
      }
    };

    loadUpdates();
  }, [projectId, maxUpdates, refreshTrigger]); // Add refreshTrigger to dependencies

  const handleRefresh = () => {
    fetchUpdates();
  };

  const handleDeleteUpdate = async (updateId: string, phaseId: string) => {
    if (!updateId || !phaseId) return;

    if (
      !confirm(
        'Are you sure you want to delete this update? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingUpdate(updateId);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/updates?phaseId=${phaseId}&updateId=${updateId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete update');
      }

      // Refresh the updates list
      await fetchUpdates();
    } catch (err) {
      console.error('Delete update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete update');
    } finally {
      setDeletingUpdate(null);
    }
  };

  // Check if user can delete an update (admin or update author)
  const canDeleteUpdate = (update: UpdateWithPhase): boolean => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || update.userId === currentUser.id;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Project Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Project Updates</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Recent activity and progress updates
          {lastRefresh && (
            <span className="text-xs block mt-1">
              Last updated: {format(lastRefresh, 'MMM d, h:mm a')}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && updates.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No updates yet</p>
            <p className="text-sm text-muted-foreground">
              Updates will appear here as work progresses
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div
                key={update._id || index}
                className="border border-border/50 rounded-lg p-4 bg-muted/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {update.userName}
                    </span>
                    {showPhaseInfo && update.phaseName && (
                      <Badge variant="outline" className="text-xs">
                        {update.phaseName}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(update.createdAt), 'MMM d, h:mm a')}
                    </span>
                    {canDeleteUpdate(update) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                        onClick={() =>
                          handleDeleteUpdate(update._id!, update.phaseId!)
                        }
                        disabled={deletingUpdate === update._id}
                      >
                        {deletingUpdate === update._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{update.message}</p>
                {update.images && update.images.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    📷 {update.images.length} image(s) attached
                  </div>
                )}
              </div>
            ))}
            {maxUpdates && updates.length >= maxUpdates && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/dashboard/projects/${projectId}/timeline`)
                  }
                >
                  View All Updates
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
