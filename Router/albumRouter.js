const Routes = require("express").Router();

const albumRouter = require("../Controller/albumsController");

Routes.post("/create_album", albumRouter.createAlbum);
Routes.get("/get_album/:id", albumRouter.getAlbumByID);
Routes.delete("/get_album/:id", albumRouter.delete);
Routes.get("/get_album", albumRouter.getAllAlbums);

Routes.post("/add_track_to_album/:albumId", albumRouter.addTrackToAlbum);
Routes.get("/album_track/:id", albumRouter.getAlbumTrack);

module.exports = Routes;
