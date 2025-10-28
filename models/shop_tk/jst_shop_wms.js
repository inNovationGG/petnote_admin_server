const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_shop_wms', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    wms_co_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "分仓编号\n",
      unique: "uk_wms_co_id"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "分仓名称"
    },
    co_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "主仓公司编号"
    },
    is_main: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "状态"
    },
    remark1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "对方备注"
    },
    remark2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "我方备注"
    }
  }, {
    sequelize,
    tableName: 'jst_shop_wms',
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
        name: "uk_wms_co_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "wms_co_id" },
        ]
      },
    ]
  });
};
