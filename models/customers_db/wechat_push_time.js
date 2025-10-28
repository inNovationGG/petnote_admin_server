const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const WechatPushTime = sequelize.define('wechat_push_time', {
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
        week_day: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "1-星期一，2-星期二，3-星期三，4-星期四，5-星期五，6-星期六，7-星期日"
        },
        push_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "推送具体时间，HH:mm"
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
        tableName: 'wechat_push_time',
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
                using: "BTREE",
                fields: [
                    { name: "name" },
                ]
            },
        ]
    });
    sequelizePaginate.paginate(WechatPushTime);
    return WechatPushTime;
};
