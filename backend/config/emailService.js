const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer transport using environment variables.
 * Compatible with Gmail, Brevo, SendGrid, Mailgun, or standard SMTP.
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";

  if (!user || !pass) {
    return null;
  }

  const host = process.env.EMAIL_HOST ? process.env.EMAIL_HOST.trim() : "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 465;

  // Use nodemailer built-in service preset for Gmail for maximum compatibility
  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass
      }
    });
  }

  const secure = port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
};

/**
 * Sends a 6-digit OTP verification email to the user.
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient user name
 * @param {string} otp - 6-digit verification code
 */
const sendVerificationEmail = async (email, name, otp) => {
  const transporter = getTransporter();

  const appName = "Recipe Sharing Platform";
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  
  // Gmail requires the 'from' address to match the authenticated account to avoid rejection
  let fromAddress;
  if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes("recipesharing.com")) {
    fromAddress = process.env.EMAIL_FROM;
  } else if (user) {
    fromAddress = `"${appName}" <${user}>`;
  } else {
    fromAddress = `"${appName}" <no-reply@recipesharing.com>`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fffaf3; margin: 0; padding: 20px; color: #24150c; }
        .email-container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #f0eee9; }
        .header { background: #1677f9; color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #111; }
        .instructions { font-size: 15px; color: #5c6b7a; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { display: inline-block; background: #f0f6ff; border: 2px dashed #1677f9; border-radius: 12px; padding: 18px 36px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1677f9; margin: 10px 0 24px; }
        .expiry-note { font-size: 13px; color: #8898aa; margin-top: 10px; }
        .footer { background: #faf8f5; border-top: 1px solid #f0eee9; padding: 20px 24px; text-align: center; font-size: 12px; color: #9aa5b1; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🍴 ${appName}</h1>
        </div>
        <div class="content">
          <div class="greeting">Welcome, ${name || "Foodie"}!</div>
          <p class="instructions">
            Thank you for registering on <strong>${appName}</strong>. Please enter the 6-digit verification code below to confirm your email and activate your account.
          </p>
          <div class="otp-box">${otp}</div>
          <p class="expiry-note">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
          <p class="instructions" style="font-size: 13px; margin-top: 20px;">
            If you did not sign up for this account, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Welcome to ${appName}, ${name}!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

  if (!transporter) {
    console.log("\n=======================================================");
    console.log("⚠️  EMAIL SERVICE NOTICE (No SMTP credentials found in .env)");
    console.log(`✉️  SIMULATING EMAIL SEND TO: ${email}`);
    console.log(`👤 User: ${name}`);
    console.log(`🔐 VERIFICATION OTP CODE: [ ${otp} ]`);
    console.log("⏱️  Valid for 10 minutes");
    console.log("👉 To send real emails to inboxes, add EMAIL_USER and EMAIL_PASS to backend/.env");
    console.log("=======================================================\n");
    return { success: true, simulated: true, previewOtp: otp };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `${otp} is your verification code for ${appName}`,
      text: textContent,
      html: htmlContent
    });

    console.log(`Verification email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message);
    console.log("\n-------------------------------------------------------");
    console.log("⚠️  SMTP SEND ERROR FALLBACK");
    console.log(`🔐 Verification OTP for ${email}: [ ${otp} ]`);
    console.log("-------------------------------------------------------\n");
    return { success: false, error: error.message, simulated: true, previewOtp: otp };
  }
};

module.exports = {
  sendVerificationEmail
};
