const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
  },
  { timestamps: true },
);
// Auto-delete messages 7 days after they're created (MongoDB TTL index)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
module.exports = mongoose.model("Message", messageSchema);
