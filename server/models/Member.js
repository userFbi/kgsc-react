const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    aadhar: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    tshirtSize: { type: String, required: true },
    shortsSize: { type: String, required: true },
    joined: { type: Date, default: Date.now },
    insurance: { type: Boolean, default: false },
    nominee: { type: nomineeSchema, default: null },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Member", memberSchema);
