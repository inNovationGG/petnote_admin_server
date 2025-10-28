module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_audit', {
    nid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "记录id"
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-审核中,1-通过，2-拒绝"
    }
  }, {
    sequelize,
    tableName: 'note_audit',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nid" },
        ]
      },
    ]
  });
};
