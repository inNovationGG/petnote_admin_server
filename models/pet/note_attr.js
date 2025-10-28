module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_attr', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "user.id冗余"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "pet:id冗余,体重属性时需要"
    },
    nid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note.id"
    },
    ncid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate.id冗余"
    },
    ncaid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "note_cate_attr.id"
    },
    ncavid_custom: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户自定义属性值user_note_cate_attr_val.id"
    },
    nca_serial: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "属性组序号"
    },
    vals: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "真实值,多个以逗号隔开"
    },
    org_vals: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "原始值"
    },
    vals_ext: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "值,多个以逗号隔开,记录额外的数据值"
    },
    unit_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "单位id"
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
    tableName: 'note_attr',
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
        name: "idx_ncaid",
        using: "BTREE",
        fields: [
          { name: "ncaid" },
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
      {
        name: "idx_petid_isdeleted_ncaid_notetime",
        using: "BTREE",
        fields: [
          { name: "pet_id" },
          { name: "is_deleted" },
          { name: "ncaid" },
          { name: "note_time" },
        ]
      },
      {
        name: "idx_uid_isdeleted_ncaid_petid",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "is_deleted" },
          { name: "ncaid" },
          { name: "pet_id" },
        ]
      },
    ]
  });
};
