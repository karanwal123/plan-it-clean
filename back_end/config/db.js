import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`PLAN-IT back-end is ready :: ${conn.connection.host}`);
  } catch (error) {
    console.error("oopsie doopsie..code got fked:", error.message);
    process.exit(1);
  }
};

export default connectDB;
