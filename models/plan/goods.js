const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('goods', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "分类1-商品,2-自制,3-用品"
    },
    brand_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "品牌id"
    },
    cate_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "品类id (自制下面99-自制生100-自制熟) 用品下面(301-尿便 302-玩具 303-养护 )"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "商品名称"
    },
    pic: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "商品图片"
    },
    source: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "来源1-国产,2-进口"
    },
    c_dbz: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "粗蛋白质"
    },
    c_zf: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "粗脂肪"
    },
    c_hf: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "粗灰分"
    },
    c_xw: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "粗纤维"
    },
    c_sf: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "粗水分"
    },
    sf: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "水分"
    },
    gai: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "钙"
    },
    lin: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "总磷"
    },
    srxyhw: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "水溶性氯化物"
    },
    nhs: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "牛磺酸"
    },
    kll: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "卡路里"
    },
    spec: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "规格"
    },
    qgp: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "保质期"
    },
    stuff: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: "",
      comment: "原料"
    },
    additive: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: "",
      comment: "添加剂"
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
      comment: "0-未删除1-已删除"
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
    tableName: 'goods',
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
