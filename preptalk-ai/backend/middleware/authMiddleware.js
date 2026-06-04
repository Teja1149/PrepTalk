const supabaseAdmin = require("../config/supabaseAdmin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing authorization token"
      });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

module.exports = authMiddleware;
