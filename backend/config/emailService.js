const nodemailer = require("nodemailer");

// Render Free blocks outbound SMTP ports 25, 465 and 587.
// Use Brevo's HTTPS API when BREVO_API_KEY is configured.
const sendViaBrevo = async (email, code, name = "") => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.EMAIL_USER?.trim();

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured on the server.");
  }

  if (!senderEmail) {
    throw new Error("EMAIL_USER is not configured on the server.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: "Recipe Sharing Platform",
        email: senderEmail
      },
      to: [{ email, name: name || undefined }],
      subject: "Recipe Sharing Platform - Email Verification Code",
      textContent: `Your Recipe Sharing Platform verification code is ${code}. It expires in 10 minutes.`,
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2>Recipe Sharing Platform</h2><p>Hello ${name || "there"},</p><p>Use this verification code to complete your registration:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f4f4f4;text-align:center">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this code, you can ignore this email.</p></div>`
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let details = errorText;
    try {
      details = JSON.parse(errorText);
    } catch (_) {}

    console.error("Brevo API error:", {
      status: response.status,
      details
    });
    throw new Error(`Brevo email service returned HTTP ${response.status}.`);
  }

  const result = await response.json();
  console.log(`OTP email sent to ${email} via Brevo. Message ID: ${result.messageId || "unknown"}`);
  return result;
};

// SMTP fallback for local development or paid Render plans.
const sendViaSmtp = async (email, code) => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are not configured on the server.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });

  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `Recipe Sharing Platform <${user}>`,
      to: email,
      subject: "Recipe Sharing Platform - Email Verification Code",
      text: `Your Recipe Sharing Platform verification code is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2>Recipe Sharing Platform</h2><p>Use this verification code to complete your registration:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f4f4f4;text-align:center">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p></div>`
    });
    console.log(`OTP email sent to ${email} via Gmail SMTP. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Gmail SMTP error:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message
    });
    throw error;
  }
};

const sendVerificationCode = async (email, code, name = "") => {
  if (process.env.BREVO_API_KEY?.trim()) {
    return sendViaBrevo(email, code, name);
  }
  return sendViaSmtp(email, code);
};

module.exports = { sendVerificationCode };
