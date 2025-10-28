const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_goods_sku', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "ID"
    },
    sku_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "聚水潭skuID",
      unique: "uk_sku"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "聚水潭分仓名称"
    },
    i_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "款式编码"
    },
    short_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "商品简称"
    },
    sale_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "销售价"
    },
    cost_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "成本价"
    },
    properties_value: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "颜色规格"
    },
    c_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "类目id"
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "分类"
    },
    pic_big: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "大图地址"
    },
    pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "图片地址"
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "是否启用，0：备用，1：启用，-1：禁用"
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "重量"
    },
    market_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "市场价"
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "品牌"
    },
    supplier_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "供应商编号"
    },
    supplier_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "供应商名称"
    },
    sku_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "国标码"
    },
    supplier_sku_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "供应商商品编码"
    },
    supplier_i_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "供应商商品款号"
    },
    vc_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "虚拟分类"
    },
    sku_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "商品类型"
    },
    creator: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "创建者"
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "备注"
    },
    item_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "商品属性"
    },
    stock_disabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "是否禁止同步"
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "单位"
    },
    shelf_life: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "保质期"
    },
    labels: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "商品标签"
    },
    production_licence: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "生产许可证"
    },
    l: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "长"
    },
    w: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "宽"
    },
    h: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "高"
    },
    is_series_number: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "是否开启序列号"
    },
    other_price_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "其他价格1"
    },
    other_price_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "其他价格2"
    },
    other_price_3: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "其他价格3"
    },
    other_price_4: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "其他价格4"
    },
    other_price_5: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "其他价格5"
    },
    other_1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "其他属性1"
    },
    other_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "其他属性2"
    },
    other_3: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "其他属性3"
    },
    other_4: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "其他属性4"
    },
    other_5: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "其他属性5"
    },
    stock_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "链接同步状态"
    },
    sku_codes: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "辅助码"
    },
    autoid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "唯一id，系统自增id"
    },
    batch_enabled: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "是否开启生产批次开关"
    }
  }, {
    sequelize,
    tableName: 'jst_goods_sku',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
        name: "uk_sku",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sku_id" },
        ]
      },
    ]
  });
};
