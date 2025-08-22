'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/auth/logout-button';
import { AppSettings } from '@/lib/models/Settings';
import {
  Building2,
  Users,
  FolderPlus,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Projects', href: '/admin/projects', icon: Building2 },
  { name: 'Create Project', href: '/admin/projects/create', icon: FolderPlus },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [appName, setAppName] = useState('Construction Pro');

  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const settings: AppSettings = await response.json();
          setAppName(settings.appName || 'Construction Pro');
        }
      } catch (error) {
        console.error('Error fetching app name:', error);
        // Keep default name on error
      }
    };

    fetchAppName();
  }, []);

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r sticky top-0">
      <div className="flex h-16 items-center px-6 border-b">
        <Building2 className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold">{appName}</span>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <LogoutButton variant="outline" size="sm" />
      </div>
    </div>
  );
}
