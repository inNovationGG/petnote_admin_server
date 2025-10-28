module.exports = function (sequelize, DataTypes) {
    return sequelize.define('score_log', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        uid: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "用户ID"
        },
        task_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "任务ID"
        },
        goods_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "商品ID"
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "积分收支类型（0-增加，1-减少）"
        },
        child_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "积分收支细分类型（0-消费获取，1-新用户任务获取，2-每日任务获取，3-签到任务获取，4-活动任务获取，5-管理员添加，6-其他方式获取，7-兑换商品扣减，8-积分到期扣减，9-管理员扣减，10-其他方式扣减）"
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "积分变化数量"
        },
        create_by: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "创建人ID"
        },
        created: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "创建日期"
        },
        created_at: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "创建日期"
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
        tableName: 'score_log',
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
                name: "idx_uid",
                using: "BTREE",
                fields: [
                    { name: "uid" },
                ]
            },
            {
                name: "idx_task_id",
                using: "BTREE",
                fields: [
                    { name: "task_id" },
                ]
            },
            {
                name: "idx_goods_id",
                using: "BTREE",
                fields: [
                    { name: "goods_id" },
                ]
            },
            {
                name: "idx_type",
                using: "BTREE",
                fields: [
                    { name: "type" },
                    { name: "child_type" },
                ]
            },
            {
                name: "idx_created",
                using: "BTREE",
                fields: [
                    { name: "created" },
                ]
            },
        ]
    });
};
