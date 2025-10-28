const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('customer_labels', {
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    label_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'labels',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'customer_labels',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "customer_id" },
          { name: "label_id" },
        ]
      },
      {
        name: "label_id",
        using: "BTREE",
        fields: [
          { name: "label_id" },
        ]
      },
    ]
  });
};
