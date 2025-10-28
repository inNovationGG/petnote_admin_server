const {
    sequelize_shop_tk,
    JstStoreSkuCost
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");

//统计昨天的分仓商品含税成本数据，并添加到jst_store_sku_cost表中
async function addJstStoreSkuCostToDatabase() {
    console.log('Begin Run jst_store_sku_cost Schedule Job');
    try {
        const list = [];
        const nowTime = moment().format("YYYY-MM-DD");
        let base_sql = `
            SELECT 
                g.sku_id AS skuId,
                g.name AS skuName,
                w.wms_co_id AS storeId,
                w.city AS city,
                w.name AS storeName,
                SUM(t.total_cost_with_tax) AS totalCost 
            FROM 
                jst_goods_sku g 
            JOIN 
                tax t ON g.sku_id = t.goods_id 
            JOIN 
                jst_warehouses w ON t.store_id = w.wms_co_id 
            GROUP BY 
                g.sku_id, g.name, w.wms_co_id, w.city, w.name 
            ORDER BY 
                w.city, w.wms_co_id, g.sku_id`;
        const result = await sequelize_shop_tk.query(base_sql, {
            type: QueryTypes.SELECT
        });
        if (result && result.length) {
            for (const item of result) {
                const { skuId, skuName, storeId, city, totalCost } = item;
                list.push({
                    sku_id: skuId, //商品编号
                    sku_name: skuName, //商品名称
                    city: city || '', //城市名称
                    store_id: storeId, //分仓ID
                    total_cost: totalCost, //商品成本（含税）
                    created: nowTime //创建时间
                });
            }
            await JstStoreSkuCost.destroy({
                truncate: true
            });
            await JstStoreSkuCost.bulkCreate(list);
        }
    } catch (error) {
        console.log('addDataToDatabase Error ===>>>', error);
    }
    console.log('End Run jst_store_sku_cost Schedule Job');
}

module.exports = {
    addJstStoreSkuCostToDatabase
}
