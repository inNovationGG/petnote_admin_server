module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_image', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    nid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note.id"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "user.id冗余"
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "文件地址"
    },
    remark: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "图片/视频备注"
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "类型0-图片,1-视频"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除"
    },
    note_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note年冗余"
    },
    note_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note年月冗余"
    },
    note_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note年月日冗余"
    },
    note_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note.note_time冗余"
    },
    f_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate一级分类冗余"
    },
    s_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate二级分类冗余"
    },
    t_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate三级分类冗余"
    },
    t_ncid_custom: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户自定义3级分类冗余"
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "图片状态：0-正常 1-异常违规"
    },
    task_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "审核taskId"
    },
    audit_ext: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "审核备注"
    },
    created_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年冗余"
    },
    created_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年月冗余"
    },
    created_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年月日冗余"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    updated: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'note_image',
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
        name: "idx_isdelete",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
        ]
      },
      {
        name: "idx_nid_isdelete",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "is_deleted" },
        ]
      },
      {
        name: "idx_type",
        using: "BTREE",
        fields: [
          { name: "type" },
        ]
      },
      {
        name: "idx_nid_isdeleted",
        using: "BTREE",
        fields: [
          { name: "nid" },
          { name: "is_deleted" },
        ]
      },
    ]
  });
};
