import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatId: {type: String, required: true, index: true}
}, { timestamps: true });

const ChatMessage = mongoose.model('Chat', chatSchema);

export default ChatMessage;