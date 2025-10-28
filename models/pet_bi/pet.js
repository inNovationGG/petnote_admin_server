module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pet', {
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
      comment: "用户id"
    },
    top_cate_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "类型顶级分类id"
    },
    cate_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物品种分类id"
    },
    head_img: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "",
      comment: "头像地址"
    },
    old_breeds: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "宠物品种"
    },
    weight: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "体重-单位 克"
    },
    gender: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 2,
      comment: "性别0-男,1-女,2-未知"
    },
    birthday: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物生日"
    },
    homeday: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "宠物到家日期"
    },
    nick_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "昵称"
    },
    master_nick_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "和主人的关系(称呼)"
    },
    kc_status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 2,
      comment: "绝育状态0-未绝育，1-已绝育，2-未知"
    },
    sort_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "排序id"
    },
    intro: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "一句话宣言介绍"
    },
    bg_img: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "背景图"
    },
    somato_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "体型1-瘦弱,2-偏瘦,3-标准,4-偏胖,5-肥胖"
    },
    size: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "类型（1-小型，2-中型，3-大型，0其他"
    },
    is_die: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否死亡0-未,1-是"
    },
    die_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "死亡时间"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除0-未删除1-已删除"
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
    tableName: 'pet',
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
        name: "idx_cate_id",
        using: "BTREE",
        fields: [
          { name: "cate_id" },
        ]
      },
      {
        name: "idx_is_die",
        using: "BTREE",
        fields: [
          { name: "is_die" },
        ]
      },
      {
        name: "idx_topcatid",
        using: "BTREE",
        fields: [
          { name: "top_cate_id" },
        ]
      },
      {
        name: "idx_somatotype",
        using: "BTREE",
        fields: [
          { name: "somato_type" },
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
      {
        name: "idx_topcateid_created",
        using: "BTREE",
        fields: [
          { name: "top_cate_id" },
          { name: "created" },
        ]
      },
      {
        name: "idx_topcateid_created_birthday_homeday",
        using: "BTREE",
        fields: [
          { name: "top_cate_id" },
          { name: "created" },
          { name: "birthday" },
          { name: "homeday" },
        ]
      },
      {
        name: "idx_homeday_topcateid_created",
        using: "BTREE",
        fields: [
          { name: "homeday" },
          { name: "top_cate_id" },
          { name: "created" },
        ]
      },
      {
        name: "idx_size_birthday",
        using: "BTREE",
        fields: [
          { name: "size" },
          { name: "birthday" },
        ]
      },
      {
        name: "idx_topcateid_somatotype_created_birthday",
        using: "BTREE",
        fields: [
          { name: "top_cate_id" },
          { name: "somato_type" },
          { name: "created" },
          { name: "birthday" },
        ]
      },
      {
        name: "idx_topcateid_isdeleted_created_uid",
        using: "BTREE",
        fields: [
          { name: "top_cate_id" },
          { name: "is_deleted" },
          { name: "created" },
          { name: "uid" },
        ]
      },
      {
        name: "idx_isdeleted_uid_created",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
          { name: "uid" },
          { name: "created" },
        ]
      },
    ]
  });
};
