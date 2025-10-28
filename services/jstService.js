const axios = require("axios");
const crypto = require("crypto");
const dayjs = require("dayjs");

const APP_KEY = "6541f48cc92642c99b2b85e5b8977f08";
const APP_SECRET = "5ee3d39be7f14e2da4d1d0dbe8e08b66";
const BASE_URL = "https://openapi.jushuitan.com";

axios.interceptors.request.use((request) => {
  request.headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
  return request;
});

// 获取 access_token
const tokenCache = {};
async function getAccessToken() {
  const key = dayjs().format("YYYY-MM-DD");
  if (tokenCache[key]) {
    return tokenCache[key];
  }
  const params = {
    app_key: APP_KEY, //	string	开发者应用 Key	0ecde8631431a5ed6b3e7368afbabdadss	必填
    timestamp: dayjs().unix(), //	string	当前请求的时间戳【单位是秒】	1577771730	必填
    grant_type: "authorization_code", //	string	固定值：authorization_code	authorization_code	必填
    charset: "utf-8", //	string	交互数据的编码【utf-8】目前只能传 utf-8，不能不传！	utf-8	必填
    code: "kZfcaz", //	string	随机码（随机创建六位字符串）自定义值	4xFIOC	必填
    sign: "", //	string	请求的数字签名，是通过所有请求参数通过摘要生成的，保证请求参数没有被篡改。签名拼装规则参考：https://openweb.jushuitan.com/doc?docId=70	0ecde8631431a5ed6b3e7368afbabdaoas	必填
  };
  params.sign = commonSign(params, APP_SECRET);

  const response = await axios.post(`${BASE_URL}/openWeb/auth/getInitToken`, params);
  const access_token = response?.data?.data?.access_token;
  tokenCache[key] = access_token;
  return access_token;
}

// 签名规则
function commonSign(apiParams, app_secret) {
  /** 通用 md5 签名函数 */
  const shasum = crypto.createHash("md5");
  if (apiParams == null || !(apiParams instanceof Object)) {
    return "";
  }

  /** 获取 apiParms中的key 去除 sign key,并排序 */
  let sortedKeys = Object.keys(apiParams)
    .filter((item) => item !== "sign")
    .sort();
  /** 排序后字符串 */
  let sortedParamStr = "";
  // 拼接字符串参数
  sortedKeys.forEach(function (key) {
    let keyValue = apiParams[key];
    if (keyValue instanceof Object) keyValue = JSON.stringify(keyValue);
    if (key != "sign" && keyValue != null && keyValue != "") {
      sortedParamStr += `${key}${keyValue}`;
    }
  });
  /** 拼接加密字符串 */
  let paraStr = app_secret + sortedParamStr;

  // https://openweb.jushuitan.com/doc?docId=140&name=API%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7
  console.info(`待加密字符串,可与官网测试工具对比：`, paraStr);

  shasum.update(paraStr);
  let sign = (apiParams.sign = shasum.digest("hex"));
  return sign;
}

// 公共参数
async function commonParams(data) {
  const access_token = await getAccessToken();
  const params = {
    app_key: APP_KEY, //	String 是 POP分配给应用的app_key
    access_token: access_token, // String 是 通过code获取的access_token
    timestamp: dayjs().unix(), //	Long 是 UNIX时间戳，单位秒，需要与聚水潭服务器时间差值在10分钟内
    charset: "utf-8", //	String 是 字符编码（固定值：utf-8）
    version: "2", //	String 是 版本号，固定传2
    sign: "", //	String 是 数字签名
    biz: JSON.stringify(data),
  };
  params.sign = commonSign(params, APP_SECRET);
  return params;
}

// 仓储列表
async function wmsPartnerList(data) {
  const params = await commonParams(data);
  const response = await axios.post(`${BASE_URL}/open/wms/partner/query`, params);
  return response.data.data || {};
}

// 商品库存查询
async function getInventoryInfo(data) {
  const params = await commonParams(data);
  const response = await axios.post(`${BASE_URL}/open/inventory/query`, params);
  return response.data.data || {};
}

// 普通商品资料查询（按sku查询）
async function getSkuInfo(data) {
  const params = await commonParams(data);
  const response = await axios.post(`${BASE_URL}/open/sku/query`, params);
  console.log("普通商品资料查询（按sku查询）response.data: ", response.data);
  return response.data.data || {};
}

// 订单查询
async function getOrdersInfo(data) {
  const params = await commonParams(data);
  const response = await axios.post(`${BASE_URL}/open/orders/single/query`, params);
  console.log("params: ", params);
  console.log("response: ", response.data.data);
}

// 销售出库查询 /open/orders/out/simple/query
async function getOrdersOut(data) {
  const params = await commonParams(data);
  const response = await axios.post(`${BASE_URL}/open/orders/out/simple/query`, params);
  console.log("params: ", params);
  console.log("getOrdersOut response: ", response.data.data.datas[0]);
}

// 获取 sku 库存
async function getInventoryInfoBySkuId(skuId) {
  const { page_count } = await wmsPartnerList({ page_index: 1, page_size: 1 });
  const { datas } = await await wmsPartnerList({ page_index: 1, page_size: page_count });

  let sum = 0;
  const res = [];

  for (let i = 0; i < datas.length; i++) {
    const data = datas[i];
    const { inventorys = [] } = await getInventoryInfo({
      wms_co_id: data.wms_co_id,
      age_index: 1,
      page_size: 100,
      sku_ids: skuId.join(","),
    });
    const qty = inventorys?.[0]?.qty || 0;
    sum += qty;
    if (qty > 0) {
      res.push(data);
    }
  }

  return sum;
}

module.exports = {
  getAccessToken,
  getSkuInfo,
  getInventoryInfo,
  wmsPartnerList,
  getOrdersInfo,
  getOrdersOut,
};
