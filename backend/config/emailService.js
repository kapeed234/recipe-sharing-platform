const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationCode = async (email, code) => {
  await transporter.sendMail({
    from: `Recipe Sharing Platform <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Recipe Sharing Platform - Email Verification Code",
    text: `Your Recipe Sharing Platform verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2>Recipe Sharing Platform</h2><p>Use this verification code to complete your registration:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f4f4f4;text-align:center">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this code, you can ignore this email.</p></div>`
  });
};

module.exports = { sendVerificationCode };
