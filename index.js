// index.js
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
const allRoutes = require("./routes/index"); // We will create this
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: "http://localhost:3000", // 🌟 ONLY ALLOW REQUESTS FROM YOUR FRONT-END PORT
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow these HTTP methods
  credentials: true, // Allow cookies/authorization headers to be sent
  optionsSuccessStatus: 204, // Some legacy browsers choke on 200
};

// Middleware
app.use(cors(corsOptions));
// Middleware
// To parse JSON bodies

// Connect to Database
connectDB();

// API Routes (Prefix all with /api/v1)
app.use("/api/v1", allRoutes);

// Simple health check route
app.get("/", (req, res) => {
  res.send("API Server is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
