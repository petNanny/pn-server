import { RequestHandler } from "express";
import Message from "../models/MessageModel";
import mongoose from "mongoose";
import createHttpError from "http-errors";

// add a chat message
// @route POST /addMessage
export const newMessage: RequestHandler = async (req, res, next) => {
  const { conversationId, sender, text } = req.body;
  try {
    const message = await Message.create({ conversationId, sender, text });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// get all chat messages from one conversation
// @route GET /getMessage/:conversationId
export const getMessages: RequestHandler = async (req, res, next) => {
  const { conversationId } = req.params;
  try {
    if (!mongoose.isValidObjectId(conversationId)) {
      throw createHttpError(400, "Invalid conversation id.");
    }
    const messages = await Message.find({
      conversationId: conversationId,
    }).populate({
      path: "conversationId",
      populate: {
        path: "members",
        select: "-password -email -phone -address -roles",
        strictPopulate: false,
      },
    });
    if (!messages) return res.status(404).json({ message: "Messages not found" });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
