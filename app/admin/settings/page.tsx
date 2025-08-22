'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthClient } from '@/hooks/use-auth-client';
import { AppSettings } from '@/lib/models/Settings';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <SettingsContent />
    </AdminLayout>
  );
}

function SettingsContent() {
  const { user } = useAuthClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    appName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    primaryColor: '#3b82f6',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      console.log('Fetch settings response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Settings data:', data);
        setFormData({
          appName: data.appName || '',
          companyName: data.companyName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
          primaryColor: data.primaryColor || '#3b82f6',
        });
      } else {
        console.error('Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        alert('Settings updated successfully!');
        // Refresh the page to update the sidebar
        window.location.reload();
      } else {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        } else {
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse);
          alert(`Server error: ${response.status}. Check console for details.`);
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(
        `Failed to update settings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Access denied. Admin privileges required.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage global configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic application settings and company information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="appName">Application Name *</Label>
                <Input
                  id="appName"
                  value={formData.appName}
                  onChange={(e) => handleInputChange('appName', e.target.value)}
                  placeholder="Construction Pro"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  This name will appear in the sidebar and throughout the
                  application.
                </p>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="Your Construction Company"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    handleInputChange('contactEmail', e.target.value)
                  }
                  placeholder="contact@yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    handleInputChange('contactPhone', e.target.value)
                  }
                  placeholder="+91 12345 67890"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Company Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Company address"
                />
              </div>

              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      handleInputChange('primaryColor', e.target.value)
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) =>
                      handleInputChange('primaryColor', e.target.value)
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={fetchSettings}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
