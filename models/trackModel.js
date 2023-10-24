const moongose = require("mongoose");

const { Artist } = require("./artistModel");

const trackSchema = new moongose.Schema(
  {
    name: { type: String, require: true },
    artist: { type: moongose.Schema.Types.ObjectId, ref: "Artist" },
    date: { type: String, require: true },
    duration: { type: Number, require: true },
    genre: { type: [String], require: true },
    audio: {
      contentType: { type: String },
      filename: { type: String },
      path: {
        type: String,
        required: true,
      },
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

const Track = moongose.model("Track", trackSchema);

module.exports = { Track, Artist };
