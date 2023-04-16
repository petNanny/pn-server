import express from "express";
import * as conversationController from "../controllers/conversation";

const router = express.Router();

// start conversation
router.post("/", conversationController.newConversation);

// get all conversations from one user
router.get("/getAll/:userId", conversationController.getConversations);

// get one conversation
router.get("/getOne/:conversationId", conversationController.getConversation);

// delete conversation
// router.delete("/deleteOne/:conversationId", conversationController.deleteConversation);

export default router;
