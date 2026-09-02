const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const { getEvents, createEvent, deleteEvent } = require("../controllers/eventController");

router.get("/", verifyToken, getEvents);
router.post("/", verifyToken, requireRole("admin", "manager"), createEvent);
router.delete("/:id", verifyToken, requireRole("admin", "manager"), deleteEvent);

module.exports = router;