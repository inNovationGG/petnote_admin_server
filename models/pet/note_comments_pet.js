module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_comments_pet', {
    nc_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "note_comments:id"
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
      comment: "冗余:发表评论用户id"
    },
    reply_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "冗余:被回复的用户id"
    }
  }, {
    sequelize,
    tableName: 'note_comments_pet',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nc_id" },
          { name: "pet_id" },
        ]
      },
      {
        name: "idx_uid_petid",
        using: "BTREE",
        fields: [
          { name: "uid" },
          { name: "pet_id" },
        ]
      },
    ]
  });
};
