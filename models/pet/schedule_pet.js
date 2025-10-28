module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schedule_pet', {
    s_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "schedule:id"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "pet:id"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "schedule:uid(冗余)"
    },
    sc_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "schedule_cate:sc_id(冗余) (未选择为0)"
    },
    remind_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "提醒时间(冗余)"
    },
    is_send: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否已提醒(冗余)"
    },
    is_complete: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否已完成(冗余)"
    },
    complete_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "完成时间(冗余)"
    },
    complete_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "完成用户id(冗余)"
    },
    is_deleted_schedule: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除(冗余)(0:否;1:是)"
    },
    is_deleted_pet: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物是否删除(0:否;1:是)"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建时间(冗余)"
    },
    updated: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "更新时间(冗余)"
    }
  }, {
    sequelize,
    tableName: 'schedule_pet',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "s_id" },
          { name: "pet_id" },
        ]
      },
      {
        name: "idx_petid_rtime_issend_iscom",
        using: "BTREE",
        fields: [
          { name: "pet_id" },
          { name: "remind_time" },
          { name: "is_send" },
          { name: "is_complete" },
        ]
      },
    ]
  });
};
