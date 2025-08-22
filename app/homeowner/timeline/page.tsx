import { HomeownerLayout } from '@/components/homeowner/homeowner-layout';
import { TimelinePageWrapper } from '@/components/timeline/timeline-page-wrapper';
import { GanttChart } from '@/components/timeline/gantt-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSession } from '@/lib/session';
import { getProjectsByUserId } from '@/lib/db/projects';

async function getHomeownerProject() {
  const session = await getSession();
  if (!session) return null;

  const projects = await getProjectsByUserId(session.id, session.role);
  return projects[0] || null;
}

export default async function HomeownerTimelinePage() {
  const project = await getHomeownerProject();

  if (!project) {
    return (
      <HomeownerLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Project Found</h2>
          <p className="text-muted-foreground">
            You don&apos;t have any construction projects assigned yet.
          </p>
        </div>
      </HomeownerLayout>
    );
  }

  return (
    <HomeownerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Project Timeline</h1>
          <p className="text-muted-foreground">
            Track the progress of your construction project
          </p>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <TimelinePageWrapper initialProject={project} canEdit={false} />
          </TabsContent>

          <TabsContent value="gantt" className="space-y-6">
            <GanttChart project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </HomeownerLayout>
  );
}
