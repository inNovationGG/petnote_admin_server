var DataTypes = require("sequelize").DataTypes;
var _action_log = require("./action_log");

function initModels(sequelize) {
  var action_log = _action_log(sequelize, DataTypes);


  return {
    action_log,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
