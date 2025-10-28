"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建 jst_warehouses 表
    await queryInterface.createTable("jst_warehouses", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "主键ID",
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "分仓名称",
      },
      co_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "主仓公司编号",
      },
      wms_co_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "分仓编号",
      },
      is_main: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: "是否为主仓，true=主仓",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "状态",
      },
      remark1: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "对方备注",
      },
      remark2: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "我方备注",
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "省份",
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "城市",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 创建 jst_inventory 表
    await queryInterface.createTable("jst_inventory", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: "主键ID",
      },
      warehouse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "仓库ID，引用jst_warehouses表的ID",
        references: {
          model: "jst_warehouses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sku_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "商品编码",
        references: {
          model: "jst_goods_sku",
          key: "sku_id",
        },
        onDelete: "CASCADE",
      },
      purchase_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "采购在途数",
      },
      min_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "安全库存下限",
      },
      allocate_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "调拨在途数",
      },
      virtual_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "虚拟库存",
      },
      order_lock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "订单占有数",
      },
      max_qty: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "安全库存上限",
      },
      pick_lock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "仓库待发数",
      },
      wms_co_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "WMS公司ID",
      },
      qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "主仓实际库存",
      },
      modified: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "修改时间，用此时间作为下一次查询的起始时间",
      },
      in_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "进货仓库存",
      },
      defective_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "次品库存",
      },
      return_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "销退仓库存",
      },
      ts: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "时间戳",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
      i_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "款式编码",
      },
      customize_qty_1: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "自定义仓1",
      },
      customize_qty_2: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "自定义仓2",
      },
      customize_qty_3: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "自定义仓3",
      },
    });

    // 添加索引
    await queryInterface.addIndex("jst_inventory", ["warehouse_id", "sku_id"]);
    await queryInterface.addIndex("jst_inventory", ["wms_co_id"]);
  },

  async down(queryInterface, Sequelize) {
    // 删除索引
    await queryInterface.removeIndex("jst_inventory", ["warehouse_id", "sku_id"]);
    await queryInterface.removeIndex("jst_inventory", ["wms_co_id"]);

    // 删除 jst_inventory 表
    await queryInterface.dropTable("jst_inventory");

    // 删除 jst_warehouses 表
    await queryInterface.dropTable("jst_warehouses");
  },
};
