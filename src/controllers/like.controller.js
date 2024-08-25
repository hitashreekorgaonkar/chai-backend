import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "Video ID is required");
  }

  const checkVideoExists = await Video.findById(videoId);
  if (!checkVideoExists) throw new ApiError(404, "Video not found");

  const likedVideo = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);
  } else {
    await Like.create({
      likedBy: req.user._id,
      video: videoId,
    });
  }

  const msg = likedVideo ? "Disliked" : "Liked";

  return res.status(200).json(new ApiResponse(200, {}, `Video is ${msg}`));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              duration: 1,
              views: 1,
              owner: 1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$ownerDetails", // Unwind the ownerDetails array to convert it into an object
          },
        ],
      },
    },
    {
      $unwind: "$video", // Extract the first element from the video array
    },
  ]);

  if (!likedVideos) throw new ApiError(500, "Error fetching your video list");

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "All liked videos list"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

// NOTE: $addFields: Enhances documents by Add or modifying info within documents.
// NOTE: $unwind: Splits arrays into separate documents.
