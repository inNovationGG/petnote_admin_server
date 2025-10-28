const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const YouzanTicket = sequelize.define('youzan_ticket', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        activity_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "活动id"
        },
        activity_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "活动名称"
        },
        kdt_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "店铺id"
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "活动状态（1-未开始，2-进行中，3-已结束，4-已失效，5-审核中）"
        },
        designated_shop_ids: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "活动适用店铺信息（null-未指派，[0]表示全部指派，[kdtId1,kdtId2]表示部分店铺指派）"
        },
        statistics_content: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "活动统计信息"
        },
        extra_content: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "活动扩展信息"
        },
    }, {
        sequelize,
        tableName: 'youzan_ticket',
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
        ]
    });
    sequelizePaginate.paginate(YouzanTicket);
    return YouzanTicket;
};
