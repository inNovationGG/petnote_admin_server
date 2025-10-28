module.exports = function (sequelize, DataTypes) {
  return sequelize.define('output_article', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    output_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "output:id"
    },
    article_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "article:id"
    }
  }, {
    sequelize,
    tableName: 'output_article',
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
