const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('banner_copy1', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "Banner"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "标题"
    },
    pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "图片链接地址"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "描述"
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "链接"
    },
    tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "标记位置：PLAN_INDEX"
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: "序号"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-未删除1-已删除"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue("created_at")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue("updated_at")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      },
    }
  }, {
    sequelize,
    tableName: 'banner_copy1',
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
