import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 🔑 Extract token
      token = req.headers.authorization.split(" ")[1];

      // 🔐 Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 👤 Attach user
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      return next(); // ✅ important
    } catch (error) {
      console.error("Auth error:", error.message);

      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Token expired, please login again"
            : "Invalid token",
      });
    }
  }

  return res.status(401).json({
    message: "Not authorized, no token",
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Admin access required" });
};