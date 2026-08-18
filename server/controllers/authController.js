const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
  };
}

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
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
    const { fullName, phone, address, aadharNumber } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (aadharNumber) updateData.aadharNumber = aadharNumber;
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

    res.status(200).json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// PATCH /api/auth/complete-profile
exports.completeProfile = async (req, res) => {
  try {
    const { aadharNumber, address } = req.body;

    const updateData = {};
    if (aadharNumber) updateData.aadharNumber = aadharNumber;
    if (address) updateData.address = address;
    if (req.file) updateData.profilePhotoUrl = req.file.path; // Cloudinary URL

    // Profile complete tab manoge jab Aadhar aur address dono aa jayein
    const user = await User.findById(req.userId);
    const hasAadhar = aadharNumber || user.aadharNumber;
    const hasAddress = address || user.address;
    if (hasAadhar && hasAddress) {
      updateData.isProfileComplete = true;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });

    res.status(200).json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};
