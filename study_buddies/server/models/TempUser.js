import mongoose from 'mongoose';

const TempUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  VerifCode: {type: String, required: true },
  CodeExpiry: {type: Date, required: true}
}, { timestamps: true });

const TempUser = mongoose.model('TempUser', TempUserSchema);
export default TempUser; 