const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  matchId:    { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
  matchLabel: { type: String, required: true },   // e.g. "MI vs CSK"
  ballNo:     { type: String },                    // e.g. "1.3", "12.5"
  prediction: { type: String, required: true },   // "4 run", "Wicket", "Dot", etc.
  confidence: { type: Number, min: 0, max: 100,  default: 75 }, // %
  isVIP:      { type: Boolean, default: false },   // locked for non-VIP
  result:     { type: String, enum: ["CORRECT", "WRONG", "PENDING"], default: "PENDING" },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Prediction", PredictionSchema);
