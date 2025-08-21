import { HomeownerLayout } from '@/components/homeowner/homeowner-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/session';
import { getProjectsByUserId } from '@/lib/db/projects';
import { getUserById } from '@/lib/db/users';
import { Phone, Mail, User, Building2 } from 'lucide-react';

async function getProjectTeam() {
  const session = await getSession();
  if (!session) return null;

  const projects = await getProjectsByUserId(session.id, session.role);
  const project = projects[0];

  if (!project) return null;

  // Get team members
  const teamMemberIds = [
    ...(project.engineerIds || []),
    ...(project.managerIds || []),
  ];
  const teamMembers = await Promise.all(
    teamMemberIds.map((id: string) => getUserById(id))
  );

  return {
    project,
    engineers: teamMembers.filter((member) => member?.role === 'engineer'),
    managers: teamMembers.filter((member) => member?.role === 'manager'),
  };
}

export default async function HomeownerContactPage() {
  const data = await getProjectTeam();

  if (!data) {
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

  const { project, engineers, managers } = data;

  return (
    <HomeownerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contact Team</h1>
          <p className="text-muted-foreground">
            Get in touch with your project team members
          </p>
        </div>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Project Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Project Managers */}
        {managers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Managers</CardTitle>
              <CardDescription>
                Your main points of contact for project oversight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {managers.map((manager) => (
                  <div
                    key={manager?._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{manager?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Project Manager
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${manager?.mobile}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`sms:${manager?.mobile}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Text
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Engineers */}
        {engineers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Engineers</CardTitle>
              <CardDescription>
                Technical team members working on your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineers.map((engineer) => (
                  <div
                    key={engineer?._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-secondary/10 rounded-full">
                        <User className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{engineer?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Engineer
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${engineer?.mobile}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`sms:${engineer?.mobile}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Text
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-orange-800">Emergency Contact</CardTitle>
            <CardDescription className="text-orange-700">
              For urgent issues or emergencies during construction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-orange-800">
                  24/7 Emergency Line
                </h3>
                <p className="text-sm text-orange-700">
                  Available for urgent construction issues
                </p>
              </div>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-800 hover:bg-orange-100 bg-transparent"
                asChild
              >
                <a href="tel:+1234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Call
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
