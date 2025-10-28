const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('jst_order', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    so_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "线上单号",
      unique: "uk_so_id"
    },
    co_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "公司编号"
    },
    shop_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "店铺编号"
    },
    io_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "出库单号"
    },
    o_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "内部单号"
    },
    created: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "创建时间"
    },
    modified: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "修改时间"
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "状态;WaitConfirm:待出库,Confirmed:已出库"
    },
    order_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "订单类型，普通订单"
    },
    shop_buyer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "买家昵称"
    },
    open_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "平台买家唯一值"
    },
    receiver_country: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "国家"
    },
    receiver_state: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "省"
    },
    receiver_city: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "市"
    },
    receiver_district: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "区"
    },
    receiver_town: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "街道"
    },
    receiver_address: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      comment: "地址"
    },
    receiver_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "收件人姓名"
    },
    receiver_phone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "收件人手机"
    },
    receiver_mobile: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "收件人电话"
    },
    buyer_message: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "买家留言"
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "备注"
    },
    is_cod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "是否货到付款"
    },
    pay_amount: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "应付金额"
    },
    l_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "物流单号"
    },
    io_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "出库时间"
    },
    labels: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "标记"
    },
    paid_amount: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "实付金额"
    },
    free_amount: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "优惠金额"
    },
    weight: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "预估重量"
    },
    merge_so_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "合并订单号"
    },
    is_print_express: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "快递单已打印"
    },
    f_weight: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "实称重量"
    },
    wms_co_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "分仓编号"
    },
    currency: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "货币类型"
    },
    pay_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "付款日期"
    },
    seller_flag: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "旗帜"
    },
    shop_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "店铺名称"
    },
    ts: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "数据库行版"
    },
    drp_co_id_from: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "分销商编号"
    },
    buyer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "买家号"
    },
    business_staff: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "业务人员"
    },
    wave_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "拣货批次号"
    },
    qty: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "数量"
    },
    mt_phone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "美团处理手机号"
    }
  }, {
    sequelize,
    tableName: 'jst_order',
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
        name: "uk_so_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "so_id" },
        ]
      },
      {
        name: "idx_jst_order_shop_id",
        using: "BTREE",
        fields: [
          { name: "shop_id" },
        ]
      },
      {
        name: "idx_created",
        using: "BTREE",
        fields: [
          { name: "created" },
        ]
      },
      {
        name: "idx_wms_co_id",
        using: "BTREE",
        fields: [
          { name: "wms_co_id" },
        ]
      },
    ]
  });
};
