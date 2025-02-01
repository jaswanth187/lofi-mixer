const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many verification attempts, please try again later",
});

const createTransporter = async () => {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
    debug: true, // show debug output
    logger: true, // log information in console
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log("Email service ready");
    return transporter;
  } catch (error) {
    console.error("Email service error details:", {
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
    });
    throw new Error(`Email service configuration failed: ${error.message}`);
  }
};

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = await createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: {
        name: "Lofi Mixer",
        address: process.env.EMAIL_USERNAME,
      },
      to: email,
      subject: "🎵 Verify Your Lofi Mixer Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verify Your Lofi Mixer Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 10px;">
            <h1 style="color: #10B981;">Welcome to Lofi Mixer! 🎵</h1>
            <p>Thanks for registering. Please verify your email to start using Lofi Mixer.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #10B981; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              This link will expire in 24 hours.<br>
              If you didn't create an account, please ignore this email.
            </p>
            <p style="margin-top: 20px; color: #6B7280; font-size: 12px;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <span style="color: #10B981;">${verificationUrl}</span>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Lofi Mixer! Please verify your email by visiting: ${verificationUrl}`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
      },
    };

    // Add retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return info;
      } catch (error) {
        retries++;
        console.error(`Email sending attempt ${retries} failed:`, error);
        if (retries === MAX_RETRIES) {
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retries - 1))
        );
      }
    }
  } catch (error) {
    console.error("Final email sending error:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = await createTransporter();
    // Construct the reset URL properly - token is now passed directly
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: {
        name: "Lofi Mixer",
        address: process.env.EMAIL_USERNAME,
      },
      to: email,
      subject: "Reset Your Lofi Mixer Password",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 10px;">
            <h1 style="color: #10B981;">Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #10B981; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="margin-top: 20px; color: #6B7280; font-size: 12px;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <span style="color: #10B981; word-break: break-all;">${resetUrl}</span>
            </p>
            <p style="color: #6B7280; font-size: 14px;">
              This link will expire in 1 hour.<br>
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Reset your password by visiting: ${resetUrl}`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
      },
    };

    // Add retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully:", info.messageId);
        return info;
      } catch (error) {
        retries++;
        console.error(`Email sending attempt ${retries} failed:`, error);
        if (retries === MAX_RETRIES) {
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retries - 1))
        );
      }
    }
  } catch (error) {
    console.error("Final email sending error:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};
module.exports = {
  sendVerificationEmail,
  emailLimiter,
  sendPasswordResetEmail,
};
