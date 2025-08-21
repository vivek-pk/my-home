"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Phone, Shield } from "lucide-react"

export function CreateUserForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Form state
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [role, setRole] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      setSuccess("User created successfully!")
      setName("")
      setMobile("")
      setRole("")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/users")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Create New User</span>
        </CardTitle>
        <CardDescription>Add a new user to the construction management system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">This will be used for login authentication</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Select value={role} onValueChange={setRole} required disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-xs text-muted-foreground">Full system access</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Project Manager</div>
                      <div className="text-xs text-muted-foreground">Oversee projects and teams</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="engineer">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Engineer</div>
                      <div className="text-xs text-muted-foreground">Technical project work</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="homeowner">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium">Homeowner</div>
                      <div className="text-xs text-muted-foreground">View project progress</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Permissions Info */}
          {role && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Role Permissions</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {role === "admin" && (
                    <>
                      <p>• Create and manage all projects</p>
                      <p>• Add and manage users</p>
                      <p>• Access all system features</p>
                      <p>• View analytics and reports</p>
                    </>
                  )}
                  {role === "manager" && (
                    <>
                      <p>• Manage assigned projects</p>
                      <p>• Update project timelines</p>
                      <p>• Add progress updates</p>
                      <p>• Manage materials and resources</p>
                    </>
                  )}
                  {role === "engineer" && (
                    <>
                      <p>• View assigned projects</p>
                      <p>• Add progress updates</p>
                      <p>• Upload progress photos</p>
                      <p>• Update material usage</p>
                    </>
                  )}
                  {role === "homeowner" && (
                    <>
                      <p>• View own project progress</p>
                      <p>• Access project timeline</p>
                      <p>• View uploaded documents</p>
                      <p>• Contact project team</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || !role}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                "Create User"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
