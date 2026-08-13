const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  children: [
    {
      type: mongoose.Schema.Types.Mixed,
    },
  ],
});

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    blocks: {
      type: [blockSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);