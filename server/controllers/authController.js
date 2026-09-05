const {
    authenticateUser,
    registerCustomer,
    toSafeUser,
} = require("../services/authService");
const { COOKIE_NAME, createToken, cookieOptions } = require("../utils/token");

function validateCredentials(body, requiresName) {
    const { name, email, password } = body && typeof body === "object" ? body : {};

    if (requiresName && (typeof name !== "string" || !name.trim())) {
        const error = new Error("Name is required.");
        error.statusCode = 400;
        throw error;
    }

    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
        const error = new Error("Email and password are required.");
        error.statusCode = 400;
        throw error;
    }

    if (typeof name === "string" && name.length > 100) {
        const error = new Error("Name cannot exceed 100 characters.");
        error.statusCode = 400;
        throw error;
    }

    if (password.length > 200) {
        const error = new Error("Password cannot exceed 200 characters.");
        error.statusCode = 400;
        throw error;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        const error = new Error("A valid email address is required.");
        error.statusCode = 400;
        throw error;
    }

    if (password.length < 8) {
        const error = new Error("Password must be at least 8 characters long.");
        error.statusCode = 400;
        throw error;
    }
}

function sendAuthenticatedUser(res, user, statusCode = 200) {
    res.cookie(COOKIE_NAME, createToken(user), cookieOptions());
    res.status(statusCode).json({ user: toSafeUser(user) });
}

async function register(req, res) {
    validateCredentials(req.body, true);
    const user = await registerCustomer(req.body);
    sendAuthenticatedUser(res, user, 201);
}

async function login(req, res) {
    validateCredentials(req.body, false);
    const user = await authenticateUser(req.body);
    sendAuthenticatedUser(res, user);
}

function logout(req, res) {
    const options = cookieOptions();
    delete options.maxAge;
    res.clearCookie(COOKIE_NAME, options);
    res.status(200).json({ message: "Logged out successfully." });
}

function getCurrentUser(req, res) {
    res.status(200).json({ user: req.user });
}

module.exports = { getCurrentUser, login, logout, register };
