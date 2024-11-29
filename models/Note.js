const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please enter task title"],
    },
    description: {
      type: String,
      required: [true, "Please enter task description"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", schema);
