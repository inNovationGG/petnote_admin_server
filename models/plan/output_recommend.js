module.exports = function (sequelize, DataTypes) {
  return sequelize.define('output_recommend', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    output_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    goods_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    type_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "1-尿便2-饮食"
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
      comment: "推荐理由"
    }
  }, {
    sequelize,
    tableName: 'output_recommend',
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
        name: "idx_outputid",
        using: "BTREE",
        fields: [
          { name: "output_id" },
        ]
      },
    ]
  });
};
