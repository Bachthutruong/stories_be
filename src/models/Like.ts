import mongoose, { Schema, models, model } from 'mongoose';

const LikeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
}, { timestamps: true });

// Compound index to ensure one like per user per post
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default models.Like || model('Like', LikeSchema); 