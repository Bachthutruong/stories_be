import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this user.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a phone number for this user.'],
        unique: true,
        maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    email: {
        type: String,
        required: false,
        default: undefined,
        maxlength: [50, 'Email cannot be more than 50 characters'],
    },
    password: {
        type: String,
        required: false,
        default: '',
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },
}, { timestamps: true });

// Remove the old unique index and add a partial unique index for email
UserSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { email: { $exists: true, $ne: null } } }
);

// Add index for phoneNumber queries (phoneNumber is already unique)
// UserSchema.index({ phoneNumber: 1 }); // Not needed as phoneNumber is already unique

export default models.User || model('User', UserSchema); 