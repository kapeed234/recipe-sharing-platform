const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dns = require("dns").promises;
const crypto = require("crypto");
const { sendVerificationCode } = require("../config/emailService");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const hasMailServer = async (email) => {
  const domain = email.split("@")[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords?.length) return true;
  } catch (_) {}
  try {
    await dns.lookup(domain);
    return true;
  } catch (_) {
    return false;
  }
};

const createToken = (user) => jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Registration sends an OTP. The account is created but remains unverified until OTP confirmation.
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) return res.status(400).json({ message: "Name must be at least 2 characters long." });
    if (!isValidEmail(normalizedEmail)) return res.status(400).json({ message: "Please provide a valid email address." });
    if (!(await hasMailServer(normalizedEmail))) return res.status(400).json({ message: "This email address does not appear to be valid or reachable. Please use an existing email address." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters long." });

    let user = await User.findOne({ email: normalizedEmail });
    if (user?.isVerified) return res.status(400).json({ message: "An account with this email address already exists. Please log in." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      user.name = trimmedName;
      user.password = hashedPassword;
      user.verificationCode = code;
      user.verificationCodeExpires = expires;
      user.isVerified = false;
      await user.save();
    } else {
      user = await User.create({
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
        verificationCode: code,
        verificationCodeExpires: expires
      });
    }

    try {
      await sendVerificationCode(normalizedEmail, code);
    } catch (mailError) {
      await User.deleteOne({ _id: user._id, isVerified: false });
      console.error("OTP email error:", mailError);
      return res.status(500).json({ message: "Unable to send the verification code. Please check the email service configuration." });
    }

    return res.status(200).json({ message: "Verification code sent to your email address." });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "An error occurred during registration." });
  }
};

const verifyRegistration = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedCode = code?.trim();

    if (!normalizedEmail || !normalizedCode) return res.status(400).json({ message: "Email and verification code are required." });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Registration not found. Please register again." });
    if (user.isVerified) return res.status(400).json({ message: "This email is already verified. Please log in." });
    if (!user.verificationCode || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please register again to receive a new code." });
    }
    if (user.verificationCode !== normalizedCode) return res.status(400).json({ message: "Invalid verification code." });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = createToken(user);
    return res.status(200).json({
      message: "Email verified and registration successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "An error occurred during email verification." });
  }
};

// Login remains password-only; no OTP is required here.
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Please provide both email and password." });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email address before logging in." });

    const token = createToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "An error occurred during login." });
  }
};

module.exports = { registerUser, verifyRegistration, loginUser };
