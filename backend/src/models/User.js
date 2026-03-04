const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  firebaseUid: {
    type: String,
    unique: true,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  subjectScores: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
