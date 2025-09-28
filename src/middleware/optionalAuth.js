// middlewares/optionalAuth.js
import jwt from "jsonwebtoken";

export const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    // Login olmayıbsa req.user boş qalır
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token səhvdirsə də req.user boş qalır
    req.user = null;
  }

  next();
};
