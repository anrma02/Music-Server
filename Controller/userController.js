const { model } = require("mongoose");
const User = require("../models/userModel");

exports.userController = {
  /*
   *GET ALL User
   */

  getAllUser: async (req, res) => {
    try {
      const data = await User.find();
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  /*
   *Get User ID
   */
  getUserByID: async (req, res) => {
    try {
      const data = await User.findById(req.params.id);
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  /*
   * Delete User
   */

  deteleUser: async (req, res) => {
    try {
      const data = await User.findByIdAndDelete(req.params.id);
      if (!data) {
        return res.status(404).json("User not found!");
      }
      res.status(200).json("User deleted successfully!");
    } catch (error) {
      res.status(500).json(error);
    }
  },

  /*
   * Update User
   */

  updateUser: async (req, res) => {
    try {
      const data = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!data) {
        return res.status(404).json("User not found!");
      }

      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
