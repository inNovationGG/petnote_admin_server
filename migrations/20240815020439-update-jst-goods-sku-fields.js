"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 删除不需要的字段
    await queryInterface.removeColumn("jst_goods_sku", "is_deleted");
    await queryInterface.removeColumn("jst_goods_sku", "created_by");
    await queryInterface.removeColumn("jst_goods_sku", "updated_by");

    // 新增字段
    await queryInterface.addColumn("jst_goods_sku", "i_id", {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: "款式编码",
    });

    await queryInterface.addColumn("jst_goods_sku", "short_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "商品简称",
    });

    await queryInterface.addColumn("jst_goods_sku", "sale_price", {
      type: Sequelize.FLOAT,
      allowNull: false,
      comment: "销售价",
    });

    await queryInterface.addColumn("jst_goods_sku", "cost_price", {
      type: Sequelize.FLOAT,
      allowNull: false,
      comment: "成本价",
    });

    await queryInterface.addColumn("jst_goods_sku", "properties_value", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "颜色规格",
    });

    await queryInterface.addColumn("jst_goods_sku", "c_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "类目id",
    });

    await queryInterface.addColumn("jst_goods_sku", "category", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "分类",
    });

    await queryInterface.addColumn("jst_goods_sku", "pic_big", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "大图地址",
    });

    await queryInterface.addColumn("jst_goods_sku", "pic", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "图片地址",
    });

    await queryInterface.addColumn("jst_goods_sku", "enabled", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "是否启用，0：备用，1：启用，-1：禁用",
    });

    await queryInterface.addColumn("jst_goods_sku", "weight", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "重量",
    });

    await queryInterface.addColumn("jst_goods_sku", "market_price", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "市场价",
    });

    await queryInterface.addColumn("jst_goods_sku", "brand", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "品牌",
    });

    await queryInterface.addColumn("jst_goods_sku", "supplier_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "供应商编号",
    });

    await queryInterface.addColumn("jst_goods_sku", "supplier_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "供应商名称",
    });

    await queryInterface.addColumn("jst_goods_sku", "sku_code", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "国标码",
    });

    await queryInterface.addColumn("jst_goods_sku", "supplier_sku_id", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "供应商商品编码",
    });

    await queryInterface.addColumn("jst_goods_sku", "supplier_i_id", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "供应商商品款号",
    });

    await queryInterface.addColumn("jst_goods_sku", "vc_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "虚拟分类",
    });

    await queryInterface.addColumn("jst_goods_sku", "sku_type", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "商品类型",
    });

    await queryInterface.addColumn("jst_goods_sku", "creator", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "创建者",
    });

    await queryInterface.addColumn("jst_goods_sku", "remark", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "备注",
    });

    await queryInterface.addColumn("jst_goods_sku", "item_type", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "商品属性",
    });

    await queryInterface.addColumn("jst_goods_sku", "stock_disabled", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "是否禁止同步",
    });

    await queryInterface.addColumn("jst_goods_sku", "unit", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "单位",
    });

    await queryInterface.addColumn("jst_goods_sku", "shelf_life", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "保质期",
    });

    await queryInterface.addColumn("jst_goods_sku", "labels", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "商品标签",
    });

    await queryInterface.addColumn("jst_goods_sku", "production_licence", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "生产许可证",
    });

    await queryInterface.addColumn("jst_goods_sku", "l", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "长",
    });

    await queryInterface.addColumn("jst_goods_sku", "w", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "宽",
    });

    await queryInterface.addColumn("jst_goods_sku", "h", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "高",
    });

    await queryInterface.addColumn("jst_goods_sku", "is_series_number", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      comment: "是否开启序列号",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_price_1", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "其他价格1",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_price_2", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "其他价格2",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_price_3", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "其他价格3",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_price_4", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "其他价格4",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_price_5", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "其他价格5",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_1", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "其他属性1",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_2", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "其他属性2",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_3", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "其他属性3",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_4", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "其他属性4",
    });

    await queryInterface.addColumn("jst_goods_sku", "other_5", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "其他属性5",
    });

    await queryInterface.addColumn("jst_goods_sku", "stock_type", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "链接同步状态",
    });

    await queryInterface.addColumn("jst_goods_sku", "sku_codes", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "辅助码",
    });

    await queryInterface.addColumn("jst_goods_sku", "autoid", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "唯一id，系统自增id",
    });

    await queryInterface.addColumn("jst_goods_sku", "batch_enabled", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "是否开启生产批次开关",
    });
  },

  async down(queryInterface, Sequelize) {
    // 移除新增的字段
    await queryInterface.removeColumn("jst_goods_sku", "i_id");
    await queryInterface.removeColumn("jst_goods_sku", "short_name");
    await queryInterface.removeColumn("jst_goods_sku", "sale_price");
    await queryInterface.removeColumn("jst_goods_sku", "cost_price");
    await queryInterface.removeColumn("jst_goods_sku", "properties_value");
    await queryInterface.removeColumn("jst_goods_sku", "c_id");
    await queryInterface.removeColumn("jst_goods_sku", "category");
    await queryInterface.removeColumn("jst_goods_sku", "pic_big");
    await queryInterface.removeColumn("jst_goods_sku", "pic");
    await queryInterface.removeColumn("jst_goods_sku", "enabled");
    await queryInterface.removeColumn("jst_goods_sku", "weight");
    await queryInterface.removeColumn("jst_goods_sku", "market_price");
    await queryInterface.removeColumn("jst_goods_sku", "brand");
    await queryInterface.removeColumn("jst_goods_sku", "supplier_id");
    await queryInterface.removeColumn("jst_goods_sku", "supplier_name");
    await queryInterface.removeColumn("jst_goods_sku", "sku_code");
    await queryInterface.removeColumn("jst_goods_sku", "supplier_sku_id");
    await queryInterface.removeColumn("jst_goods_sku", "supplier_i_id");
    await queryInterface.removeColumn("jst_goods_sku", "vc_name");
    await queryInterface.removeColumn("jst_goods_sku", "sku_type");
    await queryInterface.removeColumn("jst_goods_sku", "creator");
    await queryInterface.removeColumn("jst_goods_sku", "remark");
    await queryInterface.removeColumn("jst_goods_sku", "item_type");
    await queryInterface.removeColumn("jst_goods_sku", "stock_disabled");
    await queryInterface.removeColumn("jst_goods_sku", "unit");
    await queryInterface.removeColumn("jst_goods_sku", "shelf_life");
    await queryInterface.removeColumn("jst_goods_sku", "labels");
    await queryInterface.removeColumn("jst_goods_sku", "production_licence");
    await queryInterface.removeColumn("jst_goods_sku", "l");
    await queryInterface.removeColumn("jst_goods_sku", "w");
    await queryInterface.removeColumn("jst_goods_sku", "h");
    await queryInterface.removeColumn("jst_goods_sku", "is_series_number");
    await queryInterface.removeColumn("jst_goods_sku", "other_price_1");
    await queryInterface.removeColumn("jst_goods_sku", "other_price_2");
    await queryInterface.removeColumn("jst_goods_sku", "other_price_3");
    await queryInterface.removeColumn("jst_goods_sku", "other_price_4");
    await queryInterface.removeColumn("jst_goods_sku", "other_price_5");
    await queryInterface.removeColumn("jst_goods_sku", "other_1");
    await queryInterface.removeColumn("jst_goods_sku", "other_2");
    await queryInterface.removeColumn("jst_goods_sku", "other_3");
    await queryInterface.removeColumn("jst_goods_sku", "other_4");
    await queryInterface.removeColumn("jst_goods_sku", "other_5");
    await queryInterface.removeColumn("jst_goods_sku", "stock_type");
    await queryInterface.removeColumn("jst_goods_sku", "sku_codes");
    await queryInterface.removeColumn("jst_goods_sku", "autoid");
    await queryInterface.removeColumn("jst_goods_sku", "batch_enabled");

    // 重新添加删除的字段
    await queryInterface.addColumn("jst_goods_sku", "is_deleted", {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除0-否1-是",
    });

    await queryInterface.addColumn("jst_goods_sku", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "创建人",
    });

    await queryInterface.addColumn("jst_goods_sku", "updated_by", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "更新人",
    });
  },
};
