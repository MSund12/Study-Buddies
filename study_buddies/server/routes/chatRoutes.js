import express from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
} from "../controllers/chatController.js";
import auth from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.post(
  "/:groupId/messages",
  auth,
  validateObjectId("groupId"),
  sendMessage
);

router.get(
  "/:groupId/messages",
  auth,
  validateObjectId("groupId"),
  getMessages
);

router.put(
  "/messages/:messageId/read",
  auth,
  validateObjectId("messageId"),
  markAsRead
);

export default router;
