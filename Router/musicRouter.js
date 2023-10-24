const Routes = require("express").Router();

const musicController = require("../Controller/musicController");

Routes.get("/search", musicController.getMusic);

module.exports = Routes;
