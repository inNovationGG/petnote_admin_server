module.exports = function (sequelize, DataTypes) {
    return sequelize.define('goods_cate', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            comment: "主键ID"
        },
        f_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "一级品类id"
        },
        f_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "一级品类名称"
        },
        s_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "二级品类id"
        },
        s_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "二级品类名称"
        },
        t_cate_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "三级品类id"
        },
        t_cate_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "三级品类名称"
        },
        created: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "日期"
        }
    }, {
        sequelize,
        tableName: 'goods_cate',
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
                name: "idx_cate",
                using: "BTREE",
                fields: [
                    { name: "f_cate_id" },
                    { name: "s_cate_id" },
                    { name: "t_cate_id" },
                ]
            },
        ]
    });
};
