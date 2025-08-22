import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
// Using relative import for UserCard to avoid transient path alias resolution issue
import { UserCard } from '../../../components/admin/user-card';
import type { User } from '@/lib/models/User';

type Role = User['role'];
type AdminUser = Pick<User, '_id' | 'name' | 'mobile' | 'role' | 'createdAt'>;
type MongoUser = {
  _id: { toString(): string };
  name?: unknown;
  mobile?: unknown;
  role?: unknown;
  createdAt?: unknown;
};

async function getUsers(): Promise<AdminUser[]> {
  const db = await getDatabase();
  const users = (await db
    .collection('users')
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as MongoUser[];

  return users.map((user) => {
    const roleStr = typeof user.role === 'string' ? user.role : '';
    const role: Role =
      roleStr === 'admin' ||
      roleStr === 'manager' ||
      roleStr === 'engineer' ||
      roleStr === 'homeowner'
        ? (roleStr as Role)
        : 'homeowner';

    const rawCreatedAt = user.createdAt;
    const createdAt: Date =
      rawCreatedAt instanceof Date
        ? rawCreatedAt
        : typeof rawCreatedAt === 'string' || typeof rawCreatedAt === 'number'
        ? new Date(rawCreatedAt)
        : new Date();

    return {
      _id: user._id?.toString() ?? '',
      name: String(user.name ?? ''),
      mobile: String(user.mobile ?? ''),
      role,
      createdAt,
    };
  });
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

export default async function UsersPage() {
  const users = await getUsers();

  const usersByRole: Record<Role, AdminUser[]> = {
    admin: users.filter((user) => user.role === 'admin'),
    manager: users.filter((user) => user.role === 'manager'),
    engineer: users.filter((user) => user.role === 'engineer'),
    homeowner: users.filter((user) => user.role === 'homeowner'),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage system users and their roles
            </p>
          </div>
          <Link href="/admin/users/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>

        {/* User Statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {role}s
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total {role} users
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className={getRoleColor(role)}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}s
                  </Badge>
                  <span>({roleUsers.length})</span>
                </CardTitle>
                <CardDescription>
                  Users with {role} access level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roleUsers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roleUsers.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No {role} users found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
