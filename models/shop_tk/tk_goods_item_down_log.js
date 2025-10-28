const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tk_goods_item_down_log', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "ID"
    },
    product_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "抖店商品ID"
    },
    shop_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "店铺ID"
    },
    sku_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "聚水潭和抖店SKU"
    },
    wms_co_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "聚水潭分仓ID"
    },
    threshold_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "阀值数"
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "聚水潭仓位"
    },
    batch_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "批次号"
    },
    jst_result: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "聚水潭当时结果"
    },
    tk_result: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "抖店当时结果"
    }
  }, {
    sequelize,
    tableName: 'tk_goods_item_down_log',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
