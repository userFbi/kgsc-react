const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.get("/", verifyToken, requireRole("admin", "manager"), getTransactions);
router.post("/", verifyToken, requireRole("admin"), createTransaction);
router.delete("/:id", verifyToken, requireRole("admin"), deleteTransaction);

module.exports = router;
