import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'student'; // Role to distinguish between admin and user
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], required: true }, // Role field
});

export default mongoose.model<IUser>('User', UserSchema);
