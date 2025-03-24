import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 1
  },
  members: {
    type: [String], // Array to store user IDs or names
    default: []
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Group = mongoose.model('Group', groupSchema);

export default Group;
