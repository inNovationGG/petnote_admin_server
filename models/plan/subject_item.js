module.exports = function (sequelize, DataTypes) {
  return sequelize.define('subject_item', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    sid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "subject:id"
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: "",
      comment: "内容"
    }
  }, {
    sequelize,
    tableName: 'subject_item',
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
    ]
  });
};
