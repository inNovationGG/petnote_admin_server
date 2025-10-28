var DataTypes = require("sequelize").DataTypes;
var _customer_labels = require("./customer_labels");
var _customer_services = require("./customer_services");
var _customers = require("./customers");
var _labels = require("./labels");
var _orders = require("./orders");
var _wechat_push = require("./wechat_push");
var _wechat_push_time = require("./wechat_push_time");
var _wechat_labels = require("./wechat_labels");
var _youzan_orders = require("./youzan_orders");
var _wechat_customers_labels = require("./wechat_customers_labels");
var _wechat_push_results = require("./wechat_push_results");

function initModels(sequelize) {
  var customer_labels = _customer_labels(sequelize, DataTypes);
  var customer_services = _customer_services(sequelize, DataTypes);
  var customers = _customers(sequelize, DataTypes);
  var labels = _labels(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var wechat_push = _wechat_push(sequelize, DataTypes);
  var wechat_push_time = _wechat_push_time(sequelize, DataTypes);
  var wechat_labels = _wechat_labels(sequelize, DataTypes);
  var youzan_orders = _youzan_orders(sequelize, DataTypes);
  var wechat_customers_labels = _wechat_customers_labels(sequelize, DataTypes);
  var wechat_push_results = _wechat_push_results(sequelize, DataTypes);

  customers.belongsToMany(labels, { as: 'labels', through: customer_labels, foreignKey: "customer_id", otherKey: "label_id" });
  labels.belongsToMany(customers, { as: 'customers', through: customer_labels, foreignKey: "label_id", otherKey: "customer_id" });
  customers.belongsTo(customer_services, { as: "customer_service", foreignKey: "customer_service_id" });
  customer_services.hasMany(customers, { as: "customers", foreignKey: "customer_service_id" });
  customer_labels.belongsTo(customers, { as: "customer", foreignKey: "customer_id" });
  customers.hasMany(customer_labels, { as: "customer_labels", foreignKey: "customer_id" });
  customer_labels.belongsTo(labels, { as: "label", foreignKey: "label_id" });
  labels.hasMany(customer_labels, { as: "customer_labels", foreignKey: "label_id" });

  return {
    customer_labels,
    customer_services,
    customers,
    labels,
    orders,
    wechat_push,
    wechat_push_time,
    wechat_labels,
    youzan_orders,
    wechat_customers_labels,
    wechat_push_results
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
