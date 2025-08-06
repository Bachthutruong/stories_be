import mongoose, { Schema, models, model, Document } from 'mongoose';

interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    name?: string;
    content: string;
    userIp: string;
    status: string;
}

const CommentSchema = new Schema<IComment>({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional if user comments without logging in
    },
    name: {
        type: String,
        required: function (this: IComment) { return !this.userId; }, // Required if userId is not present
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    content: {
        type: String,
        required: [true, 'Comment content cannot be empty.'],
    },
    userIp: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'approved',
    },
}, { timestamps: true });

// Add indexes for better query performance
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ status: 1 });

export default models.Comment || model<IComment>('Comment', CommentSchema); 