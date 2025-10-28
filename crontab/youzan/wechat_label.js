const schedule = require('node-schedule');
const {
    sequelize_customers,
    CityStore
} = require("../../models");
const {
    wechat_labels: WechatLabels
} = require("../../models").customersModels;
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");

async function syncYouzanOrderLabels() {
    console.log('Begin Run Schedule Job syncYouzanOrderLabels');
    try {
        const startTime = moment().subtract(7, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
        const nowTime = moment().format("YYYY-MM-DD HH:mm:ss");
        let storeInfoMap = new Map();
        let storeInfo = await CityStore.findAll({
            attributes: ['store_id', 'store_name']
        });
        if (storeInfo && storeInfo.length) {
            for (const item of storeInfo) {
                storeInfoMap.set(item.store_id, item.store_name);
            }
        }
        let delivery_city_sql = `
            SELECT 
                DISTINCT delivery_city 
            FROM 
                youzan_orders 
            WHERE 
                order_creation_time BETWEEN '${startTime}' AND '${nowTime}' 
                AND 
                delivery_city IS NOT NULL AND delivery_city != ''
        `;
        let store_id_sql = `
            SELECT 
                DISTINCT store_id 
            FROM 
                youzan_orders 
            WHERE 
                order_creation_time BETWEEN '${startTime}' AND '${nowTime}' 
                AND 
                store_id IS NOT NULL AND store_id != ''
        `;
        let brand_sql = `
            SELECT 
                DISTINCT brand 
            FROM 
                youzan_orders 
            WHERE 
                order_creation_time BETWEEN '${startTime}' AND '${nowTime}' 
                AND 
                brand IS NOT NULL AND brand != ''
        `;
        let s_cate_sql = `
            SELECT 
                DISTINCT s_cate_id, s_cate_name 
            FROM 
                youzan_orders 
            WHERE 
                order_creation_time BETWEEN '${startTime}' AND '${nowTime}' 
                AND 
                s_cate_id IS NOT NULL AND s_cate_id != ''
        `;
        let goods_id_sql = `
            SELECT 
                DISTINCT goods_id  
            FROM 
                youzan_orders 
            WHERE 
                order_creation_time BETWEEN '${startTime}' AND '${nowTime}' 
                AND 
                goods_id IS NOT NULL AND goods_id != ''
        `;
        let [cityResults, storeResults, brandResults, sCateResults, goodsIdResults] = await Promise.all([
            sequelize_customers.query(delivery_city_sql, { type: QueryTypes.SELECT }),
            sequelize_customers.query(store_id_sql, { type: QueryTypes.SELECT }),
            sequelize_customers.query(brand_sql, { type: QueryTypes.SELECT }),
            sequelize_customers.query(s_cate_sql, { type: QueryTypes.SELECT }),
            sequelize_customers.query(goods_id_sql, { type: QueryTypes.SELECT }),
        ]);
        if (cityResults && cityResults.length) {
            for (const city of cityResults) {
                await WechatLabels.findOrCreate({
                    where: { name: city.delivery_city, type: 0 },
                    defaults: {
                        bind_id: '',
                        name: city.delivery_city,
                        type: 0,
                        created_at: nowTime,
                        updated_at: nowTime
                    },
                });
            }
        }
        if (storeResults && storeResults.length) {
            for (const store of storeResults) {
                await WechatLabels.findOrCreate({
                    where: { bind_id: store.store_id, type: 1 },
                    defaults: {
                        bind_id: store.store_id,
                        name: storeInfoMap?.get(store.store_id) ?? '',
                        type: 1,
                        created_at: nowTime,
                        updated_at: nowTime
                    },
                });
            }
        }
        if (brandResults && brandResults.length) {
            for (const brand of brandResults) {
                await WechatLabels.findOrCreate({
                    where: { name: brand.brand, type: 3 },
                    defaults: {
                        bind_id: '',
                        name: brand.brand,
                        type: 3,
                        created_at: nowTime,
                        updated_at: nowTime
                    },
                });
            }
        }
        if (sCateResults && sCateResults.length) {
            for (const sCate of sCateResults) {
                await WechatLabels.findOrCreate({
                    where: { bind_id: sCate.s_cate_id, type: 2 },
                    defaults: {
                        bind_id: sCate.s_cate_id,
                        name: sCate.s_cate_name,
                        type: 2,
                        created_at: nowTime,
                        updated_at: nowTime
                    },
                });
            }
        }
        if (goodsIdResults && goodsIdResults.length) {
            for (const goods of goodsIdResults) {
                await WechatLabels.findOrCreate({
                    where: { bind_id: goods.goods_id, type: 4 },
                    defaults: {
                        bind_id: goods.goods_id,
                        name: '',
                        type: 4,
                        created_at: nowTime,
                        updated_at: nowTime
                    },
                });
            }
        }
    } catch (error) {
        console.log('syncYouzanOrderLabels Error ===>>>', error);
    }
    console.log('End Run Schedule Job syncYouzanOrderLabels');
}

// module.exports = () => {
//     //每天5点执行
//     const time = "0 5 * * *";
//     schedule.scheduleJob(time, function () {
//         syncYouzanOrderLabels();
//     });
// }

module.exports = () => {
    syncYouzanOrderLabels();
}
