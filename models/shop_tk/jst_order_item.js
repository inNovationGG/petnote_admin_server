const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_order_item', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "订单ID"
    },
    ioi_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "子单号"
    },
    i_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "款式编码"
    },
    batch_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "批次号"
    },
    sku_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "商品编码"
    },
    sale_base_price: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "原价"
    },
    order_base_price: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "订单价格"
    },
    pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "图片"
    },
    inout_item_flds: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "订单集合"
    },
    expiration_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "有效期至"
    },
    sale_price: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "单价"
    },
    oi_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "订单子订单号"
    },
    product_date: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "批次日期"
    },
    raw_so_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "原始线上订单号"
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "商品单位"
    },
    properties_value: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "颜色规格"
    },
    is_gift: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "是否赠品"
    },
    qty: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "数量"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "商品名称"
    },
    sale_amount: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "金额"
    },
    free_amount: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "费用金额"
    },
    outer_oi_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "子订单号"
    }
  }, {
    sequelize,
    tableName: 'jst_order_item',
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
        name: "uk_order_ioi",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_id" },
          { name: "ioi_id" },
        ]
      },
      {
        name: "idx_sku_id",
        using: "BTREE",
        fields: [
          { name: "sku_id" },
        ]
      },
    ]
  });
};
