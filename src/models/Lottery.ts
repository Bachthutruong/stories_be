import mongoose, { Schema, models, model } from 'mongoose';

const LotterySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    prize: {
        type: String,
        required: true,
    },
    maxParticipants: {
        type: Number,
        required: true,
        default: 100,
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming',
    },
    drawnAt: {
        type: Date,
    },
}, { timestamps: true });

// Add indexes for better query performance
LotterySchema.index({ status: 1 });
LotterySchema.index({ startDate: 1 });
LotterySchema.index({ endDate: 1 });

export default models.Lottery || model('Lottery', LotterySchema); 