import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromMess: { type: String, enum: ['A', 'B'], required: true },
  toMess: { type: String, enum: ['A', 'B'], required: true },
  appliedAt: { type: Date, default: Date.now },
});

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
export default SwapRequest;
