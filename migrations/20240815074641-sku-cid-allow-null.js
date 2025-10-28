"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("jst_goods_sku", "c_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "类目id",
    });

    await queryInterface.changeColumn("jst_goods_sku", "sale_price", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "销售价",
    });

    await queryInterface.changeColumn("jst_goods_sku", "cost_price", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "成本价",
    });

    await queryInterface.changeColumn("jst_inventory", "i_id", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "款式编码",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("jst_goods_sku", "c_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "类目id",
    });

    await queryInterface.changeColumn("jst_goods_sku", "sale_price", {
      type: Sequelize.FLOAT,
      allowNull: false,
      comment: "销售价",
    });

    await queryInterface.changeColumn("jst_goods_sku", "cost_price", {
      type: Sequelize.FLOAT,
      allowNull: false,
      comment: "成本价",
    });

    await queryInterface.changeColumn("jst_inventory", "i_id", {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: "款式编码",
    });
  },
};
