const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      contentType: { type: String },
      filename: { type: String },
      path: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Genre = mongoose.model("Genre", genreSchema);

module.exports = { Genre };
