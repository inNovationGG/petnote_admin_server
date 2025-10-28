const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_warehouses', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "主键ID"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "分仓名称"
    },
    co_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "主仓公司编号"
    },
    wms_co_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "分仓编号"
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "是否为主仓，true=主仓"
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "状态"
    },
    remark1: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "对方备注"
    },
    remark2: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "我方备注"
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "省份"
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "城市"
    }
  }, {
    sequelize,
    tableName: 'jst_warehouses',
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
        name: "idx_wms_co_id",
        using: "BTREE",
        fields: [
          { name: "wms_co_id" },
        ]
      },
      {
        name: "idx_city",
        using: "BTREE",
        fields: [
          { name: "city" },
        ]
      },
    ]
  });
};
