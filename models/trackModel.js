const mongoose = require("mongoose");

const { Artist } = require("./artistModel");
const { Album } = require("./albumModel");

const lyricSchema = new mongoose.Schema({
  title: { type: [String], required: true },
  track: { type: mongoose.Schema.Types.ObjectId, ref: "Track" },
});

const trackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    artist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
    album: [{ type: mongoose.Schema.Types.ObjectId, ref: "Album" }],
    // date: { type: String, required: true },
    duration: { type: Number, required: true },
    genre: { type: [String], required: true },
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
      // filename: { type: String },
      path: {
        type: String,
        required: true,
      },
    },
    lyric: { type: String },
  },
  { timestamps: true }
);

const Track = mongoose.model("Track", trackSchema);

const Lyric = mongoose.model("Lyric", lyricSchema);

module.exports = { Track, Artist, Album, Lyric };
