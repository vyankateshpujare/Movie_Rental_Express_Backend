const mongoose = require("mongoose");
const config = require("config");

function databaseConnection() {
  mongoose
    .connect(config.get("db"))
    .then(() => console.log(`Connected To ${config.get("db")}`))
    .catch(() => console.log("Could not connect to DB"));
}

module.exports = databaseConnection;
