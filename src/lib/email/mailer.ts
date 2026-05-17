import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"Doi Again" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #6b7280;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #ef4444; text-align: center; padding: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, ignore this email.</p>
      </div>
    `,
  });
}
