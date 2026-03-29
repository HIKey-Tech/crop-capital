/**
 * One-off migration: set the `domains` array on the `cropcapital` tenant so
 * host-based tenant resolution works without relying on the X-Tenant-Slug
 * header trust path.
 *
 * Usage:
 *   TENANT_DOMAINS="crop-capital.onrender.com,cropcapital.cropcapitals.com" \
 *     tsx scripts/patchCropCapitalDomains.ts
 *
 * If TENANT_DOMAINS is not provided the script falls back to the value of
 * CROPCAPITAL_TENANT_DOMAINS (shared with the onboard script) and then to
 * the hardcoded production defaults below.
 */

import { connectDB } from "../src/config/db";
import { Tenant } from "../src/modules/tenants/tenant.model";

const PRODUCTION_DEFAULTS = [
  "crop-capital.onrender.com", // Render service hostname (host header the backend sees)
];

const parseDomains = (raw?: string): string[] =>
  (raw || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

const patchCropCapitalDomains = async () => {
  console.log("🔧 Patching cropcapital tenant domains…");
  await connectDB();

  const rawDomains =
    process.env.TENANT_DOMAINS ||
    process.env.CROPCAPITAL_TENANT_DOMAINS ||
    PRODUCTION_DEFAULTS.join(",");

  const domains = parseDomains(rawDomains);

  if (domains.length === 0) {
    console.error("❌ No domains resolved. Aborting.");
    process.exit(1);
  }

  console.log(`  Domains to set: ${domains.join(", ")}`);

  const result = await Tenant.findOneAndUpdate(
    { slug: "cropcapital" },
    { $set: { domains } },
    { new: true },
  );

  if (!result) {
    console.error(
      '❌ Tenant "cropcapital" not found. Run onboard:cropcapital first.',
    );
    process.exit(1);
  }

  console.log(`✅ Tenant "${result.slug}" updated.`);
  console.log(`   domains: [${result.domains?.join(", ") ?? ""}]`);
};

patchCropCapitalDomains()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Patch failed:", err.message);
    process.exit(1);
  });
