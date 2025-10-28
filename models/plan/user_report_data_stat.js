const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_report_data_stat', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "ID"
    },
    report_data_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "报告数据ID",
      unique: "uk_report_data"
    },
    uid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "用户UID"
    },
    pet_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "宠物ID"
    },
    report_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "报告ID"
    },
    avg_score_1: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "1-饮食得分平均"
    },
    out_score_1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1-饮食超过比"
    },
    avg_score_2: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "2-尿便得分平均"
    },
    out_score_2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "2-尿便超过比"
    },
    avg_score_3: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "3-体重体型得分平均"
    },
    out_score_3: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "3-体重体型超过比"
    },
    avg_score_4: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "4-精神得分平均"
    },
    out_score_4: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "4-精神超过比"
    },
    avg_score_5: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "5-体质得分平均"
    },
    out_score_5: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "5-体质超过比"
    },
    avg_score: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "总分平均"
    },
    out_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "总分超过比"
    },
    created: {
      type: DataTypes.BIGINT,
      allowNull: true
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
    tableName: 'user_report_data_stat',
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
        name: "uk_report_data",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "report_data_id" },
        ]
      },
    ]
  });
};
