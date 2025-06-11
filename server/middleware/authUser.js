const jwt = require("jsonwebtoken");
const secretKey = "pigmy";

const VerifyCustomerToken = (req, res, next) => {
    const token=req.header("auth-token");
    if (!token) {
        return res.status(401).json({ message: "Access denied", success: false });
    }
    try {
        const userId= jwt.verify(token, secretKey);
        req.customer = userId;
        next();
    }
    catch (error) {
        return res.status(400).json({ message: "Invalid token", success: false });
    }
};
    module.exports = { VerifyCustomerToken };
