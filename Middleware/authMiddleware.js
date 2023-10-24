const jwt = require("jsonwebtoken");

exports.authMiddleware = {
  // verifyToken

  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      //Bearer
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Invalid Token" });
        }
        req.user = user;

        next();
      });
    } else {
      return res.status(401).json({ message: "You're not authoricated" });
    }
  },

  checkAdmin: (req, res, next) => {
    this.authMiddleware.verifyToken(req, res, () => {
      if (req.user.isAdmin == true) {
        // Kiểm tra xem user có phải là admin hay không
        next(); // Tiếp tục middleware tiếp theo
      } else {
        return res
          .status(403)
          .json({ message: "You're not allowed to do this" });
      }
    });
  },

  // Verify Admin Token

  verifyAdminToken: (req, res, next) => {
    this.authMiddleware.verifyToken(req, res, () => {
      if (req.user.id == req.params.id || req.user.isAdmin == true) {
        next();
      } else {
        return res
          .status(403)
          .json({ message: "You're not allowed to delete others" });
      }
    });
  },
};
