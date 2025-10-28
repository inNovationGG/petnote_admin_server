module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_cate_attr_unit', {
    ncaid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "note_cate_attr.id"
    },
    unit_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "unit.id"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-未删除，1-已删除"
    }
  }, {
    sequelize,
    tableName: 'note_cate_attr_unit',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ncaid" },
          { name: "unit_id" },
        ]
      },
    ]
  });
};
