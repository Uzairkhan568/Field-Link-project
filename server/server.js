const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
    res.send("WEFiX server is running!");
});

app.use("/api/bookings", bookingRoutes);

app.listen(5000, () => {
    console.log("WEFiX server is running on port 5000");
});