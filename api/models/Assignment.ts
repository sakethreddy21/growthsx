import { Schema, model, Document } from 'mongoose';

// Define the Assignment schema
const assignmentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        task: {
            type: String,
            required: true,
        },
        admin: {
            type: String, // Storing admin name
            required: true,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model for admin
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'], // Enum for possible statuses
            default: 'pending', // Default status is 'pending'
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create the Assignment model
const Assignment = model<IAssignment>('Assignment', assignmentSchema);

export interface IAssignment extends Document {
    userId: Schema.Types.ObjectId;
    task: string;
    admin: string;
    adminId: Schema.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
}

export default Assignment;
