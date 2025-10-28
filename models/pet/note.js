const sequelizePaginate = require('sequelize-paginate');
const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  const Note = sequelize.define('note', {
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
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "状态：0-正常 1失败 10待审核 11阿里审核中 12人工审核"
    },
    task_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "审核taskID"
    },
    desc_audit_ext: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "记录审核扩展"
    },
    from_source: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "来源：0-小程序 1-后台审核"
    },
    from_uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "来源UID"
    },
    mark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "备注"
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue("created_at")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue("updated_at")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      },
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
        name: "idx_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_updated",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
          { name: "updated" },
        ]
      },
      {
        name: "idx_created_ymd",
        using: "BTREE",
        fields: [
          { name: "created_ymd" }
        ]
      },
    ]
  });
  sequelizePaginate.paginate(Note);
  return Note;
};
