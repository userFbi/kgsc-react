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

module.exports = mongoose.model("Message", messageSchema);
