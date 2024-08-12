import { v2 as cloudinary } from "cloudinary";
import exp from "constants";
import fs from "fs"; // ep.10 14:12 File System is from Node

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    // ep. 10 21:21 .upload explained
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("response", response);
    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file, as the upload operation on cloudinary got failed
    console.error("Error uploading file to cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary };
