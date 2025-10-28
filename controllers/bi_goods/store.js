const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const excelUtils = require("../../utils/excelUtil");
const Decimal = require('decimal.js');

class StoreController {
    // 查询商品分仓库存报表
    async getLists(ctx) {
        try {
            // { //参数
            //     city: "上海",
            //     storeId: "xxxxxxx",
            //     skuId: "yyyyyyy",
            //     skuName: "zzzzz"
            //     page: 1,
            //     pagesize: 10,
            // }
            let { city, storeId, skuId, skuName, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            let newCond = `1 = 1`;
            if (city) {
                newCond += ` AND city = '${city}'`;
            }
            if (storeId) {
                newCond += ` AND store_id = '${storeId}'`;
            }
            if (skuId) {
                newCond += ` AND sku_id = '${skuId}'`;
            }
            if (skuName) {
                newCond += ` AND sku_name LIKE '%${skuName}%'`;
            }
            let base_sql = `
                SELECT 
                    sku_id AS skuId,
                    sku_name AS skuName,
                    city,
                    store_id AS storeId,
                    total_cost AS totalCost 
                FROM 
                    jst_store_sku_cost 
                WHERE 
                    ${newCond}`;
            // 分页查询
            let paginate_sql = `${base_sql} LIMIT ${skip}, ${currentPagesize}`;
            const result = await sequelize_shop_tk.query(paginate_sql, {
                type: QueryTypes.SELECT
            });
            if (!result || !result.length) {
                return ctx.body = {
                    success: true,
                    data: {
                        listData: [],
                        totalData: {
                            totalInventory: 0, //商品总库存
                            cityHasInventoryNum: 0, //有库存城市数
                            storeHasInventoryNum: 0, //有库存分仓数
                        },
                        ...formatPagination({ total: 0, page: currentPage, limit: currentPagesize, pages: 0 })
                    }
                }
            }
            // 查总数据量
            let total_sql = `SELECT COUNT(*) AS ct FROM (${base_sql}) AS a`;
            const totalNum = await sequelize_shop_tk.query(total_sql, {
                type: QueryTypes.SELECT
            });
            const total = totalNum?.[0]?.ct ?? 0;
            const pages = Math.ceil(total / currentPagesize);
            // 查询分仓名字和城市
            const city_sql = `SELECT wms_co_id AS storeId, city, name FROM jst_warehouses`;
            const storeList = await sequelize_shop_tk.query(city_sql, {
                type: QueryTypes.SELECT
            });
            const storeInfoMap = new Map(); //key: storeId, value: { city, name }
            if (storeList && storeList.length) {
                for (const item of storeList) {
                    const { storeId, city, name } = item;
                    const key = storeId + '';
                    storeInfoMap.set(key, { city, name });
                }
            }
            // 查询各个商品的库存（区分分仓）
            const skuIds = result.map(v => `'${v.skuId}'`).join(',');
            let inventory_cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                inventory_cond = ` wms_co_id IN (${sql})`;
            }
            if (storeId) {
                inventory_cond = ` wms_co_id = '${storeId}'`;
            }
            const inventory_sql = `
                SELECT 
                    sku_id AS skuId, wms_co_id AS storeId, SUM(qty) AS inventory 
                FROM 
                    jst_inventory 
                WHERE 
                    ${inventory_cond} AND sku_id IN (${skuIds}) 
                GROUP BY 
                    sku_id, wms_co_id`;
            const inventoryResult = await sequelize_shop_tk.query(inventory_sql, {
                type: QueryTypes.SELECT
            });
            const inventoryMap = new Map(); //key: storeId:skuId, value: inventory
            if (inventoryResult && inventoryResult.length) {
                for (const item of inventoryResult) {
                    const { skuId, storeId, inventory } = item;
                    inventoryMap.set(`${skuId}:${storeId}`, Number(inventory));
                }
            }
            let skuTotalInventory = 0; //商品总库存
            let cityHasInventoryNum = 0; //有库存城市数
            let storeHasInventoryNum = 0; //有库存分仓数
            const totalInventory_sql = `
                SELECT 
                    wms_co_id AS storeId, SUM(qty) AS totalInventory 
                FROM 
                    jst_inventory 
                WHERE 
                    ${inventory_cond} 
                    AND 
                    sku_id IN (
                        SELECT 
                            DISTINCT sku_id AS skuId 
                        FROM 
                            jst_store_sku_cost 
                        WHERE 
                            ${newCond}
                    ) 
                GROUP BY 
                    wms_co_id`;
            const totalInventoryResult = await sequelize_shop_tk.query(totalInventory_sql, {
                type: QueryTypes.SELECT
            });
            if (totalInventoryResult && totalInventoryResult.length) {
                const citys = []; //存储有库存的城市名
                for (const item of totalInventoryResult) {
                    const { storeId, totalInventory } = item;
                    const key = storeId + '';
                    const totalInventoryNum = Number(totalInventory);
                    skuTotalInventory += totalInventoryNum;
                    const city = storeInfoMap.get(key)?.city ?? '';
                    if (city && totalInventoryNum > 0 && !citys.includes(city)) {
                        citys.push(city);
                    }
                    if (totalInventoryNum > 0) {
                        storeHasInventoryNum++;
                    }
                }
                cityHasInventoryNum = citys.length;
            }
            const list = [];
            for (const item of result) {
                const { skuId, skuName, storeId, city, totalCost } = item;
                const totalCostNum = new Decimal(totalCost || 0);
                list.push({
                    skuId: skuId, //商品编号
                    skuName: skuName, //商品名称
                    storeId: storeId, //分仓id
                    city: city || '', //城市名称
                    storeName: storeInfoMap.get(storeId)?.name ?? '', //分仓名称
                    totalCost: totalCostNum.toFixed(2), //商品成本（含税）
                    inventory: inventoryMap.get(`${skuId}:${storeId}`) || 0, //库存数
                });
            }
            const totalData = {
                totalInventory: skuTotalInventory, //商品总库存
                cityHasInventoryNum: cityHasInventoryNum, //有库存城市数
                storeHasInventoryNum: storeHasInventoryNum, //有库存分仓数
            }
            ctx.body = {
                success: true,
                data: {
                    listData: list,
                    totalData: totalData,
                    ...formatPagination({ total: total, page: currentPage, limit: currentPagesize, pages: pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async export(ctx) {
        try {
            let { city, storeId, skuId, skuName } = ctx.request.body || {};
            let newCond = `1 = 1`;
            if (city) {
                newCond += ` AND city = '${city}'`;
            }
            if (storeId) {
                newCond += ` AND store_id = '${storeId}'`;
            }
            if (skuId) {
                newCond += ` AND sku_id = '${skuId}'`;
            }
            if (skuName) {
                newCond += ` AND sku_name LIKE '%${skuName}%'`;
            }
            let base_sql = `
                SELECT 
                    sku_id AS skuId,
                    sku_name AS skuName,
                    city,
                    store_id AS storeId,
                    total_cost AS totalCost 
                FROM 
                    jst_store_sku_cost 
                WHERE 
                    ${newCond}`;
            const result = await sequelize_shop_tk.query(base_sql, {
                type: QueryTypes.SELECT
            });
            if (!result || !result.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            // 查询分仓名字和城市
            const city_sql = `SELECT wms_co_id AS storeId, city, name FROM jst_warehouses`;
            const storeList = await sequelize_shop_tk.query(city_sql, {
                type: QueryTypes.SELECT
            });
            const storeInfoMap = new Map(); //key: storeId, value: { city, name }
            if (storeList && storeList.length) {
                for (const item of storeList) {
                    const { storeId, city, name } = item;
                    const key = storeId + '';
                    storeInfoMap.set(key, { city, name });
                }
            }
            // 查询各个商品的库存（区分分仓）
            let inventory_cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                inventory_cond = ` wms_co_id IN (${sql})`;
            }
            if (storeId) {
                inventory_cond = ` wms_co_id = '${storeId}'`;
            }
            const inventory_sql = `
                SELECT 
                    sku_id AS skuId, wms_co_id AS storeId, SUM(qty) AS inventory 
                FROM 
                    jst_inventory 
                WHERE 
                    ${inventory_cond} AND sku_id IN (SELECT DISTINCT sku_id FROM jst_store_sku_cost WHERE ${newCond}) 
                GROUP BY 
                    sku_id, wms_co_id`;
            const inventoryResult = await sequelize_shop_tk.query(inventory_sql, {
                type: QueryTypes.SELECT
            });
            const inventoryMap = new Map(); //key: storeId:skuId, value: inventory
            if (inventoryResult && inventoryResult.length) {
                for (const item of inventoryResult) {
                    const { skuId, storeId, inventory } = item;
                    inventoryMap.set(`${skuId}:${storeId}`, Number(inventory));
                }
            }
            const list = [];
            for (const item of result) {
                const { skuId, skuName, storeId, city, totalCost } = item;
                const totalCostNum = new Decimal(totalCost || 0);
                list.push({
                    skuId: skuId, //商品编号
                    skuName: skuName, //商品名称
                    storeId: storeId, //分仓id
                    city: city || '', //城市名称
                    storeName: storeInfoMap.get(storeId)?.name ?? '', //分仓名称
                    totalCost: totalCostNum.toFixed(2), //商品成本（含税）
                    inventory: inventoryMap.get(`${skuId}:${storeId}`) || 0, //库存数
                });
            }
            let columns = [
                { header: '商品编号', key: 'skuId' },
                { header: '商品名称', key: 'skuName' },
                { header: '城市名称', key: 'city' },
                { header: '分仓ID', key: 'storeId' },
                { header: '分仓名称', key: 'storeName' },
                { header: '商品成本（含税）', key: 'totalCost' },
                { header: '库存数', key: 'inventory' }
            ];
            if (!list.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(list, columns, "商品分仓库存查询");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = StoreController
