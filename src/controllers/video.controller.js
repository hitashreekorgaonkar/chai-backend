import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page, limit, query, sortBy, sortType, userId } = req.query;
  console.log("req.query", req.query);

  // Construct the MongoDB query object
  let dbQuery = {};

  // If a query string is provided, search in relevant fields (e.g., title or description)
  if (query) {
    dbQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // If a userId is provided, add it to the query
  if (userId) {
    dbQuery.owner = userId;
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Sorting
  const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };
  console.log("sortOptions", sortOptions);

  // Fetch videos
  const videos = await Video.find(dbQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Total count for pagination
  const totalVideos = await Video.countDocuments(dbQuery);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / limit),
        totalVideos,
      },
      "All videos fetched successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "Please provide video title and description");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  // upload your file on cloud using a method
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video and Thumbnail file is required");
  }

  const owner = await User.findById(req?.user._id).select(
    "-password -refreshToken"
  );

  // create video object - create entry in db
  const createdVideo = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: owner,
    // TODO: Try aggregate here
  });

  return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "Please provide video title and description");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading on thumbnail");
  }
  if (!videoFile.url) {
    throw new ApiError(400, "Error while uploading on videoFile");
  }

  await deleteFromCloudinary(videoFileLocalPath);
  await deleteFromCloudinary(thumbnailLocalPath);

  const videoUpdate = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description: description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, videoUpdate, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "video Id is missing");
  }

  const video = await Video.findById(videoId);
  console.log("video", video.isPublished);
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status updated successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
