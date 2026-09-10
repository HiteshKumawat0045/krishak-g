import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri || uri.trim() === "") {
    console.error(
      "MongoDB Connection Error: Neither MONGODB_URI nor MONGO_URI is set in environment variables."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri.trim());
    console.log("MongoDB connected");
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message || error}`);
    process.exit(1);
  }
}
