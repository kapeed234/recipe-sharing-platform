const nodemailer = require("nodemailer");

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are not configured on the server.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
};

const sendVerificationCode = async (email, code) => {
  const transporter = getTransporter();
  const sender = process.env.EMAIL_USER;

  await transporter.verify();

  await transporter.sendMail({
    from: `Recipe Sharing Platform <${sender}>`,
    to: email,
    subject: "Recipe Sharing Platform - Email Verification Code",
    text: `Your Recipe Sharing Platform verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2>Recipe Sharing Platform</h2><p>Use this verification code to complete your registration:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f4f4f4;text-align:center">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this code, you can ignore this email.</p></div>`
  });
};

module.exports = { sendVerificationCode };
