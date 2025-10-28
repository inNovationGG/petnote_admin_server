const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_inventory', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "主键ID"
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "仓库ID，引用jst_warehouses表的ID",
      references: {
        model: 'jst_warehouses',
        key: 'id'
      }
    },
    sku_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "商品编码",
      references: {
        model: 'jst_goods_sku',
        key: 'sku_id'
      }
    },
    purchase_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "采购在途数"
    },
    min_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "安全库存下限"
    },
    allocate_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "调拨在途数"
    },
    virtual_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "虚拟库存"
    },
    order_lock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "订单占有数"
    },
    max_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "安全库存上限"
    },
    pick_lock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "仓库待发数"
    },
    wms_co_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "WMS公司ID"
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "主仓实际库存"
    },
    modified: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "修改时间，用此时间作为下一次查询的起始时间"
    },
    in_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "进货仓库存"
    },
    defective_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "次品库存"
    },
    return_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "销退仓库存"
    },
    ts: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "时间戳"
    },
    i_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "款式编码"
    },
    customize_qty_1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "自定义仓1"
    },
    customize_qty_2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "自定义仓2"
    },
    customize_qty_3: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "自定义仓3"
    }
  }, {
    sequelize,
    tableName: 'jst_inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
        name: "sku_id",
        using: "BTREE",
        fields: [
          { name: "sku_id" },
        ]
      },
      {
        name: "jst_inventory_warehouse_id_sku_id",
        using: "BTREE",
        fields: [
          { name: "warehouse_id" },
          { name: "sku_id" },
        ]
      },
      {
        name: "jst_inventory_wms_co_id",
        using: "BTREE",
        fields: [
          { name: "wms_co_id" },
        ]
      },
    ]
  });
};
