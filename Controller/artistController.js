const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const removeDiacritics = require("remove-diacritics");

const { Artist } = require("../models/artistModel");
const { Track } = require("../models/trackModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/artist");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      callback(null, true);
    } else {
      return callback(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("image");

exports.createArtist = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Error uploading image." });
      }

      const { name, followers, genre } = req.body;

      // Kiểm tra xem req.file đã tồn tại và không bị lỗi
      if (!req.file) {
        return res.status(400).json({ message: "Please upload an image." });
      }

      const imageData = req.file.buffer;

      const imagePath = path.join(req.file.filename);

      const items = new Artist({
        name,
        followers,
        genre,
        image: {
          path: imagePath,
          data: imageData,
          contentType: req.file.mimetype,
        },
      });
      await items.save();

      res.status(201).json({
        success: true,
        message: "Artist created successfully",
        items,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.searchArtist = async (q) => {
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
    const items = await Artist.find({ name: regexQuery });
    const totalCount = items.length;
    return {
      totalCount,
      items,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAllArtist = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const count = await Artist.countDocuments();

  try {
    const items = await Artist.find()
      .populate("followers")
      .skip(skip)
      .limit(limit);
    const totalPage = Math.ceil(count / limit);
    res.status(200).json({ success: true, page, totalPage, items });
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getArtistByID = async (req, res) => {
  try {
    const items = await Artist.findById(req.params.id).populate("followers");
    if (!items) {
      res.status(200).json({ success: true, items });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Artist not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err)
        return res.status(400).json({ message: "Error uploading image." });

      const artist = await Artist.findById(req.params.id);
      const { name, followers, genre } = req.body;
      if (artist) {
        if (req.file) {
          const imageData = await sharp(req.file.buffer)
            .resize({
              width: 50,
              height: 50,
              fit: "cover",
            })
            .toBuffer();
          const imagePath = req.file.filename;
          artist.image = {
            path: imagePath,
            data: imageData,
            contentType: req.file.mimetype,
          };
        }
        artist.name = name;
        artist.followers = followers;
        artist.genre = genre;

        await artist.save();
        res.status(201).json({ message: "Artist updated successfully" });
      } else {
        res.status(401).json({ message: "Artist does not exist " });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(401).json({ message: "Artist does not exist " });
    }

    // Xóa ảnh trước khi xóa sách khỏi cơ sở dữ liệu
    if (artist.imageUrl) {
      // Xóa ảnh từ hệ thống tệp (file system)
      fs.unlinkSync(req.file.filename);
    }

    // Xóa sách từ cơ sở dữ liệu
    await Artist.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Artist deleted successfuly" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

{
  /*
   * Artist Singer
   */
}

// Add Track To AstistSinger

exports.addTrackToArtistSinger = async (req, res) => {
  const { trackId } = req.body;
  const { artistId } = req.params;

  try {
    const artist = await Artist.findById(artistId);
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (artist.tracks.includes(trackId)) {
      return res
        .status(400)
        .json({ message: "Track already added to the artist" });
    }

    artist.tracks.push(trackId);
    const items = await artist.save();

    res.status(201).json({
      success: true,
      message: "Track added to the artist successfully",
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all tracks of an artist
exports.getArtistSingerByID = async (req, res) => {
  try {
    const items = await Artist.findById(req.params.id).populate("tracks");

    if (!items) {
      res.status(404).json({ message: "Artist no found" });
    }
    await items.save();
    res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
