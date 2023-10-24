const multer = require("multer");
const path = require("path");
const removeDiacritics = require("remove-diacritics");

const { Album } = require("../models/albumModel");
const { Track } = require("../models/trackModel");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/album");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  }
};

const upload = multer({ storage, fileFilter }).single("image");

exports.createAlbum = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "Error uploading image." });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Please upload an image." });
      }

      const { name, artist, releaseDate } = req.body;

      const imageData = req.file.buffer;
      const imagePath = path.join(req.file.filename);

      const items = new Album({
        name,
        artist,
        releaseDate,
        image: {
          path: imagePath,
          data: imageData,
          contentType: req.file.mimetype,
        },
      });

      await items.save();

      res.status(201).json({
        success: true,
        message: "Album created successfully",
        items,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.addTrackToAlbum = async (req, res) => {
  try {
    const trackId = req.body.trackId;
    const albumId = req.params.albumId;

    const album = await Album.findById(albumId);
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    if (album.tracks.includes(trackId)) {
      return res
        .status(400)
        .json({ message: "Track already added to the album" });
    }
    album.tracks.push(trackId);
    await album.save();

    res.status(201).json({
      success: true,
      message: "Track added to the album successfully",
      album,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAlbumTrack = async (req, res) => {
  try {
    const items = await Album.findById(req.params.id).populate("tracks");
    if (!items) {
      return res.status(404).json({ message: "Album Track not found" });
    }
    await items.save();
    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.searchAlbum = async (q) => {
  try {
    if (!q) {
      throw new Error("Empty query");
    }

    const normalizedQuery = removeDiacritics(q);
    const regexQuery = new RegExp(
      normalizedQuery
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "|"),
      "i"
    );

    const items = await Album.find({ name: regexQuery })
      .populate("tracks")
      .populate("artist");
    const totalCount = items.length;

    return { totalCount, items };
  } catch (error) {
    throw error;
  }
};
exports.getAlbumByID = async (req, res) => {
  try {
    const items = await Album.findById(req.params.id)
      .populate("tracks")
      .populate("artist");

    if (!items) {
      return res.status(404).json({ error: "Album not found" });
    }
    await items.save();
    res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const albums = await Album.findById(req.params.id);

    if (!albums) {
      return res.status(401).json({ message: "Artist does not exist " });
    }
    if (albums.imageUrl) {
      fs.unlinkSync(req.file.filename);
    }
    await Album.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Artist deleted successfuly" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate("artist").populate("tracks");
    res.json({ albums });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
