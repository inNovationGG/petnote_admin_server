const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_report_flow', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "报告评分ID"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "用户UID"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "宠物ID号"
    },
    report_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "报告ID号"
    },
    tag_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "算法标的ID"
    },
    category_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      comment: "分类 1-饮食 2-尿便 3-体重体型 4-精神 5体质 100-其他"
    },
    score: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      comment: "得分"
    },
    output_ids: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "output输出ID"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-未删除1-已删除"
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
    tableName: 'user_report_flow',
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
        name: "uk_user_report_tag_category",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "report_id" },
          { name: "tag_id" },
          { name: "category_id" },
        ]
      },
      {
        name: "idx_report_id",
        using: "BTREE",
        fields: [
          { name: "report_id" },
        ]
      },
    ]
  });
};
