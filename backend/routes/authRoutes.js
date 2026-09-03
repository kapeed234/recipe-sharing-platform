const express = require("express");

const {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendVerificationCode);
router.post("/login", loginUser);

module.exports = router;