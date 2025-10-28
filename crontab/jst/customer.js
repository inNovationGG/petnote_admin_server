const {
    sequelize_customers,
} = require("../../models");
const {
    wechat_push_results: WechatPushResults
} = require("../../models").customersModels;
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");

// 昨天精准推送的用户，要看下他们的下单情况，我需要的数据是，昨天筛选了多少人，推送了多少人，在这些人中产生了多少订单，订单的商品是什么
async function getResult() {
    const startDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
    const endDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
    const startTime = moment().subtract(1, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
    const endTime = moment().subtract(1, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
    let wechatPushResults = await WechatPushResults.findAll({
        where: {
            created_at: { [Op.between]: [startTime, endTime] }
        },
        attributes: ['result'],
    });
    let data = [];
    if (!wechatPushResults.length) {
        return;
    }
    data = wechatPushResults.map(item => item.result);
    let pushList = []; //推送的成员id
    let failList = []; //推送失败的成员id
    for (let i = 0; i < data.length; i++) {
        if (!data[i].external_userid.length) {
            continue;
        }
        pushList = pushList.concat(data[i].external_userid);
        if (data[i].add.fail_list.length) {
            failList = failList.concat(data[i].add.fail_list);
        }
    }
    const uniquePushList = [...new Set(pushList)];
    const uniqueFailList = [...new Set(failList)];
    const successList = uniquePushList.filter(item => uniqueFailList.indexOf(item) === -1);
    let ids = successList.map((item) => `'${item}'`).join(",") || null;
    let goodsInfo_sql = `
        SELECT 
            DISTINCT brand, title 
        FROM 
            youzan_orders 
        WHERE 
            order_creation_time BETWEEN '${startDate} 17:00:00' AND '${endDate} 23:59:59'  
            AND 
            fans_nickname IN (SELECT DISTINCT name FROM customers WHERE external_userid IN (${ids}))
    `;
    const goodsInfo = await sequelize_customers.query(goodsInfo_sql, {
        type: QueryTypes.SELECT
    });
    let orderCount_sql = `
        SELECT 
            COUNT(DISTINCT order_number) AS '订单数' 
        FROM 
            youzan_orders 
        WHERE 
            order_creation_time BETWEEN '${startDate} 17:00:00' AND '${endDate} 23:59:59' 
            AND 
            fans_nickname IN (SELECT DISTINCT name FROM customers WHERE external_userid IN (${ids}))
    `;
    const orderCount = await sequelize_customers.query(orderCount_sql, {
        type: QueryTypes.SELECT
    });
    return {
        success: true,
        data: {
            '推送人数': uniquePushList.length,
            '推送失败人数': uniqueFailList.length,
            '推送成功人数': successList.length,
            '购买商品信息': goodsInfo,
            '产生订单数': orderCount
        }
    }
}

module.exports = () => {
    getResult();
}
