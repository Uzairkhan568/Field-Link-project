const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const providerProfileRoutes = require("./routes/providerProfileRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { env } = require("./config/env");
const connectDatabase = require("./config/db");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

app.use(cookieParser());

app.use(
    cors({
        origin: env.CLIENT_ORIGIN,
        credentials: true,
    })
);

/*
 * General API rate limiter
 *
 * This applies to the whole /api section.
 * Increased from 100 to 500 because WEFiX makes
 * multiple API requests while navigating/testing.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Too many requests, please try again later.",
    },
});

/*
 * Login-specific rate limiter
 *
 * Login still has protection against excessive
 * repeated attempts.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message: "Too many login attempts, please try again later.",
    },
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

/*
 * Authentication routes
 *
 * Login gets an additional dedicated limiter.
 */
app.use("/api/auth/login", loginLimiter);

app.use("/api/services", serviceRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/users", userRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/provider-profile", providerProfileRoutes);

app.use(notFound);

app.use(errorHandler);

async function startServer() {
    await connectDatabase();

    app.listen(env.PORT, () => {
        console.log(`WEFiX server is running on port ${env.PORT}`);
    });
}

startServer().catch((error) => {
    console.error(
        "Unable to start WEFiX server:",
        error.message
    );

    process.exit(1);
});