const Routes = require("express").Router();

const { authMiddleware } = require("../Middleware/authMiddleware");
const { userController } = require("../Controller/userController");

Routes.get("/get_user", authMiddleware.verifyToken, userController.getAllUser);
Routes.get("/get_user/:id", userController.getUserByID);
Routes.delete("/delete_user/:id", userController.deteleUser);
Routes.put("/update_user/:id", userController.updateUser);

module.exports = Routes;
