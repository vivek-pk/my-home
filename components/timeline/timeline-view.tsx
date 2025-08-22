'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, ProjectPhase } from '@/lib/models/Project';
import { AddUpdateDialog } from './add-update-dialog';
import { MaterialsDialog } from './materials-dialog';

interface TimelineViewProps {
  project: Project;
  canEdit?: boolean;
  onUpdate?: () => void;
}

function getPhaseStatus(phase: ProjectPhase) {
  const now = new Date();
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);

  if (phase.status === 'completed') return 'completed';
  if (phase.status === 'delayed') return 'delayed';
  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'overdue';
  if (phase.status === 'in-progress') return 'active';
  return 'pending';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'active':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'delayed':
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'upcoming':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'active':
      return <Clock className="h-4 w-4" />;
    case 'delayed':
    case 'overdue':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
}

function TimelineView({
  project,
  canEdit = false,
  onUpdate,
}: TimelineViewProps) {
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showMaterialsDialog, setShowMaterialsDialog] = useState(false);

  const completedPhases = project.timeline.filter(
    (phase) => phase.status === 'completed'
  ).length;
  const totalPhases = project.timeline.length;
  const overallProgress =
    totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  const handleAddUpdate = (phase: ProjectPhase) => {
    setSelectedPhase(phase);
    setShowUpdateDialog(true);
  };

  const handleManageMaterials = (phase: ProjectPhase) => {
    setSelectedPhase(phase);
    setShowMaterialsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Project Progress
            <Badge variant="outline">
              {completedPhases} of {totalPhases} phases completed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {project.timeline.map((phase, index) => {
          const status = getPhaseStatus(phase);
          const duration = differenceInDays(
            new Date(phase.endDate),
            new Date(phase.startDate)
          );
          const isLast = index === project.timeline.length - 1;

          return (
            <div key={phase._id || index} className="relative">
              {/* Timeline connector */}
              {!isLast && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-border" />
              )}

              <Card
                className={cn(
                  'transition-all hover:shadow-md',
                  status === 'active' && 'ring-2 ring-primary/20'
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          'p-2 rounded-full border',
                          getStatusColor(status)
                        )}
                      >
                        {getStatusIcon(status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{phase.name}</CardTitle>
                        <CardDescription>{phase.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Phase Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Start:{' '}
                        {format(new Date(phase.startDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        End: {format(new Date(phase.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {duration} days</span>
                    </div>
                  </div>

                  {/* Materials */}
                  {phase.materials && phase.materials.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Materials</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {phase.materials.slice(0, 4).map((material, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm bg-muted/50 p-2 rounded"
                          >
                            <span>{material.name}</span>
                            <span>
                              {material.quantity} {material.unit}
                            </span>
                          </div>
                        ))}
                        {phase.materials.length > 4 && (
                          <div className="text-sm text-muted-foreground">
                            +{phase.materials.length - 4} more materials
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Updates */}
                  {phase.updates && phase.updates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recent Updates</h4>
                      <div className="space-y-2">
                        {phase.updates.slice(-2).map((update, idx) => (
                          <div
                            key={idx}
                            className="bg-muted/50 p-3 rounded text-sm"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">
                                {update.userName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(update.createdAt),
                                  'MMM d, h:mm a'
                                )}
                              </span>
                            </div>
                            <p>{update.message}</p>
                          </div>
                        ))}
                        {phase.updates.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            +{phase.updates.length - 2} more updates
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddUpdate(phase)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Add Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageMaterials(phase)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Manage Materials
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      {selectedPhase && (
        <>
          <AddUpdateDialog
            isOpen={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            projectId={project._id!}
            phase={selectedPhase}
            onUpdateAdded={() => {
              setShowUpdateDialog(false);
              onUpdate?.();
            }}
          />
          <MaterialsDialog
            open={showMaterialsDialog}
            onOpenChange={setShowMaterialsDialog}
            projectId={project._id!}
            phase={selectedPhase}
            onSuccess={() => {
              setShowMaterialsDialog(false);
              onUpdate?.();
            }}
          />
        </>
      )}
    </div>
  );
}

export { TimelineView };
export default TimelineView;
