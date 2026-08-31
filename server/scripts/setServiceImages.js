const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const Service = require("../models/Service");

const serviceImages = {
    plumbing: "/images/services/plumbing.svg",
    electrical: "/images/services/electrical.svg",
    cleaning: "/images/services/cleaning.svg",
    carpentry: "/images/services/carpentry.svg",
    painting: "/images/services/painting.svg",
    "pest-control": "/images/services/pest-control.svg",
};

async function setServiceImages() {
    await connectDatabase();

    console.log("\nUpdating service images...\n");

    for (const [slug, imageUrl] of Object.entries(serviceImages)) {
        const result = await Service.updateOne(
            { slug: slug },
            { $set: { imageUrl: imageUrl } }
        );

        console.log(
            `${slug}: matched=${result.matchedCount}, modified=${result.modifiedCount}`
        );
    }

    console.log("\nCurrent services:\n");

    const services = await Service.find(
        {},
        { name: 1, slug: 1, imageUrl: 1 }
    ).lean();

    console.table(services);

    await mongoose.disconnect();
}

setServiceImages().catch(async (error) => {
    console.error("Unable to update service images:", error);
    await mongoose.disconnect();
    process.exit(1);
});
