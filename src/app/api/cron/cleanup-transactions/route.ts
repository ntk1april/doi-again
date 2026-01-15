import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Transaction } from "@/lib/db/models";

/**
 * DELETE /api/cron/cleanup-transactions
 * Deletes transactions older than 30 days
 * This should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Optional: Add a secret token for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete transactions older than 30 days
    const result = await Transaction.deleteMany({
      date: { $lt: thirtyDaysAgo },
    });

    console.log(`✓ Deleted ${result.deletedCount} transactions older than 30 days`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount,
      cutoffDate: thirtyDaysAgo,
    });
  } catch (error) {
    console.error("Error cleaning up transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cleanup transactions" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/cleanup-transactions
 * Preview how many transactions would be deleted
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const count = await Transaction.countDocuments({
      date: { $lt: thirtyDaysAgo },
    });

    return NextResponse.json({
      success: true,
      count,
      cutoffDate: thirtyDaysAgo,
      message: `${count} transactions would be deleted`,
    });
  } catch (error) {
    console.error("Error previewing cleanup:", error);
    return NextResponse.json(
      { success: false, error: "Failed to preview cleanup" },
      { status: 500 }
    );
  }
}
