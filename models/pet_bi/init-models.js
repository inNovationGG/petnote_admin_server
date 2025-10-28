var DataTypes = require("sequelize").DataTypes;
var _node_user = require("./node_user");
var _note = require("./note");
var _note_attr = require("./note_attr");
var _note_cate = require("./note_cate");
var _note_cate_attr = require("./note_cate_attr");
var _note_cate_attr_val = require("./note_cate_attr_val");
var _note_image = require("./note_image");
var _note_pet = require("./note_pet");
var _pet = require("./pet");
var _pet_cate = require("./pet_cate");
var _user = require("./user");
var _user_breeder = require("./user_breeder");

function initModels(sequelize) {
  var node_user = _node_user(sequelize, DataTypes);
  var note = _note(sequelize, DataTypes);
  var note_attr = _note_attr(sequelize, DataTypes);
  var note_cate = _note_cate(sequelize, DataTypes);
  var note_cate_attr = _note_cate_attr(sequelize, DataTypes);
  var note_cate_attr_val = _note_cate_attr_val(sequelize, DataTypes);
  var note_image = _note_image(sequelize, DataTypes);
  var note_pet = _note_pet(sequelize, DataTypes);
  var pet = _pet(sequelize, DataTypes);
  var pet_cate = _pet_cate(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var user_breeder = _user_breeder(sequelize, DataTypes);


  return {
    node_user,
    note,
    note_attr,
    note_cate,
    note_cate_attr,
    note_cate_attr_val,
    note_image,
    note_pet,
    pet,
    pet_cate,
    user,
    user_breeder,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
