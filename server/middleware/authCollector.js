const jwt = require("jsonwebtoken");
const secretKey = "pigmy";

const VerifyCollectorToken = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ 
            message: "Access denied", 
            success: false 
        });
    }
    try {
        const collectorId = jwt.verify(token, secretKey);
        req.collector = collectorId; // <-- Here, you are setting req.collector directly to the ID
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ 
            message: "Invalid token", 
            success: false 
        });
    }
};

module.exports = { VerifyCollectorToken };