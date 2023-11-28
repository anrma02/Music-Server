const { searchTrack } = require("./trackController");
const { searchArtist } = require("./artistController");
const { searchAlbum } = require("./albumsController");

exports.getMusic = async (req, res) => {
  try {
    const q = req.query.q;
    const type = req.query.type;
    let results = null;

    const limit = parseInt(req.query.body) || 10;
    const page = parseInt(req.query.page) || 1;

    if (type === "multi") {
      results = {
        track: await searchTrack(q, page, limit),
        artist: await searchArtist(q, page, limit),
        album: await searchAlbum(q, page, limit),
      };
    } else {
      if (type === "track") {
        results = await searchTrack(q, page, limit);
      } else if (type === "artist") {
        results = await searchArtist(q, page, limit);
      } else if (type === "album") {
        results = await searchAlbum(q, page, limit);
      } else {
        throw new Error("Invalid type");
      }
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
