const sequelizePaginate = require('sequelize-paginate');
module.exports = function (sequelize, DataTypes) {
    const LotteryText = sequelize.define('lottery_text', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        type: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "签运类型（大吉、中吉、小吉、末吉、凶）"
        },
        text: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "文案"
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否删除（0-未删除，1-已删除）"
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
    }, {
        sequelize,
        tableName: 'lottery_text',
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
    sequelizePaginate.paginate(LotteryText);
    return LotteryText;
};
