module.exports = function (sequelize, DataTypes) {
    return sequelize.define('note_num_everyday', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: "自增主键"
        },
        created_ymd: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: "create年月日"
        },
        note_num: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: "YYYYMMDD当天创建的记录数量"
        },
        user_num: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: "YYYYMMDD当天创建记录的用户数量，去重"
        },
        user_all_num: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: "YYYYMMDD当天之前创建记录的用户数量，去重"
        }
    }, {
        sequelize,
        tableName: 'note_num_everyday',
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
                name: "idx_ymd",
                using: "BTREE",
                fields: [
                    { name: "created_ymd" },
                ]
            }
        ]
    });
};
