import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  Fac: { type: String },
  Dept: { type: String, required: true },
  Term: { type: String },
  "Course Name": { type: String },
  "Course ID": { type: String, required: true },
  Hours: [
    {
      Type: { type: String },
      Meet: { type: Number },
      "Cat.No": { type: String },
      Day: { type: String },
      Time: { type: String },
      Dur: { type: Number },
      Campus: { type: String },
      Room: { type: String },
      "Full Course ID": { type: String },
    },
  ],
}, {
  collection: 'Courses', 
  timestamps: true,
});

export default mongoose.model("Course", courseSchema);