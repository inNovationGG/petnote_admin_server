const { sequelize_shop_tk } = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const { formatPagination } = require("../../utils/pagination");
const moment = require("moment");
const excelUtils = require("../../utils/excelUtil");
const { isValidDateFormat } = require("../../utils/commonUtil");

class StoreController {
    //工厂方法，用于创建中间件
    createMiddleware(methodName) {
        if (!this[methodName]) {
            throw new Error(`Method ${methodName} does not exist.`);
        }
        //返回一个中间件函数
        return async (ctx, next) => {
            //直接调用类方法，并将ctx作为参数传递
            await this[methodName].call(this, ctx);
            //继续执行下一个中间件
            await next();
        };
    }

    // 查询分仓报表
    async getLists(ctx) {
        try {
            // { //参数
            //     startTime: "2024-01-01",
            //     endTime: "2024-02-02",
            //     city: ['上海','北京'], //城市
            //     store: ['1001','1002'], //分仓
            //     channel: ["美团","饿了么","有赞小程序"], //销售渠道
            //     page: 1,
            //     pagesize: 10,
            //     sort: [{ field: 'price', order: 'DESC' }], //排序规则
            // }
            let { startTime, endTime, city, store, channel, sort, page = 1, pagesize = 10 } = ctx.request.body || {};
            const currentPage = parseInt(page, 10);
            const currentPagesize = parseInt(pagesize, 10);
            const skip = (currentPage - 1) * currentPagesize;
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            // 计算天数差
            const daysDiff = moment(endTime).diff(moment(startTime), 'days') + 1;
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
            if (city) {
                if (!Array.isArray(city)) {
                    return ctx.body = { success: false, msg: "城市参数格式不正确" }
                }
                if (city.length) {
                    let citys = city.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND city IN (${citys})`;
                }
            }
            if (store) {
                if (!Array.isArray(store)) {
                    return ctx.body = { success: false, msg: "分仓参数格式不正确" }
                }
                if (store.length) {
                    let stores = store.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND store_id IN (${stores})`;
                }
            }
            if (channel) {
                if (!Array.isArray(channel)) {
                    return ctx.body = { success: false, msg: "销售渠道参数格式不正确" }
                }
                if (channel.length) {
                    let channels = channel.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND channel IN (${channels})`;
                }
            }
            // 三方订单分城市、分仓（计算系数0.957）
            let third_city_store_sql = `
                SELECT 
                    city, -- 城市
                    store_name AS store, -- 分仓 
                    SUM(total_price / 0.957) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.957 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel != '有赞小程序' 
                GROUP BY 
                    city, store_name;
            `;
            // 有赞订单分城市、分仓（计算系数0.994）
            let youzan_city_store_sql = `
                SELECT 
                    city, -- 城市
                    store_name AS store, -- 分仓 
                    SUM(total_price / 0.994) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.994 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel = '有赞小程序' 
                GROUP BY 
                    city, store_name;
            `;
            // 三方订单分城市（计算系数0.957）
            let third_city_sql = `
                SELECT 
                    city, -- 城市
                    SUM(total_price / 0.957) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.957 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel != '有赞小程序' 
                GROUP BY 
                    city;
            `;
            // 有赞订单分城市（计算系数0.994）
            let youzan_city_sql = `
                SELECT 
                    city, -- 城市
                    SUM(total_price / 0.994) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.994 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel = '有赞小程序' 
                GROUP BY 
                    city;
            `;
            let [thirdCityStoreResult, youzanCityStoreResult, thirdCityResult, youzanCityResult] = await Promise.all([
                sequelize_shop_tk.query(third_city_store_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(youzan_city_store_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(third_city_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(youzan_city_sql, { type: QueryTypes.SELECT }),
            ]);
            const thirdCityStoreMap = new Map();
            const youzanCityStoreMap = new Map();
            const thirdCityMap = new Map();
            const youzanCityMap = new Map();
            //三方订单分城市
            if (thirdCityResult && Array.isArray(thirdCityResult) && thirdCityResult.length) {
                for (const item of thirdCityResult) {
                    const { city, price, revenue, cost, goodsCount, orderCount } = item;
                    thirdCityMap.set(city, { price, revenue, cost, goodsCount, orderCount, totalProfit: revenue - cost });
                }
            }
            //有赞订单分城市
            if (youzanCityResult && Array.isArray(youzanCityResult) && youzanCityResult.length) {
                for (const item of youzanCityResult) {
                    const { city, price, revenue, cost, goodsCount, orderCount } = item;
                    youzanCityMap.set(city, { price, revenue, cost, goodsCount, orderCount, totalProfit: revenue - cost });
                }
            }
            //三方订单分城市、分仓
            if (thirdCityStoreResult && Array.isArray(thirdCityStoreResult) && thirdCityStoreResult.length) {
                for (const item of thirdCityStoreResult) {
                    const { city, store, price, revenue, cost, goodsCount, orderCount } = item;
                    thirdCityStoreMap.set(`${city}-${store}`, { price, revenue, cost, goodsCount, orderCount });
                }
            }
            //有赞订单分城市、分仓
            if (youzanCityStoreResult && Array.isArray(youzanCityStoreResult) && youzanCityStoreResult.length) {
                for (const item of youzanCityStoreResult) {
                    const { city, store, price, revenue, cost, goodsCount, orderCount } = item;
                    youzanCityStoreMap.set(`${city}-${store}`, { price, revenue, cost, goodsCount, orderCount });
                }
            }
            const uniqueKeys = [...new Set([...thirdCityStoreMap.keys(), ...youzanCityStoreMap.keys()])];
            let listData = [];
            for (const item of uniqueKeys) {
                const city = item.split('-')[0];
                const store = item.split('-')[1];
                const totalPrice = Number(thirdCityMap?.get(city)?.price ?? 0 + youzanCityMap?.get(city)?.price ?? 0);
                const totalProfit = Number(thirdCityMap?.get(city)?.totalProfit ?? 0 + youzanCityMap?.get(city)?.totalProfit ?? 0);
                const totalRevenue = Number(thirdCityMap?.get(city)?.revenue ?? 0 + youzanCityMap?.get(city)?.revenue ?? 0);
                const price = Number((thirdCityStoreMap?.get(item)?.price ?? 0 + youzanCityStoreMap?.get(item)?.price ?? 0).toFixed(2));
                const revenue = Number((thirdCityStoreMap?.get(item)?.revenue ?? 0 + youzanCityStoreMap?.get(item)?.revenue ?? 0).toFixed(2));
                const cost = Number((thirdCityStoreMap?.get(item)?.cost ?? 0 + youzanCityStoreMap?.get(item)?.cost ?? 0).toFixed(2));
                const profit = Number(((revenue - cost) || 0).toFixed(2));
                const goodsCount = Number((thirdCityStoreMap?.get(item)?.goodsCount ?? 0 + youzanCityStoreMap?.get(item)?.goodsCount ?? 0).toFixed(2));
                const profitRate = revenue ? Number((((revenue - cost) / revenue) || 0).toFixed(4)) : 0;
                const orderCount = Number((thirdCityStoreMap?.get(item)?.orderCount ?? 0 + youzanCityStoreMap?.get(item)?.orderCount ?? 0).toFixed(2));
                const dailyOrderCount = Math.round(orderCount / daysDiff);
                const singleOrderPrice = orderCount ? Number(((price / orderCount) || 0).toFixed(2)) : 0;
                const singleOrderProfit = orderCount ? Number(((profit / orderCount) || 0).toFixed(2)) : 0;
                const singleGoodsPrice = goodsCount ? Number(((price / goodsCount) || 0).toFixed(2)) : 0;
                const totalRevenueRate = totalRevenue ? Number(((revenue / totalRevenue) || 0).toFixed(4)) : 0;
                const totalProfitRate = totalProfit ? Number(((profit / totalProfit) || 0).toFixed(4)) : 0;
                listData.push({
                    city: city, //城市
                    store: store, //分仓
                    price: price, //实收(含税_含5%)
                    revenue: revenue, //Revenue(未税_含5%)
                    cost: cost, //成本(未税)
                    profit: profit, //毛利额
                    goodsCount: goodsCount, //件数
                    profitRate: profitRate, //毛利率
                    orderCount: orderCount, //订单数
                    dailyOrderCount: dailyOrderCount, //日均订单数
                    singleOrderPrice: singleOrderPrice, //客单价
                    singleOrderProfit: singleOrderProfit, //单均利润
                    singleGoodsPrice: singleGoodsPrice, //件单价
                    totalRevenueRate: totalRevenueRate, //Revenue-城市占比
                    totalProfitRate: totalProfitRate, //毛利额-城市占比
                    cityTotalPrice: totalPrice, //城市总实收，用来排序
                });
            }
            // 先按城市总实收倒序排序, 再按分仓总实收倒序排序
            listData.sort((a, b) => b.cityTotalPrice - a.cityTotalPrice);
            let sortedListData = [];
            const cityGroups = {};
            listData.forEach(item => {
                if (!cityGroups[item.city]) {
                    cityGroups[item.city] = [];
                }
                cityGroups[item.city].push(item);
            });
            Object.values(cityGroups).forEach(item => {
                item.sort((a, b) => b.price - a.price);
                sortedListData = sortedListData.concat(item);
            });
            ctx.body = {
                success: true,
                data: {
                    listData: sortedListData.slice(skip, skip + currentPagesize),
                    ...formatPagination({ total: listData.length, page: currentPage, limit: currentPagesize, pages: Math.ceil(listData.length / currentPagesize) })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async exportData(ctx) {
        try {
            let { startTime, endTime, city, store, channel, sort } = ctx.request.body || {};
            if (!startTime || !endTime) {
                return ctx.body = { success: false, msg: "开始时间和结束时间必传" }
            }
            if (!isValidDateFormat(startTime) || !isValidDateFormat(endTime)) {
                return ctx.body = { success: false, msg: "开始时间和结束时间格式不正确" }
            }
            // 计算天数差
            const daysDiff = moment(endTime).diff(moment(startTime), 'days') + 1;
            let cond = `order_createtime BETWEEN '${startTime}' AND '${endTime}'`;
            if (city) {
                if (!Array.isArray(city)) {
                    return ctx.body = { success: false, msg: "城市参数格式不正确" }
                }
                if (city.length) {
                    let citys = city.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND city IN (${citys})`;
                }
            }
            if (store) {
                if (!Array.isArray(store)) {
                    return ctx.body = { success: false, msg: "分仓参数格式不正确" }
                }
                if (store.length) {
                    let stores = store.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND store_id IN (${stores})`;
                }
            }
            if (channel) {
                if (!Array.isArray(channel)) {
                    return ctx.body = { success: false, msg: "销售渠道参数格式不正确" }
                }
                if (channel.length) {
                    let channels = channel.map((item) => `'${item}'`).join(",") || null;
                    cond += ` AND channel IN (${channels})`;
                }
            }
            // 三方订单分城市、分仓（计算系数0.957）
            let third_city_store_sql = `
                SELECT 
                    city, -- 城市
                    store_name AS store, -- 分仓 
                    SUM(total_price / 0.957) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.957 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel != '有赞小程序' 
                GROUP BY 
                    city, store_name;
            `;
            // 有赞订单分城市、分仓（计算系数0.994）
            let youzan_city_store_sql = `
                SELECT 
                    city, -- 城市
                    store_name AS store, -- 分仓 
                    SUM(total_price / 0.994) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.994 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel = '有赞小程序' 
                GROUP BY 
                    city, store_name;
            `;
            // 三方订单分城市（计算系数0.957）
            let third_city_sql = `
                SELECT 
                    city, -- 城市
                    SUM(total_price / 0.957) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.957 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel != '有赞小程序' 
                GROUP BY 
                    city;
            `;
            // 有赞订单分城市（计算系数0.994）
            let youzan_city_sql = `
                SELECT 
                    city, -- 城市
                    SUM(total_price / 0.994) AS price, -- 实收(含税_含5%)
                    SUM(total_price / 0.994 / (1 + tax_percent / 100)) AS revenue, -- Revenue(未税_含5%)
                    SUM(total_cost) AS cost, -- 成本(未税)
                    SUM(audit_output_count) AS goodsCount, -- 件数
                    COUNT(DISTINCT platform_order_id) AS orderCount -- 订单数 
                FROM 
                    tax 
                WHERE 
                    ${cond} AND channel = '有赞小程序' 
                GROUP BY 
                    city;
            `;
            let [thirdCityStoreResult, youzanCityStoreResult, thirdCityResult, youzanCityResult] = await Promise.all([
                sequelize_shop_tk.query(third_city_store_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(youzan_city_store_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(third_city_sql, { type: QueryTypes.SELECT }),
                sequelize_shop_tk.query(youzan_city_sql, { type: QueryTypes.SELECT }),
            ]);
            const thirdCityStoreMap = new Map();
            const youzanCityStoreMap = new Map();
            const thirdCityMap = new Map();
            const youzanCityMap = new Map();
            //三方订单分城市
            if (thirdCityResult && Array.isArray(thirdCityResult) && thirdCityResult.length) {
                for (const item of thirdCityResult) {
                    const { city, price, revenue, cost, goodsCount, orderCount } = item;
                    thirdCityMap.set(city, { price, revenue, cost, goodsCount, orderCount, totalProfit: revenue - cost });
                }
            }
            //有赞订单分城市
            if (youzanCityResult && Array.isArray(youzanCityResult) && youzanCityResult.length) {
                for (const item of youzanCityResult) {
                    const { city, price, revenue, cost, goodsCount, orderCount } = item;
                    youzanCityMap.set(city, { price, revenue, cost, goodsCount, orderCount, totalProfit: revenue - cost });
                }
            }
            //三方订单分城市、分仓
            if (thirdCityStoreResult && Array.isArray(thirdCityStoreResult) && thirdCityStoreResult.length) {
                for (const item of thirdCityStoreResult) {
                    const { city, store, price, revenue, cost, goodsCount, orderCount } = item;
                    thirdCityStoreMap.set(`${city}-${store}`, { price, revenue, cost, goodsCount, orderCount });
                }
            }
            //有赞订单分城市、分仓
            if (youzanCityStoreResult && Array.isArray(youzanCityStoreResult) && youzanCityStoreResult.length) {
                for (const item of youzanCityStoreResult) {
                    const { city, store, price, revenue, cost, goodsCount, orderCount } = item;
                    youzanCityStoreMap.set(`${city}-${store}`, { price, revenue, cost, goodsCount, orderCount });
                }
            }
            const uniqueKeys = [...new Set([...thirdCityStoreMap.keys(), ...youzanCityStoreMap.keys()])];
            let listData = [];
            for (const item of uniqueKeys) {
                const city = item.split('-')[0];
                const store = item.split('-')[1];
                const totalPrice = Number(thirdCityMap?.get(city)?.price ?? 0 + youzanCityMap?.get(city)?.price ?? 0);
                const totalProfit = Number(thirdCityMap?.get(city)?.totalProfit ?? 0 + youzanCityMap?.get(city)?.totalProfit ?? 0);
                const totalRevenue = Number(thirdCityMap?.get(city)?.revenue ?? 0 + youzanCityMap?.get(city)?.revenue ?? 0);
                const price = Number((thirdCityStoreMap?.get(item)?.price ?? 0 + youzanCityStoreMap?.get(item)?.price ?? 0).toFixed(2));
                const revenue = Number((thirdCityStoreMap?.get(item)?.revenue ?? 0 + youzanCityStoreMap?.get(item)?.revenue ?? 0).toFixed(2));
                const cost = Number((thirdCityStoreMap?.get(item)?.cost ?? 0 + youzanCityStoreMap?.get(item)?.cost ?? 0).toFixed(2));
                const profit = Number(((revenue - cost) || 0).toFixed(2));
                const goodsCount = Number((thirdCityStoreMap?.get(item)?.goodsCount ?? 0 + youzanCityStoreMap?.get(item)?.goodsCount ?? 0).toFixed(2));
                const profitRate = revenue ? Number((((revenue - cost) / revenue) || 0).toFixed(4)) : 0;
                const orderCount = Number((thirdCityStoreMap?.get(item)?.orderCount ?? 0 + youzanCityStoreMap?.get(item)?.orderCount ?? 0).toFixed(2));
                const dailyOrderCount = Math.round(orderCount / daysDiff);
                const singleOrderPrice = orderCount ? Number(((price / orderCount) || 0).toFixed(2)) : 0;
                const singleOrderProfit = orderCount ? Number(((profit / orderCount) || 0).toFixed(2)) : 0;
                const singleGoodsPrice = goodsCount ? Number(((price / goodsCount) || 0).toFixed(2)) : 0;
                const totalRevenueRate = totalRevenue ? Number(((revenue / totalRevenue) || 0).toFixed(4)) : 0;
                const totalProfitRate = totalProfit ? Number(((profit / totalProfit) || 0).toFixed(4)) : 0;
                listData.push({
                    city: city, //城市
                    store: store, //分仓
                    price: price, //实收(含税_含5%)
                    revenue: revenue, //Revenue(未税_含5%)
                    cost: cost, //成本(未税)
                    profit: profit, //毛利额
                    goodsCount: goodsCount, //件数
                    profitRate: profitRate, //毛利率
                    orderCount: orderCount, //订单数
                    dailyOrderCount: dailyOrderCount, //日均订单数
                    singleOrderPrice: singleOrderPrice, //客单价
                    singleOrderProfit: singleOrderProfit, //单均利润
                    singleGoodsPrice: singleGoodsPrice, //件单价
                    totalRevenueRate: totalRevenueRate, //Revenue-城市占比
                    totalProfitRate: totalProfitRate, //毛利额-城市占比
                    cityTotalPrice: totalPrice, //城市总实收，用来排序
                });
            }
            // 先按城市总实收倒序排序, 再按分仓总实收倒序排序
            listData.sort((a, b) => b.cityTotalPrice - a.cityTotalPrice);
            let sortedListData = [];
            const cityGroups = {};
            listData.forEach(item => {
                if (!cityGroups[item.city]) {
                    cityGroups[item.city] = [];
                }
                cityGroups[item.city].push(item);
            });
            Object.values(cityGroups).forEach(item => {
                item.sort((a, b) => b.price - a.price);
                sortedListData = sortedListData.concat(item);
            });
            const list = sortedListData;
            let columns = [
                { header: '城市', key: 'city' },
                { header: '分仓名称', key: 'store' },
                { header: '实收(含税_含5%)', key: 'price' },
                { header: 'Revenue(未税_含5%)', key: 'revenue' },
                { header: '成本(未税)', key: 'cost' },
                { header: '毛利额', key: 'profit' },
                { header: '件数', key: 'goodsCount' },
                { header: '毛利率', key: 'profitRate' },
                { header: '订单数', key: 'orderCount' },
                { header: '日均订单数', key: 'dailyOrderCount' },
                { header: '客单价', key: 'singleOrderPrice' },
                { header: '单均利润', key: 'singleOrderProfit' },
                { header: '件单价', key: 'singleGoodsPrice' },
                { header: 'Revenue-城市占比', key: 'totalRevenueRate' },
                { header: '毛利额-城市占比', key: 'totalProfitRate' }
            ];
            if (!list.length) {
                return ctx.body = { success: false, msg: "没有数据可导出" }
            }
            const { buffer, headers } = await excelUtils.exportExcel(list, columns, "分仓报表");
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
