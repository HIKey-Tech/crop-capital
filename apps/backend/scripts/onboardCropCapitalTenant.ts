import { connectDB } from "../src/config/db";
import { Tenant } from "../src/modules/tenants/tenant.model";
import { User } from "../src/modules/users/user.model";
import { Farm } from "../src/modules/farms/farm.model";
import { Investment } from "../src/modules/investments/investment.model";
import { KycDocument } from "../src/modules/kyc/kyc.model";
import { Activity } from "../src/modules/activities/activity.model";
import { WebhookEvent } from "../src/modules/payments/webhookEvent.model";

type PlatformSnapshot = {
  users: number;
  farms: number;
  investments: number;
  kycDocs: number;
  activities: number;
  webhookEvents: number;
  totalInvestmentAmount: number;
  totalFarmFunding: number;
};

const toArray = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const getSnapshot = async (): Promise<PlatformSnapshot> => {
  const [
    users,
    farms,
    investments,
    kycDocs,
    activities,
    webhookEvents,
    investmentAggregate,
    farmAggregate,
  ] = await Promise.all([
    User.countDocuments(),
    Farm.countDocuments(),
    Investment.countDocuments(),
    KycDocument.countDocuments(),
    Activity.countDocuments(),
    WebhookEvent.countDocuments(),
    Investment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Farm.aggregate([
      { $group: { _id: null, total: { $sum: "$fundedAmount" } } },
    ]),
  ]);

  return {
    users,
    farms,
    investments,
    kycDocs,
    activities,
    webhookEvents,
    totalInvestmentAmount: investmentAggregate[0]?.total || 0,
    totalFarmFunding: farmAggregate[0]?.total || 0,
  };
};

const printSnapshot = (label: string, snapshot: PlatformSnapshot) => {
  console.log(`\n📊 ${label}`);
  console.log(`Users: ${snapshot.users}`);
  console.log(`Farms: ${snapshot.farms}`);
  console.log(`Investments: ${snapshot.investments}`);
  console.log(`KYC Docs: ${snapshot.kycDocs}`);
  console.log(`Activities: ${snapshot.activities}`);
  console.log(`Webhook Events: ${snapshot.webhookEvents}`);
  console.log(`Investment Amount Total: ₦${snapshot.totalInvestmentAmount}`);
  console.log(`Farm Funded Total: ₦${snapshot.totalFarmFunding}`);
};

const assertRetention = (before: PlatformSnapshot, after: PlatformSnapshot) => {
  const checks: Array<{ key: keyof PlatformSnapshot; label: string }> = [
    { key: "users", label: "Users count" },
    { key: "farms", label: "Farms count" },
    { key: "investments", label: "Investments count" },
    { key: "kycDocs", label: "KYC count" },
    { key: "activities", label: "Activities count" },
    { key: "webhookEvents", label: "Webhook events count" },
    { key: "totalInvestmentAmount", label: "Investment totals" },
    { key: "totalFarmFunding", label: "Farm funding totals" },
  ];

  const failed = checks.filter(
    (check) => before[check.key] !== after[check.key],
  );

  if (failed.length > 0) {
    console.error("\n❌ Data retention validation failed:");
    failed.forEach((check) => {
      console.error(
        `- ${check.label}: before=${before[check.key]}, after=${after[check.key]}`,
      );
    });
    throw new Error("Retention validation failed after tenant assignment");
  }

  console.log("\n✅ Retention validation passed (counts and totals unchanged)");
};

const onboardCropCapitalTenant = async () => {
  console.log("🚀 Starting CropCapital tenant onboarding...");
  await connectDB();

  const before = await getSnapshot();
  printSnapshot("Before migration", before);

  const cropCapitalDomains = toArray(process.env.CROPCAPITAL_TENANT_DOMAINS);
  const superAdminEmail = (
    process.env.CROPCAPITAL_SUPER_ADMIN_EMAIL || "admin@cropcapital.com"
  )
    .toLowerCase()
    .trim();

  const tenant = await Tenant.findOneAndUpdate(
    { slug: "cropcapital" },
    {
      $set: {
        name: "CropCapital",
        slug: "cropcapital",
        isActive: true,
        domains: cropCapitalDomains,
        features: {
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
        },
        branding: {
          displayName: "CropCapital",
          shortName: "CC",
          legalName: "CropCapital",
          primaryColor: "142 64% 32%",
          secondaryColor: "352 47% 29%",
          accentColor: "43 92% 52%",
          tagline:
            "Empowering African agriculture through community-driven investments.",
          heroTitle: "Invest in African Agriculture",
          heroDescription:
            "Connect with verified farms across Liberia and West Africa. Earn attractive returns while empowering local communities.",
          ctaPrimaryLabel: "Start Investing",
          ctaSecondaryLabel: "Explore Farms",
          supportEmail: "support@cropcapital.com",
          supportPhone: "+234 800 123 4567",
          websiteUrl: "https://cropcapital.com",
        },
      },
    },
    { new: true, upsert: true },
  );

  const tenantId = tenant._id;
  const tenantIdString = tenantId.toString();

  const [users, farms, investments, kycDocs, activities, webhookEvents] =
    await Promise.all([
      User.updateMany({}, { $set: { tenantId } }),
      Farm.updateMany({}, { $set: { tenantId } }),
      Investment.updateMany({}, { $set: { tenantId } }),
      KycDocument.updateMany({}, { $set: { tenantId } }),
      Activity.updateMany({}, { $set: { tenantId } }),
      WebhookEvent.updateMany({}, { $set: { tenantId: tenantIdString } }),
    ]);

  const superAdmin = await User.findOneAndUpdate(
    { email: superAdminEmail },
    { $set: { role: "super_admin", tenantId } },
    { new: true },
  );

  console.log("\n✅ CropCapital tenant assignment complete");
  console.log(`Tenant: ${tenant.slug} (${tenant._id})`);
  console.log(`Users assigned: ${users.modifiedCount}`);
  console.log(`Farms assigned: ${farms.modifiedCount}`);
  console.log(`Investments assigned: ${investments.modifiedCount}`);
  console.log(`KYC docs assigned: ${kycDocs.modifiedCount}`);
  console.log(`Activities assigned: ${activities.modifiedCount}`);
  console.log(`Webhook events assigned: ${webhookEvents.modifiedCount}`);
  console.log(
    `Super Admin: ${superAdmin?.email ?? "not found"} (${superAdmin?.role ?? "n/a"})`,
  );

  const after = await getSnapshot();
  printSnapshot("After migration", after);
  assertRetention(before, after);

  const usersWithoutTenant = await User.countDocuments({
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  });
  const farmsWithoutTenant = await Farm.countDocuments({
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  });
  const investmentsWithoutTenant = await Investment.countDocuments({
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  });

  console.log("\n🔎 Post-check");
  console.log(`Users without tenant: ${usersWithoutTenant}`);
  console.log(`Farms without tenant: ${farmsWithoutTenant}`);
  console.log(`Investments without tenant: ${investmentsWithoutTenant}`);
  console.log("\n🎉 CropCapital tenant onboarding complete");
};

onboardCropCapitalTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ CropCapital onboarding failed:", error.message);
    process.exit(1);
  });
