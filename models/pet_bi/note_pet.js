module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_pet', {
    nid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "记录id"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "宠物id"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "user.id冗余"
    },
    pet_top_cid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "pet_cate.id冗余顶级分类"
    },
    is_deleted_note: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-记录未删1-记录已删除"
    },
    is_deleted_pet: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-宠物未删,1-宠物已删"
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
      comment: "记录时间冗余"
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
    is_auto: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否系统模版生成0-否,1-是冗余"
    },
    is_show_own: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "仅自己可见1-是,0-否"
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
    tableName: 'note_pet',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nid" },
          { name: "pet_id" },
        ]
      },
      {
        name: "idx_petopcid",
        using: "BTREE",
        fields: [
          { name: "pet_top_cid" },
        ]
      },
      {
        name: "idx_uid_isdeletednote_sncid_petid",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "is_deleted_note" },
          { name: "s_ncid" },
          { name: "pet_id" },
        ]
      },
      {
        name: "idx_petid_isdeletednote_sncid_tncid",
        using: "BTREE",
        fields: [
          { name: "pet_id" },
          { name: "is_deleted_note" },
          { name: "s_ncid" },
          { name: "t_ncid" },
        ]
      },
      {
        name: "idx_nid_isdeletenote",
        using: "BTREE",
        fields: [
          { name: "nid" },
          { name: "is_deleted_note" },
        ]
      },
      {
        name: "idx_notelists",
        using: "BTREE",
        fields: [
          { name: "is_deleted_pet" },
          { name: "is_deleted_note" },
          { name: "pet_id" },
          { name: "s_ncid" },
          { name: "note_time" },
          { name: "created" },
        ]
      },
      {
        name: "idx_pettopcid_isauto_uid_created",
        using: "BTREE",
        fields: [
          { name: "pet_top_cid" },
          { name: "is_auto" },
          { name: "uid" },
          { name: "created" },
        ]
      },
      {
        name: "idx_pettopcid_isauto_created_uid",
        using: "BTREE",
        fields: [
          { name: "pet_top_cid" },
          { name: "is_auto" },
          { name: "created" },
          { name: "uid" },
        ]
      },
      {
        name: "idx_uid_created",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "created" },
        ]
      },
      {
        name: "idx_sncid",
        using: "BTREE",
        fields: [
          { name: "s_ncid" },
        ]
      },
      {
        name: "idx_sncid_pettopcid_isauto_notetime",
        using: "BTREE",
        fields: [
          { name: "s_ncid" },
          { name: "pet_top_cid" },
          { name: "is_auto" },
          { name: "note_time" },
        ]
      },
      {
        name: "idx_tncid_pettopcid_isauto_notetime",
        using: "BTREE",
        fields: [
          { name: "t_ncid" },
          { name: "pet_top_cid" },
          { name: "is_auto" },
          { name: "note_time" },
        ]
      },
      {
        name: "idx_sncid_pettopcid_notetime_uid",
        using: "BTREE",
        fields: [
          { name: "s_ncid" },
          { name: "pet_top_cid" },
          { name: "note_time" },
          { name: "uid" },
        ]
      },
      {
        name: "idx_petid_sncid_pettopcid_notetime",
        using: "BTREE",
        fields: [
          { name: "pet_id" },
          { name: "s_ncid" },
          { name: "pet_top_cid" },
          { name: "note_time" },
        ]
      },
    ]
  });
};
