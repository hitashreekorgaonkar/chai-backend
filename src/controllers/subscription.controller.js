import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // NOTE: To understand this watch video ep.18 Subscription Schema

  const { channelId } = req.body;

  const subscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (subscribed) {
    await Subscription.findByIdAndDelete(subscribed._id);
    // console.log("delete/Unsubscribed!");
  } else {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    // console.log("create/Subscribed!");
  }

  const msg = subscribed ? "Unsubscribed" : "Subscribed";

  return res.status(200).json(new ApiResponse(200, {}, `${msg} Successfully`));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscribedChannelsList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(`${req.user._id}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel: {
          $first: "$channel",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannelsList, length: subscribedChannelsList.length },
        "Successfully received channels list"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(`${req.user._id}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, length: subscribers.length },
        "Successfully received subscribers list"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
