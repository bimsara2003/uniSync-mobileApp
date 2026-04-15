require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const userRoutes = require("./routes/userRoute");
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
