'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectFilesSection } from './project-files-section';
import { Loader2, Plus, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UploadedFile } from '@/components/upload/file-upload';

interface User {
  _id: string;
  name: string;
  mobile: string;
  role: string;
}

interface ProjectPhase {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

interface CreateProjectFormProps {
  users?: User[];
  initialData?: {
    _id: string;
    name: string;
    description: string;
    budget?: number;
    status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
    startDate?: string | Date;
    endDate?: string | Date;
    homeownerId: string;
    engineerIds: string[];
    managerIds: string[];
    timeline?: {
      name: string;
      description: string;
      startDate: string | Date;
      endDate: string | Date;
    }[];
    floorPlans?: UploadedFile[];
    images?: UploadedFile[];
  };
  isEditing?: boolean;
}

export function CreateProjectForm({
  users = [],
  initialData,
  isEditing = false,
}: CreateProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [budget, setBudget] = useState(initialData?.budget || '');
  const [status, setStatus] = useState(initialData?.status || 'planning');
  const [projectStartDate, setProjectStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  );
  const [projectEndDate, setProjectEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  );
  const [homeownerId, setHomeownerId] = useState(
    initialData?.homeownerId || ''
  );
  const [engineerIds, setEngineerIds] = useState<string[]>(
    initialData?.engineerIds || []
  );
  const [managerIds, setManagerIds] = useState<string[]>(
    initialData?.managerIds || []
  );
  const [phases, setPhases] = useState<ProjectPhase[]>(
    initialData?.timeline?.map((phase) => ({
      name: phase.name,
      description: phase.description,
      startDate: new Date(phase.startDate),
      endDate: new Date(phase.endDate),
    })) || []
  );
  const [floorPlans, setFloorPlans] = useState<UploadedFile[]>(
    initialData?.floorPlans || []
  );
  const [images, setImages] = useState<UploadedFile[]>(
    initialData?.images || []
  );

  const [allUsers, setAllUsers] = useState<User[]>(users);

  useEffect(() => {
    if (users.length === 0) {
      // Fetch users if not provided
      fetch('/api/admin/users')
        .then((res) => res.json())
        .then((data) => setAllUsers(data.users || []))
        .catch(console.error);
    }
  }, [users]);

  const homeowners = allUsers.filter((user) => user.role === 'homeowner');
  const engineers = allUsers.filter((user) => user.role === 'engineer');
  const managers = allUsers.filter((user) => user.role === 'manager');

  const addPhase = () => {
    if (!phaseName || !phaseDescription || !phaseStartDate || !phaseEndDate) {
      setError('Please fill in all phase details');
      return;
    }

    const newPhase: ProjectPhase = {
      name: phaseName,
      description: phaseDescription,
      startDate: phaseStartDate,
      endDate: phaseEndDate,
    };

    setPhases([...phases, newPhase]);
    setPhaseName('');
    setPhaseDescription('');
    setPhaseStartDate(undefined);
    setPhaseEndDate(undefined);
    setShowPhaseForm(false);
    setError('');
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const toggleUser = (userId: string, type: 'engineer' | 'manager') => {
    if (type === 'engineer') {
      setEngineerIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } else {
      setManagerIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url =
        isEditing && initialData
          ? `/api/admin/projects/${initialData._id}`
          : '/api/admin/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          budget: budget ? Number.parseFloat(String(budget)) : undefined,
          status,
          startDate: projectStartDate,
          endDate: projectEndDate,
          homeownerId,
          engineerIds,
          managerIds,
          timeline: phases.map((phase) => ({
            ...phase,
            status: 'pending',
            materials: [],
          })),
          floorPlans,
          images,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to ${isEditing ? 'update' : 'create'} project`
        );
      }

      router.push(
        isEditing && initialData
          ? `/admin/projects/${initialData._id}`
          : '/admin/projects'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Phase form state
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseName, setPhaseName] = useState('');
  const [phaseDescription, setPhaseDescription] = useState('');
  const [phaseStartDate, setPhaseStartDate] = useState<Date>();
  const [phaseEndDate, setPhaseEndDate] = useState<Date>();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Basic information about the construction project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the construction project"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Project Value ($)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter project budget"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Project Stage</Label>
              <Select
                value={status}
                onValueChange={(
                  v: 'planning' | 'in-progress' | 'completed' | 'on-hold'
                ) => setStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !projectStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {projectStartDate
                      ? format(projectStartDate, 'PPP')
                      : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={projectStartDate}
                    onSelect={setProjectStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Project End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !projectEndDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {projectEndDate
                      ? format(projectEndDate, 'PPP')
                      : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={projectEndDate}
                    onSelect={setProjectEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeowner">Homeowner</Label>
            <Select value={homeownerId} onValueChange={setHomeownerId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select homeowner" />
              </SelectTrigger>
              <SelectContent>
                {homeowners.map((homeowner) => (
                  <SelectItem key={homeowner._id} value={homeowner._id}>
                    {homeowner.name} ({homeowner.mobile})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Assignment</CardTitle>
          <CardDescription>
            Assign engineers and managers to this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Engineers</Label>
            <div className="flex flex-wrap gap-2">
              {engineers.map((engineer) => (
                <Badge
                  key={engineer._id}
                  variant={
                    engineerIds.includes(engineer._id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleUser(engineer._id, 'engineer')}
                >
                  {engineer.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Managers</Label>
            <div className="flex flex-wrap gap-2">
              {managers.map((manager) => (
                <Badge
                  key={manager._id}
                  variant={
                    managerIds.includes(manager._id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleUser(manager._id, 'manager')}
                >
                  {manager.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectFilesSection
        onFloorPlansChange={setFloorPlans}
        onImagesChange={setImages}
        initialFloorPlans={floorPlans}
        initialImages={images}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Define phases and milestones for the project
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPhaseForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Phase
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPhaseForm && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phase Name</Label>
                    <Input
                      value={phaseName}
                      onChange={(e) => setPhaseName(e.target.value)}
                      placeholder="e.g., Foundation Work"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={phaseDescription}
                      onChange={(e) => setPhaseDescription(e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !phaseStartDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {phaseStartDate
                            ? format(phaseStartDate, 'PPP')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={phaseStartDate}
                          onSelect={setPhaseStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !phaseEndDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {phaseEndDate
                            ? format(phaseEndDate, 'PPP')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={phaseEndDate}
                          onSelect={setPhaseEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addPhase}>
                    Add Phase
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPhaseForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {phases.length > 0 && (
            <div className="space-y-3">
              {phases.map((phase, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{phase.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {phase.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(phase.startDate, 'MMM d, yyyy')} -{' '}
                          {format(phase.endDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating Project...' : 'Creating Project...'}
            </>
          ) : isEditing ? (
            'Update Project'
          ) : (
            'Create Project'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default CreateProjectForm;
