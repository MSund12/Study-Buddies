import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // Admin status check
  isVerified: {type: Boolean, default: false},
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User; 
