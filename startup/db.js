const mongoose = require("mongoose");
const config = require("config");

function databaseConnection() {
  console.log("db" + config.get("db"));
  mongoose
    .connect(config.get("db"))
    .then(() => console.log(`Connected To ${config.get("db")}`))
    .catch(() => console.log("Could not connect to DB"));
}

module.exports = databaseConnection;
