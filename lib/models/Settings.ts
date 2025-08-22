export interface AppSettings {
  _id?: string;
  appName: string;
  companyName?: string;
  logo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSettingsData {
  appName: string;
  companyName?: string;
  logo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}
