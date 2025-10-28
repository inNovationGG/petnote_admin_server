module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "id"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户id"
    },
    desc: {
      type: DataTypes.STRING(550),
      allowNull: false,
      defaultValue: "",
      comment: "记录描述"
    },
    ext_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "扩展数据"
    },
    note_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note年"
    },
    note_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note年月"
    },
    note_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note年月日"
    },
    note_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "记录时间"
    },
    old_first_note_type: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "v3二级分类-第一级"
    },
    old_second_note_type: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "v3二级分类-第二级"
    },
    f_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate一级分类"
    },
    s_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate二级分类"
    },
    t_ncid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate三级分类"
    },
    t_ncid_custom: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户自定义3级分类"
    },
    is_auto: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否系统模版生成0-否,1-是"
    },
    is_show_own: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "仅自己可见1-是,0-否"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除"
    },
    like_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "点赞数量"
    },
    comment_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "评论数量"
    },
    created_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年"
    },
    created_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年月"
    },
    created_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年月日"
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
    tableName: 'note',
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
        name: "idx_notetime",
        using: "BTREE",
        fields: [
          { name: "note_time" },
        ]
      },
      {
        name: "idx_uid_isdeleted_sncid",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "is_deleted" },
          { name: "s_ncid" },
        ]
      },
      {
        name: "idx_createdymd_isdeleted_uid",
        using: "BTREE",
        fields: [
          { name: "created_ymd" },
          { name: "is_deleted" },
          { name: "uid" },
        ]
      },
      {
        name: "idx_isdeleted_uid_createdymd",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
          { name: "uid" },
          { name: "created_ymd" },
        ]
      },
      {
        name: "idx_isdeleted_createdymd",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
          { name: "created_ymd" },
        ]
      },
    ]
  });
};
