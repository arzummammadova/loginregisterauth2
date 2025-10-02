import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: "Vacancy", required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("OTP", OtpSchema);
