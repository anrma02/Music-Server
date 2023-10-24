const Routes = require("express").Router();

const { authController } = require("../Controller/authController");
const { authMiddleware } = require("../Middleware/authMiddleware");

Routes.post("/register", authController.registerUser);
Routes.post("/signin", authController.signinUser);

Routes.post("/logout", authMiddleware.verifyToken, authController.logoutUser);

// RERSHER

Routes.post("/refresh", authController.requestRefreshToken);
module.exports = Routes;
