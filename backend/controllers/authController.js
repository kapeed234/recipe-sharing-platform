const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../config/emailService");

// Helper to generate a 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Formal field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long."
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long."
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    // Generate 6-digit OTP and set 10-minute expiry
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // If user is already registered and verified
      if (existingUser.isVerified !== false) {
        return res.status(400).json({
          message: "An account with this email address already exists. Please log in."
        });
      }

      // If user registered earlier but never verified their email, refresh details & send a new OTP
      existingUser.name = trimmedName;
      existingUser.password = hashedPassword;
      existingUser.verificationCode = otp;
      existingUser.verificationCodeExpires = otpExpires;
      await existingUser.save();

      await sendVerificationEmail(existingUser.email, existingUser.name, otp);

      return res.status(200).json({
        message: "A verification code has been sent to your email. Please enter it to activate your account.",
        email: existingUser.email,
        requiresVerification: true
      });
    }

    // Create new unverified user
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationCode: otp,
      verificationCodeExpires: otpExpires
    });

    await sendVerificationEmail(user.email, user.name, otp);

    res.status(201).json({
      message: "Registration successful! A 6-digit verification code has been sent to your email.",
      email: user.email,
      requiresVerification: true
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: error.message || "An error occurred during registration."
    });
  }
};

// ================= VERIFY EMAIL (OTP) =================
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and verification code are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User account not found."
      });
    }

    // Already verified
    if (user.isVerified === true) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Email is already verified.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    }

    // Check expiration
    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new code."
      });
    }

    // Verify OTP match
    if (user.verificationCode !== otp.trim()) {
      return res.status(400).json({
        message: "Invalid verification code. Please check and try again."
      });
    }

    // Mark as verified & clear verification code
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    // Issue JWT token immediately so user is automatically logged in
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Email verified successfully! Welcome to Recipe Sharing Platform.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({
      message: error.message || "An error occurred during email verification."
    });
  }
};

// ================= RESEND VERIFICATION CODE =================
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User account not found."
      });
    }

    if (user.isVerified === true) {
      return res.status(400).json({
        message: "This account is already verified. You can log in directly."
      });
    }

    const otp = generateOTP();
    user.verificationCode = otp;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, otp);

    res.status(200).json({
      message: "A fresh 6-digit verification code has been sent to your email."
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      message: error.message || "Unable to resend verification code."
    });
  }
};

// ================= LOGIN USER =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password."
      });
    }

    // If account was explicitly marked unverified with an active verification code (new registration flow), prompt user to verify
    // Existing users without a verification code are never blocked
    if (user.isVerified === false && Boolean(user.verificationCode)) {
      const otp = generateOTP();
      user.verificationCode = otp;
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, user.name, otp);

      return res.status(403).json({
        message: "Your email address is not verified yet. A fresh verification code has been sent to your email.",
        requiresVerification: true,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: error.message || "An error occurred during login."
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser
};