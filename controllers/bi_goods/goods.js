/* eslint-disable no-unused-vars */
const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const excelUtils = require("../../utils/excelUtil");
const { isValidDateFormat } = require("../../utils/commonUtil");
const Decimal = require('decimal.js');

class GoodsController {
    // 查询商品销售列表
    async getLists(ctx) {
        try {
            // { //参数
            //     sortType: "desc",
            //     startTime: "2024-01-01",
            //     endTime: "2024-02-02",
            //     city: "上海",
            //     storeId: "xxxxxxx",
            //     channel: "美团",
            //     brand: "爱肯拿",
            //     cate: "猫砂",
            //     skuId: "yyyyyyy",
            //     skuName: "zzzzz",
            //     page: 1,
            //     pagesize: 10,
            // }
            let {
                sortType,
                startTime,
                endTime,
                city,
                storeId,
                channel,
                brand,
                cate,
                skuId,
                skuName,
                page = 1,
                pagesize = 10
            } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            startTime += ' 00:00:00';
            endTime += ' 23:59:59';
            let orderTime_cond = ` o.created BETWEEN '${startTime}' AND '${endTime}'`;
            let cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                cond += ` AND ois.store_id IN (${sql})`;
            }
            if (storeId) {
                cond += ` AND ois.store_id = '${storeId}'`;
            }
            if (channel) {
                cond += ` AND ti.channel = '${channel}'`;
            }
            if (brand) {
                cond += ` AND g.brand = '${brand}'`;
            }
            if (cate) {
                cond += ` AND g.category = '${cate}'`;
            }
            if (skuId) {
                cond += ` AND g.sku_id = '${skuId}'`;
            }
            if (skuName) {
                cond += ` AND g.name LIKE '%${skuName}%'`;
            }
            let sortCond = ' qty DESC'; //默认按销量倒序排序
            if (sortType == 'asc') {
                sortCond = ' qty ASC';
            }
            // 默认按商品维度进行统计（不区分分仓）
            let base_sql = `
                WITH OrderItemSummary AS (
                    SELECT 
                        oi.order_id,
                        oi.sku_id,
                        o.so_id AS platform_order_id,
                        o.wms_co_id AS store_id,
                        SUM(CAST(oi.qty AS DECIMAL(10, 2))) AS total_qty, 
                        SUM(CAST(oi.sale_amount AS DECIMAL(10, 2))) AS total_sale_amount 
                    FROM 
                        jst_order_item oi 
                    JOIN 
                        jst_order o ON oi.order_id = o.id 
                    WHERE 
                        ${orderTime_cond} AND o.status NOT IN ('Delete', 'Cancelled') 
                    GROUP BY  
                        oi.order_id, oi.sku_id, o.so_id, o.wms_co_id
                ),
                TaxInfo AS (
                    SELECT 
                        t.platform_order_id,
                        t.store_id,
                        t.goods_id AS sku_id,
                        t.channel,
                        CAST(t.total_cost_with_tax AS DECIMAL(10, 2)) AS total_cost 
                    FROM 
                        tax t
                ) 
                SELECT 
                    g.sku_id AS skuId,
                    g.name AS skuName,
                    g.brand AS brand,
                    g.category AS cate,
                    SUM(ois.total_qty) AS qty,
                    SUM(ois.total_sale_amount) AS saleAmount,
                    SUM(ti.total_cost) AS totalCost 
                FROM 
                    OrderItemSummary ois 
                JOIN 
                    jst_goods_sku g ON ois.sku_id = g.sku_id 
                LEFT JOIN 
                    TaxInfo ti ON ois.platform_order_id = ti.platform_order_id AND ois.store_id = ti.store_id AND ois.sku_id = ti.sku_id 
                WHERE 
                    ${cond} 
                GROUP BY 
                    g.sku_id, g.name, g.brand, g.category 
                ORDER BY 
                    ${sortCond}`;
            if (city || storeId) {
                // 需要按照分仓和商品两个维度进行分组统计
                base_sql = `
                    WITH OrderItemSummary AS (
                        SELECT 
                            oi.order_id,
                            oi.sku_id,
                            o.so_id AS platform_order_id,
                            o.wms_co_id AS store_id,
                            SUM(CAST(oi.qty AS DECIMAL(10, 2))) AS total_qty, 
                            SUM(CAST(oi.sale_amount AS DECIMAL(10, 2))) AS total_sale_amount 
                        FROM 
                            jst_order_item oi 
                        JOIN 
                            jst_order o ON oi.order_id = o.id 
                        WHERE 
                            ${orderTime_cond} AND o.status NOT IN ('Delete', 'Cancelled') 
                        GROUP BY  
                            oi.order_id, oi.sku_id, o.so_id, o.wms_co_id
                    ),
                    TaxInfo AS (
                        SELECT 
                            t.platform_order_id,
                            t.store_id,
                            t.goods_id AS sku_id,
                            t.channel,
                            CAST(t.total_cost_with_tax AS DECIMAL(10, 2)) AS total_cost 
                        FROM 
                            tax t
                    ) 
                    SELECT 
                        ois.store_id AS storeId,
                        g.sku_id AS skuId,
                        g.name AS skuName,
                        g.brand AS brand,
                        g.category AS cate,
                        SUM(ois.total_qty) AS qty,
                        SUM(ois.total_sale_amount) AS saleAmount,
                        SUM(ti.total_cost) AS totalCost 
                    FROM 
                        OrderItemSummary ois 
                    JOIN 
                        jst_goods_sku g ON ois.sku_id = g.sku_id 
                    LEFT JOIN 
                        TaxInfo ti ON ois.platform_order_id = ti.platform_order_id AND ois.store_id = ti.store_id AND ois.sku_id = ti.sku_id 
                    WHERE 
                        ${cond} 
                    GROUP BY 
                        ois.store_id, g.sku_id, g.name, g.brand, g.category 
                    ORDER BY 
                        ${sortCond}`;
            }
            // 分页查询
            let paginate_sql = `${base_sql} LIMIT ${skip}, ${currentPagesize}`;
            const result = await sequelize_shop_tk.query(paginate_sql, {
                type: QueryTypes.SELECT
            });
            if (!result || !result.length) {
                return ctx.body = {
                    success: true,
                    data: {
                        data: [],
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
            // 查询各个商品的总库存和有货仓库数
            const skuIds = result.map(v => `'${v.skuId}'`).join(',');
            let inventory_cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                inventory_cond = ` wms_co_id IN (${sql})`;
            }
            if (storeId) {
                inventory_cond = ` wms_co_id = ${storeId}`;
            }
            // 默认按商品维度进行统计（不区分分仓）
            let inventory_sql = `
                SELECT 
                    sku_id, SUM(qty) AS totalInventory 
                FROM 
                    jst_inventory 
                WHERE 
                    sku_id IN (${skuIds}) 
                GROUP BY 
                    sku_id`;
            // 区分分仓
            if (city || storeId) {
                inventory_sql = `
                    SELECT 
                        sku_id, SUM(qty) AS totalInventory 
                    FROM 
                        jst_inventory 
                    WHERE 
                        ${inventory_cond} AND sku_id IN (${skuIds}) 
                    GROUP BY 
                        sku_id`;
            }
            let inventoryResult = await sequelize_shop_tk.query(inventory_sql, {
                type: QueryTypes.SELECT
            });
            const inventoryMap = new Map(); //key: skuId, value: inventory
            if (inventoryResult && inventoryResult.length) {
                for (const item of inventoryResult) {
                    const { sku_id, totalInventory } = item;
                    inventoryMap.set(sku_id, totalInventory);
                }
            }
            // 查询有货仓库数，默认按商品维度进行统计（不区分分仓）
            let store_sql = `
                SELECT 
                    sku_id, COUNT(DISTINCT wms_co_id) AS storeNum 
                FROM 
                    jst_inventory 
                WHERE 
                    sku_id IN (${skuIds}) AND qty > 0 
                GROUP BY 
                    sku_id`;
            // 区分分仓
            if (city || storeId) {
                store_sql = `
                    SELECT 
                        sku_id, COUNT(DISTINCT wms_co_id) AS storeNum 
                    FROM 
                        jst_inventory 
                    WHERE 
                        ${inventory_cond} AND sku_id IN (${skuIds}) AND qty > 0 
                    GROUP BY 
                        sku_id`;
            }
            let storeNumResult = await sequelize_shop_tk.query(store_sql, {
                type: QueryTypes.SELECT
            });
            const storeNumMap = new Map(); //key: skuId, value: storeNum
            if (storeNumResult && storeNumResult.length) {
                for (const item of storeNumResult) {
                    const { sku_id, storeNum } = item;
                    storeNumMap.set(sku_id, storeNum);
                }
            }
            const list = [];
            for (const item of result) {
                const { skuId, skuName, brand, cate, qty, saleAmount, totalCost } = item;
                const _qty = new Decimal(qty || 0);
                const _saleAmount = new Decimal(saleAmount || 0);
                const _totalCost = new Decimal(totalCost || 0);
                // 计算平均到手单价
                const avgPrice = !_qty.isZero() ? _saleAmount.div(_qty).toFixed(2) : "0.00";
                // 计算毛利率
                const rate = !_saleAmount.isZero() ? ((_saleAmount.minus(_totalCost)).div(_saleAmount)).times(100).toFixed(2) : "0.00";
                list.push({
                    skuId: skuId, //商品编号
                    cate: cate, //分类
                    skuName: skuName, //商品名称
                    brand: brand, //品牌
                    qty: qty, //销量
                    saleAmount: saleAmount, //售卖金额
                    avgPrice: avgPrice, //平均到手单价
                    totalCost: totalCost, //商品成本
                    rate: rate + "%", //毛利率
                    inventory: inventoryMap.get(skuId) || 0, //总库存
                    storeNum: storeNumMap.get(skuId) || 0, //有货仓库数
                });
            }
            ctx.body = {
                success: true,
                data: {
                    data: list,
                    ...formatPagination({ total: total, page: currentPage, limit: currentPagesize, pages: pages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    // 查询城市
    async getCitys(ctx) {
        try {
            let citys = [];
            let sql = `SELECT DISTINCT city FROM jst_warehouses`;
            const result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                citys = result.map(v => v.city);
            }
            ctx.body = { success: true, data: citys }
        } catch (error) {
            console.log('getCitys error ===>>>', error);
        }
    }

    // 查询分仓
    async getStores(ctx) {
        try {
            const { city } = ctx.request.body || {};
            let stores = [];
            let sql = `SELECT wms_co_id, name FROM jst_warehouses`;
            if (city) {
                sql = `SELECT wms_co_id, name FROM jst_warehouses WHERE city = '${city}'`;
            }
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            for (let item of result) {
                const { wms_co_id, name } = item;
                if (wms_co_id && name) {
                    stores.push({
                        storeId: wms_co_id,
                        storeName: name
                    });
                }
            }
            ctx.body = { success: true, data: stores }
        } catch (error) {
            console.log('getStores error ===>>>', error);
        }
    }

    // 查询销售渠道
    async getSaleChannel(ctx) {
        try {
            let channels = [];
            let sql = `SELECT DISTINCT channel FROM tax WHERE channel IS NOT NULL AND channel != ''`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                channels = result.map(v => v.channel);
            }
            ctx.body = { success: true, data: channels }
        } catch (error) {
            console.log('getSaleChannel error ===>>>', error);
        }
    }

    // 查询品牌
    async getBrands(ctx) {
        try {
            let brands = [];
            let sql = `SELECT DISTINCT brand FROM jst_goods_sku WHERE brand IS NOT NULL AND brand != ''`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                brands = result.map(v => v.brand);
            }
            ctx.body = { success: true, data: brands }
        } catch (error) {
            console.log('getBrands error ===>>>', error);
        }
    }

    // 查询分类
    async getCates(ctx) {
        try {
            let cates = [];
            let sql = `SELECT DISTINCT category FROM jst_goods_sku WHERE category IS NOT NULL AND category != ''`;
            let result = await sequelize_shop_tk.query(sql, {
                type: QueryTypes.SELECT
            });
            if (result && result.length) {
                cates = result.map(v => v.category);
            }
            ctx.body = { success: true, data: cates }
        } catch (error) {
            console.log('getCates error ===>>>', error);
        }
    }

    async export(ctx) {
        try {
            let { sortType, startTime, endTime, city, storeId, channel, brand, cate, skuId, skuName } = ctx.request.body || {};
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            startTime += ' 00:00:00';
            endTime += ' 23:59:59';
            let orderTime_cond = ` o.created BETWEEN '${startTime}' AND '${endTime}'`;
            let cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                cond += ` AND ois.store_id IN (${sql})`;
            }
            if (storeId) {
                cond += ` AND ois.store_id = '${storeId}'`;
            }
            if (channel) {
                cond += ` AND ti.channel = '${channel}'`;
            }
            if (brand) {
                cond += ` AND g.brand = '${brand}'`;
            }
            if (cate) {
                cond += ` AND g.category = '${cate}'`;
            }
            if (skuId) {
                cond += ` AND g.sku_id = '${skuId}'`;
            }
            if (skuName) {
                cond += ` AND g.name LIKE '%${skuName}%'`;
            }
            let sortCond = ' qty DESC'; //默认按销量倒序排序
            if (sortType == 'asc') {
                sortCond = ' qty ASC';
            }
            // 导出的数据需要区分分仓
            let base_sql = `
                WITH OrderItemSummary AS (
                    SELECT 
                        oi.order_id,
                        oi.sku_id,
                        o.so_id AS platform_order_id,
                        o.wms_co_id AS store_id,
                        SUM(CAST(oi.qty AS DECIMAL(10, 2))) AS total_qty, 
                        SUM(CAST(oi.sale_amount AS DECIMAL(10, 2))) AS total_sale_amount 
                    FROM 
                        jst_order_item oi 
                    JOIN 
                        jst_order o ON oi.order_id = o.id 
                    WHERE 
                        ${orderTime_cond} AND o.status NOT IN ('Delete', 'Cancelled') 
                    GROUP BY 
                        oi.order_id, oi.sku_id, o.so_id, o.wms_co_id
                ),
                TaxInfo AS (
                    SELECT 
                        t.platform_order_id,
                        t.store_id,
                        t.goods_id AS sku_id,
                        t.channel,
                        CAST(t.total_cost_with_tax AS DECIMAL(10, 2)) AS total_cost 
                    FROM 
                        tax t
                ) 
                SELECT 
                    ois.store_id AS storeId,
                    g.sku_id AS skuId,
                    g.name AS skuName,
                    g.brand AS brand,
                    g.category AS cate,
                    ti.channel AS channel,
                    SUM(ois.total_qty) AS qty,
                    SUM(ois.total_sale_amount) AS saleAmount,
                    SUM(ti.total_cost) AS totalCost 
                FROM 
                    OrderItemSummary ois 
                JOIN 
                    jst_goods_sku g ON ois.sku_id = g.sku_id 
                LEFT JOIN 
                    TaxInfo ti ON ois.platform_order_id = ti.platform_order_id AND ois.store_id = ti.store_id AND ois.sku_id = ti.sku_id 
                WHERE 
                    ${cond} 
                GROUP BY 
                    ois.store_id, g.sku_id, g.name, g.brand, g.category, ti.channel 
                ORDER BY 
                    ${sortCond}`;
            const result = await sequelize_shop_tk.query(base_sql, {
                type: QueryTypes.SELECT
            });
            if (!result || !result.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            // 查询各个商品的总库存和有货仓库数
            const skuIds = result.map(v => `'${v.skuId}'`).join(',');
            let inventory_cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                inventory_cond = ` wms_co_id IN (${sql})`;
            }
            if (storeId) {
                inventory_cond = ` wms_co_id = ${storeId}`;
            }
            // 默认按商品维度进行统计（不区分分仓）
            let inventory_sql = `
                SELECT 
                    sku_id, SUM(qty) AS totalInventory 
                FROM 
                    jst_inventory 
                WHERE 
                    sku_id IN (${skuIds}) 
                GROUP BY 
                    sku_id`;
            // 区分分仓
            if (city || storeId) {
                inventory_sql = `
                    SELECT 
                        sku_id, SUM(qty) AS totalInventory 
                    FROM 
                        jst_inventory 
                    WHERE 
                        ${inventory_cond} AND sku_id IN (${skuIds}) 
                    GROUP BY 
                        sku_id`;
            }
            let inventoryResult = await sequelize_shop_tk.query(inventory_sql, {
                type: QueryTypes.SELECT
            });
            const inventoryMap = new Map(); //key: skuId, value: inventory
            if (inventoryResult && inventoryResult.length) {
                for (const item of inventoryResult) {
                    const { sku_id, totalInventory } = item;
                    inventoryMap.set(sku_id, totalInventory);
                }
            }
            // 查询有货仓库数，默认按商品维度进行统计（不区分分仓）
            let store_sql = `
                SELECT 
                    sku_id, COUNT(DISTINCT wms_co_id) AS storeNum 
                FROM 
                    jst_inventory 
                WHERE 
                    sku_id IN (${skuIds}) AND qty > 0 
                GROUP BY 
                    sku_id`;
            // 区分分仓
            if (city || storeId) {
                store_sql = `
                    SELECT 
                        sku_id, COUNT(DISTINCT wms_co_id) AS storeNum 
                    FROM 
                        jst_inventory 
                    WHERE 
                        ${inventory_cond} AND sku_id IN (${skuIds}) AND qty > 0 
                    GROUP BY 
                        sku_id`;
            }
            let storeNumResult = await sequelize_shop_tk.query(store_sql, {
                type: QueryTypes.SELECT
            });
            const storeNumMap = new Map(); //key: skuId, value: storeNum
            if (storeNumResult && storeNumResult.length) {
                for (const item of storeNumResult) {
                    const { sku_id, storeNum } = item;
                    storeNumMap.set(sku_id, storeNum);
                }
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
            const list = [];
            for (const item of result) {
                const { channel, storeId, skuId, skuName, brand, cate, qty, saleAmount, totalCost } = item;
                const _qty = new Decimal(qty || 0);
                const _saleAmount = new Decimal(saleAmount || 0);
                const _totalCost = new Decimal(totalCost || 0);
                // 计算平均到手单价
                const avgPrice = !_qty.isZero() ? _saleAmount.div(_qty).toFixed(2) : "0.00";
                // 计算毛利率
                const rate = !_saleAmount.isZero() ? ((_saleAmount.minus(_totalCost)).div(_saleAmount)).times(100).toFixed(2) : "0.00";
                list.push({
                    channel: channel, //销售渠道
                    storeId: storeId, //分仓ID
                    storeName: storeInfoMap.get(storeId)?.name ?? '', //分仓名
                    skuId: skuId, //商品编号
                    cate: cate, //分类
                    skuName: skuName, //商品名称
                    brand: brand, //品牌
                    qty: qty, //销量
                    saleAmount: saleAmount, //售卖金额
                    avgPrice: avgPrice, //平均到手单价
                    totalCost: totalCost, //商品成本
                    rate: rate + "%", //毛利率
                    inventory: inventoryMap.get(skuId) || 0, //总库存
                    storeNum: storeNumMap.get(skuId) || 0, //有货仓库数
                });
            }
            let columns = [
                { header: '销售渠道', key: 'channel' },
                { header: '分仓ID', key: 'storeId' },
                { header: '分仓名', key: 'storeName' },
                { header: '商品编号', key: 'skuId' },
                { header: '分类', key: 'cate' },
                { header: '商品名称', key: 'skuName' },
                { header: '品牌', key: 'brand' },
                { header: '销量', key: 'qty' },
                { header: '售卖金额', key: 'saleAmount' },
                { header: '平均到手单价', key: 'avgPrice' },
                { header: '商品成本（含税）', key: 'totalCost' },
                { header: '毛利率', key: 'rate' },
                { header: '总库存', key: 'inventory' },
                { header: '有货仓库数', key: 'storeNum' }
            ];
            if (!list.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(list, columns, "商品销售报表");
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

module.exports = GoodsController
