const express = require("express");

const {
  registerUser,
  verifyRegistration,
  loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-registration", verifyRegistration);
router.post("/login", loginUser);

module.exports = router;
