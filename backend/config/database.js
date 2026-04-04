const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
  const uri = process.env.DATABASE_URL;
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Database connected succcessfully");
    })
    .catch((error) => {
      console.log(`Error while connecting server with Database`);
      console.log(error);
      process.exit(1);
    });
};
