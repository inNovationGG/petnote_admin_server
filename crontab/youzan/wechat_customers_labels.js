const schedule = require('node-schedule');
const {
    sequelize_customers
} = require("../../models");
const {
    youzan_orders: YouzanOrders,
    wechat_labels: WechatLabels,
    wechat_customers_labels: WechatCustomersLabels
} = require("../../models").customersModels;
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");

async function syncWechatCustomersLabels2() {
    console.log('Begin Run Schedule Job syncWechatCustomersLabels');
    try {
        const { default: pLimit } = await import("p-limit");
        const limit = pLimit(20);
        const dateArr = [
            ['2023-11-01 00:00:00', '2023-11-30 23:59:59'],
            ['2023-12-01 00:00:00', '2023-12-31 23:59:59'],
            ['2024-01-01 00:00:00', '2024-01-31 23:59:59'],
            ['2024-02-01 00:00:00', '2024-02-29 23:59:59'],
            ['2024-03-01 00:00:00', '2024-03-31 23:59:59'],
            ['2024-04-01 00:00:00', '2024-04-30 23:59:59'],
            ['2024-05-01 00:00:00', '2024-05-31 23:59:59'],
            ['2024-06-01 00:00:00', '2024-06-30 23:59:59'],
            ['2024-07-01 00:00:00', '2024-07-31 23:59:59'],
            ['2024-08-01 00:00:00', '2024-08-31 23:59:59'],
            ['2024-09-01 00:00:00', '2024-09-30 23:59:59'],
            ['2024-10-01 00:00:00', '2024-10-31 23:59:59'],
            ['2024-11-01 12:00:00', '2024-11-30 11:59:59'],
        ];
        for (let i = 0; i < dateArr.length; i++) {
            const startTime = dateArr[i][0];
            const endTime = dateArr[i][1];
            // 批量查询订单
            let orders = await YouzanOrders.findAll({
                where: {
                    order_creation_time: { [Op.between]: [startTime, endTime] },
                    user_ids: {
                        [Op.ne]: '',
                        [Op.not]: null
                    }
                },
                attributes: ['id', 'delivery_city', 'store_id', 'goods_id', 'brand', 's_cate_id', 'user_ids'],
            });
            if (!orders.length) {
                return;
            }
            // 准备批量更新的数据
            const updatePromises = orders.map((order) =>
                limit(async () => {
                    const { id, delivery_city, store_id, goods_id, brand, s_cate_id, user_ids } = order;
                    let userIds = user_ids.split(',').map(Number);
                    let labelIds = [];
                    // 查找wechat_labels表
                    const labelIdsResults = await WechatLabels.findAll({
                        where: {
                            [Op.or]: [
                                { name: delivery_city, type: 0 },
                                { bind_id: store_id, type: 1 },
                                { bind_id: s_cate_id, type: 2 },
                                { name: brand, type: 3 },
                                { bind_id: goods_id, type: 4 },
                            ]
                        },
                        attributes: ['id']
                    });
                    if (labelIdsResults && labelIdsResults.length) {
                        labelIds = labelIdsResults.map(v => Number(v.id));
                    }
                    let dataList = [];
                    if (labelIds.length && userIds.length) {
                        for (const user of userIds) {
                            for (const label of labelIds) {
                                dataList.push({
                                    customer_id: user,
                                    label_id: label,
                                    order_id: id
                                });
                            }
                        }
                    }
                    if (dataList.length) {
                        await WechatCustomersLabels.bulkCreate(dataList);
                    }
                })
            );
            await Promise.all(updatePromises);
        }
    } catch (error) {
        console.log('syncWechatCustomersLabels Error ===>>>', error);
    }
    console.log('End Run Schedule Job syncWechatCustomersLabels');
}

async function syncWechatCustomersLabels() {
    console.log('Begin Run Schedule Job syncWechatCustomersLabels');
    try {
        // const startTime = moment().subtract(2, 'months').startOf('day').format("YYYY-MM-DD HH:mm:ss");
        // const endTime = moment().subtract(1, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
        const startTime = '2024-07-01 00:00:00';
        const endTime = '2024-11-14 23:59:59';
        const { default: pLimit } = await import("p-limit");
        const limit = pLimit(20);
        // 批量查询订单
        let orders = await YouzanOrders.findAll({
            where: {
                order_creation_time: { [Op.between]: [startTime, endTime] },
                user_ids: {
                    [Op.ne]: '',
                    [Op.not]: null
                }
            },
            attributes: ['id', 'delivery_city', 'store_id', 'goods_id', 'brand', 's_cate_id', 'user_ids'],
        });
        if (!orders.length) {
            return;
        }
        // 删除最近两个月的用户-标签数据（因为用户昵称可能改变，导致user_ids字段发生变化，旧的用户-标签变得不可信任）
        await WechatCustomersLabels.destroy({
            where: {
                order_id: { [Op.in]: orders.map(v => v.id) },
            },
        });
        // 准备批量更新的数据
        const updatePromises = orders.map((order) =>
            limit(async () => {
                const { id, delivery_city, store_id, goods_id, brand, s_cate_id, user_ids } = order;
                let userIds = user_ids.split(',').map(Number);
                let labelIds = [];
                // 查找wechat_labels表
                const labelIdsResults = await WechatLabels.findAll({
                    where: {
                        [Op.or]: [
                            { name: delivery_city, type: 0 },
                            { bind_id: store_id, type: 1 },
                            { bind_id: s_cate_id, type: 2 },
                            { name: brand, type: 3 },
                            { bind_id: goods_id, type: 4 },
                        ]
                    },
                    attributes: ['id']
                });
                if (labelIdsResults && labelIdsResults.length) {
                    labelIds = labelIdsResults.map(v => Number(v.id));
                }
                let dataList = [];
                if (labelIds.length && userIds.length) {
                    for (const user of userIds) {
                        for (const label of labelIds) {
                            dataList.push({
                                customer_id: user,
                                label_id: label,
                                order_id: id
                            });
                        }
                    }
                }
                if (dataList.length) {
                    await WechatCustomersLabels.bulkCreate(dataList);
                }
            })
        );
        await Promise.all(updatePromises);
    } catch (error) {
        console.log('syncWechatCustomersLabels Error ===>>>', error);
    }
    console.log('End Run Schedule Job syncWechatCustomersLabels');
}

// module.exports = () => {
//     //每天7点执行
//     const time = "0 7 * * *";
//     schedule.scheduleJob(time, function () {
//         syncWechatCustomersLabels();
//     });
// }

module.exports = () => {
    syncWechatCustomersLabels();
}
