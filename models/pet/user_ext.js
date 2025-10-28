module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_ext', {
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "用户id"
    },
    page_surplus_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "书页额度"
    },
    page_freeze_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "冻结额度"
    },
    balance: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "余额"
    },
    status_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "自定义"
    }
  }, {
    sequelize,
    tableName: 'user_ext',
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
