const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
    res.send("WEFiX server is running!");
});

app.listen(5000, () => {
    console.log("WEFiX server is running on port 5000");
});