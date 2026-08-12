// routes/managerRoutes.js
const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");

const {
    getDashboardStats,
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    getInsuredMembers,
    addInsurance,
    removeInsurance,
} = require("../controllers/manager");

// Every route below is Manager/Admin only
router.use(protect, requireRole("manager", "admin"));

// Dashboard.jsx
router.get("/dashboard", getDashboardStats);

// Insurance.jsx  (declared before "/members/:id" so "insured" isn't read as an :id)
router.get("/members/insured", getInsuredMembers);
router.patch("/members/:id/insurance", addInsurance);
router.delete("/members/:id/insurance", removeInsurance);

// AddMember.jsx / ViewMembers.jsx
router.get("/members", getMembers);
router.post("/members", createMember);
router.get("/members/:id", getMemberById);
router.put("/members/:id", updateMember);
router.delete("/members/:id", deleteMember);

module.exports = router;