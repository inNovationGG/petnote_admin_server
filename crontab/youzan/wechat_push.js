const schedule = require('node-schedule');
const {
    sequelize_customers
} = require("../../models");
const {
    customers: Customers,
    youzan_orders: YouzanOrders,
    wechat_labels: WechatLabels,
    wechat_customers_labels: WechatCustomersLabels,
    wechat_push_results: WechatPushResults
} = require("../../models").customersModels;
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");
const { getAttachments, wechatPush } = require("../../services/wechatWorkService");
const MAX_BATCH_SIZE = 10000;

async function createWechatPush() {
    console.log('Begin Run Schedule Job createWechatPush');
    try {
        const now = moment().format("YYYY-MM-DD HH:mm:ss");
        const nowDate = moment().format("YYYY-MM-DD");
        let dayOfWeek = moment().day();
        dayOfWeek = dayOfWeek == 0 ? 7 : dayOfWeek;
        const nowTime = moment().format('HH:mm');
        const sixtyMinutesLater = moment().add(60, 'minutes').format('HH:mm');
        console.log('createWechatPush time ===>>>', nowDate, dayOfWeek, nowTime, sixtyMinutesLater);
        let wechat_push_sql = `
            SELECT 
                a.*, b.week_day, b.push_time 
            FROM 
                wechat_push a 
            LEFT JOIN 
                wechat_push_time b 
            ON 
                a.name = b.name 
            WHERE 
                a.status = 0 AND a.is_deleted = 0 AND a.start_date <= '${nowDate}' AND a.end_date >= '${nowDate}'
                AND b.week_day = ${dayOfWeek} AND b.push_time > '00:00' AND b.push_time <= '23:59' 
            ORDER BY 
                b.push_time ASC
        `;
        const wechatPushResults = await sequelize_customers.query(wechat_push_sql, {
            type: QueryTypes.SELECT
        });
        console.log('wechatPushResults ===>>>', wechatPushResults);
        if (!wechatPushResults || !wechatPushResults.length) {
            return;
        }
        for (const item of wechatPushResults) {
            //查询指定范围内的订单
            let externalUserIds = await getExternalUserIds(item);
            console.log(`externalUserIds ===>>>${item?.name ?? ''}`, externalUserIds);
            console.log(`externalUserIds.length ===>>>${item?.name ?? ''}`, externalUserIds.length);
            if (!externalUserIds.length) {
                continue;
            }
            let pages = Math.ceil(externalUserIds.length / MAX_BATCH_SIZE);
            for (let i = 1; i <= pages; i++) {
                let skip = (i - 1) * MAX_BATCH_SIZE;
                let externalUserIdsPageData = externalUserIds.slice(skip, skip + MAX_BATCH_SIZE);
                if (!externalUserIdsPageData.length) {
                    continue;
                }
                const attachParam = {
                    img: item.img,
                    mini_program_title: item.mini_program_title,
                    mini_program_img: item.mini_program_img,
                    mini_program_url: item.mini_program_url
                };
                const attachments = await getAttachments(attachParam);
                const wechatPushParam = {
                    external_userid: externalUserIdsPageData,
                    content: item.content,
                    attachments: attachments
                };
                const pushRes = await wechatPush(wechatPushParam);
                if (pushRes.data) {
                    const pushResult = {
                        ...wechatPushParam,
                        add: pushRes.data
                    }
                    await WechatPushResults.create({ name: item.name, result: pushResult, created_at: now });
                }
            }
        }
    } catch (error) {
        console.log('createWechatPush Error ===>>>', error);
    }
    console.log('End Run Schedule Job createWechatPush');
}

//获取企微客户uid
async function getExternalUserIds(order) {
    try {
        const lastOrderDay = Number(order?.last_order_day || 1);
        const lastOrderDayLimit = Number(order?.last_order_day_limit || 1);
        const orderStartTime = moment().subtract(lastOrderDayLimit, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
        const orderEndTime = moment().subtract(lastOrderDay, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
        console.log('orderStartTime ===>>>', orderStartTime);
        console.log('orderEndTime ===>>>', orderEndTime);
        let orders = await YouzanOrders.findAll({
            where: {
                order_creation_time: { [Op.between]: [orderStartTime, orderEndTime] },
            },
            attributes: ['id', 'user_ids'],
        });
        if (!orders.length) {
            return [];
        }
        let orderIds = [];
        let userIds = [];
        for (let i = 0; i < orders.length; i++) {
            let { id, user_ids } = orders[i];
            orderIds.push(id);
            if (user_ids) {
                let userIdArr = user_ids.split(",");
                userIds = userIds.concat(userIdArr);
            }
        }
        const uniqueUids = [...new Set(userIds)];
        let labelCondition = [];
        if (order.city_labels) {
            labelCondition.push({ type: 0, name: { [Op.in]: order.city_labels.split(",") } });
        }
        if (order.store_labels) {
            labelCondition.push({ type: 1, bind_id: { [Op.in]: order.store_labels.split(",") } });
        }
        if (order.cate_labels) {
            labelCondition.push({ type: 2, bind_id: { [Op.in]: order.cate_labels.split(",") } });
        }
        if (order.brand_labels) {
            labelCondition.push({ type: 3, name: { [Op.in]: order.brand_labels.split(",") } });
        }
        if (order.sku_labels) {
            labelCondition.push({ type: 4, bind_id: { [Op.in]: order.sku_labels.split(",") } });
        }
        let customerIds = [];
        let externalUserIds = [];
        console.log('labelCondition ===>>>', labelCondition);
        if (!labelCondition.length) {
            customerIds = uniqueUids;
        } else {
            //查询标签id
            let labels = await WechatLabels.findAll({
                where: {
                    [Op.or]: labelCondition
                },
                attributes: ['id']
            });
            console.log('labels.length ===>>>', labels.length);
            if (!labels.length) {
                //未找到相关标签，说明没有人满足此标签，直接返回空数组
                return [];
            }
            const customerLabels = await WechatCustomersLabels.findAll({
                where: {
                    order_id: { [Op.in]: orderIds },
                    label_id: { [Op.in]: labels.map(v => v.id) },
                    customer_id: { [Op.in]: uniqueUids }
                },
                attributes: ['customer_id'],
            });
            customerIds = customerLabels.map(v => v.customer_id);
            customerIds = [...new Set(customerIds)];
        }
        console.log('customerIds.length ===>>>', customerIds.length);
        const customers = await Customers.findAll({
            where: {
                id: {
                    [Op.in]: customerIds,
                },
            },
            attributes: ["external_userid"],
        });
        externalUserIds = customers.map(({ external_userid }) => external_userid);
        return externalUserIds;
    } catch (error) {
        console.log('getExternalUserIds error ===>>>', error);
    }
}

// module.exports = () => {
//     //每小时执行一次
//     const time = "0 * * * *";
//     schedule.scheduleJob(time, function () {
//         createWechatPush();
//     });
// }

module.exports = () => {
    createWechatPush();
}
