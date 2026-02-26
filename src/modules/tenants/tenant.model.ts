import mongoose, { Document, Schema } from "mongoose";

export interface ITenantBranding {
  displayName: string;
  shortName?: string;
  legalName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  tagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  ctaPrimaryLabel?: string;
  ctaSecondaryLabel?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportWhatsapp?: string;
  address?: string;
  websiteUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface ITenantFeatures {
  investments: boolean;
  wallet: boolean;
  transactions: boolean;
  farms: boolean;
  news: boolean;
  notifications: boolean;
  adminPortal: boolean;
  adminFarms: boolean;
  adminInvestors: boolean;
  adminTransactions: boolean;
  adminPayouts: boolean;
  adminKyc: boolean;
  adminReports: boolean;
}

export interface ITenant extends Document {
  name: string;
  slug: string;
  domains: string[];
  isActive: boolean;
  branding: ITenantBranding;
  features: ITenantFeatures;
  createdAt: Date;
  updatedAt: Date;
}

const featureDefaults: ITenantFeatures = {
  investments: true,
  wallet: true,
  transactions: true,
  farms: true,
  news: true,
  notifications: true,
  adminPortal: true,
  adminFarms: true,
  adminInvestors: true,
  adminTransactions: true,
  adminPayouts: true,
  adminKyc: true,
  adminReports: true,
};

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    domains: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    features: {
      investments: { type: Boolean, default: featureDefaults.investments },
      wallet: { type: Boolean, default: featureDefaults.wallet },
      transactions: { type: Boolean, default: featureDefaults.transactions },
      farms: { type: Boolean, default: featureDefaults.farms },
      news: { type: Boolean, default: featureDefaults.news },
      notifications: {
        type: Boolean,
        default: featureDefaults.notifications,
      },
      adminPortal: { type: Boolean, default: featureDefaults.adminPortal },
      adminFarms: { type: Boolean, default: featureDefaults.adminFarms },
      adminInvestors: {
        type: Boolean,
        default: featureDefaults.adminInvestors,
      },
      adminTransactions: {
        type: Boolean,
        default: featureDefaults.adminTransactions,
      },
      adminPayouts: { type: Boolean, default: featureDefaults.adminPayouts },
      adminKyc: { type: Boolean, default: featureDefaults.adminKyc },
      adminReports: { type: Boolean, default: featureDefaults.adminReports },
    },
    branding: {
      displayName: { type: String, required: true },
      shortName: { type: String },
      legalName: { type: String },
      logoUrl: { type: String },
      faviconUrl: { type: String },
      primaryColor: { type: String },
      tagline: { type: String },
      heroTitle: { type: String },
      heroDescription: { type: String },
      ctaPrimaryLabel: { type: String },
      ctaSecondaryLabel: { type: String },
      supportEmail: { type: String },
      supportPhone: { type: String },
      supportWhatsapp: { type: String },
      address: { type: String },
      websiteUrl: { type: String },
      termsUrl: { type: String },
      privacyUrl: { type: String },
    },
  },
  { timestamps: true },
);

TenantSchema.pre("save", function () {
  this.slug = this.slug?.toLowerCase().trim();
  this.domains = (this.domains || [])
    .map((domain) => domain.toLowerCase().trim().split(":")[0])
    .filter(Boolean);
});

TenantSchema.index({ domains: 1 }, { unique: true, sparse: true });

export const Tenant = mongoose.model<ITenant>("Tenant", TenantSchema);
