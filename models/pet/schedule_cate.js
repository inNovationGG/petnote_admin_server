module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schedule_cate', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "主键"
    },
    pid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "父id 0为一级分类"
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "",
      comment: "分类名称"
    },
    ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate.id对应的分类id"
    },
    attr_val_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate_attr_val:id属性值id"
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "排序id"
    },
    display_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "",
      comment: "显示分类名称"
    }
  }, {
    sequelize,
    tableName: 'schedule_cate',
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
    ]
  });
};
