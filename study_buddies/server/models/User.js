import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => v.endsWith("@yorku.ca"),
        message: "Email must be a @yorku.ca address",
      },
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
