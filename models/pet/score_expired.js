module.exports = function (sequelize, DataTypes) {
    const ScoreExpired = sequelize.define('score_expired', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        score_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "积分id"
        },
        uid: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "用户id"
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "积分数"
        },
        in_time: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "积分获取年月（202401）"
        },
        out_time: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "积分到期年月（202501）"
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "修改原因（管理员后台可以调整积分，必填修改原因）"
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
        created_y: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "创建日期年"
        },
        created_ym: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "创建日期年月"
        },
        created_ymd: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "创建日期年月日"
        },
    }, {
        sequelize,
        tableName: 'score_expired',
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
                name: "idx_score_id",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "score_id" },
                ]
            },
            {
                name: "idx_uid",
                using: "BTREE",
                fields: [
                    { name: "uid" },
                ]
            },
            {
                name: "idx_in_time",
                using: "BTREE",
                fields: [
                    { name: "in_time" },
                ]
            },
            {
                name: "idx_out_time",
                using: "BTREE",
                fields: [
                    { name: "out_time" },
                ]
            },
        ]
    });
    return ScoreExpired;
};
