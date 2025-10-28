const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_store_house', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "ID"
    },
    wms_co_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "聚水潭分仓ID",
      unique: "uk_wms_co_id"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "聚水潭分仓名称"
    },
    shop_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "抖店店铺ID"
    },
    shop_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "抖店店铺名称"
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
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "更新人"
    }
  }, {
    sequelize,
    tableName: 'jst_store_house',
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
