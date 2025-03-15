import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
<<<<<<< HEAD
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // Admin status check
  isVerified: {type: Boolean, default: false},
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User; 
=======
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default UserSchema;
>>>>>>> f1c13e3ffe33ace1151ba084565bf4aa8fb013df
