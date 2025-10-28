module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schedule', {
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
    sc_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "schedule_cate:id (未选择为0)"
    },
    complete_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "完成用户id"
    },
    timer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "timer服务器任务id"
    },
    title: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "提醒标题"
    },
    repeat_interval: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "计划周期-天(单次计划为0)"
    },
    is_complete: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否已完成(0:否;1:是)"
    },
    advance: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "提前多少天提醒(当天为0)"
    },
    complete_days: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "提前完成的天数"
    },
    is_send: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否已提醒(0:否;1:是)"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除(0:否;1:是)"
    },
    remind_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "提醒时间"
    },
    complete_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "完成时间"
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
    tableName: 'schedule',
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
        name: "idx_isdel_issend_iscom",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
          { name: "is_send" },
          { name: "is_complete" },
        ]
      },
      {
        name: "idx_uid_isdeleted",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "is_deleted" },
        ]
      },
    ]
  });
};
