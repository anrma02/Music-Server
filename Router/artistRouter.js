const Routes = require("express").Router();

const artistController = require("../Controller/artistController");

Routes.post("/create_artist", artistController.createArtist);
Routes.get("/get_all_artist", artistController.getAllArtist);
Routes.get("/get_artist/:id", artistController.getArtistByID);
Routes.put("/update_artist/:id", artistController.updateArtist);
Routes.delete("/delete_artist/:id", artistController.deleteArtist);

{
  /*
   * ArtistSinger
   */
}

Routes.post(
  "/artist_singer/:artistId",
  artistController.addTrackToArtistSinger
);
Routes.get("/artist_singer/:id", artistController.getArtistSingerByID);

module.exports = Routes;
