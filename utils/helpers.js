const moment = require("moment");

// 获取当前时间戳
const getTimestamp = () => Math.floor(Date.now() / 1000);

// 获取 YYYY-MM-DD 格式日期
const getCurrentDate = () => moment().format("YYYY-MM-DD");

// 获取 YYYYMMDD 格式日期
const getCurrentDateYMD = () => moment().format("YYYYMMDD");

module.exports = {
    getTimestamp,
    getCurrentDate,
    getCurrentDateYMD,
};
