const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String, required: true },
  picture: { type: String },
  role: { type: String, default: "user" },
  phone: { type: String },
  address: { type: String },
  birthday: { type: String },
  status: { type: String, default: "active" }, // "active" or "blocked"
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
   promoCode: {
    code: { type: String },
    lastClaimed: { type: Date },
    timesUsed: { type: Number, default: 0 }
  }
}, { timestamps: true });



module.exports = mongoose.model("User", userSchema);