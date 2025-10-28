module.exports = function (sequelize, DataTypes) {
    return sequelize.define('score_goods_cate', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        goods_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品分类ID"
        },
        goods_cate_pid: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品分类父ID（预留字段，暂时不用）"
        },
        goods_cate_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "商品分类类别（0-一级分类，1-二级分类，2-宠本本周边，3-适用范围标签，4-属性标签，5-其他）"
        },
        goods_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品分类名称（同城达专用/全国通用/优惠券/配送优惠券/商品兑换券/宠本本周边/新品/畅销/限量款等等）"
        },
        sort: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "展示顺序"
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否删除（0-未删除，1-已删除）"
        },
    }, {
        sequelize,
        tableName: 'score_goods_cate',
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
                name: "idx_goods_cate_id",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "goods_cate_id" },
                ]
            },
            {
                name: "idx_goods_cate_type",
                using: "BTREE",
                fields: [
                    { name: "goods_cate_type" },
                ]
            },
        ]
    });
};
