'use client';

import { useState } from 'react';
import { TimelineView } from './timeline-view';
import { UpdatesHistory } from './updates-history';
import type { Project } from '@/lib/models/Project';

interface TimelinePageWrapperProps {
  initialProject: Project;
  canEdit?: boolean;
  currentUser?: { id: string; role: string; name: string } | null;
}

export function TimelinePageWrapper({
  initialProject,
  canEdit = false,
  currentUser,
}: TimelinePageWrapperProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshProject = async () => {
    if (!project._id) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setRefreshCounter((prev) => prev + 1); // Trigger updates refresh
      }
    } catch (error) {
      console.error('Failed to refresh project:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        {isRefreshing && (
          <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 text-blue-800 text-center py-2 z-10 rounded">
            Refreshing timeline...
          </div>
        )}
        <TimelineView
          project={project}
          canEdit={canEdit}
          onUpdate={refreshProject}
        />
      </div>

      {/* Add UpdatesHistory component to timeline pages */}
      <UpdatesHistory
        projectId={project._id!}
        showPhaseInfo={true}
        refreshTrigger={refreshCounter}
        currentUser={currentUser}
      />
    </div>
  );
}
