module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mini_send_count', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "id"
    },
    cnt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "剩余次数"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户ID"
    },
    send_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
      comment: "小程序订阅消息模版类型"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "插入时间"
    },
    updated: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "更新时间"
    },
    created_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "created年"
    },
    created_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "created年月"
    },
    created_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "created年月日"
    },
    updated_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "updated年"
    },
    updated_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "updated年月"
    },
    updated_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "updated年月日"
    }
  }, {
    sequelize,
    tableName: 'mini_send_count',
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
        name: "udx_uid_sendtype",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "send_type" },
        ]
      },
    ]
  });
};
