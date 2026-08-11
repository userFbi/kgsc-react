const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kgsc/profile-photos' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function userResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    authProvider: user.authProvider,
    aadharNumber: user.aadharNumber,
    address: user.address,
    profilePhotoUrl: user.profilePhotoUrl,
    isProfileComplete: user.isProfileComplete,
  };
}

// ─────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      authProvider: 'local',
    });

    const token = generateToken(user);

    res.status(201).json({ success: true, token, user: userResponse(user) });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Failed to create account.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.authProvider !== 'local') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({ success: true, token, user: userResponse(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Failed to log in.' });
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/google
// body: { credential }  <- ID token from @react-oauth/google
// ─────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // create new account for first-time Google sign-in
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        authProvider: 'google',
        googleId,
      });
    } else if (user.authProvider !== 'google') {
      // email already registered with password login
      return res.status(409).json({
        error: 'This email is already registered with a password. Please log in normally.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({ success: true, token, user: userResponse(user) });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(401).json({ error: 'Google authentication failed.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json({ user: userResponse(user) });
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/complete-profile  (protected)
// ─────────────────────────────────────────────
exports.completeProfile = async (req, res) => {
  try {
    const { aadharNumber, address } = req.body;

    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({ error: 'Enter a valid 12-digit Aadhar number.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Address is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      user.profilePhotoUrl = result.secure_url;
    }

    user.aadharNumber = aadharNumber;
    user.address = address.trim();
    user.isProfileComplete = true;

    await user.save();

    res.status(200).json({ success: true, user: userResponse(user) });
  } catch (err) {
    console.error('Complete profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/profile  (protected) — edit any profile field
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, aadharNumber } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      user.profilePhotoUrl = result.secure_url;
    }

    if (fullName !== undefined && fullName.trim()) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    if (aadharNumber !== undefined && aadharNumber !== '') {
      if (!/^\d{12}$/.test(aadharNumber)) {
        return res.status(400).json({ error: 'Enter a valid 12-digit Aadhar number.' });
      }
      user.aadharNumber = aadharNumber;
    }

    if (user.aadharNumber && user.address) user.isProfileComplete = true;

    await user.save();
    res.status(200).json({ success: true, user: userResponse(user) });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};