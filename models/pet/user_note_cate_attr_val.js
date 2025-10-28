module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_note_cate_attr_val', {
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
      comment: "用户id"
    },
    ncid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate.id冗余"
    },
    ncaid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate_attr.id"
    },
    vals: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
      comment: "值"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'user_note_cate_attr_val',
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
        name: "idx_ncaid",
        using: "BTREE",
        fields: [
          { name: "ncaid" },
        ]
      },
    ]
  });
};
