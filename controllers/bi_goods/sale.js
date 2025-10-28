/* eslint-disable no-unused-vars */
const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const { isValidDateFormat } = require("../../utils/commonUtil");
const excelUtils = require("../../utils/excelUtil");
const Decimal = require('decimal.js');
const moment = require("moment");
const { addJstStoreSkuCostToDatabase } = require("../../crontab/jst/store_sku_cost");
const { addJstOrderNumToDatabase } = require("../../crontab/jst/order_num");
const { addJstStoreOrderNumToDatabase } = require("../../crontab/jst/store_order_num");

class SaleController {
    // 查询商品分仓库存报表
    async getLists(ctx) {
        try {
            // { //参数
            //     startTime: "2024-01-01", //开始时间
            //     endTime: "2024-06-01", //结束时间
            //     channel: "美团", //渠道
            //     city: "上海", //城市
            //     storeId: "xxxxxxx", //分仓
            //     page: 1,
            //     pagesize: 10,
            // }
            let { startTime, endTime, channel, city, storeId, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            let newCond = ` created BETWEEN '${startTime}' AND '${endTime}'`;
            if (channel) {
                newCond += ` AND channel = '${channel}'`;
            }
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                newCond += ` AND store_id IN (${sql})`;
            }
            if (storeId) {
                newCond += ` AND store_id = '${storeId}'`;
            }
            // 默认不区分分仓
            let base_sql = `
                SELECT 
                    created, 
                    channel, 
                    order_type AS orderType, 
                    order_count AS orderCount,
                    sale_amount AS saleAmount,
                    total_cost AS totalCost 
                FROM 
                    jst_order_num 
                WHERE 
                    ${newCond}`;
            // 区分城市但不区分分仓（order_count,sale_amount,total_cost等字段需要分组累加）
            if (city && !storeId) {
                base_sql = `
                    SELECT 
                        created,
                        channel,
                        order_type AS orderType,
                        SUM(order_count) AS orderCount,
                        SUM(CAST(sale_amount AS DECIMAL(10, 2))) AS saleAmount,
                        SUM(CAST(total_cost AS DECIMAL(10, 2))) AS totalCost 
                    FROM 
                        jst_store_order_num 
                    WHERE 
                        ${newCond} 
                    GROUP BY 
                        created, channel, orderType `;
            }
            // 单个分仓
            if (storeId) {
                base_sql = `
                    SELECT 
                        created,
                        channel,
                        order_type AS orderType,
                        order_count AS orderCount,
                        sale_amount AS saleAmount,
                        total_cost AS totalCost 
                    FROM 
                        jst_store_order_num 
                    WHERE 
                        ${newCond} `;
            }
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
            // 查询商品总库存、有库存城市数、有库存分仓数
            let inventory_cond = `1 = 1`;
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                inventory_cond = ` wms_co_id IN (${sql})`;
            }
            if (storeId) {
                inventory_cond = ` wms_co_id = ${storeId}`;
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
                const { created, channel, orderType, orderCount, saleAmount, totalCost } = item;
                // Decimal不接受null和undefined
                if (saleAmount == null || totalCost == null) continue;
                const _saleAmount = new Decimal(saleAmount);
                const _totalCost = new Decimal(totalCost);
                // 计算毛利率
                const rate = !_saleAmount.isZero() ? ((_saleAmount.minus(_totalCost)).div(_saleAmount)).times(100).toFixed(2) : "0.00";
                list.push({
                    created: created, //日期
                    channel: channel, //渠道
                    orderType: orderType, //订单类型
                    orderCount: orderCount, //订单数
                    saleAmount: saleAmount, //实收
                    totalCost: totalCost, //商品成本（含税）
                    rate: rate + "%", //毛利率
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
            let { startTime, endTime, channel, city, storeId } = ctx.request.body || {};
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            let newCond = ` created BETWEEN '${startTime}' AND '${endTime}'`;
            if (channel) {
                newCond += ` AND channel = '${channel}'`;
            }
            if (city) {
                let sql = `SELECT wms_co_id FROM jst_warehouses WHERE city = '${city}'`;
                newCond += ` AND store_id IN (${sql})`;
            }
            if (storeId) {
                newCond += ` AND store_id = '${storeId}'`;
            }
            // 导出接口默认区分分仓
            let base_sql = `
                SELECT 
                    created,
                    store_id AS storeId,
                    channel,
                    order_type AS orderType,
                    order_count AS orderCount,
                    sale_amount AS saleAmount,
                    total_cost AS totalCost,
                    rate 
                FROM 
                    jst_store_order_num 
                WHERE 
                    ${newCond} `;
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
            const list = [];
            for (const item of result) {
                const { created, storeId, channel, orderType, orderCount, saleAmount, totalCost, rate } = item;
                list.push({
                    created: created, //日期
                    storeId: storeId, //分仓ID
                    storeName: storeInfoMap.get(storeId)?.name ?? '', //分仓名
                    channel: channel, //渠道
                    orderType: orderType, //订单类型
                    orderCount: orderCount, //订单数
                    saleAmount: saleAmount, //实收
                    totalCost: totalCost, //商品成本（含税）
                    rate: rate, //毛利率
                });
            }
            let columns = [
                { header: '日期', key: 'created' },
                { header: '分仓ID', key: 'storeId' },
                { header: '分仓名', key: 'storeName' },
                { header: '渠道', key: 'channel' },
                { header: '订单类型', key: 'orderType' },
                { header: '订单数', key: 'orderCount' },
                { header: '实收', key: 'saleAmount' },
                { header: '商品成本（含税）', key: 'totalCost' },
                { header: '毛利率', key: 'rate' },
            ];
            if (!list.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(list, columns, "小程序销售日报");
            ctx.set(headers);
            ctx.body = {
                success: true,
                data: buffer
            }
        } catch (error) {
            console.log(error);
        }
    }

    async discovery(ctx) {
        try {
            const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
            const tax_sql = `SELECT COUNT(*) AS cnt FROM tax WHERE order_createtime = :first`;
            const taxCountResult = await sequelize_shop_tk.query(tax_sql, {
                replacements: { first: yesterday },
                type: QueryTypes.SELECT
            });
            const taxCount = taxCountResult && taxCountResult[0] && taxCountResult[0].cnt ? taxCountResult[0].cnt : 0;
            if (!taxCount) {
                return ctx.body = { success: false, msg: '请联系管理员上传完整的成本数据' }
            }
            await Promise.all([
                addJstStoreSkuCostToDatabase(), //商品含税成本(区分分仓)
                addJstOrderNumToDatabase(), //小程序销售报表(不区分分仓)
                addJstStoreOrderNumToDatabase(), //小程序销售报表(区分分仓)
            ]);
            ctx.body = { success: true, data: true }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = SaleController
