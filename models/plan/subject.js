const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('subject', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "标题"
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "类型1-单选题2-多选题3-填空题"
    },
    type_range: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "",
      comment: "text-文案，int-整数，num-小数点后两位数值"
    },
    type_unit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "",
      comment: "单位"
    },
    type_tips: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "提示文案"
    },
    type_pic: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "填空题图片地址"
    },
    cate_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "题目所属分类1-基本信息,2-饮食情况,3-排泄情况,4-生活习惯,5-健康状况"
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "编号"
    },
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建人"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-正常 1-删除"
    },
    created_ymd: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "创建年月日"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'subject',
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
};
