const mongoose = require("mongoose");
const { env } = require("../config/env");
const { generateBookingReference } = require("../utils/bookingReference");

async function migrateBookingReferences() {
    await mongoose.connect(env.MONGODB_URI);

    const collection = mongoose.connection.collection("bookings");
    const cursor = collection.find({
        $or: [
            { bookingReference: { $exists: false } },
            { bookingReference: null },
            { bookingReference: "" },
        ],
    });

    let updated = 0;

    while (await cursor.hasNext()) {
        const booking = await cursor.next();
        let reference;

        do {
            reference = generateBookingReference(booking.createdAt);
        } while (
            await collection.findOne(
                { bookingReference: reference },
                { projection: { _id: 1 } }
            )
        );

        await collection.updateOne(
            { _id: booking._id },
            { $set: { bookingReference: reference } }
        );
        updated += 1;
    }

    await collection.createIndex(
        { bookingReference: 1 },
        { unique: true, name: "bookingReference_unique" }
    );

    console.log(`Booking reference migration complete. Updated: ${updated}`);
    await mongoose.disconnect();
}

migrateBookingReferences().catch(async (error) => {
    console.error("Booking reference migration failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
