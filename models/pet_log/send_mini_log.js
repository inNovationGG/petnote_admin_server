module.exports = function(sequelize, DataTypes) {
  return sequelize.define('send_mini_log', {
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
      comment: "用户ID"
    },
    text: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "日志内容"
    },
    send_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "模版类型"
    },
    is_success: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否发生成功1-成功,0-失败"
    },
    last_send_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "日志创建年"
    },
    last_send_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "日志创建年月"
    },
    last_send_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "日志创建年月日"
    }
  }, {
    sequelize,
    tableName: 'send_mini_log',
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
        name: "idx_uid",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
    ]
  });
};
