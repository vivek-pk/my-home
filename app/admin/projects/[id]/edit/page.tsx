import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';
import { CreateProjectForm } from '@/components/admin/create-project-form';
import { getProjectById } from '@/lib/db/projects';
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

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  const users = await getUsers();

  if (!project) {
    notFound();
  }

  const formInitial = {
    _id: project._id!,
    name: project.name,
    description: project.description,
    budget: project.budget,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    homeownerId: project.homeownerId,
    engineerIds: project.engineerIds,
    managerIds: project.managerIds,
    timeline: project.timeline?.map((p) => ({
      name: p.name,
      description: p.description,
      startDate: p.startDate,
      endDate: p.endDate,
    })),
    floorPlans: project.floorPlans,
    images: project.images,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/admin/projects/${project._id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600">{project.name}</p>
          </div>
        </div>

        {/* Edit Form */}
        <CreateProjectForm
          initialData={formInitial}
          isEditing={true}
          users={users}
        />
      </div>
    </AdminLayout>
  );
}
