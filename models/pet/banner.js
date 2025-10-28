const sequelizePaginate = require('sequelize-paginate');
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('banner', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "Banner"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "标题"
    },
    pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "图片链接地址"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "描述"
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: "类型：1-Banner 2-弹窗 3-开屏 "
    },
    tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "标记位置：BANNER_INDEX-首页Banner SCREEN_INDEX-开屏首页 POP_INDEX-弹窗首页"
    },
    url_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "链接类型：1-小程序链接 2-公众号链接 3-H5链接 4-其它小程序链接"
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "链接"
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: "序号"
    },
    time_type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: "时间类型：1-不设时间2-有时间"
    },
    start_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "开始时间"
    },
    end_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "结束时间"
    },
    data_tracking: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "数据埋点"
    },
    status: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: "状态：1-上架 2-下架"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-未删除1-已删除"
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      comment: "创建人"
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "更新人"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue("created_at")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue("updated_at")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      },
    }
  }, {
    sequelize,
    tableName: 'banner',
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
  sequelizePaginate.paginate(Banner);
  return Banner;
};
