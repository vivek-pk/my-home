'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, X } from 'lucide-react';
import type { ProjectPhase, Material } from '@/lib/models/Project';

interface MaterialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  phase: ProjectPhase;
  onSuccess: () => void;
}

export function MaterialsDialog({
  open,
  onOpenChange,
  projectId,
  phase,
  onSuccess,
}: MaterialsDialogProps) {
  const [materials, setMaterials] = useState<Material[]>(phase.materials || []);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.quantity || !newMaterial.unit) {
      setError('Please fill in all material details');
      return;
    }

    setMaterials([...materials, newMaterial as Material]);
    setNewMaterial({});
    setError('');
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // If user entered a new material but didn't click Add, include it
      const pending =
        newMaterial.name && newMaterial.unit && newMaterial.quantity
          ? [
              {
                name: String(newMaterial.name),
                unit: String(newMaterial.unit),
                quantity: Number(newMaterial.quantity),
                cost:
                  newMaterial.cost !== undefined &&
                  newMaterial.cost !== null &&
                  Number.isFinite(Number(newMaterial.cost))
                    ? Number(newMaterial.cost)
                    : undefined,
                supplier: newMaterial.supplier
                  ? String(newMaterial.supplier)
                  : undefined,
              },
            ]
          : [];
      const outgoing = [...materials, ...pending];

      const response = await fetch(`/api/projects/${projectId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId: phase._id,
          phaseName: phase.name,
          materials: outgoing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update materials');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Materials</DialogTitle>
          <DialogDescription>
            Update materials list for the &quot;{phase.name}&quot; phase
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Existing Materials */}
          {materials.length > 0 && (
            <div className="space-y-3">
              <Label>Current Materials</Label>
              {materials.map((material, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-4 gap-4 flex-1">
                        <div>
                          <span className="text-sm font-medium">
                            {material.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm">
                            {material.quantity} {material.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm">
                            {material.cost ? `$${material.cost}` : 'No cost'}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            {material.supplier || 'No supplier'}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Material */}
          <div className="space-y-3">
            <Label>Add New Material</Label>
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Material Name</Label>
                    <Input
                      value={newMaterial.name || ''}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, name: e.target.value })
                      }
                      placeholder="e.g., Concrete, Steel bars"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={newMaterial.unit || ''}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, unit: e.target.value })
                      }
                      placeholder="e.g., bags, tons, pieces"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newMaterial.quantity || ''}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          quantity: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost (Optional)</Label>
                    <Input
                      type="number"
                      value={newMaterial.cost || ''}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          cost: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier (Optional)</Label>
                    <Input
                      value={newMaterial.supplier || ''}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          supplier: e.target.value,
                        })
                      }
                      placeholder="Supplier name"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterial}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </CardContent>
            </Card>
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
                  Updating Materials...
                </>
              ) : (
                'Update Materials'
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
