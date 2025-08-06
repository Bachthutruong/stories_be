import mongoose, { Schema, models, model } from 'mongoose';

const ReportSchema = new Schema({
    contentType: {
        type: String,
        enum: ['post', 'comment'],
        required: true,
    },
    contentId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for the report.'],
        enum: ['spam', 'inappropriate', 'harassment', 'violence', 'copyright', 'other'],
    },
    description: {
        type: String,
        required: false,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending',
    },
    adminResponse: {
        type: String,
        default: '',
    },
}, { timestamps: true });

// Add indexes for better query performance
ReportSchema.index({ contentType: 1, contentId: 1 });
ReportSchema.index({ userId: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ createdAt: -1 });

export default models.Report || model('Report', ReportSchema); 