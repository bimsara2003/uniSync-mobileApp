require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");
const eventRoutes = require("./routes/eventRoute");

const {
  facultyRouter,
  departmentRouter,
  moduleRouter,
} = require("./routes/hierarchyRoute");
const resourceRoutes = require("./routes/resourceRoute");
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculties", facultyRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/modules", moduleRouter);
app.use("/api/resources", resourceRoutes);
app.use("/api/events", eventRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
