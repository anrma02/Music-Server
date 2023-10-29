const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dfwxw6uiv",
  api_key: "716639466149213",
  api_secret: "lP9UaKpEAcx1wPNeM9Zj9e3x77k",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "album-images",
    format: async (req, file) => ("png", "jpg", "jpeg"),
    public_id: (req, file) => `album-${file.originalname}`,
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
