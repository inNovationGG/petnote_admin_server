module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jst_order_num', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "主键ID"
        },
        channel: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "渠道"
        },
        order_type: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "订单类型（外卖订单和自提订单）"
        },
        order_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "订单数"
        },
        sale_amount: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "实收"
        },
        total_cost: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品含税成本"
        },
        rate: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "毛利率"
        },
        created: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "日期"
        }
    }, {
        sequelize,
        tableName: 'jst_order_num',
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
                name: "idx_created",
                using: "BTREE",
                fields: [
                    { name: "created" },
                ]
            },
            {
                name: "idx_channel",
                using: "BTREE",
                fields: [
                    { name: "channel" },
                ]
            },
        ]
    });
};
