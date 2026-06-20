export type CarStatus = 'Available' | 'Sold' | 'Reserved';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  mileage?: number;
  originalColour?: string;
  photos: string[];
  price: number;
  status: CarStatus;
  description?: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export interface AllowedAccount {
  id: number;
  email: string;
  createdAt: string;
}

export interface SignupSettings {
  enabled: boolean;
}

export type PasswordResetRequestStatus = "pending" | "approved" | "completed" | "rejected";

export interface PasswordResetRequest {
  id: number;
  email: string;
  reason: string;
  status: PasswordResetRequestStatus;
  adminNote: string;
  handledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  footerText: string;
  logoUrl: string;
  faviconUrl: string;
  whatsappNumber: string;
  signupsEnabled: boolean;
}

export interface SiteSettingsUpdate {
  siteName?: string;
  siteSubtitle?: string;
  heroKicker?: string;
  heroTitle?: string;
  heroDescription?: string;
  footerText?: string;
  logoUrl?: string;
  faviconUrl?: string;
  whatsappNumber?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}