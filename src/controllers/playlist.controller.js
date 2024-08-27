import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;

  if (!(name && description)) {
    throw new ApiError(400, "Name and description are required");
  }
  const createPlaylist = await Playlist.create({ name, description, owner });

  if (!createPlaylist) {
    throw new ApiError(500, "Something went wrong while creating a playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, createPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const playlistList = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistList, "Playlist List fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  // Use aggregate to join the Playlist with the Video collection
  const playlist = await Playlist.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(`${playlistId}`) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos", // The field in Playlist that contains video IDs
        foreignField: "_id", // The field in Videos collection that matches video IDs
        as: "videos", // The name of the new array field to add video details
        pipeline: [
          {
            $lookup: {
              from: "users", // The collection to join with (users collection)
              localField: "owner", // The field in videos that references the user ID
              foreignField: "_id", // The field in users collection that matches the user ID
              as: "owner", // The name of the array to store the joined data
            },
          },
          {
            $unwind: "$owner", // Unwind the owner array to a single object
          },
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              duration: 1,
              views: 1,
              owner: {
                _id: 1, // Include specific fields from the owner (user) document
                username: 1,
                email: 1,
                avatar: 1,
              },
            },
          },
        ],
      },
    },
  ]);

  // If no playlist found
  if (!playlist || playlist.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Playlist not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(
  async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Check if the videoId already exists in the playlist's videos array
    const checkPlaylistExistsylist = await Playlist.findOne({
      _id: playlistId,
      videos: { $elemMatch: { $eq: videoId } }, // Check if videoId exists in the array
    });

    if (checkPlaylistExistsylist) {
      throw new ApiError(404, "Video already exists in playlist");
    }

    const addedVideoPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: videoId,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          addedVideoPlaylist,
          "Video added to playlist successfully"
        )
      );
  },
  { new: true }
);

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId }, // Remove the videoId from the videos array
    },
    { new: true } // Return the updated document
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video deleted from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const { name, description } = req.body;

  const checkPlaylistExists = await Playlist.findById(playlistId);
  if (!checkPlaylistExists) throw new ApiError(404, "Playlist not found");

  if (!(name && description)) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlistUpdate = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistUpdate, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
