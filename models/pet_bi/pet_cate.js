module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pet_cate', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    pid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "父id"
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "分类名称"
    },
    is_hot: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否热门0-否,1-是"
    },
    f_letter: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: "英文首字母"
    },
    size: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "类型（0-其他，1-小型，2-中型，3-大型）"
    }
  }, {
    sequelize,
    tableName: 'pet_cate',
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
        name: "idx_pid",
        using: "BTREE",
        fields: [
          { name: "pid" },
        ]
      },
      {
        name: "idx_is_hot",
        using: "BTREE",
        fields: [
          { name: "is_hot" },
        ]
      },
      {
        name: "idx_f_letter",
        using: "BTREE",
        fields: [
          { name: "f_letter" },
        ]
      },
    ]
  });
};
