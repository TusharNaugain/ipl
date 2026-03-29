const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "SMDL", "MDL", "DL", "USER"],
    default: "USER"
  },
  coins:          { type: Number, default: 1000 },
  isVIP:          { type: Boolean, default: false },
  vipExpiry:      { type: Date, default: null },
  commissionRate: { type: Number, default: 0 }, // % commission earned on downline bets
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
