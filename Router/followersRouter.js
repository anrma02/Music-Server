const Routes = require("express").Router();

const followersRouter = require("../Controller/followersController");

Routes.post("/increate_follower/:userId", followersRouter.inCreateFollower);
Routes.get("/get_followers/:userId", followersRouter.getFollowers);

module.exports = Routes;
