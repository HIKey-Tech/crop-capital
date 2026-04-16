import { User } from "../src/modules/users/user.model";
import { Farm } from "../src/modules/farms/farm.model";
import { Investment } from "../src/modules/investments/investment.model";
import { connectDB } from "../src/config/db";

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    await connectDB();

    // Create or update admin user
    const adminData = {
      name: "Admin User",
      email: "admin@cropcapital.com",
      password: "admin123",
      role: "super_admin" as const,
      country: "Nigeria",
      isVerified: true,
    };

    let admin = await User.findOne({ email: adminData.email });
    if (admin) {
      admin.password = adminData.password;
      admin.markModified("password"); // Ensure password is hashed
      admin.name = adminData.name;
      admin.role = adminData.role;
      admin.country = adminData.country;
      admin.isVerified = true;
      await admin.save();
      console.log("✅ Updated admin user password");
    } else {
      admin = await User.create(adminData);
      console.log("✅ Created admin user");
    }

    // Create or update investor users
    const investorDataList = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "investor" as const,
        country: "Ghana",
        isVerified: true,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "investor" as const,
        country: "Nigeria",
        isVerified: true,
      },
      {
        name: "Samuel Johnson",
        email: "samuel@example.com",
        password: "password123",
        role: "investor" as const,
        country: "Kenya",
        isVerified: false,
      },
    ];

    const investors = [];
    for (const investorData of investorDataList) {
      let investor = await User.findOne({ email: investorData.email });
      if (investor) {
        investor.password = investorData.password;
        investor.markModified("password"); // Ensure password is hashed
        investor.name = investorData.name;
        investor.country = investorData.country;
        investor.isVerified = investorData.isVerified;
        await investor.save();
        investors.push(investor);
        console.log(`✅ Updated investor: ${investorData.email}`);
      } else {
        investor = await User.create(investorData);
        investors.push(investor);
        console.log(`✅ Created investor: ${investorData.email}`);
      }
    }

    // Create farms (skip if already exist)
    const farmDataList = [
      {
        name: "Cassava Plantation Co.",
        location: "Buchanan, Liberia",
        coordinates: { latitude: 5.8808, longitude: -10.0467 },
        images: [
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        ],
        imagePublicIds: ["seed_cassava_plantation_1"],
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
        name: "Baobab Orchards",
        location: "Kakata, Liberia",
        coordinates: { latitude: 6.5333, longitude: -10.35 },
        images: [
          "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800",
        ],
        imagePublicIds: ["seed_baobab_orchards_1"],
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
      {
        name: "Green Palm Trees Farm",
        location: "Monrovia, Liberia",
        coordinates: { latitude: 6.3004, longitude: -10.7969 },
        images: [
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
        ],
        imagePublicIds: ["seed_palm_trees_1"],
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
        coordinates: { latitude: 6.3106, longitude: -10.8047 },
        images: [
          "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        ],
        imagePublicIds: ["seed_wheat_rolls_1"],
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
        name: "Grain Wheat Plantation",
        location: "Gbarnga, Liberia",
        coordinates: { latitude: 7.0091, longitude: -9.4856 },
        images: [
          "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
        ],
        imagePublicIds: ["seed_grain_wheat_1"],
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
        coordinates: { latitude: 4.375, longitude: -7.7169 },
        images: [
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
        ],
        imagePublicIds: ["seed_sunrise_agrofarm_1"],
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
        name: "Green Valley Rice Farm",
        location: "Bong County, Liberia",
        coordinates: { latitude: 7.0833, longitude: -9.3667 },
        images: [
          "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        ],
        imagePublicIds: [
          "sample_rice_farm_1",
          "sample_rice_farm_2",
          "sample_rice_farm_3",
        ],
        minimumInvestment: 500,
        investmentGoal: 50000,
        fundedAmount: 35000,
        roi: 15,
        durationMonths: 12,
      },
      {
        name: "Cassava Processing Plant",
        location: "Nimba County, Liberia",
        coordinates: { latitude: 7.4961, longitude: -8.8201 },
        images: [
          "https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&w=800",
          "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800",
        ],
        imagePublicIds: ["sample_cassava_plant_1", "sample_cassava_plant_2"],
        minimumInvestment: 1000,
        investmentGoal: 100000,
        fundedAmount: 75000,
        roi: 20,
        durationMonths: 18,
      },
      {
        name: "Organic Vegetable Farm",
        location: "Margibi County, Liberia",
        coordinates: { latitude: 6.5151, longitude: -10.3047 },
        images: [
          "https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=800",
          "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800",
          "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        ],
        imagePublicIds: [
          "sample_vegetable_farm_1",
          "sample_vegetable_farm_2",
          "sample_vegetable_farm_3",
          "sample_vegetable_farm_4",
        ],
        minimumInvestment: 300,
        investmentGoal: 30000,
        fundedAmount: 28000,
        roi: 18,
        durationMonths: 9,
      },
      {
        name: "Poultry Production Farm",
        location: "Montserrado County, Liberia",
        coordinates: { latitude: 6.3004, longitude: -10.7969 },
        images: [
          "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800",
        ],
        imagePublicIds: ["sample_poultry_farm_1"],
        minimumInvestment: 750,
        investmentGoal: 60000,
        fundedAmount: 45000,
        roi: 22,
        durationMonths: 15,
      },
      {
        name: "Cocoa Plantation",
        location: "Grand Gedeh County, Liberia",
        coordinates: { latitude: 5.9223, longitude: -8.2211 },
        images: [
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
          "https://images.unsplash.com/photo-1504387828636-abeb50778c0c?w=800",
          "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800",
        ],
        imagePublicIds: [
          "sample_cocoa_plantation_1",
          "sample_cocoa_plantation_2",
          "sample_cocoa_plantation_3",
        ],
        minimumInvestment: 2000,
        investmentGoal: 150000,
        fundedAmount: 90000,
        roi: 25,
        durationMonths: 24,
      },
      {
        name: "Fish Farming Project",
        location: "Grand Bassa County, Liberia",
        coordinates: { latitude: 6.2354, longitude: -10.0467 },
        images: [
          "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800",
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        ],
        imagePublicIds: ["sample_fish_farm_1", "sample_fish_farm_2"],
        minimumInvestment: 400,
        investmentGoal: 40000,
        fundedAmount: 15000,
        roi: 16,
        durationMonths: 10,
      },
    ];

    const farms = [];
    for (const farmData of farmDataList) {
      let farm = await Farm.findOne({ name: farmData.name });
      if (!farm) {
        farm = await Farm.create(farmData);
        console.log(`✅ Created farm: ${farmData.name}`);
      } else {
        // Update existing farm with new data
        farm.location = farmData.location;
        farm.coordinates = farmData.coordinates;
        farm.images = farmData.images;
        farm.imagePublicIds = farmData.imagePublicIds;
        farm.minimumInvestment = farmData.minimumInvestment;
        farm.investmentGoal = farmData.investmentGoal;
        farm.fundedAmount = farmData.fundedAmount;
        farm.roi = farmData.roi;
        farm.durationMonths = farmData.durationMonths;
        if (farmData.updates) {
          farm.updates = farmData.updates;
        }
        await farm.save();
        console.log(`✅ Updated farm: ${farmData.name}`);
      }
      farms.push(farm);
    }

    // Create sample investments (skip if already exist)
    const investmentDataList = [
      {
        investor: investors[0]._id,
        farm: farms[0]._id,
        amount: 5000,
        roi: farms[0].roi,
        durationMonths: farms[0].durationMonths,
        status: "completed",
        roiPaid: false,
        paystackReference: "TXN_SEED_1",
      },
      {
        investor: investors[0]._id,
        farm: farms[2]._id,
        amount: 2000,
        roi: farms[2].roi,
        durationMonths: farms[2].durationMonths,
        status: "completed",
        roiPaid: true,
        paystackReference: "TXN_SEED_2",
      },
      {
        investor: investors[1]._id,
        farm: farms[1]._id,
        amount: 10000,
        roi: farms[1].roi,
        durationMonths: farms[1].durationMonths,
        status: "completed",
        roiPaid: false,
        paystackReference: "TXN_SEED_3",
      },
      {
        investor: investors[1]._id,
        farm: farms[3]._id,
        amount: 3000,
        roi: farms[3].roi,
        durationMonths: farms[3].durationMonths,
        status: "completed",
        roiPaid: false,
        paystackReference: "TXN_SEED_4",
      },
    ];

    const investments = [];
    for (const investmentData of investmentDataList) {
      let investment = await Investment.findOne({
        paystackReference: investmentData.paystackReference,
      });
      if (!investment) {
        investment = await Investment.create(investmentData);
        console.log(
          `✅ Created investment: ${investmentData.paystackReference}`,
        );
      } else {
        console.log(
          `⏭️  Investment already exists: ${investmentData.paystackReference}`,
        );
      }
      investments.push(investment);
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`   - Admin users: 1`);
    console.log(`   - Investor users: ${investors.length}`);
    console.log(`   - Farms: ${farms.length}`);
    console.log(`   - Investments: ${investments.length}`);
    console.log("\n🔑 Login Credentials:");
    console.log("   Admin:");
    console.log("     Email: admin@cropcapital.com");
    console.log("     Password: admin123");
    console.log("\n   Investor:");
    console.log("     Email: john@example.com");
    console.log("     Password: password123");
    console.log("\n✅ Database seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
