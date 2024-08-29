import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  if (!userId) {
    throw new ApiError(400, "User Id is missing");
  }

  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  if (!totalSubscribers) {
    throw new ApiError(400, "Channel does not exists");
  }

  const totalVideos = await Video.countDocuments({
    owner: userId,
  });

  if (!totalVideos) {
    throw new ApiError(400, "Video does not exists");
  }

  // Total Likes (only for videos)
  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $match: { "videoDetails.owner": userId } },
  ]);
  console.log("totalLikes", totalLikes.length);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        totalVideos,
        totalLikes: totalLikes.length,
      },
      "User channel fetched successfully"
    )
  );
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const getUserVideo = await Video.find({ owner: req.user._id });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getUserVideo,
        "All videos of a user retrieve successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
