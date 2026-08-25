function errorHandler(error, req, res, next) {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || 500;
    const message =
        statusCode >= 500 ? "An unexpected server error occurred" : error.message;

    res.status(statusCode).json({ message });
}

module.exports = errorHandler;
