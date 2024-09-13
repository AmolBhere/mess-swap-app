import mongoose from 'mongoose';

const swappedUsersSchema = new mongoose.Schema({
  userId1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  swappedAt: { type: Date, default: Date.now },
});

export default mongoose.model('SwappedUsers', swappedUsersSchema);
