const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const WechatLabels = sequelize.define('wechat_labels', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        bind_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "标签名称关联的id，如分仓id，品类id等等"
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "标签名称"
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "标签类型（0-城市，1-分仓，2-二级品类，3-品牌，4-SKU）"
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
        tableName: 'wechat_labels',
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
                name: "idx_type",
                using: "BTREE",
                fields: [
                    { name: "type" },
                ]
            },
        ]
    });
    sequelizePaginate.paginate(WechatLabels);
    return WechatLabels;
};
