import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The page you are looking for doesn2t exist.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
