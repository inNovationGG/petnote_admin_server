module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_cate_attr', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    pid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "父id,用于属性组"
    },
    ncid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate.id"
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "",
      comment: "标题"
    },
    seq: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "显示顺序"
    },
    group_limit_num: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "属性分组限制个数"
    },
    tp: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "multi:多选,single:单选;text:输入group:分组属性"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-未删除,1-已删除"
    }
  }, {
    sequelize,
    tableName: 'note_cate_attr',
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
        name: "idx_seq",
        using: "BTREE",
        fields: [
          { name: "seq" },
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
