require("dotenv").config();
import connectDB from "../config/db";
import User from "../models/User";

const seedData = async () => {
  try {
    await connectDB();

    // Remove existing users
    await User.deleteMany({});

    // Create default users
    const users = [
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", email: "bob@example.com" },
    ];

    await User.insertMany(users);
    console.log("Database seeded successfully");
    process.exit();
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
