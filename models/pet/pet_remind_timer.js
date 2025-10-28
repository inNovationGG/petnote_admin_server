module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pet_remind_timer', {
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "用户ID"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "宠物ID"
    },
    remind_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "提醒类型  (1-生日提醒 ; 2-纪念日提醒)"
    },
    timer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "timerID"
    },
    next_step: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "下次节点(对应constants配置里的id)"
    },
    next_send_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "下次提醒时间"
    },
    all_step_finshed: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "完成状态 (1-已完成; 0-未完成)"
    },
    pet_cate: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物类型 (1-猫 ; 2-狗)"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除0-未删除1-已删除"
    }
  }, {
    sequelize,
    tableName: 'pet_remind_timer',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "pet_id" },
          { name: "remind_type" },
        ]
      },
    ]
  });
};
