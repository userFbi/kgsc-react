const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const {
  getMessages,
  createMessage,
  deleteMessage,
} = require("../controllers/messageController");

router.get("/", verifyToken, getMessages);
router.post("/", verifyToken, requireRole("admin", "manager"), createMessage);
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin", "manager"),
  deleteMessage,
);

module.exports = router;
