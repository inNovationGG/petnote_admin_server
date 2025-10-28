const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const ScoreGoods = sequelize.define('score_goods', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        goods_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品ID"
        },
        real_goods_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "实际商品ID（对接有赞）"
        },
        goods_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品名称"
        },
        goods_img: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品展示图片"
        },
        goods_cate: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品一级分类ID（多个用逗号分隔）"
        },
        goods_second_cate: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品二级分类ID（多个用逗号分隔）"
        },
        goods_use_range: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "商品适用范围（暂时不用，和商品一级分类保持一致）"
        },
        goods_field: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "商品属性（9-新品，10-畅销，11-限量款）"
        },
        online_inventory: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "线上库存"
        },
        total_inventory: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "总库存（对接有赞）"
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "商品价值（兑换所需积分数）"
        },
        sort: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "排序"
        },
        goods_begin_time: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "商品有效期开始时间"
        },
        goods_end_time: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "商品有效期结束时间"
        },
        goods_begin_date: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品有效期开始日期"
        },
        goods_end_date: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品有效期结束日期"
        },
        cycle_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "线上循环类型（0-不循环，1-日循环，2-月循环）"
        },
        cycle_date: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "线上循环时间（HH:mm:ss）"
        },
        cycle_day: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "线上循环日（月循环时用于表示每月的第几天）"
        },
        cycle_action_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "线上循环action类型（0-新增，1-减少，2-其他）"
        },
        cycle_action_effect: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "线上循环action影响范围（0-线上库存，1-其他）"
        },
        cycle_action_effect_value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "线上循环action影响的数值"
        },
        is_exchange_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否有兑换次数限制（0-无限制，1-有限制）"
        },
        exchange_level_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "兑换所需的用户等级（预留字段，暂时不用）"
        },
        exchange_date_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "兑换周期类型（0-分钟，1-小时，2-天，3-周，4-月，5-季度，6-年，7-一辈子（暂时只有天、月、一辈子三种）"
        },
        exchange_times_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "兑换次数限制"
        },
        is_hidden: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否隐藏款（0-否，1-是）"
        },
        is_grow: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否可膨胀（0-否，1-是），隐藏款不可膨胀"
        },
        grow_goods_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "膨胀后的商品ID，关联goods_id字段的值"
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否删除（0-未删除，1-已删除）"
        },
        goods_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "商品状态（0-上架（前端显示并可兑换），1-隐藏（前端不显示，可兑换），2-线上售罄（前端显示，不可兑换，展示循环补货时间），3-下架（前端不显示，不可兑换））"
        },
        city_description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "适用城市"
        },
        exchange_description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "兑换方式"
        },
        rule_description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "规则"
        },
        detail_description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "商品详情"
        },
        create_by: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "创建人ID"
        },
        update_by: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "修改人ID"
        },
        created: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "创建日期"
        },
        updated: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "修改日期"
        },
        created_at: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "创建日期"
        },
        updated_at: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "修改日期"
        },
        created_y: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "创建日期年"
        },
        created_ym: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "创建日期年月"
        },
        created_ymd: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "创建日期年月日"
        },
    }, {
        sequelize,
        tableName: 'score_goods',
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
                name: "idx_goods_id",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "goods_id" },
                ]
            },
            {
                name: "idx_real_goods_id",
                using: "BTREE",
                fields: [
                    { name: "real_goods_id" },
                ]
            },
            {
                name: "idx_goods_status",
                using: "BTREE",
                fields: [
                    { name: "goods_status" },
                ]
            },
        ]
    });
    sequelizePaginate.paginate(ScoreGoods);
    return ScoreGoods;
};
