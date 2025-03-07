import express from "express";
import {
  createGroup,
  getGroupDetails,
  deleteGroup,
} from "../controllers/groupController.js";
import auth from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.post("/", auth, createGroup);
router.get("/:id", validateObjectId("id"), auth, getGroupDetails);
router.delete("/:id", validateObjectId("id"), auth, deleteGroup);

export default router;
