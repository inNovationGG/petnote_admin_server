const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const WechatCustomersLabels = sequelize.define('wechat_customers_labels', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "对应customers表的主键id"
        },
        label_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "对应wechat_labels表的主键id"
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "对应youzan_orders表的主键id"
        },
    }, {
        sequelize,
        tableName: 'wechat_customers_labels',
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
                name: "idx_customer_id",
                using: "BTREE",
                fields: [
                    { name: "customer_id" },
                ]
            },
            {
                name: "idx_label_id",
                using: "BTREE",
                fields: [
                    { name: "label_id" },
                ]
            },
            {
                name: "idx_order_id",
                using: "BTREE",
                fields: [
                    { name: "order_id" },
                ]
            },
        ]
    });
    sequelizePaginate.paginate(WechatCustomersLabels);
    return WechatCustomersLabels;
};
