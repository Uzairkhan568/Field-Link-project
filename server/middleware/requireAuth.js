const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { COOKIE_NAME } = require("../utils/token");
const { toSafeUser } = require("../services/authService");

async function requireAuth(req, res, next) {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(payload.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Authentication is required." });
        }

        req.user = toSafeUser(user);
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication is required." });
    }
}

module.exports = requireAuth;
