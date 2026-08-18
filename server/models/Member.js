const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // 👈 naya link
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    aadhar: { type: String, default: null, trim: true },       // ab optional
    address: { type: String, default: null, trim: true },       // ab optional
    tshirtSize: { type: String, default: null },                // ab optional
    shortsSize: { type: String, default: null },                // ab optional
    joined: { type: Date, default: Date.now },
    insurance: { type: Boolean, default: false },
    nominee: { type: nomineeSchema, default: null },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);