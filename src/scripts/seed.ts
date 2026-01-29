import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../modules/users/user.model";
import { Farm } from "../modules/farms/farm.model";
import { Investment } from "../modules/investments/investment.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Farm.deleteMany({});
    await Investment.deleteMany({});

    // Create admin user
    console.log("👤 Creating users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@ayfagro.com",
      password: adminPassword,
      role: "admin",
      country: "Liberia",
      isVerified: true,
    });

    // Create investor users
    const investorPassword = await bcrypt.hash("investor123", 10);
    const investor1 = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: investorPassword,
      role: "investor",
      country: "Liberia",
      isVerified: true,
    });

    const investor2 = await User.create({
      name: "Jane Smith",
      email: "jane@example.com",
      password: investorPassword,
      role: "investor",
      country: "Nigeria",
      isVerified: true,
    });

    const investor3 = await User.create({
      name: "Samuel Johnson",
      email: "samuel@example.com",
      password: investorPassword,
      role: "investor",
      country: "Ghana",
      isVerified: true,
    });

    console.log("🌾 Creating farms...");
    const farms = await Farm.insertMany([
      {
        name: "Green Palm Trees Farm",
        location: "Monrovia, Liberia",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
        investmentGoal: 5000000,
        minimumInvestment: 10000,
        roi: 15,
        durationMonths: 6,
        fundedAmount: 1050000,
        updates: [
          { stage: "Land preparation", date: new Date("2024-01-15") },
          { stage: "Planting started", date: new Date("2024-02-01") },
        ],
      },
      {
        name: "Wheat Rolls Valley Farm",
        location: "Monrovia, Liberia",
        image:
          "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        investmentGoal: 7500000,
        minimumInvestment: 10000,
        roi: 18,
        durationMonths: 12,
        fundedAmount: 4500000,
        updates: [
          { stage: "Land acquisition", date: new Date("2024-02-01") },
          { stage: "Soil testing completed", date: new Date("2024-02-15") },
          { stage: "Equipment procurement", date: new Date("2024-03-01") },
        ],
      },
      {
        name: "Cassava Plantation Co.",
        location: "Buchanan, Liberia",
        image:
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        investmentGoal: 12000000,
        minimumInvestment: 15000,
        roi: 20,
        durationMonths: 18,
        fundedAmount: 12000000,
        updates: [
          { stage: "Fully funded", date: new Date("2023-10-01") },
          { stage: "Planting completed", date: new Date("2023-11-15") },
          { stage: "First harvest", date: new Date("2024-04-01") },
        ],
      },
      {
        name: "Grain Wheat Plantation",
        location: "Gbarnga, Liberia",
        image:
          "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
        investmentGoal: 9000000,
        minimumInvestment: 10000,
        roi: 16,
        durationMonths: 24,
        fundedAmount: 6750000,
        updates: [{ stage: "Land clearing", date: new Date("2024-03-01") }],
      },
      {
        name: "Sunrise Agrofarm",
        location: "Harper, Liberia",
        image:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
        investmentGoal: 5000000,
        minimumInvestment: 10000,
        roi: 15,
        durationMonths: 12,
        fundedAmount: 5000000,
        updates: [
          { stage: "Fully funded", date: new Date("2023-06-01") },
          { stage: "Harvest completed", date: new Date("2024-06-01") },
          { stage: "ROI distributed", date: new Date("2024-06-15") },
        ],
      },
      {
        name: "Baobab Orchards",
        location: "Kakata, Liberia",
        image:
          "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800",
        investmentGoal: 9000000,
        minimumInvestment: 20000,
        roi: 22,
        durationMonths: 36,
        fundedAmount: 7200000,
        updates: [
          { stage: "Orchard planning", date: new Date("2024-01-20") },
          { stage: "Seedling procurement", date: new Date("2024-02-10") },
        ],
      },
    ]);

    console.log("💰 Creating investments...");
    await Investment.insertMany([
      {
        investor: investor1._id,
        farm: farms[0]._id,
        amount: 500000,
        roi: farms[0].roi,
        durationMonths: farms[0].durationMonths,
        roiPaid: false,
        status: "completed",
      },
      {
        investor: investor1._id,
        farm: farms[1]._id,
        amount: 250000,
        roi: farms[1].roi,
        durationMonths: farms[1].durationMonths,
        roiPaid: false,
        status: "completed",
      },
      {
        investor: investor2._id,
        farm: farms[0]._id,
        amount: 300000,
        roi: farms[0].roi,
        durationMonths: farms[0].durationMonths,
        roiPaid: false,
        status: "completed",
      },
      {
        investor: investor2._id,
        farm: farms[2]._id,
        amount: 1000000,
        roi: farms[2].roi,
        durationMonths: farms[2].durationMonths,
        roiPaid: true,
        status: "completed",
      },
      {
        investor: investor3._id,
        farm: farms[3]._id,
        amount: 750000,
        roi: farms[3].roi,
        durationMonths: farms[3].durationMonths,
        roiPaid: false,
        status: "completed",
      },
    ]);

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:    admin@ayfagro.com / admin123");
    console.log("Investor: john@example.com / investor123");
    console.log("Investor: jane@example.com / investor123");
    console.log("Investor: samuel@example.com / investor123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
