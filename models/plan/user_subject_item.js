const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_subject_item', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "user:uid"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "user_report:id"
    },
    sid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "subject:id"
    },
    item_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "选项id"
    },
    item_val: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "选项值"
    },
    created_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    created_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    created_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    updated: {
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
    tableName: 'user_subject_item',
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
        name: "idx_uid_petid_reportid_sid",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "pet_id" },
          { name: "report_id" },
          { name: "sid" },
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
