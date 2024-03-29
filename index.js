const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

{
  /*
   * Router`
   */
}

const authorRouter = require("./Router/authRouter");
const musicRouter = require("./Router/musicRouter");
const userRoute = require("./Router/userRouter");
const trackRouter = require("./Router/trackRouter");
const artistRouter = require("./Router/artistRouter");
const followersRouter = require("./Router/followersRouter");
const albumRouter = require("./Router/albumRouter");
const genreRouter = require("./Router/genreRouter");

{
  /*
   * Config
   */
}

dotenv.config();
const app = express();
app.use(morgan("combined"));

{
  /*
   * Get Path
   */
}

app.use(express.static("uploads/artist"));
app.use(express.static("uploads/track/image"));
app.use(express.static("uploads/track/audio"));

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URL);
    console.log("Connecter to DB");
  } catch (error) {
    console.log("dbConnect ~ error:", error);
  }
};
dbConnect();
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

/*
 *Router
 */
app.get("/", (req, res, next) => {
  res.json({ message: "ahahaha " });
});
app.use("/user", userRoute);
app.use("/auth", authorRouter);
app.use("/artist", artistRouter);
app.use("/getMusic", musicRouter);
app.use("/track", trackRouter);
app.use("/followers", followersRouter);
app.use("/album", albumRouter);
app.use("/genre", genreRouter);

/*
 * localhost:5000/
 */

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running ${PORT} `);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing server gracefully.");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
