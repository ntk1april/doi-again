import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PortfolioStock, Transaction } from "@/lib/db/models";
import {
  calculateNewAvgPrice,
  calculateRealizedPnl,
  calculateUnrealizedPnl,
  calculateCurrentValue,
  calculateTotalCost,
  calculateNetPnl,
} from "@/lib/utils/calculations";
import { getRealStockPrice } from "@/lib/utils/realPrices";
import { getStockLogo } from "@/lib/utils/logos";
import {
  PortfolioStock as PortfolioStockType,
  ApiResponse,
  PortfolioTableFiled,
  PortfolioSummary,
} from "@/types";
import { requireAuth } from "@/lib/auth/middleware";

/**
 * GET /api/portfolio/stocks
 * Fetch all stocks in portfolio with calculated fields and summary
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const userId = requireAuth(request);

    await connectDB();

    const stocks = (await PortfolioStock.find({ userId })) as any[];

    // Enrich stocks with current prices and calculated fields
    const portfolioTableFiled: PortfolioTableFiled[] = await Promise.all(
      stocks.map(async (stock) => {
        // Fetch real price, fallback to avgPrice if API unavailable
        let currentPrice: number;
        try {
          currentPrice = await getRealStockPrice(stock.symbol);
        } catch (error) {
          // If API fails, use average price as fallback (break-even)
          console.warn(
            `Could not fetch real price for ${stock.symbol}, using average price:`,
            error instanceof Error ? error.message : error
          );
          currentPrice = stock.avgPrice;
        }

        const totalCost = calculateTotalCost(stock.avgPrice, stock.units);
        const currentValue = calculateCurrentValue(currentPrice, stock.units);
        const unrealizedPnl = calculateUnrealizedPnl(
          currentPrice,
          stock.avgPrice,
          stock.units
        );
        const netPnl = calculateNetPnl(unrealizedPnl, stock.realizedPnl);
        const unrealizedPnlPercent =
          stock.avgPrice > 0
            ? ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100
            : 0;
        const netPnlPercent =
          totalCost > 0 ? (netPnl / totalCost) * 100 : 0;

        return {
          ...stock.toObject(),
          currentPrice,
          totalCost,
          currentValue,
          unrealizedPnl,
          netPnl,
          unrealizedPnlPercent,
          netPnlPercent,
          logo: getStockLogo(stock.symbol),
        };
      })
    );

    // Calculate portfolio summary
    const summary: PortfolioSummary = {
      totalInvested: portfolioTableFiled.reduce(
        (sum, stock) => sum + stock.totalCost,
        0
      ),
      currentValue: portfolioTableFiled.reduce(
        (sum, stock) => sum + stock.currentValue,
        0
      ),
      unrealizedPnl: portfolioTableFiled.reduce(
        (sum, stock) => sum + stock.unrealizedPnl,
        0
      ),
      realizedPnl: portfolioTableFiled.reduce(
        (sum, stock) => sum + stock.realizedPnl,
        0
      ),
      netPnl: portfolioTableFiled.reduce((sum, stock) => sum + stock.netPnl, 0),
      netPnlPercent: 0,
    };

    // Calculate net P/L percentage
    if (summary.totalInvested > 0) {
      summary.netPnlPercent =
        (summary.netPnl / summary.totalInvested) * 100;
    }

    return NextResponse.json(
      {
        success: true,
        data: { stocks: portfolioTableFiled, summary },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching portfolio stocks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio stocks",
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio/stocks
 * Add a new stock or buy more of an existing stock
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const userId = requireAuth(req);

    await connectDB();

    const { symbol, units, buyPrice } = await req.json();

    if (!symbol || !units || !buyPrice) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: symbol, units, buyPrice",
        } as ApiResponse,
        { status: 400 }
      );
    }

    const normalizedSymbol = symbol.toUpperCase().trim();

    // Check if stock already exists in portfolio for this user
    const existingStock = (await PortfolioStock.findOne({
      userId,
      symbol: normalizedSymbol,
    })) as any;

    let updatedStock;

    if (existingStock) {
      // Buying more: update units and recalculate average price
      const newAvgPrice = calculateNewAvgPrice(
        existingStock.units,
        existingStock.avgPrice,
        units,
        buyPrice
      );

      existingStock.units += units;
      existingStock.avgPrice = newAvgPrice;
      existingStock.updatedAt = new Date();

      updatedStock = await existingStock.save();
    } else {
      // New stock: create entry with 0 realized P/L
      updatedStock = await PortfolioStock.create({
        userId,
        symbol: normalizedSymbol,
        units,
        avgPrice: buyPrice,
        realizedPnl: 0,
      });
    }

    // Record transaction
    await Transaction.create({
      userId,
      symbol: normalizedSymbol,
      type: "BUY",
      units,
      price: buyPrice,
      date: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedStock,
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding/buying stock:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add/buy stock",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
