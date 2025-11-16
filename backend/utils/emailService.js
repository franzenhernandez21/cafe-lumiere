const nodemailer = require("nodemailer");

// --------------- CREATE TRANSPORTER -----------------
const createTransporter = () => {
  console.log("\n=== 📧 EMAIL CONFIG TEST ===");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS (length):", process.env.EMAIL_PASS?.length);
  console.log("EMAIL_PASS (first 4 chars):", process.env.EMAIL_PASS?.substring(0, 4));
  console.log("EMAIL_PASS (last 4 chars):", process.env.EMAIL_PASS?.substring(process.env.EMAIL_PASS.length - 4));
  console.log("Has spaces?:", process.env.EMAIL_PASS?.includes(" "));
  console.log("====================================================\n");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,            // ✔ REQUIRED for Gmail App Passwords
    secure: true,         // ✔ MUST be true when port is 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // OPTIONAL CHECK (super helpful)
  transporter.verify((err, success) => {
    if (err) {
      console.log("❌ SMTP VERIFY ERROR:", err);
    } else {
      console.log("✅ SMTP is ready to send emails!");
    }
  });

  return transporter;
};

// =============== SEND PASSWORD RESET EMAIL =================
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  console.log("\n🚀 Attempting to send email to:", email);

  const transporter = createTransporter();

  const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Café Lumière" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Password Reset Request - Café Lumière",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; 
                       box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #8B4513; }
          .logo { font-size: 32px; color: #8B4513; font-weight: bold; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 12px 30px; background-color: #8B4513; color: white; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">

          <div class="header">
            <div class="logo">☕ Café Lumière</div>
          </div>

          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password.</p>

            <p>Click the button below to reset your password:</p>

            <center>
              <a href="${resetURL}" class="button">Reset Password</a>
            </center>

            <p>Or copy this link:</p>
            <p style="word-break: break-all; color: #0066cc;">${resetURL}</p>

            <div class="warning">
              ⚠️ <strong>Note:</strong> This link will expire in 1 hour.
            </div>

            <p>If you did not request this, please ignore this email.</p>
          </div>

          <div class="footer">
            <p>© 2024 Café Lumière. All rights reserved.</p>
            <p>☕ Living the Coffee Life</p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendPasswordResetEmail };
