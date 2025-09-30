import mongoose, { Schema, models, model } from 'mongoose';

const PostSchema = new Schema({
    postId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for this post.'],
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Please provide content for this post.'],
    },
    images: [{
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    }],
    description: {
        type: String,
        required: [true, 'Please provide a description for this post.'],
    },
    contactInfo: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
    },
    likes: {
        type: Number,
        default: 0,
    },
    shares: {
        type: Number,
        default: 0,
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isHidden: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['published', 'draft', 'archived', 'pending_review', 'rejected'],
        default: 'published',
    },
    luckyNumber: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Add indexes for better query performance
PostSchema.index({ isHidden: 1, likes: -1, createdAt: -1 });
PostSchema.index({ isHidden: 1, shares: -1, createdAt: -1 });
PostSchema.index({ isHidden: 1, commentsCount: -1, createdAt: -1 });
PostSchema.index({ isFeatured: 1, isHidden: 1, createdAt: -1 });
PostSchema.index({ userId: 1 });
PostSchema.index({ status: 1 });

export default models.Post || model('Post', PostSchema); 