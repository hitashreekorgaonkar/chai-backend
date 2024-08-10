import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      // NOTE: whenever you want to enable searching field use index
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // if (this.isModified("password")) {
  //   this.password = bcrypt.hash(this.password, 10);
  // }
  // OR

  if (!this.isModified("password")) return next();
  s;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// NOTE: never write arrow fun () => {} like this in pre 29:30 ep.9 bcz. we dont't have 'this' reference in arrow fun

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// isPasswordCorrect - we created custom method here. compare(password - this is user pwd, this.password - this is encrypted pwd)

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
// here we didn't used async await bcz it gives response immediately

export const User = mongoose.model("User", userSchema);
// NOTE: model("User") mongoDB saves model "User" as "users" - lowercase and plural
