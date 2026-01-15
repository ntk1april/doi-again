import mongoose, { Schema, Document, Model } from "mongoose";

// Portfolio Stock Schema
const portfolioStockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    units: {
      type: Number,
      required: true,
      min: 0,
    },
    avgPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    realizedPnl: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: userId + symbol must be unique (user can't have duplicate stocks)
portfolioStockSchema.index({ userId: 1, symbol: 1 }, { unique: true });

// Transaction Schema
const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    realizedPnl: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by user
transactionSchema.index({ userId: 1, date: -1 });

// Wishlist Schema
const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    targetPrice: {
      type: Number,
      min: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: userId + symbol must be unique
wishlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

// Get or create models
const PortfolioStock: Model<Document> =
  mongoose.models.PortfolioStock ||
  mongoose.model("PortfolioStock", portfolioStockSchema);

const Transaction: Model<Document> =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

const Wishlist: Model<Document> =
  mongoose.models.Wishlist ||
  mongoose.model("Wishlist", wishlistSchema);

export { PortfolioStock, Transaction, Wishlist };
