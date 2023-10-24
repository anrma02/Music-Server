const mongoose = require("mongoose");

const { Track } = require("./trackModel");

const followersSchema = new mongoose.Schema({
  user: { type: String, required: true },
  total: { type: Number, default: 0 },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
});

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    genre: { type: [String], require: true },
    followers: { type: mongoose.Schema.Types.ObjectId, ref: "Followers" },
    image: {
      contentType: { type: String },
      filename: { type: String },
      path: {
        type: String,
        required: true,
      },
    },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
  },
  { timestamps: true }
);

const Artist = mongoose.model("Artist", artistSchema);
const Followers = mongoose.model("Followers", followersSchema);

module.exports = { Artist, Followers, Track };
