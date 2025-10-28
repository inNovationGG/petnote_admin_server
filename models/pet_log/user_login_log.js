module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_login_log', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    last_login_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "最后登录年"
    },
    last_login_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "最后登录年月"
    },
    last_login_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "最后登录年月日"
    },
    parame: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "参数"
    },
    created: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'user_login_log',
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
        name: "uid",
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "idx_ymd",
        using: "BTREE",
        fields: [
          { name: "last_login_ymd" },
        ]
      },
      {
        name: "idx_ym",
        using: "BTREE",
        fields: [
          { name: "last_login_ym" },
        ]
      },
    ]
  });
};
