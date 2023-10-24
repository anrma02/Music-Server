const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

const { Genre } = require("../models/genreModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/genre");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("image");

exports.createGenre = async (req, res) => {
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
      const { name, color, description } = req.body;
      const imagePath = path.join(req.file.filename);

      try {
        const imageData = await fs.readFile(req.file.path);
        await fs.unlink(req.file.path);

        const genre = new Genre({
          name,
          color,
          description,
          image: {
            path: imagePath,
            data: imageData,
            contentType: req.file.mimetype,
          },
        });

        await genre.save();
        res.status(201).json({
          success: true,
          message: "Genre created successfully",
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getGenre = async (req, res) => {
  try {
    const items = await Genre.find();
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.log("🚀exports.getGenre= ~ error:", error);
    return res.status(500).json({ message: error.message });
  }
};
