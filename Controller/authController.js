const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookie = require("cookie-parser");

const User = require("../models/userModel");

let refreshTokens = [];

exports.authController = {
  /*
   * Register
   */

  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
        lastname: req.body.lastname,
        firtname: req.body.firtname,
      });

      const data = await newUser.save();
      res.status(201).json({ success: true, data });
    } catch (e) {
      res.status(500).json(e);
    }
  },

  /*
   *  Generate Access Token
   */
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      {
        expiresIn: "30s",
      }
    );
  },

  /*
   *  Generate Resfresh Token
   */

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_REFRESH_KEY,
      {
        expiresIn: "1d",
      }
    );
  },
  /*
   * Login
   */

  signinUser: async (req, res) => {
    try {
      const user = await User.findOne({
        username: req.body.username,
      });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed. User not found." });
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid Password!" });
      }
      if (user && validPassword) {
        const accessToken = this.authController.generateAccessToken(user);
        const refreshToken = this.authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        // Cookies
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          path: "/",
          secure: false,
          sameSite: "strict", // den tu sameSite
        });

        // Response
        const { password, ...others } = user._doc;
        res.status(200).json({
          success: true,
          data: { ...others, accessToken },
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  /*
   * Refresh Token
   */

  requestRefreshToken: async (req, res) => {
    // lấy resfresh token from user
    const refreshToken = req.cookies.refreshToken;
    res.status(200).json(refreshToken);

    if (!refreshToken)
      return res.status(401).json({ message: "You're not authoricated" });

    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Resfresh token is not valid" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log("🚀 jwt.verify ~ err:", err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

      /*
       * create new access token,  refresh token is valid
       */

      const newAccessToken = this.authController.generateAccessToken(user);
      const newResfreshToken = this.authController.generateRefreshToken(user);

      refreshTokens.push(newResfreshToken);
      res.cookie("refreshToken", newResfreshToken, {
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "strict", //chanwj den tu sameSite
      });
      res.status(200).json({
        success: true,
        data: { accessToken: newAccessToken },
      });
    });
  },

  // google: async (req, res, next) => {
  //   try {
  //     const user = await User.findOne({ email: req.body.email });
  //     if (user) {
  //       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  //       const { password: pass, ...rest } = user._doc;
  //       res
  //         .cookie("access_token", token, { httpOnly: true })
  //         .status(200)
  //         .json(rest);
  //     } else {
  //       const generatedPassword =
  //         Math.random().toString(36).slice(-8) +
  //         Math.random().toString(36).slice(-8);
  //       const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
  //       const newUser = new User({
  //         username:
  //           req.body.name.split(" ").join("").toLowerCase() +
  //           Math.random().toString(36).slice(-4),
  //         email: req.body.email,
  //         password: hashedPassword,
  //         avatar: req.body.photo,
  //       });
  //       await newUser.save();
  //       const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
  //       const { password: pass, ...rest } = newUser._doc;
  //       res
  //         .cookie("access_token", token, { httpOnly: true })
  //         .status(200)
  //         .json(rest);
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // },

  /*
   * Logout
   */
  logoutUser: async (req, res, next) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );

    res.status(200).json("Logged out successfully!");
    next();
  },
};
