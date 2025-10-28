const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_report_data', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "用户Uid"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "宠物ID"
    },
    report_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "报告ID"
    },
    pet_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "宠物名称"
    },
    date_month: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "宠物年龄月数"
    },
    rer: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "RER"
    },
    bcs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "BCS体况"
    },
    intake: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "摄入量"
    },
    weight_state: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "体重状态：1-体重偏低2-体重正常3-正在长肉4体重偏高5-肥胖症"
    },
    weight_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "体重标准最小值"
    },
    weight_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "体重标准最大值"
    },
    score_1: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "1-饮食得分"
    },
    score_2: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "2-尿便得分"
    },
    score_3: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "3-体重体型得分"
    },
    score_4: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "4-精神得分"
    },
    score_5: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "5-体质得分"
    },
    score: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      comment: "总分"
    },
    output_ids: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "OutputID集合"
    },
    report_type: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: "报告类型：0-大报告  1-饮食 2-尿便 3-体型 4-精神"
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: "报告状态：0-正常 1-废弃"
    },
    report_flag: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: "报告初始标记：0-大报告 1-饮食 2-尿便 3-体型体重 4-精神"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
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
    tableName: 'user_report_data',
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
        name: "uk_uid_report",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "report_id" },
        ]
      },
    ]
  });
};
