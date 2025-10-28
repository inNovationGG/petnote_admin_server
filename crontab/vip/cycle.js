const schedule = require('node-schedule');
const {
    ScoreGoods,
    sequelize_pet
} = require("../../models");
const { Op } = require("sequelize");
const moment = require("moment");
const getRedisInstance = require("../../config/redisClient");
const redis = getRedisInstance();
const { getYouzanTicketInfo } = require("../../services/youzanService");

// 会员商品线上循环，补充线上库存
async function updateInventory() {
    console.log('Begin Run Schedule Job Cycle Add Inventory');
    try {
        const dayOfMonth = moment().date(); //当前时间是当月的第几天
        const nowTime = moment().format('HH:mm:ss'); //当前时间时分秒
        const sixtyMinutesLater = moment().add(60, 'minutes').format('HH:mm:ss'); //当前时间60分钟后的时分秒
        const goods = await ScoreGoods.findAll({
            where: {
                [Op.or]: [
                    {
                        cycle_type: 1,
                        cycle_date: {
                            [Op.gte]: nowTime,
                            [Op.lt]: sixtyMinutesLater
                        }
                    },
                    {
                        cycle_type: 2,
                        cycle_day: dayOfMonth,
                        cycle_date: {
                            [Op.gte]: nowTime,
                            [Op.lt]: sixtyMinutesLater
                        }
                    }
                ]
            },
            attributes: ['goods_id', 'real_goods_id', 'online_inventory', 'cycle_action_effect_value']
        });
        if (!goods || !goods.length) {
            return;
        }
        for (const item of goods) {
            let totalInventory = await redis.hGet(`vip_goods:${item.real_goods_id}`, "qty");
            if (totalInventory === null) {
                const result = await getYouzanTicketInfo(item.real_goods_id);
                if (!result.success) {
                    continue; // 异常的优惠券不执行补库存逻辑
                }
                const { status, qty } = result.data;
                await redis.hSet(`vip_goods:${item.real_goods_id}`, "status", status);
                await redis.hSet(`vip_goods:${item.real_goods_id}`, "qty", qty);
                totalInventory = qty;
            }
            let addInventory = item.cycle_action_effect_value || 0;
            if (item.online_inventory >= totalInventory) {
                continue;
            }
            if (item.online_inventory + addInventory >= totalInventory) {
                addInventory = totalInventory - item.online_inventory;
            }
            await ScoreGoods.update(
                {
                    online_inventory: sequelize_pet.literal(`online_inventory + ${addInventory}`)
                },
                {
                    where: {
                        goods_id: item.goods_id
                    }
                }
            );
        }
    } catch (error) {
        console.log('updateInventory Error ===>>>', error);
    }
    console.log('End Run Schedule Job Cycle Add Inventory');
}

module.exports = () => {
    // 每小时执行一次
    const time = "0 * * * *";
    schedule.scheduleJob(time, function () {
        console.log('ScheduleJob Cycle Add Inventory Executing!!!');
        updateInventory();
    });
}
