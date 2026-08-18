const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const {
  addMember,
  getMembers,
  getDashboard,
  addInsurance,
  removeInsurance,
  updateMember,
  deleteMember,
} = require("../controllers/managerController");

router.use(verifyToken, requireRole("manager", "admin"));

router.post("/members", addMember);
router.get("/members", getMembers);
router.get("/dashboard", getDashboard);
router.patch("/members/:id/insurance", addInsurance);
router.delete("/members/:id/insurance", removeInsurance);
router.put("/members/:id", updateMember);
router.delete("/members/:id", deleteMember);

module.exports = router;
