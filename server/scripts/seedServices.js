const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const Service = require("../models/Service");

const services = [
    {
        name: "Plumbing",
        slug: "plumbing",
        description: "Find reliable plumbing professionals.",
    },
    {
        name: "Electrical",
        slug: "electrical",
        description: "Find trusted electrical professionals.",
    },
    {
        name: "Cleaning",
        slug: "cleaning",
        description: "Find professional cleaning services.",
    },
    {
        name: "Carpentry",
        slug: "carpentry",
        description: "Find skilled carpenters for your woodwork.",
    },
    {
        name: "Painting",
        slug: "painting",
        description: "Find professional painters for a fresh look.",
    },
    {
        name: "Pest Control",
        slug: "pest-control",
        description: "Find experts to safely remove pests.",
    },
];

async function seedServices() {
    await connectDatabase();

    await Service.bulkWrite(
        services.map((service) => ({
            updateOne: {
                filter: { slug: service.slug },
                update: { $set: service },
                upsert: true,
            },
        }))
    );

    console.log("Services seeded successfully");
    await mongoose.disconnect();
}

seedServices().catch(async (error) => {
    console.error("Unable to seed services:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});
