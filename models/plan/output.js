const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('output', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "标题"
    },
    cate_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "分类id1. 问题  2. 风险  3.建议"
    },
    cate_sub_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "默认0 当cate_id=3时(1-饮食，2-尿便，3-体质，4-体型体重，5-精神)"
    },
    tag: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "标签"
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: "",
      comment: "内容"
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建人"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-未删除1-已删除"
    },
    created_ymd: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建年月日"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'output',
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
