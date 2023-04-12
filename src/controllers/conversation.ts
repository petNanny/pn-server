import { RequestHandler } from "express";
import Conversation from "../models/ConversationModel";
import PetOwner from "../models/PetOwnerModel";
import mongoose from "mongoose";
import createHttpError from "http-errors";

// start conversation
// @route POST /
export const newConversation: RequestHandler = async (req, res, next) => {
  const { senderId, receiverId } = req.body;

  try {
    const foundConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    const foundSender = await PetOwner.findById(senderId);
    const foundReceiver = await PetOwner.findById(receiverId);
    if (!foundSender || !foundReceiver) {
      throw createHttpError(400, "User not found");
    }

    if (!foundConversation) {
      const conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
      res.status(201).json(conversation);
    } else {
      res.status(200).json(foundConversation);
    }
  } catch (error) {
    next(error);
  }
};

// get all conversations from one user
// @route GET getAll/:userId
export const getConversations: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw createHttpError(400, "Invalid pet owner id.");
    }
    const foundUser = await PetOwner.findById(userId);
    if (!foundUser) {
      throw createHttpError(400, "User not found");
    }
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

// get one conversation
// @route GET getOne/:conversationId
export const getConversation: RequestHandler = async (req, res, next) => {
  const { conversationId } = req.params;
  try {
    if (!mongoose.isValidObjectId(conversationId)) {
      throw createHttpError(400, "Invalid conversation id.");
    }
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
};

// delete conversation
// @route DELETE deleteOne/:conversationId
// export const deleteConversation: RequestHandler = async (req, res, next) => {
//   const { conversationId } = req.params;
//   try {
//     const conversation = await Conversation.findByIdAndDelete(conversationId);
//     res.status(200).json(conversation);
//   } catch (error) {
//     next(error);
//   }
// }
