const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('customers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    external_userid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "external_userid"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    corp_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    corp_full_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    customer_service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customer_services',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'customers',
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
        name: "external_userid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "external_userid" },
        ]
      },
      {
        name: "fk_customer_service_id",
        using: "BTREE",
        fields: [
          { name: "customer_service_id" },
        ]
      },
    ]
  });
};
