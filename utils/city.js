const cities = ["上海", "北京", "广州", "深圳", "杭州", "成都", "天津", "苏州", "重庆", "南京", "武汉"];
const provinces = {
  上海: "上海市",
  北京: "北京市",
  广州: "广东省",
  深圳: "广东省",
  杭州: "浙江省",
  成都: "四川省",
  天津: "天津市",
  苏州: "江苏省",
  重庆: "重庆市",
  南京: "江苏省",
  武汉: "湖北省",
};

function extractProvinceCity(warehouse) {
  const city = cities.find((c) => warehouse.name.includes(c));
  const province = city ? provinces[city] : "";

  return {
    ...warehouse,
    city: city || "未知城市",
    province: province || "未知省份",
  };
}

module.exports = {
  extractProvinceCity,
};
