// models/Member.js
const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        relation: {
            type: String,
            enum: ["Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Other"],
        },
        phone: { type: String, trim: true, match: [/^[0-9]{10}$/, "Nominee phone must be 10 digits"] },
    },
    { _id: false }
);

const memberSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            match: [/^[0-9]{10}$/, "Phone must be a 10-digit number"],
        },
        aadhar: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{12}$/, "Aadhar must be a 12-digit number"],
        },
        address: { type: String, required: true, trim: true },
        tshirtSize: {
            type: String,
            required: true,
            enum: ["S", "M", "L", "XL", "XXL", "3XL"],
        },
        shortsSize: {
            type: String,
            required: true,
            enum: ["S", "M", "L", "XL", "XXL", "3XL"],
        },
        insurance: { type: Boolean, default: false },
        nominee: { type: nomineeSchema, default: null },
        // Date the member was added — defaults to "now" same as the old frontend did
        joined: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);