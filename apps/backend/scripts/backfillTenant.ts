import { connectDB } from "../src/config/db";
import { DEFAULT_TENANT_SLUG } from "../src/config/env";
import { Tenant } from "../src/modules/tenants/tenant.model";
import { User } from "../src/modules/users/user.model";
import { Farm } from "../src/modules/farms/farm.model";
import { Investment } from "../src/modules/investments/investment.model";
import { KycDocument } from "../src/modules/kyc/kyc.model";
import { Activity } from "../src/modules/activities/activity.model";

const backfillTenant = async () => {
  await connectDB();

  const tenantSlug = (DEFAULT_TENANT_SLUG ?? "default").toLowerCase().trim();
  if (!tenantSlug) {
    throw new Error("DEFAULT_TENANT_SLUG must be set");
  }

  const tenant = await Tenant.findOneAndUpdate(
    { slug: tenantSlug },
    {
      $setOnInsert: {
        name: tenantSlug.toUpperCase(),
        slug: tenantSlug,
        isActive: true,
        branding: {
          displayName: tenantSlug.toUpperCase(),
        },
      },
    },
    { new: true, upsert: true },
  );

  const tenantId = tenant._id;
  const missingTenantQuery = {
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  };

  const [users, farms, investments, kycDocs, activities] = await Promise.all([
    User.updateMany(missingTenantQuery, { $set: { tenantId } }),
    Farm.updateMany(missingTenantQuery, { $set: { tenantId } }),
    Investment.updateMany(missingTenantQuery, { $set: { tenantId } }),
    KycDocument.updateMany(missingTenantQuery, { $set: { tenantId } }),
    Activity.updateMany(missingTenantQuery, { $set: { tenantId } }),
  ]);

  console.log("✅ Tenant backfill complete");
  console.log(`Tenant: ${tenant.slug} (${tenant._id})`);
  console.log(`Users updated: ${users.modifiedCount}`);
  console.log(`Farms updated: ${farms.modifiedCount}`);
  console.log(`Investments updated: ${investments.modifiedCount}`);
  console.log(`KYC docs updated: ${kycDocs.modifiedCount}`);
  console.log(`Activities updated: ${activities.modifiedCount}`);
};

backfillTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Tenant backfill failed:", error.message);
    process.exit(1);
  });
