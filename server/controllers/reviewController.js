const z = require("zod");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");

const createReviewSchema = z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
        message: "Invalid booking ID format",
    }),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
});

async function createReview(req, res) {
    const parseResult = createReviewSchema.safeParse(req.body);

    if (!parseResult.success) {
        const error = new Error(parseResult.error.issues[0].message);
        error.statusCode = 400;
        throw error;
    }

    const { bookingId, rating, comment } = parseResult.data;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        const error = new Error("Booking not found.");
        error.statusCode = 404;
        throw error;
    }

    if (booking.customer.toString() !== req.user.id) {
        const error = new Error("You are not authorized to review this booking.");
        error.statusCode = 403;
        throw error;
    }

    if (booking.status !== "completed") {
        const error = new Error("You can only review completed bookings.");
        error.statusCode = 400;
        throw error;
    }

    if (!booking.provider) {
        const error = new Error("This booking has no provider.");
        error.statusCode = 400;
        throw error;
    }

    const existingReview = await Review.findOne({
        booking: booking._id,
    });

    if (existingReview) {
        const error = new Error("You have already reviewed this booking.");
        error.statusCode = 409;
        throw error;
    }

    const review = new Review({
        booking: booking._id,
        customer: booking.customer,
        provider: booking.provider,
        rating,
        comment,
    });

    await review.save();

    const reviews = await Review.find({
        provider: booking.provider,
    }).select("rating");

    const totalReviews = reviews.length;

    const averageRating =
        totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
            : 0;

    await ProviderProfile.findOneAndUpdate(
        { user: booking.provider },
        {
            averageRating,
            totalReviews,
        }
    );

    res.status(201).json({
        message: "Review submitted successfully.",
        review,
    });
}

async function getReviewForBooking(req, res) {
    const review = await Review.findOne({
        booking: req.params.bookingId,
        customer: req.user.id,
    });

    res.status(200).json({
        reviewed: Boolean(review),
        review: review || null,
    });
}

module.exports = {
    createReview,
    getReviewForBooking,
};