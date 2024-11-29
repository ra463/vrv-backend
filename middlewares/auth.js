const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config({ path: "../config/config.env" });

exports.userAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ message: `Authentication Expired. Please login` });
    }

    const { userId } = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );

    req.userId = userId;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: `Authentication Expired. Please login` });
    }
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, status: 403, message: `Authentication Expired` });
  }
};

exports.adminAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ message: `Authentication Expired. Please login` });
    }

    const { userId } = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );

    req.userId = userId;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: `Authentication Expired. Please login` });
    }

    if (user.role !== "admin") {
      return res
        .status(401)
        .json({ message: `You are not authorized to access this route` });
    }
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, status: 403, message: `Authentication Expired` });
  }
};
