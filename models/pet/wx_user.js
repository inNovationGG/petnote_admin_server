module.exports = function(sequelize, DataTypes) {
  return sequelize.define('wx_user', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "主键"
    },
    offiaccount_app_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "公众号appid"
    },
    open_id: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "公众号openid"
    },
    union_id: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "union_id"
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "关联的小程序uid"
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
    }
  }, {
    sequelize,
    tableName: 'wx_user',
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
        name: "udx_openid_unionid_offacntid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "open_id" },
          { name: "union_id" },
          { name: "offiaccount_app_id" },
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
