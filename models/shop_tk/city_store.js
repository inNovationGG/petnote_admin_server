module.exports = function (sequelize, DataTypes) {
    return sequelize.define('city_store', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "主键ID"
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: "城市"
        },
        store_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "分仓ID"
        },
        store_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "分仓名称"
        },
        created: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "日期"
        }
    }, {
        sequelize,
        tableName: 'city_store',
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
                name: "idx_city",
                using: "BTREE",
                fields: [
                    { name: "city" },
                ]
            },
        ]
    });
};
