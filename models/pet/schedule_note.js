module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schedule_note', {
    note_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "note:id"
    },
    s_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true,
      comment: "schedule:id"
    }
  }, {
    sequelize,
    tableName: 'schedule_note',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "note_id" },
          { name: "s_id" },
        ]
      },
    ]
  });
};
