import mongoose from "mongoose";

const publicUserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true },
        password: { type: String }, // not required for google-only accounts
        googleId: { type: String },
        isApproved: { type: Boolean, default: false }, // club reviews new accounts
    },
    { timestamps: true }
);

export default mongoose.model("PublicUser", publicUserSchema);