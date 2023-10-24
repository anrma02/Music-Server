const { searchTrack } = require("./trackController");
const { searchArtist } = require("./artistController");
const { searchAlbum } = require("./albumsController");

exports.getMusic = async (req, res) => {
  try {
    const q = req.query.q;
    const type = req.query.type;
    let results = null;

    if (type === "multi") {
      results = {
        tracks: await searchTrack(q),
        artists: await searchArtist(q),
        albums: await searchAlbum(q),
      };
    } else {
      if (type === "track") {
        results = await searchTrack(q);
      } else if (type === "artist") {
        results = await searchArtist(q);
      } else if (type === "album") {
        results = await searchAlbum(q);
      } else {
        throw new Error("Invalid type");
      }
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
