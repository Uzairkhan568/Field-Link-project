const bcrypt = require("bcryptjs");
const User = require("../models/User");

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function toSafeUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

async function registerCustomer({ name, email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
        const error = new Error("An account with this email already exists.");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "customer",
    });

    return user;
}

async function authenticateUser({ email, password }) {
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || !user.isActive) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    return user;
}

module.exports = { authenticateUser, registerCustomer, toSafeUser };
