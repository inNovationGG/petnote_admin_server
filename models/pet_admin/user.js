module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    uid: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: "用户名",
      unique: "udx_username"
    },
    truename: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "",
      comment: "真实姓名"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "密码"
    },
    role_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-管理员1-外部人员"
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "备注"
    },
    expired_at: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "有效期时间戳"
    },
    created_at: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "创建时间戳"
    },
    updated_at: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "更新时间戳"
    },
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "udx_username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
