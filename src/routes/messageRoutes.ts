import express from "express";
import * as messageController from "../controllers/message";

const router = express.Router();

// Send a message
router.post("/addMessage", messageController.newMessage);

// Get all messages from one conversation
router.get("/getMessages/:conversationId", messageController.getMessages);

export default router;
