const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const WechatPush = sequelize.define('wechat_push', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "推送名称"
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "状态，0-进行中，1-暂停"
        },
        start_date: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "生效开始日期，YYYY-MM-DD"
        },
        end_date: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "生效结束日期，YYYY-MM-DD"
        },
        city_labels: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "城市标签，多个用英文逗号分隔，如：北京,上海,苏州"
        },
        store_labels: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "分仓标签，多个用英文逗号分隔，如：1001,1002,1003"
        },
        brand_labels: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "品牌标签，多个用英文逗号分隔，如：蓝氏,皇家,皮皮淘"
        },
        cate_labels: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "二级品类标签，多个用英文逗号分隔，如：1001,1002,1003"
        },
        sku_labels: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "商品id标签，多个用英文逗号分隔，如：1001,1002,1003"
        },
        last_order_day: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "上次下单间隔天数，如：7"
        },
        last_order_day_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "上次下单间隔天数限制区间，如：7"
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "推送文本，富文本"
        },
        img: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "图片地址"
        },
        mini_program_title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "小程序标题"
        },
        mini_program_img: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "小程序图片地址"
        },
        mini_program_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "小程序链接"
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "0-未删除，1-已删除"
        },
        created_by: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "创建人ID"
        },
        updated_by: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "修改人ID"
        },
        created_at: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "创建日期，YYYY-MM-DD HH:mm:ss"
        },
        updated_at: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "修改日期，YYYY-MM-DD HH:mm:ss"
        },
    }, {
        sequelize,
        tableName: 'wechat_push',
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
                name: "idx_name",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "name" },
                ]
            },
            {
                name: "idx_date",
                using: "BTREE",
                fields: [
                    { name: "start_date" },
                    { name: "end_date" },
                ]
            },
        ]
    });
    sequelizePaginate.paginate(WechatPush);
    return WechatPush;
};
