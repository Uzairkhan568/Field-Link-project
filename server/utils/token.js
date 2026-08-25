const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const COOKIE_NAME = "wefix_token";
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

function createToken(user) {
    return jwt.sign(
        { userId: user._id.toString(), role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
}

function cookieOptions() {
    return {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SEVEN_DAYS_IN_MS,
    };
}

module.exports = { COOKIE_NAME, createToken, cookieOptions };
