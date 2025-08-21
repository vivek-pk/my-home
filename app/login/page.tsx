import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getSession()

  // Redirect if already logged in
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
        redirect("/")
    }
  }

  return <LoginForm />
}
