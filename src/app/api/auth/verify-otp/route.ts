import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { OTP } from "@/lib/db/otpModel";
import { isValidEmail } from "@/lib/auth/utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find a valid, unused, non-expired OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, error: "Incorrect OTP. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as verified (but not yet used — will be consumed on password reset)
    await OTP.updateOne({ _id: otpRecord._id }, { $set: { verified: true } });

    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
