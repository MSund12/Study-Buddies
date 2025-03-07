import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroupMessage: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
