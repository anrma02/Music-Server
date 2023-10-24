const mongoose = require("mongoose");

const { Track } = require("./trackModel");
const { Artist } = require("./artistModel");

const musicSchema = new mongoose.Schema(
  {
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
    },
    artirt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
    },
  },
  { timestamps: true }
);

const Music = mongoose.model("Music", musicSchema);
module.exports = { Music, Track, Artist };
