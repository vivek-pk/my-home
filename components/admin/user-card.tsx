'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Calendar, Trash2 } from 'lucide-react';
import React from 'react';
import type { User } from '@/lib/models/User';

interface UserCardProps {
  user: Pick<User, '_id' | 'name' | 'mobile' | 'role' | 'createdAt'>;
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'manager':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'engineer':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'homeowner':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

export function UserCard({ user }: UserCardProps) {
  const [deleted, setDeleted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (deleted) return null;

  const handleDelete = async () => {
    if (!confirm('Delete this user?')) return;
    setError(null);
    const res = await fetch(`/api/admin/users/${user._id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Delete failed');
      return;
    }
    setDeleted(true);
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="pr-8">
            <h3 className="font-medium">{user.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.mobile}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Added {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <Badge variant="outline" className={getRoleColor(user.role)}>
              {user.role}
            </Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
          title="Delete user"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
