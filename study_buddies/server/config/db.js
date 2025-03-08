import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Replace with your MongoDB connection string
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb+srv://yorkstudygroupfinder:QjdeoOxa2RERs5Ea@studygroupfinder.08k9b.mongodb.net/",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
