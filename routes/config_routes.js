const users = require("./users");
const transfers = require("./transfers")

exports.routesInit = (app) => {
  app.use("/users", users);
  app.use("/transfers", transfers);
};
