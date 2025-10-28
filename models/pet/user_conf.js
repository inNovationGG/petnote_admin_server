module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_conf', {
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "用户id"
    },
    timeline_status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "首页版本状态，0-是 1-否"
    }
  }, {
    sequelize,
    tableName: 'user_conf',
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
    ]
  });
};
