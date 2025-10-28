module.exports = function (sequelize, DataTypes) {
  return sequelize.define('action_log', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "登录用户id"
    },
    page: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "前端页面路径"
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "controlleraction"
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "备注"
    },
    parameter: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "参数"
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "类型0-默认,1-浏览,2-下载"
    },
    ip: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "",
      comment: "ip地址"
    },
    created_y: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "创建年"
    },
    created_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建年月"
    },
    created_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建年月日"
    },
    created: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'action_log',
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
        name: "idx_uid_type",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "type" },
        ]
      },
    ]
  });
};
