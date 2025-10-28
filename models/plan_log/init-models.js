var DataTypes = require("sequelize").DataTypes;
var _user_login_log = require("./user_login_log");

function initModels(sequelize) {
  var user_login_log = _user_login_log(sequelize, DataTypes);


  return {
    user_login_log,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
