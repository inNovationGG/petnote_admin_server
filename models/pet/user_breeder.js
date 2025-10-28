const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user_breeder', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "主键"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "共养/亲友的用户id"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物id"
    },
    breeder_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: "1:共养 2:亲友"
    },
    from_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "邀请发起人(主人id)"
    },
    pet_master_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物主人id冗余"
    },
    old_from_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "老字段"
    },
    nick_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "",
      comment: "昵称"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除"
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
    tableName: 'user_breeder',
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
        name: "udx_uid_petid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "pet_id" },
        ]
      },
      {
        name: "idx_uid_btype_isdelete",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "breeder_type" },
          { name: "is_deleted" },
        ]
      },
      {
        name: "idx_petid_isdelete_btype",
        using: "BTREE",
        fields: [
          { name: "pet_id" },
          { name: "is_deleted" },
          { name: "breeder_type" },
        ]
      },
      {
        name: "idx_created",
        using: "BTREE",
        fields: [
          { name: "created" }
        ]
      },
    ]
  });
};
