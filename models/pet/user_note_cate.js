module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_note_cate', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "主键"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户id"
    },
    ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "自定义的note_cate.id"
    },
    p_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "冗余note_cate.id二级分类id"
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "",
      comment: "分类名称"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'user_note_cate',
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
      {
        name: "idx_ncid",
        using: "BTREE",
        fields: [
          { name: "ncid" },
        ]
      },
    ]
  });
};
