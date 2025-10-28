var DataTypes = require("sequelize").DataTypes;
var _jst_goods_sku = require("./jst_goods_sku");
var _jst_inventory = require("./jst_inventory");
var _jst_order = require("./jst_order");
var _jst_order_item = require("./jst_order_item");
var _jst_shop = require("./jst_shop");
var _jst_shop_wms = require("./jst_shop_wms");
var _jst_store_house = require("./jst_store_house");
var _jst_warehouses = require("./jst_warehouses");
var _open_order = require("./open_order");
var _open_order_item = require("./open_order_item");
var _sequelizemeta = require("./sequelizemeta");
var _tax = require("./tax");
var _tk_goods_item = require("./tk_goods_item");
var _tk_goods_item_down_log = require("./tk_goods_item_down_log");

function initModels(sequelize) {
  var jst_goods_sku = _jst_goods_sku(sequelize, DataTypes);
  var jst_inventory = _jst_inventory(sequelize, DataTypes);
  var jst_order = _jst_order(sequelize, DataTypes);
  var jst_order_item = _jst_order_item(sequelize, DataTypes);
  var jst_shop = _jst_shop(sequelize, DataTypes);
  var jst_shop_wms = _jst_shop_wms(sequelize, DataTypes);
  var jst_store_house = _jst_store_house(sequelize, DataTypes);
  var jst_warehouses = _jst_warehouses(sequelize, DataTypes);
  var open_order = _open_order(sequelize, DataTypes);
  var open_order_item = _open_order_item(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var tax = _tax(sequelize, DataTypes);
  var tk_goods_item = _tk_goods_item(sequelize, DataTypes);
  var tk_goods_item_down_log = _tk_goods_item_down_log(sequelize, DataTypes);

  jst_inventory.belongsTo(jst_goods_sku, { as: "sku", foreignKey: "sku_id"});
  jst_goods_sku.hasMany(jst_inventory, { as: "jst_inventories", foreignKey: "sku_id"});
  jst_inventory.belongsTo(jst_warehouses, { as: "warehouse", foreignKey: "warehouse_id"});
  jst_warehouses.hasMany(jst_inventory, { as: "jst_inventories", foreignKey: "warehouse_id"});

  // 定义关联关系
  jst_order.hasMany(jst_order_item, { foreignKey: 'order_id' });
  jst_order_item.belongsTo(jst_order, { foreignKey: 'order_id' });

  return {
    jst_goods_sku,
    jst_inventory,
    jst_order,
    jst_order_item,
    jst_shop,
    jst_shop_wms,
    jst_store_house,
    jst_warehouses,
    open_order,
    open_order_item,
    sequelizemeta,
    tax,
    tk_goods_item,
    tk_goods_item_down_log,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
