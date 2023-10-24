const { Followers, Artist } = require("../models/artistModel");

exports.inCreateFollower = async (req, res) => {
  const artistId = req.params.id;
  try {
    const artist = await Artist.findById(artistId);
    if (artist) {
      artist.followers.total += 1;
      await artist.save();

      const newFollower = new Followers({
        user: req.userId,
        total: 1,
        artist: req.params.artistId,
      });
      await newFollower.save();
      res
        .status(201)
        .json({ message: "Successfully followed the artist", success: true });
    } else {
      return res.status(404).json({ error: "Artist not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getFollowers = async (req, res) => {
  const artistId = req.params.artistId;
  try {
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }
    artist.followers.total += 1;
    await artist.save();
    res.json({ message: "Successfully followed the artist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
