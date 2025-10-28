const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "order_number"
    },
    product_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    order_product_status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    order_status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    order_creation_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    buyer_payment_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    recipient_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    buyer_nickname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    buyer_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    buyer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    product_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    product_brand: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    product_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    product_group: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    product_primary_category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    product_secondary_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_tertiary_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_quaternary_category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    product_spec_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    product_spec: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    spec_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    spec_barcode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    product_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    product_barcode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    product_attributes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    product_unit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    package_product_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    supplier: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_ids: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    sequelize,
    tableName: 'orders',
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
