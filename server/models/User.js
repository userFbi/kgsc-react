const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, trim: true },
        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
        },
        googleId: { type: String, default: null },
        aadharNumber: { type: String, default: null,  },
        role: {
            type: String,
            enum: ["member", "manager", "admin"],
            default: "member",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        membershipId: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
        },
        profilePhotoUrl: {
            type: String,
            default: null,
        },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        address: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);