import { getDatabase } from '../mongodb';
import { AppSettings, CreateSettingsData } from '../models/Settings';

export async function getAppSettings(): Promise<AppSettings | null> {
  const db = await getDatabase();

  // Get the first (and should be only) settings document
  const settings = await db.collection('settings').findOne({});

  if (!settings) {
    // Return default settings if none exist
    return {
      appName: 'Construction Pro',
      companyName: 'Your Construction Company',
      primaryColor: '#3b82f6',
    };
  }

  return {
    _id: settings._id.toString(),
    appName: settings.appName,
    companyName: settings.companyName,
    logo: settings.logo,
    primaryColor: settings.primaryColor,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    address: settings.address,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  } as AppSettings;
}

export async function updateAppSettings(
  settingsData: Partial<CreateSettingsData>
): Promise<AppSettings> {
  const db = await getDatabase();

  const updateData = {
    ...settingsData,
    updatedAt: new Date(),
  };

  // Use upsert to create if doesn't exist, update if it does
  const result = await db.collection('settings').findOneAndUpdate(
    {}, // Empty filter to match the first document
    {
      $set: updateData,
      $setOnInsert: { createdAt: new Date() },
    },
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  if (!result) {
    throw new Error('Failed to update settings');
  }

  return {
    _id: result._id.toString(),
    appName: result.appName,
    companyName: result.companyName,
    logo: result.logo,
    primaryColor: result.primaryColor,
    contactEmail: result.contactEmail,
    contactPhone: result.contactPhone,
    address: result.address,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  } as AppSettings;
}

export async function createDefaultSettings(): Promise<AppSettings> {
  const db = await getDatabase();

  // Check if settings already exist
  const existingSettings = await db.collection('settings').findOne({});
  if (existingSettings) {
    return {
      _id: existingSettings._id.toString(),
      appName: existingSettings.appName,
      companyName: existingSettings.companyName,
      logo: existingSettings.logo,
      primaryColor: existingSettings.primaryColor,
      contactEmail: existingSettings.contactEmail,
      contactPhone: existingSettings.contactPhone,
      address: existingSettings.address,
      createdAt: existingSettings.createdAt,
      updatedAt: existingSettings.updatedAt,
    } as AppSettings;
  }

  const defaultSettings: CreateSettingsData = {
    appName: 'Construction Pro',
    companyName: 'Your Construction Company',
    primaryColor: '#3b82f6',
    contactEmail: 'contact@constructionpro.com',
    contactPhone: '+1 (555) 123-4567',
  };

  const result = await db.collection('settings').insertOne({
    ...defaultSettings,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    _id: result.insertedId.toString(),
    ...defaultSettings,
  } as AppSettings;
}
