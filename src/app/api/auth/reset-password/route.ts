import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/userModel";
import { OTP } from "@/lib/db/otpModel";
import { hashPassword, isValidEmail } from "@/lib/auth/utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await request.json();

    // Validation
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify OTP (must have been verified in the previous step)
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      used: false,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "OTP not verified or has expired. Please restart the process." },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, error: "Incorrect OTP" },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Mark OTP as used
    await OTP.updateOne({ _id: otpRecord._id }, { $set: { used: true } });

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
