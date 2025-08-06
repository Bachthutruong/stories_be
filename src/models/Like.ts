import mongoose, { Schema, models, model } from 'mongoose';

const LikeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for guest users
  },
  guestId: {
    type: String,
    required: false, // Optional for authenticated users
  },
  userName: {
    type: String,
    required: false, // For guest users
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
}, { timestamps: true });

// Compound indexes to ensure one like per user/guest per post
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true, sparse: true });
LikeSchema.index({ guestId: 1, postId: 1 }, { unique: true, sparse: true });

export default models.Like || model('Like', LikeSchema); 