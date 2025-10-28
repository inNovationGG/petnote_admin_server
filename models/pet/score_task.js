module.exports = function (sequelize, DataTypes) {
    return sequelize.define('score_task', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            comment: "自增主键"
        },
        task_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "任务ID"
        },
        task_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "任务分类，0-消费送积分，1-新用户任务，2-每日任务，3-连续签到任务，4-其他任务"
        },
        is_time_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "任务是否有有效期（0-否，1-是）"
        },
        begin_time: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "任务有效期开始时间"
        },
        end_time: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: "任务有效期结束时间"
        },
        task_key: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "任务的key"
        },
        task_description: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "任务描述"
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "是否删除（0-未删除，1-已删除）"
        },
        sort: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "展示顺序"
        },
        config_data: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: "任务的详细配置信息"
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
        tableName: 'score_task',
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
                name: "idx_task_id",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "task_id" },
                ]
            },
            {
                name: "idx_task_key",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "task_key" },
                ]
            },
        ]
    });
};
