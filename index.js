const express = require("express");
const app = express();

require("./startup/loging")();
require("./startup/cors")(app);
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/prod")(app);
if (process.env.NODE_ENV !== "test") {
  require("./startup/port")(app);
}
module.exports = app;
