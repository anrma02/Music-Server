const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const removeDiacritics = require("remove-diacritics");

const { Track } = require("../models/trackModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationDir = "uploads/track/audio/";
    if (file.mimetype.startsWith("image")) {
      destinationDir = "uploads/track/image/";
    }
    cb(null, destinationDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = ["audio/mpeg", "audio/mp3"];
  const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];

  if (
    allowedAudioTypes.includes(file.mimetype) ||
    allowedImageTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only .mp3, .mpeg, .png, .jpg, and .jpeg formats are allowed!"),
      false
    );
  }
};

const upload = multer({ storage, fileFilter }).fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

exports.createTrack = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error uploading Track or Image." });
      }

      const { name, artist, duration, genre } = req.body;

      const audioFile = req.files["audio"];
      const imageFile = req.files["image"];

      if (!audioFile && !imageFile) {
        return res
          .status(400)
          .json({ message: "Please upload a Track or Image." });
      }

      let trackPath = null;
      let trackData = null;
      if (audioFile) {
        trackPath = path.join(audioFile[0].filename);
        if (audioFile[0].buffer) {
          trackData = audioFile[0].buffer.toString("base64");
        } else {
          const fileContent = fs.readFileSync(audioFile[0].path);
          trackData = Buffer.from(fileContent).toString("base64");
        }
      }

      let imagePath = null;
      let imageData = null;
      if (imageFile) {
        imagePath = path.join(imageFile[0].filename);
        imageData = imageFile[0].buffer;
      }

      const newItem = new Track({
        name,
        artist,
        duration,
        genre,
        audio: {
          path: trackPath,
          data: trackData,
          contentType: audioFile ? audioFile[0].mimetype : "",
        },
        image: {
          path: imagePath,
          data: imageData,
          contentType: imageFile ? imageFile[0].mimetype : "",
        },
      });
      newItem.populate("artist", ["name", "image"]);
      const item = await newItem.save();

      if (req.body.track) {
        const track = Track.findById(req.body.track);
        await track.updateOne({ $push: { artist: item._id } });
      }

      res
        .status(201)
        .json({ message: "Track created successfully", success: true, item });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.searchTrack = async (q, page, limit) => {
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

    const skipCount = (page - 1) * limit;
    const items = await Track.find({ name: regexQuery })
      .populate("artist", ["name", "image"])
      .skip(skipCount)
      .limit(limit);
    const count = await Track.countDocuments();
    const totalPages = Math.ceil(count / limit);
    const totalCount = items.length;

    return {
      totalCount,
      items,
      totalPages,
      page,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getTrack = async (req, res) => {
  try {
    const limit = parseInt(req.query.body) || 10;
    const page = parseInt(req.query.page) || 1;

    const skip = (page - 1) * limit;

    const count = await Track.countDocuments();
    const items = await Track.find()
      .populate("artist", ["name", "image"])
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({ success: true, totalPages, page, items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getTrackByID = async (req, res) => {
  try {
    const items = await Track.findById(req.params.id).populate("artist", [
      "name",
      "image",
    ]);
    if (items) {
      res.status(200).json({ success: true, items });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Không tìm thấy bài hát" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: "Error uploading track." });
      }

      const { name, artist, duration, genre } = req.body;

      const updatedTrack = {
        name: name,
        artist: artist,
        duration: duration,
        genre: genre,
        audio: {
          contentType: req.files?.audio?.[0]?.mimetype,
          filename: req.files?.audio?.[0]?.filename,
          path: req.files?.audio?.[0]?.path,
        },
        image: {
          contentType: req.files?.image?.[0]?.mimetype,
          filename: req.files?.image?.[0]?.filename,
          path: req.files?.image?.[0]?.path,
        },
        updatedAt: new Date(),
      };

      if (updatedTrack.artist) {
        updatedTrack.artist = updatedTrack.artist._id
          ? await Artist.findById(updatedTrack.artist._id).populate(
              "name, image"
            )
          : null;
      }

      const items = await Track.findByIdAndUpdate(req.params.id, updatedTrack, {
        new: true,
      });

      if (!items) {
        return res.status(404).json({ message: "Track not found." });
      }

      // Remove old audio after update
      if (req.files?.audio && items.audio.path) {
        fs.unlink(items.audio.path, (err) => {
          if (err) {
            console.error("Error deleting the old audio file:", err);
          }
        });
      }

      res.status(201).json({
        success: true,
        message: "Track updated successfully!",
        items,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

{
  /*
   * Delete audio
   */
}

const deleteAudioFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    const filePath = track.audio.path;
    deleteAudioFile(filePath);
    await track.deleteOne();
    res.status(200).json({ message: "Track deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
