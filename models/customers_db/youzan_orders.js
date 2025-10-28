const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('youzan_orders', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        order_number: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单号"
        },
        order_status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "订单状态"
        },
        order_creation_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单创建时间，YYYY-MM-DD HH:mm:ss"
        },
        pay_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单支付时间，YYYY-MM-DD HH:mm:ss"
        },
        receiver_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "收货人姓名"
        },
        receiver_tel: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "收货人手机号"
        },
        self_fetch_info: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "到店自提信息"
        },
        delivery_province: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "省"
        },
        delivery_city: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "市"
        },
        delivery_district: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "区"
        },
        delivery_postal_code: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "邮政编码"
        },
        delivery_address: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "详细地址"
        },
        outer_sku_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "微商城店铺类型：outer_sku_id 对应的是规格编码；在零售店铺类型场景下outer_sku_id 对应的是规格条码"
        },
        item_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "订单类型，0:普通类型商品; 1:拍卖商品; 5:餐饮商品; 10:分销商品; 20:会员卡商品; 21:礼品卡商品; 23:有赞会议商品; 24:周期购; 30:收银台商品; 31:知识付费商品; 35:酒店商品; 40:普通服务类商品; 71:卡项商品;182:普通虚拟商品; 183:电子卡券商品; 201:外部会员卡商品; 202:外部直接收款商品; 203:外部普通商品; 204:外部服务商品;205:mock不存在商品; 206:小程序二维码;207:积分充值商品;208:付费优惠券商品"
        },
        num: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "商品数量"
        },
        sku_no: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "规则编码"
        },
        goods_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品id，取自jst_order"
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品名称"
        },
        t_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "三级品类名称，取自U8C数据"
        },
        t_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "三级品类id，取自U8C数据"
        },
        s_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "二级品类名称，取自U8C数据"
        },
        s_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "二级品类id，取自U8C数据"
        },
        f_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "一级品类名称，取自U8C数据"
        },
        f_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "一级品类id，取自U8C数据"
        },
        brand: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "品牌，取自U8C数据"
        },
        goods_extra: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "商品扩展字段, json格式字符串。out_sku_id 外部系统的规格id,一般channel_info有值的情况下该字段有值.目前仅视频号小店订单透出(视频号小店的skuId); out_item_id 外部系统的商品id。一般channel_info有值的情况下该字段有值。目前仅视频号小店订单会透出(视频号小店的商品id）"
        },
        is_refund: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否有退款，0-否，1-是"
        },
        is_points_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否是积分订单，0-否，1-是"
        },
        buyer_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "下单人昵称"
        },
        expired_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单过期时间（未付款将自动关单）"
        },
        refund_state: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "退款状态 0:未退款; 2:部分退款成功; 12:全额退款成功"
        },
        shop_display_no: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "门店编码"
        },
        node_kdt_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "门店id"
        },
        success_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "交易完成时间，YYYY-MM-DD HH:mm:ss"
        },
        status_str: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "主订单状态 描述"
        },
        update_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单更新时间，YYYY-MM-DD HH:mm:ss"
        },
        root_kdt_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "总店id"
        },
        express_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "物流类型 0:快递发货; 1:到店自提; 2:同城配送; 9:无需发货（虚拟商品订单）"
        },
        order_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "主订单类型0:普通订单; 1:送礼订单; 2:代付; 3:供货商查询时返回表示为分销供货单。; 4:赠品; 5:心愿单; 6:二维码订单; 7:合并付货款; 8:1分钱实名认证; 9:品鉴; 10:拼团; 15:返利; 35:酒店; 40:外卖; 41:堂食点餐; 46:外卖买单; 51:全员开店; 61:线下收银台订单; 71:美业预约单; 72:美业服务单; 75:知识付费; 81:礼品卡;85：直播带货订单（仅指爱逛平台产生的订单） 100:批发;89:样品订单"
        },
        shop_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "店铺名"
        },
        store_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "分仓id，取自jst_order"
        },
        book_key: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单唯一识别码"
        },
        buyer_message: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单买家留言"
        },
        yz_open_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "有赞对外统一openId"
        },
        fans_nickname: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "粉丝昵称"
        },
        buyer_phone: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "买家手机号"
        },
        outer_user_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "微信H5和微信小程序（有赞小程序和小程序插件）的订单会返回微信weixin_openid，三方App（有赞APP开店）的订单会返回open_user_id，2019年1月30号后的订单支持返回该参数"
        },
        user_ids: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "用户id列表"
        },
    }, {
        sequelize,
        tableName: 'youzan_orders',
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
                name: "idx_order_creation_time",
                using: "BTREE",
                fields: [
                    { name: "order_creation_time" },
                ]
            },
        ]
    });
};
