const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:         { type: String, enum: ["CREDIT","DEBIT","COMMISSION","BET","BET_PLACED","WIN","BET_WIN","LOSS","VIP_PURCHASE"], required: true },
  amount:       { type: Number, required: true },
  description:  { type: String, default: "" },
  balanceAfter: { type: Number, default: 0 },
  referenceId:  { type: mongoose.Schema.Types.ObjectId, default: null }, // bet/game ref
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
