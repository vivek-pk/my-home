import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, Clock, Shield } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const session = await getSession()

  // Redirect authenticated users to their appropriate dashboard
  if (session) {
    switch (session.role) {
      case "admin":
        redirect("/admin")
      case "engineer":
      case "manager":
        redirect("/dashboard")
      case "homeowner":
        redirect("/homeowner")
      default:
        redirect("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold">Construction Pro</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional construction project management and tracking system for teams and homeowners
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6">
              Sign In to Your Account
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Complete project and user management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Create & manage projects</li>
                <li>User management</li>
                <li>System analytics</li>
                <li>File management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Project Managers</CardTitle>
              <CardDescription>Oversee project progress and teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Timeline management</li>
                <li>Progress tracking</li>
                <li>Team coordination</li>
                <li>Resource planning</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Engineers</CardTitle>
              <CardDescription>Technical project execution</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Progress updates</li>
                <li>Photo documentation</li>
                <li>Material tracking</li>
                <li>Technical reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Homeowners</CardTitle>
              <CardDescription>Track your construction project</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Real-time progress</li>
                <li>Timeline visibility</li>
                <li>Document access</li>
                <li>Team communication</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Contact your administrator to get access to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                New users need to be registered by an administrator. Once registered, you can log in using your mobile
                number.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Go to Login Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
