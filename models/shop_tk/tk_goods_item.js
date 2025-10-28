const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tk_goods_item', {
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
      comment: "抖店子商品ID",
      unique: "uk_product_id"
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
    threshold_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "阀值数"
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "抖店子商品名称"
    },
    last_down_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "最新下架时间"
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除0-否1-是"
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "创建人"
    }
  }, {
    sequelize,
    tableName: 'tk_goods_item',
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
      {
        name: "uk_product_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "uk_shop_sku_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "shop_id" },
          { name: "sku_id" },
        ]
      },
    ]
  });
};
