module.exports = function(sequelize, DataTypes) {
  return sequelize.define('unit', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: "",
      comment: "名称"
    }
  }, {
    sequelize,
    tableName: 'unit',
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
