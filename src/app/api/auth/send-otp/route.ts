import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/userModel";
import { OTP } from "@/lib/db/otpModel";
import { isValidEmail } from "@/lib/auth/utils";
import { sendOtpEmail } from "@/lib/email/mailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    // Check user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "This email is wrong or not registered." },
        { status: 404 },
      );
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate OTP and save
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

    // Send email
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 },
    );
  }
}
