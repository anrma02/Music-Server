const Routes = require("express").Router();

const TrackController = require("../Controller/trackController");

Routes.post("/create_track", TrackController.createTrack);
Routes.get("/get_track", TrackController.getTrack);

Routes.get("/get_track_by_id/:id", TrackController.getTrackByID);
Routes.put("/update_track/:id", TrackController.updateTrack);
Routes.delete("/detele_track/:id", TrackController.deleteTrack);

module.exports = Routes;
