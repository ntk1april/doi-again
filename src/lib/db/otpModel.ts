import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Auto-delete document after it expires (TTL index)
    index: { expires: 0 },
  },
  used: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export const OTP = mongoose.models.OTP || mongoose.model("OTP", otpSchema);
