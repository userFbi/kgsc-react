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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    membershipId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    aadhar: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    tshirtSize: { type: String, default: null },
    shortsSize: { type: String, default: null },
    joined: { type: Date, default: Date.now },
    insurance: { type: Boolean, default: false },
    nominee: { type: nomineeSchema, default: null },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);