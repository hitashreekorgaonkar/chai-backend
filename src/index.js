// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();

/* 1st Approach to connect the database
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();

NOTE: // An IIFE (Immediately Invoked Function Expression) in JavaScript is a function that is executed immediately after it is defined.
// ; it is used for cleaning purpose chai aur JS BAckend ep. 6 17:45

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => {
      console.log("ERR", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR: ", error);
    throw err;
  }
})(); */
