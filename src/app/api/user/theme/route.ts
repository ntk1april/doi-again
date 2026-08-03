import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/userModel";
import { getUserIdFromRequest } from "@/lib/auth/middleware";

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { darkMode } = body;

    if (typeof darkMode !== "boolean") {
      return NextResponse.json(
        { success: false, error: "darkMode must be a boolean value" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { darkMode },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        darkMode: Boolean(updatedUser.darkMode),
      },
    });
  } catch (error) {
    console.error("Error updating user theme preference:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update theme preference" },
      { status: 500 }
    );
  }
}
