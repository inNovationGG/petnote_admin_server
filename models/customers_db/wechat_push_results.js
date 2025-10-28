const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const wechatPushResults = sequelize.define('wechat_push_results', {
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
        result: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: "精准推送执行结果"
        },
        created_at: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "创建日期，YYYY-MM-DD HH:mm:ss"
        }
    }, {
        sequelize,
        tableName: 'wechat_push_results',
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
                name: "idx_created_at",
                using: "BTREE",
                fields: [
                    { name: "created_at" },
                ]
            },
        ]
    });
    sequelizePaginate.paginate(wechatPushResults);
    return wechatPushResults;
};
