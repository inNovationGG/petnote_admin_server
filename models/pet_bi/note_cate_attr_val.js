module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_cate_attr_val', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    ncaid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate_attr.id"
    },
    pid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "父属性值id"
    },
    val: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
      comment: "值"
    },
    pet_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "作用在指定宠物的类型0-全部1-猫2-狗"
    },
    seq: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "排序"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除"
    }
  }, {
    sequelize,
    tableName: 'note_cate_attr_val',
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
      {
        name: "idx_seq",
        using: "BTREE",
        fields: [
          { name: "seq" },
        ]
      },
      {
        name: "idx_isdelete",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
        ]
      },
    ]
  });
};
