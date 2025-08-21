import { AdminLayout } from '@/components/admin/admin-layout';
import { CreateProjectForm } from '@/components/admin/create-project-form';
import { getDatabase } from '@/lib/mongodb';

async function getUsers() {
  const db = await getDatabase();
  const users = await db.collection('users').find({}).toArray();

  return users.map((user) => ({
    _id: user._id.toString(),
    name: user.name as string,
    mobile: user.mobile as string,
    role: user.role as string,
  }));
}

export default async function CreateProjectPage() {
  const users = await getUsers();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up a new construction project with timeline and team assignments
          </p>
        </div>

        <CreateProjectForm users={users} />
      </div>
    </AdminLayout>
  );
}
