require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
