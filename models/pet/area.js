module.exports = function(sequelize, DataTypes) {
  return sequelize.define('area', {
    areaId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "地区Id"
    },
    areaCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "地区编码"
    },
    areaName: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "地区名"
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: -1,
      comment: "地区级别（1:省份province,2:市city,3:区县district,4:街道street）"
    },
    cityCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "城市编码"
    },
    center: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "城市中心点（即：经纬度坐标）"
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1,
      comment: "地区父节点"
    }
  }, {
    sequelize,
    tableName: 'area',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "areaId" },
        ]
      },
      {
        name: "areaCode",
        using: "BTREE",
        fields: [
          { name: "areaCode" },
        ]
      },
      {
        name: "parentId",
        using: "BTREE",
        fields: [
          { name: "parentId" },
        ]
      },
      {
        name: "level",
        using: "BTREE",
        fields: [
          { name: "level" },
        ]
      },
      {
        name: "areaName",
        using: "BTREE",
        fields: [
          { name: "areaName" },
        ]
      },
    ]
  });
};
