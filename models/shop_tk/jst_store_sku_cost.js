module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jst_store_sku_cost', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "主键ID"
        },
        sku_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品编号"
        },
        sku_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品名称"
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "城市"
        },
        store_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "分仓id"
        },
        total_cost: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品含税成本"
        },
        created: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "创建时间"
        }
    }, {
        sequelize,
        tableName: 'jst_store_sku_cost',
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
                name: "idx_sku_id",
                using: "BTREE",
                fields: [
                    { name: "sku_id" },
                ]
            },
            {
                name: "idx_sku_name",
                using: "BTREE",
                fields: [
                    { name: "sku_name" },
                ]
            },
            {
                name: "idx_city",
                using: "BTREE",
                fields: [
                    { name: "city" },
                ]
            },
            {
                name: "idx_store_id",
                using: "BTREE",
                fields: [
                    { name: "store_id" },
                ]
            },
        ]
    });
};
