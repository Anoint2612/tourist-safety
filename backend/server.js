const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes placeholder
app.get("/", (req, res) => res.send("Backend running"));

// mount new routes
const authRoutes = require("./src/routes/auth");
const alertsRoutes = require("./src/routes/alerts");
const efirRoutes = require("./src/routes/efir");
const inspectorsRoutes = require("./src/routes/inspectors");

app.use("/auth", authRoutes);
app.use("/alerts", alertsRoutes);
app.use("/efir", efirRoutes);
app.use("/inspectors", inspectorsRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(5000, () => console.log("Server running on 5000"));
  })
  .catch(err => console.error(err));
