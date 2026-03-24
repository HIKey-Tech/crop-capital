/**
 * One-time migration: drop the legacy global `email_1` unique index on the
 * users collection. The schema now uses a compound `{ tenantId, email }`
 * unique index (sparse), allowing the same email to exist across different
 * tenants (e.g., investor on one tenant + admin on another).
 */
import mongoose from "mongoose";
import { connectDB } from "../src/config/db";

const run = async () => {
  await connectDB();

  const db = mongoose.connection.db!;
  const collection = db.collection("users");

  const indexes = await collection.indexes();
  const legacy = indexes.find((idx) => idx.name === "email_1");

  if (!legacy) {
    console.log("ℹ️  No legacy email_1 index found — nothing to do.");
    process.exit(0);
  }

  await collection.dropIndex("email_1");
  console.log("✅ Dropped legacy email_1 unique index from users collection.");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
