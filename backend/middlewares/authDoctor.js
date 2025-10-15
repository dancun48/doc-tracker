import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

    // Add to req.doctor instead of req.body for better practice
    req.doctor = { id: token_decode.id };
    next();
  } catch (error) {
    console.log("Doctor Auth Error:", error.message);

    let message = "Authentication failed";
    if (error.name === "JsonWebTokenError") {
      message = "Invalid token";
    } else if (error.name === "TokenExpiredError") {
      message = "Token expired. Please login again.";
    } else if (error.name === "NotBeforeError") {
      message = "Token not active";
    }

    res.status(401).json({
      success: false,
      message: message,
    });
  }
};

export default authDoctor;
