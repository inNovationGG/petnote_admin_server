var DataTypes = require("sequelize").DataTypes;
var _article = require("./article");
var _bak_subject = require("./bak_subject");
var _bak_subject_item = require("./bak_subject_item");
var _banner = require("./banner");
var _banner_copy1 = require("./banner_copy1");
var _brand = require("./brand");
var _goods = require("./goods");
var _goods_cate = require("./goods_cate");
var _goods_content = require("./goods_content");
var _output = require("./output");
var _output_article = require("./output_article");
var _output_recommend = require("./output_recommend");
var _sequelizemeta = require("./sequelizemeta");
var _subject = require("./subject");
var _subject_item = require("./subject_item");
var _user = require("./user");
var _user_goods_collect = require("./user_goods_collect");
var _user_report = require("./user_report");
var _user_report_data = require("./user_report_data");
var _user_report_data_stat = require("./user_report_data_stat");
var _user_report_flow = require("./user_report_flow");
var _user_subject = require("./user_subject");
var _user_subject_item = require("./user_subject_item");

function initModels(sequelize) {
  var article = _article(sequelize, DataTypes);
  var bak_subject = _bak_subject(sequelize, DataTypes);
  var bak_subject_item = _bak_subject_item(sequelize, DataTypes);
  var banner = _banner(sequelize, DataTypes);
  var banner_copy1 = _banner_copy1(sequelize, DataTypes);
  var brand = _brand(sequelize, DataTypes);
  var goods = _goods(sequelize, DataTypes);
  var goods_cate = _goods_cate(sequelize, DataTypes);
  var goods_content = _goods_content(sequelize, DataTypes);
  var output = _output(sequelize, DataTypes);
  var output_article = _output_article(sequelize, DataTypes);
  var output_recommend = _output_recommend(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var subject = _subject(sequelize, DataTypes);
  var subject_item = _subject_item(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var user_goods_collect = _user_goods_collect(sequelize, DataTypes);
  var user_report = _user_report(sequelize, DataTypes);
  var user_report_data = _user_report_data(sequelize, DataTypes);
  var user_report_data_stat = _user_report_data_stat(sequelize, DataTypes);
  var user_report_flow = _user_report_flow(sequelize, DataTypes);
  var user_subject = _user_subject(sequelize, DataTypes);
  var user_subject_item = _user_subject_item(sequelize, DataTypes);


  return {
    article,
    bak_subject,
    bak_subject_item,
    banner,
    banner_copy1,
    brand,
    goods,
    goods_cate,
    goods_content,
    output,
    output_article,
    output_recommend,
    sequelizemeta,
    subject,
    subject_item,
    user,
    user_goods_collect,
    user_report,
    user_report_data,
    user_report_data_stat,
    user_report_flow,
    user_subject,
    user_subject_item,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
