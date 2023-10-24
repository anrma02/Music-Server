const Routes = require("express").Router();

const genreRouter = require("../Controller/genreController");

Routes.post("/create_genre", genreRouter.createGenre);
Routes.get("/get_followers ", genreRouter.getGenre);

module.exports = Routes;
