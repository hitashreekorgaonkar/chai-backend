import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 1000 } = req.query;

  const checkVideoExists = await Video.findById(videoId);
  if (!checkVideoExists) throw new ApiError(404, "Video not found");

  // Pagination
  const skip = (page - 1) * limit;

  const getAllVideoComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(`${videoId}`),
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
  ])
    .skip(skip)
    .limit(parseInt(limit));

  // Total count for pagination
  const totalComments = await Comment.countDocuments({ video: videoId });

  if (!getAllVideoComments) throw new ApiError(500, "Error fetching comments");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        getAllVideoComments,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
      },
      "All Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  const checkVideoExists = await Video.findById(videoId);
  if (!checkVideoExists) throw new ApiError(404, "Video not found");

  if (!videoId?.trim()) throw new ApiError(400, "Video Id is required");

  if (!content?.trim()) throw new ApiError(400, "Comment content is required");

  const isCommentAlreadyExists = await Comment.findOne({
    owner: req.user._id,
    video: videoId,
  });

  if (isCommentAlreadyExists) {
    throw new ApiError(400, "Comment already exists");
  } else {
    await Comment.create({
      owner: req.user._id,
      video: videoId,
      content: content,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, Comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const checkCommentoExists = await Comment.findById(commentId);
  if (!checkCommentoExists) throw new ApiError(404, "Comment Id not found");

  if (!commentId?.trim()) {
    throw new ApiError(400, "Comment Id is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const commentUpdated = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, commentUpdated, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const checkCommentoExists = await Comment.findById(commentId);
  if (!checkCommentoExists) throw new ApiError(404, "Comment not found");

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
