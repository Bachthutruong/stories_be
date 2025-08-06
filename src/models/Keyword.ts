import mongoose, { Schema, models, model } from 'mongoose';

const KeywordSchema = new Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    action: {
        type: String,
        enum: ['block', 'flag', 'review'],
        default: 'review',
        required: true,
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
        required: true,
    },
}, { timestamps: true });

// Add indexes for better query performance
KeywordSchema.index({ word: 1 });
KeywordSchema.index({ action: 1 });
KeywordSchema.index({ severity: 1 });

export default models.Keyword || model('Keyword', KeywordSchema); 