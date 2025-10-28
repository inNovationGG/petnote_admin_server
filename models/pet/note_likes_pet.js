module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_likes_pet', {
    nl_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "note_likes:id"
    },
    pet_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "宠物id"
    },
    from_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "冗余:点赞的用户id"
    },
    uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "冗余:获赞用户id"
    }
  }, {
    sequelize,
    tableName: 'note_likes_pet',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nl_id" },
          { name: "pet_id" },
        ]
      },
      {
        name: "idx_fromuid_petid",
        using: "BTREE",
        fields: [
          { name: "from_uid" },
          { name: "pet_id" },
        ]
      },
    ]
  });
};
