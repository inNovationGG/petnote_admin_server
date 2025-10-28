module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    uid: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "主键-自增"
    },
    seed: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "uid编码可用于邀请码"
    },
    open_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "微信open_id",
      unique: "udx_open_id"
    },
    union_id: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "微信union_id",
      unique: "udx_union_id"
    },
    wx_session_key: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "",
      comment: "微信session_key"
    },
    nick_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "微信昵称"
    },
    mini_nick_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "宠本本平台昵称"
    },
    gender: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "性别0-未知1-男2-女"
    },
    birthday: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "用户生日"
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "微信头像图片地址"
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "手机号"
    },
    prePhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "带区号手机号"
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "微信获取城市"
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "微信获取省"
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "微信获取国家"
    },
    is_deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "是否删除"
    },
    last_login_time: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "最后登陆时间"
    },
    last_login_time_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "最后登录ymd"
    },
    p_ch: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
      comment: "用户渠道来源"
    },
    region_first: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "地区一级"
    },
    region_second: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "",
      comment: "地区二级"
    },
    login_ip: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "",
      comment: "ip地址"
    },
    ip_updated: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "ip地址更新时间"
    },
    ip_province: {
      type: DataTypes.STRING(25),
      allowNull: false,
      defaultValue: "",
      comment: "ip省"
    },
    ip_city: {
      type: DataTypes.STRING(25),
      allowNull: false,
      defaultValue: "",
      comment: "ip市"
    },
    ip_area: {
      type: DataTypes.STRING(25),
      allowNull: false,
      defaultValue: "",
      comment: "ip区"
    },
    created_y: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年"
    },
    created_ym: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年月"
    },
    created_ymd: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "create年月日"
    },
    created: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    updated: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "udx_open_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "open_id" },
        ]
      },
      {
        name: "udx_union_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "union_id" },
        ]
      },
      {
        name: "idx_is_deleted",
        using: "BTREE",
        fields: [
          { name: "is_deleted" },
        ]
      },
      {
        name: "idx_phone",
        using: "BTREE",
        fields: [
          { name: "phone" },
        ]
      },
      {
        name: "idx_p_ch",
        using: "BTREE",
        fields: [
          { name: "p_ch" },
        ]
      },
      {
        name: "idx_seed",
        using: "BTREE",
        fields: [
          { name: "seed" },
        ]
      },
    ]
  });
};
