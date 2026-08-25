const dotenv = require("dotenv");

dotenv.config();

const requiredValues = ["MONGODB_URI", "CLIENT_ORIGIN", "JWT_SECRET"];
const missingValues = requiredValues.filter((name) => !process.env[name]);

if (missingValues.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingValues.join(", ")}`
    );
}

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

module.exports = { env };
