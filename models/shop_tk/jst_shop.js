const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_shop', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    shop_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "店铺ID",
      unique: "uk_shop_id"
    },
    shop_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "店铺名称"
    },
    shop_site: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "店铺站点"
    },
    co_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "公司编号"
    },
    short_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "店铺简称"
    },
    group_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "分组ID"
    },
    group_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "分组名"
    },
    nick: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "主账号"
    },
    created: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "创建时间"
    }
  }, {
    sequelize,
    tableName: 'jst_shop',
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
        name: "uk_shop_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "shop_id" },
        ]
      },
    ]
  });
};
