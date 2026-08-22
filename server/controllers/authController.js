const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Member = require("../models/Member");
const Otp = require("../models/Otp");
const sendEmail = require("../config/brevo");


// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    membershipId: user.membershipId,
    profilePhotoUrl: user.profilePhotoUrl,
    isProfileComplete: user.isProfileComplete,
    address: user.address,
    aadharNumber: user.aadharNumber,
    tshirtSize: user.tshirtSize,
    shortsSize: user.shortsSize,
    createdAt: user.createdAt,
  };
}


// POST /api/auth/signup
// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phone, password, aadhar } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const totalUsers = await User.countDocuments();
    const membershipId = `KGSC-${String(totalUsers + 1).padStart(4, "0")}`;

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      membershipId,
      aadharNumber: aadhar || null,
    });

    await Member.create({
      userId: user._id,
      name: fullName,
      phone,
      aadhar: aadhar || null,
    });

    const token = generateToken(user._id);

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Phone number or Member ID and password are required." });
    }

    const trimmedIdentifier = identifier.trim();

    // Match against phone number OR membership ID (case-insensitive for the ID)
    const user = await User.findOne({
      $or: [
        { phone: trimmedIdentifier },
        { membershipId: trimmedIdentifier.toUpperCase() },
      ],
    });

    if (!user || !user.password) {
      return res
        .status(400)
        .json({ error: "Invalid phone number/Member ID or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid phone number/Member ID or password." });
    }

    const token = generateToken(user._id);

    res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// POST /api/auth/google (stub — baad me complete karenge)
exports.googleLogin = async (req, res) => {
  return res.status(501).json({ error: "Google login not set up yet." });
};

// PATCH /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, address, aadharNumber, tshirtSize, shortsSize } = req.body;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (address !== undefined) updateData.address = address.trim();
    if (aadharNumber !== undefined) updateData.aadharNumber = aadharNumber.trim();
    if (tshirtSize !== undefined) updateData.tshirtSize = tshirtSize;
    if (shortsSize !== undefined) updateData.shortsSize = shortsSize;
    if (req.file) updateData.profilePhotoUrl = req.file.path;

    const currentUser = await User.findById(req.userId);
    const finalAadhar =
      aadharNumber !== undefined ? aadharNumber.trim() : currentUser.aadharNumber;
    const finalAddress =
      address !== undefined ? address.trim() : currentUser.address;

    updateData.isProfileComplete = Boolean(finalAadhar && finalAddress);

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });

    await Member.findOneAndUpdate(
      { userId: req.userId },
      {
        name: updatedUser.fullName,
        aadhar: updatedUser.aadharNumber,
        address: updatedUser.address,
        tshirtSize: updatedUser.tshirtSize,
        shortsSize: updatedUser.shortsSize,
      }
    );

    res.status(200).json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// PATCH /api/auth/complete-profile
exports.completeProfile = async (req, res) => {
  try {
    const { aadharNumber, address, tshirtSize, shortsSize } = req.body;

    const updateData = {};
    if (aadharNumber) updateData.aadharNumber = aadharNumber;
    if (address) updateData.address = address;
    if (tshirtSize) updateData.tshirtSize = tshirtSize;
    if (shortsSize) updateData.shortsSize = shortsSize;
    if (req.file) updateData.profilePhotoUrl = req.file.path;

    const user = await User.findById(req.userId);
    const hasAadhar = aadharNumber || user.aadharNumber;
    const hasAddress = address || user.address;
    if (hasAadhar && hasAddress) {
      updateData.isProfileComplete = true;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });

    // Member record sync karo
    await Member.findOneAndUpdate(
      { userId: req.userId },
      {
        name: updatedUser.fullName,
        aadhar: updatedUser.aadharNumber,
        address: updatedUser.address,
        tshirtSize: updatedUser.tshirtSize,
        shortsSize: updatedUser.shortsSize,
      }
    );

    res.status(200).json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode, expiresAt });

    await sendEmail(
      email,
      "Your KGSC verification code",
      `<p>Your OTP is <b>${otpCode}</b>. It is valid for 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Unable to send OTP." });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    await Otp.deleteOne({ _id: record._id });

    res.status(200).json({ message: "Email verified." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// POST /api/auth/forgot-password/send-otp
exports.sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({ email: email.toLowerCase(), otp: otpCode, expiresAt });

    await sendEmail(
      email,
      "Reset your KGSC password",
      `<p>Your password reset code is <b>${otpCode}</b>. It is valid for 5 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send password reset OTP error:", error);
    res.status(500).json({ message: "Unable to send OTP." });
  }
};

// POST /api/auth/forgot-password/reset
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const record = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!record) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword }
    );

    await Otp.deleteOne({ _id: record._id });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};