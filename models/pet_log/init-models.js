var DataTypes = require("sequelize").DataTypes;
var _send_mini_log = require("./send_mini_log");
var _send_wechat_log = require("./send_wechat_log");
var _user_login_log = require("./user_login_log");

function initModels(sequelize) {
  var send_mini_log = _send_mini_log(sequelize, DataTypes);
  var send_wechat_log = _send_wechat_log(sequelize, DataTypes);
  var user_login_log = _user_login_log(sequelize, DataTypes);


  return {
    send_mini_log,
    send_wechat_log,
    user_login_log,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
