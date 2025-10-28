module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    note_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "记录id"
    },
    comment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "评论id"
    },
    for_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "操作用户id"
    },
    to_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "接受用户id"
    },
    reply_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "被回复的用户id（默认为0）"
    },
    desc: {
      type: DataTypes.STRING(550),
      allowNull: false,
      defaultValue: "",
      comment: "记录描述(冗余)"
    },
    content: {
      type: DataTypes.STRING(550),
      allowNull: false,
      defaultValue: "",
      comment: "回复/评论内容(冗余)"
    },
    msg_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "消息类型：1：评论，2 点赞 , 0 未知 10-记录审核"
    },
    from_source: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "来源：0-小程序 1-后台系统"
    },
    from_uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "来源UID"
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "状态：0-成功 1失败"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建时间"
    },
    updated: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "更新时间"
    }
  }, {
    sequelize,
    tableName: 'messages',
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
        name: "idx_touid",
        using: "BTREE",
        fields: [
          { name: "to_uid" },
        ]
      },
    ]
  });
};
