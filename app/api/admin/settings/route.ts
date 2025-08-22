import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAppSettings, updateAppSettings } from '@/lib/db/settings';
import type { AppSettings } from '@/lib/models/Settings';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getAppSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.appName) {
      return NextResponse.json(
        { error: 'App name is required' },
        { status: 400 }
      );
    }

    const settingsData: Partial<AppSettings> = {
      appName: body.appName,
      companyName: body.companyName || '',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      address: body.address || '',
      primaryColor: body.primaryColor || '#3b82f6',
    };

    const updatedSettings = await updateAppSettings(settingsData);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
