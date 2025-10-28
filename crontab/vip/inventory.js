const schedule = require('node-schedule');
const {
    ScoreGoods
} = require("../../models");
const getRedisInstance = require("../../config/redisClient");
const redis = getRedisInstance();
const { getYouzanTicketInfo } = require("../../services/youzanService");

// 定时同步有赞商品库存至redis中
async function syncInventory() {
    console.log('Begin Run Schedule Job syncInventory');
    try {
        const goods = await ScoreGoods.findAll({
            where: {
                is_deleted: 0
            },
            attributes: ['real_goods_id']
        });
        if (!goods || !goods.length) {
            return;
        }
        const realGoodsIds = [...new Set(goods.map(item => item.real_goods_id))];
        for (const item of realGoodsIds) {
            const result = await getYouzanTicketInfo(item); // 查询有赞商品库存
            if (!result.success) {
                continue; // 异常的优惠券不执行缓存逻辑
            }
            const { status, qty } = result.data;
            await redis.hSet(`vip_goods:${item}`, "status", status);
            await redis.hSet(`vip_goods:${item}`, "qty", qty);
        }
    } catch (error) {
        console.log('syncInventory Error ===>>>', error);
    }
    console.log('End Run Schedule Job syncInventory');
}

module.exports = () => {
    // 每30分钟执行一次
    const time = "*/30 * * * *";
    schedule.scheduleJob(time, function () {
        console.log('ScheduleJob syncInventory Executing!!!');
        syncInventory();
    });
}
