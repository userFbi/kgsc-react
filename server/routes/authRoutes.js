const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  signup,
  login,
  googleLogin,
  getMe,
  completeProfile,
  updateProfile,
  sendOtp,
  verifyOtp,
  sendPasswordResetOtp,
  resetPassword,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", verifyToken, getMe);
router.patch(
  "/complete-profile",
  verifyToken,
  upload.single("photo"),
  completeProfile,
);
router.patch("/profile", verifyToken, upload.single("photo"), updateProfile);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password/send-otp", sendPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);

module.exports = router;
