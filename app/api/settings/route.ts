import { NextRequest, NextResponse } from 'next/server';
import {
  getAppSettings,
  updateAppSettings,
  createDefaultSettings,
} from '@/lib/db/settings';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const user = await getSession();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      appName,
      companyName,
      logo,
      primaryColor,
      contactEmail,
      contactPhone,
      address,
    } = body;

    // Validate required fields
    if (!appName || appName.trim() === '') {
      return NextResponse.json(
        { error: 'App name is required' },
        { status: 400 }
      );
    }

    const updatedSettings = await updateAppSettings({
      appName: appName.trim(),
      companyName: companyName?.trim(),
      logo: logo?.trim(),
      primaryColor: primaryColor?.trim(),
      contactEmail: contactEmail?.trim(),
      contactPhone: contactPhone?.trim(),
      address: address?.trim(),
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    // Create default settings if none exist
    const settings = await createDefaultSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error creating default settings:', error);
    return NextResponse.json(
      { error: 'Failed to create default settings' },
      { status: 500 }
    );
  }
}
