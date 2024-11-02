const express = require("express");
const app = express();
const { routesInit } = require("./routes/config_routes");
const connectDB = require("./db/mongoConnect");
const cors = require('cors')
require("dotenv").config();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true 
}));


app.use(express.json({ limit: "11mb" }));

connectDB();
routesInit(app);

app.get("/", (req, res) => {
  res.json("Express Work");
});

let port = process.env.PORT || "8800";
app.listen(port, () => console.log("Example app is listening on port 8800."));
