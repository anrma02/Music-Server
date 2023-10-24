const mongoose = require("mongoose");

const { Track } = require("./trackModel");
const { Artist } = require("./artistModel");

const albumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    releaseDate: { type: String, required: true },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
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

const Album = mongoose.model("Album", albumSchema);

module.exports = { Artist, Track, Album };
