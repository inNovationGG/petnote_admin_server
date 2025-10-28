const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('tax', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "自增主键"
    },
    order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "订单号"
    },
    platform_order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "平台订单号"
    },
    customer_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "客户编码"
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "客户"
    },
    store_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "前置仓编码"
    },
    store_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "前置仓名称"
    },
    company_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "归属公司编码"
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "归属公司"
    },
    order_createtime: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "订单日期"
    },
    goods_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "存货编码"
    },
    goods_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "存货名称"
    },
    goods_count: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "数量"
    },
    goods_price: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "单价"
    },
    total_price_with_tax: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "价税合计"
    },
    audit_output_count: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "出库审核数量"
    },
    bill_price: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "结算金额"
    },
    single_price: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "分摊单价"
    },
    total_price: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "分摊金额"
    },
    is_check: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "对账状态"
    },
    single_cost: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "成本单价"
    },
    total_cost: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "成本金额"
    },
    is_return: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "是否退货"
    },
    main_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "主表ID"
    },
    detail_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "明细ID"
    },
    bill_real_price: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "实际结算金额"
    },
    order_real_createtime: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "原单日期"
    },
    tax_percent: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "税率"
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "城市"
    },
    channel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "渠道"
    },
    goods_cate_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "分类编码"
    },
    goods_cate_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "分类名称"
    },
    cost_with_tax: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "含税成本"
    },
    total_cost_with_tax: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "含税成本金额"
    },
    workflow_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "业务流程编码"
    },
    workflow_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "业务流程名称"
    },
    mainbody_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "主体编码"
    },
    mainbody_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "主体名称"
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "品牌"
    },
    f_cate_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "一级分类编码"
    },
    f_cate_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "一级分类名称"
    },
    s_cate_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "二级分类编码"
    },
    s_cate_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "二级分类名称"
    },
    t_cate_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "三级分类编码"
    },
    t_cate_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "三级分类名称"
    },
  }, {
    sequelize,
    tableName: 'tax',
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
        name: "idx_detail_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "detail_id" },
        ]
      },
      {
        name: "idx_order_id",
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "idx_customer_id",
        using: "BTREE",
        fields: [
          { name: "customer_id" },
        ]
      },
      {
        name: "idx_store_id",
        using: "BTREE",
        fields: [
          { name: "store_id" },
        ]
      },
      {
        name: "idx_goods_id",
        using: "BTREE",
        fields: [
          { name: "goods_id" },
        ]
      },
      {
        name: "idx_channel",
        using: "BTREE",
        fields: [
          { name: "channel" },
        ]
      },
      {
        name: "idx_platform_order_id",
        using: "BTREE",
        fields: [
          { name: "platform_order_id" },
        ]
      },
      {
        name: "idx_order_createtime",
        using: "BTREE",
        fields: [
          { name: "order_createtime" },
        ]
      },
      {
        name: "idx_brand",
        using: "BTREE",
        fields: [
          { name: "brand" },
        ]
      },
    ]
  });
};
