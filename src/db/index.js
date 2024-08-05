import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    console.log(`\nconnectionInstance: ${connectionInstance}`);
    // NOTE: connectionInstance.connection.host this is used for -> If by mistake instead of production server we connect to another server as DB is different for Production, Devlopment and Testing. So that we know on which HOST we are connecting.
    //  TODO:  console log `connectionInstance` and - Read more about process.exit code
  } catch (error) {
    console.log("MONGODB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
