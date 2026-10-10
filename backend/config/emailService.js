const nodemailer = require("nodemailer");

// Prefer Brevo's HTTPS API in production. SMTP is retained as a local-development fallback.
const sendViaBrevo = async (email, code, name = "") => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  // BREVO_SENDER_EMAIL is explicit; EMAIL_USER remains supported for existing deployments.
  const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER)?.trim();

  if (!apiKey) {
    throw new Error("Email is not configured: add BREVO_API_KEY to the backend environment.");
  }

  if (!senderEmail) {
    throw new Error("Email is not configured: add BREVO_SENDER_EMAIL (or EMAIL_USER) to the backend environment.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Recipe Sharing Platform", email: senderEmail },
        to: [{ email, name: name || undefined }],
        subject: "Recipe Sharing Platform - Email Verification Code",
        textContent: `Your Recipe Sharing Platform verification code is ${code}. It expires in 10 minutes.`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2>Recipe Sharing Platform</h2><p>Hello ${name || "there"},</p><p>Use this verification code to complete your registration:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f4f4f4;text-align:center">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this code, you can ignore this email.</p></div>`,
      }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Brevo email request timed out after 15 seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    let details = errorText;
    try { details = JSON.parse(errorText); } catch (_) {}

    // Log provider response for diagnosis, but never log the API key.
    console.error("Brevo API error:", { status: response.status, details });
    throw new Error(`Brevo email service returned HTTP ${response.status}.`);
  }

  const result = await response.json();
  console.log(`OTP email sent via Brevo. Message ID: ${result.messageId || "unknown"}`);
  return result;
};

// SMTP fallback for local development or environments where SMTP is available.
const sendViaSmtp = async (email, code) => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("Email is not configured: set BREVO_API_KEY and BREVO_SENDER_EMAIL for Brevo, or EMAIL_USER and EMAIL_PASS for Gmail SMTP.");
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
    console.log(`OTP email sent via Gmail SMTP. Message ID: ${info.messageId}`);
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
